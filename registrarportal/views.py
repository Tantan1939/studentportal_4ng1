from django.shortcuts import render
from django.contrib import messages
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required, user_passes_test
from django.http import HttpResponseRedirect, JsonResponse, HttpResponse
from django.contrib.sites.shortcuts import get_current_site
from django.shortcuts import render, redirect, get_object_or_404
from django.views.generic.base import TemplateView, RedirectView, View
from django.views.generic import ListView, DetailView
from django.views.generic.edit import FormView, CreateView, DeletionMixin
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model
from django.contrib.postgres.aggregates import ArrayAgg
from django.urls import reverse
from django.db import IntegrityError, transaction
from django.db.models import Prefetch, Count, Q, Case, When, Value, F, OuterRef, Subquery
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.core.exceptions import ObjectDoesNotExist
from ratelimit.decorators import ratelimit
from adminportal.models import *
from datetime import date, datetime
from django.core.exceptions import ValidationError, NON_FIELD_ERRORS
from django.db import IntegrityError
from django.middleware import csrf
from studentportal.models import documentRequest
from formtools.wizard.views import SessionWizardView
from registrarportal.tasks import email_tokenized_enrollment_link
from . emailSenders import enrollment_invitation_emails, enrollment_acceptance_email, denied_enrollment_email, denied_admission_email, cancelDocumentRequest
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from openpyxl import Workbook
from openpyxl.styles import Border, Side, Alignment, Font
from . drf_permissions import EnrollmentValidationPermissions
from . tokenGenerators import generate_enrollment_token
from . serializers import *
from . models import *
from . forms import *
import re
from django.utils import timezone
from dateutil.relativedelta import relativedelta
from django.conf import settings


User = get_user_model()


def validate_latestSchoolYear(sy):
    # Return true if school year is ongoing/latest
    try:
        return date.today() <= sy.until
    except Exception as e:
        print(e)
        return False


def registrar_only(user):
    return user.is_registrar


def check_admissionSched(user):
    a = enrollment_admission_setup.objects.filter(
        start_date__lte=date.today(), end_date__gte=date.today()).first()
    if a:
        if enrollment_admission_setup.objects.first() == a:
            return True
        return False
    return False


def getSchoolYear():
    sy = schoolYear.objects.first()
    if sy:
        if sy.until > date.today():
            return sy
        return False
    return False


def admissionCount():
    # Pending admission
    if getSchoolYear():
        sy = getSchoolYear()
        return student_admission_details.objects.filter(admission_sy=sy, is_accepted=False, is_denied=False).exclude(with_enrollment=True).count()
    else:
        return 0


def enrollmentCount():
    # Pending admission
    if getSchoolYear():
        sy = getSchoolYear()
        return student_enrollment_details.objects.filter(enrolled_school_year=sy, is_accepted=False, is_denied=False).count()
    else:
        return 0


def countDocumentRequests():
    return documentRequest.registrarObjects.count()


@method_decorator([login_required(login_url="usersPortal:login"), user_passes_test(registrar_only, login_url="studentportal:index")], name="dispatch")
class registrarDashboard(TemplateView):
    template_name = "registrarportal/dashboard.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Dashboard"
        context["CountAdmission"] = admissionCount()
        context["CountEnrollment"] = enrollmentCount()
        context["CountDocumentRequests"] = countDocumentRequests()
        return context


@method_decorator([login_required(login_url="usersPortal:login"), user_passes_test(registrar_only, login_url="studentportal:index")], name="dispatch")
class getList_documentRequest(ListView, DeletionMixin):
    allow_empty = True
    context_object_name = "listOfDocumentRequests"
    http_method_names = ["get", "post"]
    paginate_by = 35
    template_name = "registrarPortal/documentRequests/listOfDocumentRequests.html"
    success_url = "/Registrar/RequestDocuments/"

    def delete(self, request, *args, **kwargs):
        try:
            cancelDocumentRequest(request,
                                  self.cancel_this_request.request_by.email,
                                  self.cancel_this_request.request_by.display_name,
                                  self.cancel_this_request.scheduled_date,
                                  self.cancel_this_request.document.documentName)

            self.cancel_this_request.is_cancelledByRegistrar = True
            self.cancel_this_request.save()
        except Exception as e:
            pass
        return HttpResponseRedirect(self.success_url)

    def get_queryset(self):
        return documentRequest.registrarObjects.values("id", "document__documentName", "request_by__display_name", "scheduled_date")

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Document Requests"
        return context

    def dispatch(self, request, *args, **kwargs):
        try:
            if request.method == "POST" and ("pk" in request.POST):
                self.cancel_this_request = documentRequest.registrarObjects.get(
                    id=int(request.POST["pk"]))
            return super().dispatch(request, *args, **kwargs)
        except ObjectDoesNotExist:
            messages.error(request, "Request no longer exist.")
            return HttpResponseRedirect(reverse("registrarportal:requestedDocuments"))


@method_decorator([login_required(login_url="usersPortal:login"), user_passes_test(registrar_only, login_url="studentportal:index"), user_passes_test(check_admissionSched, login_url="registrarportal:dashboard")], name="dispatch")
class enrollment_invitation_oldStudents(View):
    http_method_names = ['get']

    def get(self, request, *args, **kwargs):
        lst = [enrollment_invitations.objects.create(
            invitation_to=obj) for obj in self.diff]
        enrollment_invitation_emails(request, lst)
        return HttpResponseRedirect(reverse("registrarportal:get_enrolled_students"))

    def dispatch(self, request, *args, **kwargs):

        # Get previous students
        adm_objs = student_admission_details.oldStudents.all()

        # Get admission details with invitations
        adm_objs_with_inv = student_admission_details.objects.alias(
            count_inv=Count("invitation")).exclude(count_inv=0)
        self.diff = adm_objs.difference(adm_objs_with_inv)

        if self.diff:
            return super().dispatch(request, *args, **kwargs)
        else:
            messages.warning(request, "No previous student/s found.")
            return HttpResponseRedirect(reverse("registrarportal:get_enrolled_students"))


def enrollment_not_existing_kwarg(request, qs, val):
    if not qs:
        # if qs = walang laman, then:
        messages.warning(request, "%s not found." % val)


def search_regex_match(request, val):
    rgx = re.compile("([a-zA-Z\d\s]+)")
    if rgx.fullmatch(val):
        return True
    else:
        messages.warning(request, "%s is invalid." % val)
        return False


def dts_to_list(val):
    try:
        if int(val):
            # if val is int
            return True
    except:
        # if val is string
        return False


@method_decorator([login_required(login_url="usersPortal:login"), user_passes_test(registrar_only, login_url="studentportal:index")], name="dispatch")
class get_admitted_students(ListView):
    allow_empty = True
    context_object_name = "students"
    paginate_by = 40
    template_name = "registrarportal/admission/viewAdmittedStudents.html"

    def post(self, request, *args, **kwargs):
        try:
            search_this = request.POST.get("search_this")
            if search_this:
                if search_regex_match(request, search_this):
                    return HttpResponseRedirect(reverse("registrarportal:get_admitted_students", kwargs={"key": search_this}))
                else:
                    return HttpResponseRedirect(reverse("registrarportal:get_admitted_students"))
            else:
                messages.warning(
                    request, "Enter the Student Name or ID to search.")
                return HttpResponseRedirect(reverse("registrarportal:get_admitted_students"))
        except Exception as e:
            # messages.error(request, e)
            return HttpResponseRedirect(reverse("registrarportal:get_admitted_students"))

    def get_queryset(self):
        try:
            if "key" in self.kwargs:
                # Convert to list
                key = [ltr for ltr in self.kwargs["key"]]
                map_func_res = map(dts_to_list, key)

                if all(map_func_res):
                    # if map_func_res are all integers
                    qs = student_admission_details.objects.filter(is_accepted=True, is_denied=False, id=int(self.kwargs["key"])).prefetch_related(
                        Prefetch("softCopy_admissionRequirements_phBorn",
                                 queryset=ph_born.objects.all(), to_attr="phborndocx"),
                        Prefetch("softCopy_admissionRequirements_foreigner",
                                 queryset=foreign_citizen_documents.objects.all(), to_attr="fborndocx"),
                        Prefetch("softCopy_admissionRequirements_dualCitizen",
                                 queryset=dual_citizen_documents.objects.all(), to_attr="dborndocx")
                    )
                    enrollment_not_existing_kwarg(
                        self.request, qs, self.kwargs["key"])

                else:
                    # If combination of str and int, or pure str
                    qs = student_admission_details.objects.filter(is_accepted=True, is_denied=False, first_name__unaccent__icontains=str(self.kwargs["key"])).prefetch_related(
                        Prefetch("softCopy_admissionRequirements_phBorn",
                                 queryset=ph_born.objects.all(), to_attr="phborndocx"),
                        Prefetch("softCopy_admissionRequirements_foreigner",
                                 queryset=foreign_citizen_documents.objects.all(), to_attr="fborndocx"),
                        Prefetch("softCopy_admissionRequirements_dualCitizen",
                                 queryset=dual_citizen_documents.objects.all(), to_attr="dborndocx")
                    )
                    enrollment_not_existing_kwarg(
                        self.request, qs, self.kwargs["key"])

            else:
                qs = student_admission_details.objects.filter(is_accepted=True, is_denied=False).prefetch_related(
                    Prefetch("softCopy_admissionRequirements_phBorn",
                             queryset=ph_born.objects.all(), to_attr="phborndocx"),
                    Prefetch("softCopy_admissionRequirements_foreigner",
                             queryset=foreign_citizen_documents.objects.all(), to_attr="fborndocx"),
                    Prefetch("softCopy_admissionRequirements_dualCitizen",
                             queryset=dual_citizen_documents.objects.all(), to_attr="dborndocx")
                )
        except Exception as e:
            # messages.error(self.request, e)
            qs = student_admission_details.objects.none()
        return qs

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Admitted Students"
        return context


@method_decorator([login_required(login_url="usersPortal:login"), user_passes_test(registrar_only, login_url="studentportal:index")], name="dispatch")
class get_enrolled_students(ListView):
    allow_empty = True
    context_object_name = "students"
    paginate_by = 40
    template_name = "registrarportal/enrollment/get_enrolled_students.html"

    def post(self, request, *args, **kwargs):
        try:
            search_this = request.POST.get("search_this")
            if search_this:
                if search_regex_match(request, search_this):
                    return HttpResponseRedirect(reverse("registrarportal:get_enrolled_students", kwargs={"key": search_this}))
                else:
                    return HttpResponseRedirect(reverse("registrarportal:get_enrolled_students"))
            else:
                messages.warning(
                    request, "Enter the Student Name or ID to search.")
                return HttpResponseRedirect(reverse("registrarportal:get_enrolled_students"))
        except Exception as e:
            # messages.error(request, e)
            return HttpResponseRedirect(reverse("registrarportal:get_enrolled_students"))

    def get_queryset(self):
        try:
            if "key" in self.kwargs:
                qs = student_enrollment_details.objects.filter()
                # Convert to list
                key = [ltr for ltr in self.kwargs["key"]]
                map_func_res = map(dts_to_list, key)

                if all(map_func_res):
                    # if map_func_res are all integers
                    qs = student_enrollment_details.objects.filter(is_accepted=True, is_denied=False, id=int(self.kwargs["key"])).prefetch_related(
                        Prefetch("report_card",
                                 queryset=student_report_card.objects.all(), to_attr="reportcard"),
                        Prefetch("stud_pict",
                                 queryset=student_id_picture.objects.all(), to_attr="studentpict")
                    )
                    enrollment_not_existing_kwarg(
                        self.request, qs, self.kwargs["key"])

                else:
                    # If combination of str and int, or pure str
                    qs = student_enrollment_details.objects.filter(is_accepted=True, is_denied=False, full_name__unaccent__icontains=str(self.kwargs["key"])).prefetch_related(
                        Prefetch("report_card",
                                 queryset=student_report_card.objects.all(), to_attr="reportcard"),
                        Prefetch("stud_pict",
                                 queryset=student_id_picture.objects.all(), to_attr="studentpict")
                    )
                    enrollment_not_existing_kwarg(
                        self.request, qs, self.kwargs["key"])

            else:
                qs = student_enrollment_details.objects.filter(is_accepted=True, is_denied=False).prefetch_related(
                    Prefetch("report_card",
                             queryset=student_report_card.objects.all(), to_attr="reportcard"),
                    Prefetch("stud_pict",
                             queryset=student_id_picture.objects.all(), to_attr="studentpict")
                )
        except Exception as e:
            # messages.error(self.request, e)
            qs = student_enrollment_details.objects.none()
        return qs

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Enrolled Students"
        return context


@method_decorator([login_required(login_url="usersPortal:login"), user_passes_test(registrar_only, login_url="studentportal:index")], name="dispatch")
class get_react_app(TemplateView):
    # This class will render the react app
    template_name = 'index.html'


class get_admissions(APIView):
    permission_classes = [EnrollmentValidationPermissions]

    def get(self, request, format=None):
        applicant_lists = admission_batch.new_batches.annotate(number_of_applicants=Count("members", filter=Q(members__is_accepted=False, members__is_denied=False))).filter(number_of_applicants__gte=1).prefetch_related(
            Prefetch("members",
                     queryset=student_admission_details.objects.filter(is_accepted=False, is_denied=False).prefetch_related(
                         Prefetch("softCopy_admissionRequirements_phBorn", queryset=ph_born.objects.all(
                         )),
                         Prefetch("softCopy_admissionRequirements_foreigner", queryset=foreign_citizen_documents.objects.all(
                         )),
                         Prefetch("softCopy_admissionRequirements_dualCitizen", queryset=dual_citizen_documents.objects.all())),
                     ))
        serializer = BatchAdmissionSerializer(applicant_lists, many=True)
        csrf_token = csrf.get_token(request)

        return Response({"X_CSRFToken": csrf_token, "batch_lists": serializer.data})


class denied_admission(APIView):
    permission_classes = [EnrollmentValidationPermissions]

    def post(self, request, format=None):
        data = request.data
        try:
            get_batch = admission_batch.objects.filter(
                members__id=int(data["key"])).first()

            to_deny = student_admission_details.objects.get(
                id=int(data["key"]))
            to_deny.is_denied = True
            to_deny.save()
            get_batch.members.remove(to_deny)

            denied_admission_email(
                request, to_deny.admission_owner.email, to_deny.last_name)

            return Response({"Done": "Admission Denied"}, status=status.HTTP_200_OK)
        except ObjectDoesNotExist:
            return Response({"Warning": "Admission no longer exist."}, status=status.HTTP_200_OK)


class admit_students(APIView):
    permission_classes = [EnrollmentValidationPermissions]

    def post(self, request, format=None):
        data = request.data
        try:
            to_admit_students = student_admission_details.objects.filter(
                pk__in=data['keys']).exclude(is_accepted=True).values_list('id', flat=True)
            student_admission_details.admit_this_students(
                request, to_admit_students)
            return Response({"Done": "Admitted Students."}, status=status.HTTP_200_OK)

        except Exception as e:
            print(e)
            return Response({"Error": "Exception Error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class get_enrollment_batches(APIView):
    permission_classes = [EnrollmentValidationPermissions]

    def get(self, request, format=None):
        # Get enrollment batches with pending enrollees.
        batch_lists = enrollment_batch.new_batches.annotate(number_of_enrollment=Count("members", filter=Q(members__is_accepted=False, members__is_denied=False))).filter(number_of_enrollment__gte=1).prefetch_related(
            Prefetch("members",
                     queryset=student_enrollment_details.objects.filter(is_accepted=False, is_denied=False).prefetch_related(
                         Prefetch("enrollment_address",
                                  queryset=student_home_address.objects.all()),
                         Prefetch("enrollment_contactnumber",
                                  queryset=student_contact_number.objects.all()),
                         Prefetch("report_card",
                                  queryset=student_report_card.objects.all()),
                         Prefetch("stud_pict", queryset=student_id_picture.objects.all()))))

        serializer = EnrollmentBatchSerializer(batch_lists, many=True)
        csrf_token = csrf.get_token(request)
        return Response({"X_CSRFToken": csrf_token, "batch_lists": serializer.data, }, status=status.HTTP_200_OK)


class denied_enrollee(APIView):
    permission_classes = [EnrollmentValidationPermissions]

    def post(self, request, format=None):
        data = request.data
        try:
            with transaction.atomic():
                to_denied = student_enrollment_details.objects.select_for_update().get(
                    pk=int(data["key"]))
                to_denied.is_denied = True
                to_denied.save()

            denied_stud = student_enrollment_details.objects.get(
                id=int(data['key']))

            get_batch = enrollment_batch.new_batches.filter(
                members__id=denied_stud.id).first()
            get_batch.members.remove(denied_stud)

            denied_enrollment_email(
                request, denied_stud.applicant.email, denied_stud.full_name)

            return Response({"Done": "Successfully Denied Enrollee."}, status=status.HTTP_200_OK)
        except Exception as e:
            print(e)
            return Response({"Error": "Exception Occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class accept_enrollees(APIView):
    permission_classes = [EnrollmentValidationPermissions]

    def post(self, request, format=None):
        data = request.data
        try:
            enrollees = student_enrollment_details.objects.values_list(
                'id', flat=True).filter(pk__in=data["keys"], is_accepted=False, is_denied=False)

            # To accept each enrollment via an atomic transaction to avoid race condition.
            accept_them = student_enrollment_details.accept_students(enrollees)

            if not accept_them:
                return Response({"Warning": "Primary keys of enrollees no longer exist as pending enrollees."}, status=status.HTTP_409_CONFLICT)

            else:
                batch_id = data["batchID"]
                get_section = schoolSections.latestSections.get(
                    section_batch__id=int(batch_id))

                for student in student_enrollment_details.objects.filter(pk__in=accept_them):
                    # Assign each enrolled students to the designated section.
                    class_student.objects.create(
                        section=get_section, enrollment=student)

                    # Create an email template to send section, subject, and schedule details with the user enrollment parameters.
                    enrollment_acceptance_email(
                        request, student.applicant.email, student.applicant.display_name, get_section)
                else:
                    return Response({"Success": "success enrollment validation."}, status=status.HTTP_200_OK)

        except Exception as e:
            print(e)
            return Response({"Error": "Exception Error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class get_available_batchs(APIView):
    permission_classes = [EnrollmentValidationPermissions]

    def get(self, request, batchID, pk, format=None):
        this_strand = enrollment_batch.new_batches.values(
            'section__assignedStrand__id', 'section__yearLevel').filter(id=int(batchID)).first()

        if this_strand:
            this_batches = enrollment_batch.new_batches.filter(
                section__assignedStrand__id=int(this_strand["section__assignedStrand__id"]), section__yearLevel=this_strand["section__yearLevel"]).annotate(
                    count_members=Count('members')).annotate(
                        is_full=Case(When(section__allowedPopulation__lte=F('count_members'), then=Value(True)), default=Value(False)), allowed_students=F(
                            'section__allowedPopulation')).prefetch_related(
                                Prefetch("members", queryset=student_enrollment_details.objects.filter(is_accepted=False, is_denied=False).prefetch_related(
                                    Prefetch("stud_pict", queryset=student_id_picture.objects.all())))).exclude(
                                        members__id=int(pk)).order_by('section__yearLevel', 'section__assignedStrand__strand_name')

            serializer = batchSerializer(this_batches, many=True)
            return Response(serializer.data)
        else:
            return Response({"Data": "Empty Data."}, status.HTTP_204_NO_CONTENT)


class swap_batches_v1(APIView):
    permission_classes = [EnrollmentValidationPermissions]

    def post(self, request, format=None):
        data = request.data

        try:
            currentID = data["currentID"]
            currentBatch = data["currentBatch"]
            targetBatch = data["targetBatch"]
            exchangeID = data["exchangeID"]

            if exchangeID:
                this_enrollment = student_enrollment_details.objects.get(
                    id=int(currentID))
                this_current_batch = enrollment_batch.objects.get(
                    id=int(currentBatch))
                this_target_batch = enrollment_batch.objects.get(
                    id=int(targetBatch))
                this_exchange_enrollment = student_enrollment_details.objects.get(
                    id=int(exchangeID))

                if (this_enrollment.strand == this_exchange_enrollment.strand) and (this_current_batch.section.assignedStrand == this_target_batch.section.assignedStrand):
                    this_current_batch.members.remove(this_enrollment)
                    this_target_batch.members.remove(this_exchange_enrollment)
                    this_target_batch.members.add(this_enrollment)
                    this_current_batch.members.add(this_exchange_enrollment)

                    return Response({"Done": "Exchange successfully."})
                else:
                    return Response({"Done": "Received with no errors. But enrollment strand and strand of target batch does not match."})

            else:
                this_enrollment = student_enrollment_details.objects.get(
                    id=int(currentID))
                this_current_batch = enrollment_batch.objects.get(
                    id=int(currentBatch))
                this_target_batch = enrollment_batch.objects.get(
                    id=int(targetBatch))

                if this_enrollment.strand == this_target_batch.section.assignedStrand:
                    this_current_batch.members.remove(this_enrollment)
                    this_target_batch.members.add(this_enrollment)
                    return Response({"Done": "Swap successfully."})
                else:
                    return Response({"Done": "Received with no errors. But enrollment strand and strand of target batch does not match."})

        except Exception as e:
            print(e)
            return Response({"Error": "An error occurred."}, status=status.HTTP_409_CONFLICT)


class get_available_batches_v2(APIView):
    permission_classes = [EnrollmentValidationPermissions]

    def get(self, request, batchId, format=None):
        try:
            this_strand = enrollment_batch.new_batches.values(
                'section__assignedStrand__id', 'section__yearLevel').filter(id=batchId).first()

            if this_strand:
                this_batches = enrollment_batch.new_batches.filter(
                    section__assignedStrand__id=int(this_strand["section__assignedStrand__id"]), section__yearLevel=this_strand["section__yearLevel"]).annotate(
                        count_members=Count('members')).annotate(
                            is_full=Case(When(section__allowedPopulation__lte=F('count_members'), then=Value(True)), default=Value(False)), allowed_students=F(
                                'section__allowedPopulation')).prefetch_related(
                                    Prefetch("members", queryset=student_enrollment_details.objects.filter(is_accepted=False, is_denied=False).prefetch_related(
                                        Prefetch("stud_pict", queryset=student_id_picture.objects.all())))).exclude(
                                            id=batchId).order_by('section__yearLevel', 'section__assignedStrand__strand_name')

                serializer = batchSerializer(this_batches, many=True)
                return Response(serializer.data)
            else:
                return Response({"": ""}, status=status.HTTP_204_NO_CONTENT)

        except Exception as e:
            print(e)
            return Response({"": ""}, status=status.HTTP_409_CONFLICT)


class swap_batches_v2(APIView):
    permission_classes = [EnrollmentValidationPermissions]

    def post(self, request, format=None):
        data = request.data

        try:
            currentIDs = data["currentIDs"]
            currentBatch = int(data["currentBatch"])
            targetBatch = int(data["targetBatch"])
            exchangeIDs = data["exchangeIDs"]

            this_enrollments = student_enrollment_details.objects.filter(
                pk__in=currentIDs)
            this_exchange_enrollments = student_enrollment_details.objects.filter(
                pk__in=exchangeIDs)
            this_current_batch = enrollment_batch.objects.get(id=currentBatch)
            this_target_batch = enrollment_batch.objects.get(id=targetBatch)

            if (this_current_batch.section.assignedStrand == this_target_batch.section.assignedStrand) and self.validate_strands(this_enrollments, this_target_batch.section.assignedStrand):
                this_current_batch.members.remove(*this_enrollments)
                this_target_batch.members.add(*this_enrollments)

                if this_exchange_enrollments and self.validate_strands(this_exchange_enrollments, this_current_batch.section.assignedStrand):
                    this_target_batch.members.remove(
                        *this_exchange_enrollments)
                    this_current_batch.members.add(*this_exchange_enrollments)

                    return Response({"Done": "Exchange successfully."})
                else:
                    return Response({"Done": "Swap successfully."})

            else:
                return Response({"": ""}, status=status.HTTP_409_CONFLICT)

        except Exception as e:
            print(e)
            return Response({"": ""}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def validate_strands(self, modelInstances, strand):
        for instance in modelInstances:
            if instance.strand == strand:
                continue
            else:
                return False
        else:
            return True


class get_schoolYears(APIView):
    permission_classes = [EnrollmentValidationPermissions]

    this_sample_data = [
        {
            "id": 1,
            "sy_name": "2023 - 2024",
            "can_update": True,
            "sexs": [
                [
                    "Def",
                    "Sexes"
                ],
                [
                    "Female",
                    4
                ],
                [
                    "Male",
                    2
                ]
            ],
            "yearLevels": [
                [
                    "Def",
                    "Year Levels"
                ],
                [
                    "Grade 11",
                    6
                ]
            ],
            "strands": [
                [
                    "Def",
                    "Strand"
                ],
                [
                    "ICT",
                    5
                ],
                [
                    "STEM",
                    1
                ]
            ]
        },
        {
            "id": 2,
            "sy_name": "2022 - 2023",
            "can_update": False,
            "sexs": [
                [
                    "Def",
                    "Sexes"
                ],
                [
                    "Female",
                    20
                ],
                [
                    "Male",
                    100
                ]
            ],
            "yearLevels": [
                [
                    "Def",
                    "Year Levels"
                ],
                [
                    "Grade 11",
                    55
                ],
                [
                    "Grade 12",
                    65
                ]
            ],
            "strands": [
                [
                    "Def",
                    "Strand"
                ],
                [
                    "ICT",
                    55
                ],
                [
                    "STEM",
                    15
                ],
                [
                    "ABM",
                    50
                ]
            ]
        },
        {
            "id": 3,
            "sy_name": "2021 - 2022",
            "can_update": False,
            "sexs": [
                [
                    "Def",
                    "Sexes"
                ],
                [
                    "Female",
                    50
                ],
                [
                    "Male",
                    55
                ]
            ],
            "yearLevels": [
                [
                    "Def",
                    "Year Levels"
                ],
                [
                    "Grade 11",
                    40
                ],
                [
                    "Grade 12",
                    65
                ],
            ],
            "strands": [
                [
                    "Def",
                    "Strand"
                ],
                [
                    "ICT",
                    27
                ],
                [
                    "STEM",
                    25
                ],
                [
                    "ABM",
                    35
                ],
                [
                    "GAS",
                    18
                ]
            ]
        }
    ]

    def get(self, request, format=None):
        my_list = list()

        try:
            get_data = self.get_sys()
            for index, value in enumerate(get_data):
                my_list.append({})
                my_list[index]["id"] = value["id"]
                my_list[index]["sy_name"] = schoolYear.objects.get(
                    id=value['id']).display_sy()
                my_list[index]["can_update"] = value['can_update']

                if all([value["sexs"], value["yearLevels"], value["strands"]]):
                    distinct_elements = list()
                    distinct_elements.append(list(set(value['sexs'])))
                    distinct_elements.append(list(set(value['yearLevels'])))
                    distinct_elements.append(list(set(value['strands'])))

                    my_list[index]['sexs'] = [
                        [self.get_sex_readableValue(sex), value['sexs'].count(sex)] for sex in distinct_elements[0]]
                    my_list[index]['sexs'].insert(0, ['Def', 'Sexes'])

                    my_list[index]['yearLevels'] = [
                        [f"Grade {ylvl}", value['yearLevels'].count(ylvl)] for ylvl in distinct_elements[1]]
                    my_list[index]['yearLevels'].insert(
                        0, ['Def', 'Year Levels'])

                    my_list[index]['strands'] = [
                        [strnds, value['strands'].count(strnds)] for strnds in distinct_elements[2]]
                    my_list[index]['strands'].insert(0, ['Def', 'Strand'])

                else:
                    my_list[index]['sexs'] = []
                    my_list[index]['yearLevels'] = []
                    my_list[index]['strands'] = []

            return Response(my_list)
        except Exception as e:
            return Response([])

    def get_sex_readableValue(self, val):
        for choice in student_admission_details.SexChoices.choices:
            if val == choice[0]:
                return choice[1]

    def get_sys(self):
        sys = schoolYear.objects.annotate(sexs=Subquery(student_enrollment_details.validatedObjects.filter(enrolled_school_year__id=OuterRef('id')).values(
            'enrolled_school_year__id').annotate(ss=ArrayAgg('admission__sex')).values('ss')),
            yearLevels=Subquery(student_enrollment_details.validatedObjects.filter(enrolled_school_year__id=OuterRef('id')).values(
                'enrolled_school_year__id').annotate(yl=ArrayAgg('year_level')).values('yl')),
            strands=Subquery(student_enrollment_details.validatedObjects.filter(enrolled_school_year__id=OuterRef('id')).values(
                'enrolled_school_year__id').annotate(std=ArrayAgg('strand__strand_name')).values('std')),
            can_update=Case(When(id=self.get_sy.id, until__gte=date.today(), then=Value(True)), default=Value(False))).values(
            'id', 'can_update', 'sexs', 'yearLevels', 'strands')

        return sys

    def dispatch(self, request, *args, **kwargs):
        self.get_sy = schoolYear.objects.first()
        return super().dispatch(request, *args, **kwargs)


class get_update_schoolyear_details(APIView):
    permission_classes = [EnrollmentValidationPermissions]

    def get(self, request, format=None):
        self.this_sy = schoolYear.objects.annotate(can_update_startdate=Case(
            When(start_on__gt=date.today(), then=Value(True)),
            default=Value(False))).first()
        serializer = schoolyear_serializer(self.this_sy, many=False)
        csrf_token = csrf.get_token(request)
        return Response({"csrf_token": csrf_token, "schoolyear_details": serializer.data})

    def post(self, request, format=None):
        data = request.data
        this_sy = schoolYear.objects.first()
        try:
            start_on = datetime.strptime(
                data["start_on"], "%Y-%m-%d").date() if "start_on" in data else None
            until = datetime.strptime(data["until"], "%Y-%m-%d").date()

            if until > date.today():
                this_sy.until = until
                if start_on:
                    this_sy.start_on = start_on

                this_sy.save()
                return Response({})
            else:
                return Response({"Not Ok": "Until date must be greater than date today."})

        except Exception as e:
            print(e)
            return Response({}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class get_update_admission_schedule(APIView):
    permission_classes = [EnrollmentValidationPermissions]

    def get(self, request, format=None):
        this_sy = schoolYear.objects.first()
        this_setup = enrollment_admission_setup.objects.annotate(can_update_startdate=Case(
            When(start_date__gt=date.today(), then=Value(True)),
            default=Value(False)), can_update_this_setup=Case(
                When(ea_setup_sy__until__gte=date.today(), then=Value(True)),
                default=Value(False))).filter(ea_setup_sy=this_sy).first()

        serializer = ea_setup_serializer(this_setup, many=False)
        csrf_token = csrf.get_token(request)
        return Response({"csrf_token": csrf_token, "setupDetails": serializer.data})

    def post(self, request, format=None):
        data = request.data
        try:
            this_sy = schoolYear.objects.first()
            this_setup = enrollment_admission_setup.objects.get(
                ea_setup_sy=this_sy)

            start_date = datetime.strptime(
                data["start_date"], "%Y-%m-%d").date() if "start_date" in data else None
            end_date = datetime.strptime(data["end_date"], "%Y-%m-%d").date()

            if end_date > date.today():
                this_setup.end_date = end_date
                if start_date:
                    this_setup.start_date = start_date

                this_setup.save()
                return Response({})
            else:
                return Response({"Not Ok": "End date must be greater than date today."})

        except Exception as e:
            print(e)
            return Response({}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class get_classLists(APIView):
    permission_classes = [EnrollmentValidationPermissions]

    def get(self, request, format=None):
        data = schoolYear.objects.prefetch_related(Prefetch("sy_section", queryset=schoolSections.objects.annotate(count_students=Count(
            'students', filter=Q(students__is_accepted=True, students__is_denied=False))).filter(count_students__gte=1).prefetch_related(Prefetch(
                "students", queryset=student_enrollment_details.validatedObjects.all()))))

        serializer = classList_serializer(data, many=True)
        return Response(serializer.data)


@method_decorator([login_required(login_url="usersPortal:login"), user_passes_test(registrar_only, login_url="studentportal:index")], name="dispatch")
class print_sections(TemplateView):
    template_name = "registrarportal/classList/printing.html"

    def post(self, request, *args, **kwargs):
        selected_options = request.POST.getlist('options')

        if selected_options:
            data = self.sections.filter(pk__in=selected_options).prefetch_related(
                Prefetch("students", queryset=student_enrollment_details.validatedObjects.all(), to_attr='student_list')).order_by('name')

            workbook = Workbook()
            worksheet = workbook.active
            column_names = ['School Year', 'Section',
                            'Student Name (full name)', 'Age', 'Sex']
            worksheet.append(column_names)
            worksheet.row_dimensions[1].height = 24

            # Center column names
            for key, name in enumerate(column_names):
                cell = worksheet.cell(1, key+1)
                cell.border = Border(top=Side(border_style='medium'), right=Side(
                    border_style='medium'), left=Side(border_style='medium'), bottom=Side(border_style='medium'))
                cell.font = Font(name='Arial Rounded MT Bold',
                                 size=12, bold=True)
                cell.alignment = Alignment(horizontal='center')

            for section in data:
                for student in section.student_list:
                    row = [self.get_sy_name(
                        section.sy.id), section.name, student.full_name, student.age, student.admission.sex]
                    worksheet.append(row)

            # Format the worksheet as desired
            worksheet.column_dimensions['A'].width = 35
            worksheet.column_dimensions['B'].width = 25
            worksheet.column_dimensions['C'].width = 70
            worksheet.column_dimensions['D'].width = 15
            worksheet.column_dimensions['E'].width = 15
            worksheet.freeze_panes = 'A2'

            response = HttpResponse(
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            response['Content-Disposition'] = 'attachment; filename="sections.xlsx"'
            workbook.save(response)
            return response

        messages.warning(request, "Select a section to print.")
        return HttpResponseRedirect(reverse("registrarportal:printing", kwargs={"pk": kwargs["pk"]}))

    def get_sy_name(self, id):
        return schoolYear.objects.get(id=int(id)).display_sy()

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Printing"
        context["sections"] = self.sections

        return context

    def dispatch(self, request, *args, **kwargs):
        try:
            pk = int(kwargs["pk"])
            sy = schoolYear.objects.get(id=pk)
            self.sections = schoolSections.objects.filter(sy=sy).alias(count_students=Count('students', filter=Q(
                students__is_accepted=True, students__is_denied=False))).exclude(count_students__lt=1)
            return super().dispatch(request, *args, **kwargs)
        except ObjectDoesNotExist:
            print("Object Does not exist.")
            return HttpResponseRedirect(reverse("registrarportal:view_classlists"))
        except Exception as e:
            print(e)
            return HttpResponseRedirect(reverse("registrarportal:view_classlists"))


class get_grades(APIView):
    permission_classes = [EnrollmentValidationPermissions]

    def get(self, request, section_id, format=None):
        try:
            section = schoolSections.objects.filter(id=int(section_id)).prefetch_related(Prefetch(
                "students", queryset=student_enrollment_details.validatedObjects.all(), to_attr="student_list"), Prefetch(
                    "first_sem_subjects", queryset=subjects.objects.all(), to_attr="First_sem_subjects"), Prefetch(
                        "second_sem_subjects", queryset=subjects.objects.all(), to_attr="Second_sem_subjects")).first()

            if section:
                class_list = list()

                if section.student_list:
                    quarters = student_grades.quarter_choices.choices
                    for student_index, student in enumerate(section.student_list):
                        class_list.append({})
                        class_list[student_index]["id"] = student.applicant.id
                        class_list[student_index]["Name"] = student.full_name
                        class_list[student_index]["Year_level"] = student.year_level
                        class_list[student_index][quarters[0][0]] = self.get_quarter_details(
                            section.First_sem_subjects, quarters[0][0], student.year_level, student.applicant.id)
                        class_list[student_index][quarters[1][0]] = self.get_quarter_details(
                            section.First_sem_subjects, quarters[1][0], student.year_level, student.applicant.id)
                        class_list[student_index][quarters[2][0]] = self.get_quarter_details(
                            section.Second_sem_subjects, quarters[2][0], student.year_level, student.applicant.id)
                        class_list[student_index][quarters[3][0]] = self.get_quarter_details(
                            section.Second_sem_subjects, quarters[3][0], student.year_level, student.applicant.id)

                    csrf_token = csrf.get_token(request)
                    return Response([csrf_token, quarters, class_list])

                else:
                    return Response([])

            return Response([])

        except Exception as e:
            print(e)
            return Response([], status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get_quarter_details(self, q_subjects, quarter, yearLevel, stud_id):
        my_dict = {}
        for index_subj, subject in enumerate(q_subjects):
            my_dict[subject.code] = self.get_subject_grade(
                quarter, yearLevel, stud_id, subject.id)

        return my_dict

    def get_subject_grade(self, quarter, yearLevel, stud_id, subject_id):
        try:
            this_subject_grade = student_grades.objects.get(student__id=int(
                stud_id), subject__id=int(subject_id), quarter=quarter, yearLevel=yearLevel)
            return this_subject_grade.grade
        except ObjectDoesNotExist:
            return None


class post_grades(APIView):
    permission_classes = [EnrollmentValidationPermissions]

    def post(self, request, format=None):
        data = request.data
        try:
            grades = data["grades"]

            for index, grade in enumerate(grades):
                student_id = int(grade["student_id"])
                quarter = grade["kwarter"]
                year_level = grade["ylvl"]
                sbjcts = grade["subjects"]

                for sub_index, sub in enumerate(sbjcts):
                    if sub and sub[1]:
                        get_sg = student_grades.objects.filter(
                            student__id=student_id, subject__code=sub[0], quarter=quarter, yearLevel=year_level).first()
                        if get_sg:
                            student_grades.update_grade(get_sg.id, int(sub[1]))
                        else:
                            student_grades.objects.create(
                                student=User.objects.get(id=student_id),
                                subject=subjects.objects.get(code=sub[0]),
                                quarter=quarter,
                                yearLevel=year_level,
                                grade=int(sub[1])
                            )

            return Response({"Done": "Save grades successfully."})
        except Exception as e:
            print(e)
            return Response([])


class get_admission_with_pending_token_enrollment_v1(APIView):
    permission_classes = [EnrollmentValidationPermissions]

    # For new students
    def get(self, request, format=None):
        this_admissions = student_admission_details.objects.filter(is_accepted=True, is_denied=False).exclude(
            with_enrollment=True).select_related("admission_owner").only("id", "admission_owner")

        serializer = re_token_enrollment_Serializer(this_admissions, many=True)
        csrf_token = csrf.get_token(request)
        return Response([csrf_token, serializer.data])

    def post(self, request, format=None):
        data = request.data

        try:
            re_token_admission = student_admission_details.objects.filter(
                pk__in=data['keys']).exclude(with_enrollment=True, is_accepted=True, is_denied=False)

            if re_token_admission:
                for re_token in re_token_admission:
                    email_tokenized_enrollment_link.delay({
                        "username": re_token.admission_owner.display_name,
                        "domain": get_current_site(request).domain,
                        "uid": urlsafe_base64_encode(force_bytes(re_token.pk)),
                        "token": generate_enrollment_token.make_token(re_token),
                        "expiration_date": (timezone.now() + relativedelta(seconds=settings.ENROLLMENT_TOKEN_TIMEOUT)).strftime("%A, %B %d, %Y - %I:%M: %p")},
                        send_to=re_token.admission_owner.email)
                return Response({"Done": "Re_token Student/s."}, status=status.HTTP_200_OK)
            else:
                return Response({"Done": "No errors but no admission to re_token found."})

        except Exception as e:
            print(e)
            return Response([])
