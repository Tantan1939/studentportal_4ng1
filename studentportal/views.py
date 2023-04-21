from django.shortcuts import render
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib import messages
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required, user_passes_test
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render, redirect, get_object_or_404
from django.views.generic.base import TemplateView, RedirectView
from django.views.generic import ListView, DetailView
from django.views.generic.edit import FormView, CreateView
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.db import IntegrityError, transaction
from django.db.models import Prefetch, Count, Q, Case, When, Value
from . forms import *
from django.template.loader import render_to_string
from django.conf import settings
from django.core.mail import EmailMessage
from django.contrib.sites.shortcuts import get_current_site
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from ratelimit.decorators import ratelimit
from adminportal.models import *
from formtools.wizard.views import SessionWizardView
from datetime import date, datetime
from smtplib import SMTPException
from usersPortal.models import user_photo
from . models import *
from . email_token import *
from collections import OrderedDict
from django.core.files.storage import DefaultStorage
from registrarportal.models import student_admission_details
import cv2
import pytesseract
from PIL import Image
from registrarportal.tokenGenerators import generate_enrollment_token, new_enrollment_token_for_old_students
from usersPortal.models import user_profile
from django.core.exceptions import ObjectDoesNotExist
from studentportal.tasks import admission_batching, enrollment_batching


User = get_user_model()


def load_userPic(user):
    try:
        user_profilePicture = user_photo.objects.filter(
            photo_of=user.profile).only("image").first()
    except Exception as e:
        user_profilePicture = ""
    return user_profilePicture


def not_authenticated_user(user):
    return not user.is_authenticated


def student_and_anonymous(user):
    if user.is_authenticated:
        return user.is_student
    else:
        return True


def student_access_only(user):
    return user.is_student


# validate the latest school year
def validate_enrollmentSetup(request, sy):
    try:
        dt1 = date.today()
        dt2 = sy.date_created.date()
        dt3 = dt1 - dt2

        if dt3.days < 209:
            return True
        return False
    except:
        return False


@method_decorator(user_passes_test(student_and_anonymous, login_url="adminportal:index"), name="dispatch")
class index(TemplateView):
    template_name = "studentportal/index.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Leandro Locsin Integrated School"

        context["courses"] = shs_track.objects.filter(is_deleted=False).alias(count_strands=Count(
            "track_strand", filter=Q(track_strand__is_deleted=False))).exclude(count_strands__lt=1).prefetch_related(Prefetch(
                "track_strand", queryset=shs_strand.objects.filter(is_deleted=False).order_by("strand_name"), to_attr="strands")).order_by("track_name")

        getEvents = school_events.ongoingEvents.all()
        if getEvents:
            dct = dict()
            for event in getEvents:
                if event.start_on.strftime("%B") not in dct:
                    dct[event.start_on.strftime("%B")] = list()
                    dct[event.start_on.strftime("%B")].append(event)
                else:
                    dct[event.start_on.strftime("%B")].append(event)
            context["events"] = dct

        context["user_profilePicture"] = load_userPic(
            self.request.user) if self.request.user.is_authenticated else ""

        context["enroll_now"] = self.check_enrollment()

        return context

    def check_enrollment(self):
        if not self.request.user.is_authenticated:
            return False
        else:
            if user_no_admission(self.request.user) and check_for_admission_availability(self.request.user):
                return True
            return False


def user_no_admission(user):
    # Return False if the user has validated admission or to_validate admission, the exclude will remove the denied admission from the result
    return not student_admission_details.objects.filter(admission_owner=user).exclude(is_accepted=False, is_denied=True).exists()


def check_for_admission_availability(user):
    sy = schoolYear.objects.first()
    if sy:
        if sy.until > date.today():
            return enrollment_admission_setup.objects.filter(ea_setup_sy=sy, start_date__lte=date.today(), end_date__gt=date.today()).exists()
        return False
    return False


admission_decorators = [login_required(login_url="usersPortal:login"), user_passes_test(student_access_only, login_url="studentportal:index"), user_passes_test(
    user_no_admission, login_url="studentportal:index"), user_passes_test(check_for_admission_availability, login_url="studentportal:index")]


@method_decorator(admission_decorators, name="dispatch")
class select_admission_type(TemplateView):
    template_name = "studentportal/admissionForms/chooseAdmissionType.html"
    http_method_names = ["get"]

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Type of Applicant"
        context["types"] = student_admission_details.applicant_type.choices
        context["user_profilePicture"] = load_userPic(
            self.request.user) if self.request.user.is_authenticated else ""
        return context

    def dispatch(self, request, *args, **kwargs):
        self.get_latest = enrollment_admission_setup.objects.filter(
            ea_setup_sy__until__gt=date.today(), end_date__gte=date.today()).first()
        if self.get_latest and self.get_latest.acceptResponses:
            return super().dispatch(request, *args, **kwargs)

        messages.warning(
            request, "We no longer accept responses for the admission. Please wait for further announcement.")
        return HttpResponseRedirect(reverse("studentportal:index"))


@method_decorator(admission_decorators, name="dispatch")
class admission(SessionWizardView):
    templates = {
        "admission_personal_details": "studentportal/admissionForms/studentDetailsForm.html",
        "elementary_school_details": "studentportal/admissionForms/addPrimarySchoolForm.html",
        "jhs_details": "studentportal/admissionForms/addJHSForm.html",
        "admissionRequirementsForm": "studentportal/admissionForms/phBornDocumentForm.html",
        "foreignApplicantForm": "studentportal/admissionForms/foreignApplicantDocumentForm.html",
        "dualCitizenApplicantForm": "studentportal/admissionForms/dualCitizenApplicantDocumentForm.html",
        "dummy_form": "studentportal/admissionForms/dummyForm.html",
    }

    form_list = [
        ("admission_personal_details", admission_personal_details),
        ("elementary_school_details", elementary_school_details),
        ("jhs_details", jhs_details),
        ("admissionRequirementsForm", admissionRequirementsForm),
        ("foreignApplicantForm", foreignApplicantForm),
        ("dualCitizenApplicantForm", dualCitizenApplicantForm),
        ("dummy_form", dummy_form),
    ]

    file_storage = DefaultStorage()

    def get_form_list(self):
        form_list = OrderedDict()

        form_list["admission_personal_details"] = admission_personal_details
        form_list["elementary_school_details"] = elementary_school_details
        form_list["jhs_details"] = jhs_details

        if self.kwargs["pk"] == "1":
            form_list["admissionRequirementsForm"] = admissionRequirementsForm
        elif self.kwargs["pk"] == "2":
            form_list["foreignApplicantForm"] = foreignApplicantForm
        else:
            form_list["dualCitizenApplicantForm"] = dualCitizenApplicantForm

        form_list["dummy_form"] = dummy_form

        return form_list

    def initialize_row(self, myDict):
        for key, value in myDict.items():
            match key:
                case ("first_chosen_strand" | "second_chosen_strand"):
                    setattr(self.get_admission, key,
                            shs_strand.objects.get(id=int(value)))
                case "elem_pept_date_completion":
                    setattr(self.get_admission, key,
                            value if myDict["elem_pept_passer"] else None)
                case "elem_ae_date_completion":
                    setattr(self.get_admission, key,
                            value if myDict["elem_ae_passer"] else None)
                case "jhs_pept_date_completion":
                    setattr(self.get_admission, key,
                            value if myDict["jhs_pept_passer"] else None)
                case "jhs_ae_date_completion":
                    setattr(self.get_admission, key,
                            value if myDict["jhs_ae_passer"] else None)
                case _:
                    setattr(self.get_admission, key, value)

    def initialize_foreignTables(self, myDict):
        for key, value in myDict.items():
            setattr(self.init_docu, key, value)

    def done(self, form_list, **kwargs):
        try:
            personalDetails = self.get_cleaned_data_for_step(
                "admission_personal_details")
            primarySchoolDetails = self.get_cleaned_data_for_step(
                "elementary_school_details")
            secondarySchoolDetails = self.get_cleaned_data_for_step(
                "jhs_details")
            documents = ""

            if kwargs["pk"] == "1":
                documents = self.get_cleaned_data_for_step(
                    "admissionRequirementsForm")
                self.init_docu = ph_born()
            elif kwargs["pk"] == "2":
                documents = self.get_cleaned_data_for_step(
                    "foreignApplicantForm")
                self.init_docu = foreign_citizen_documents()
            else:
                documents = self.get_cleaned_data_for_step(
                    "dualCitizenApplicantForm")
                self.init_docu = dual_citizen_documents()

            self.get_admission = student_admission_details.objects.filter(
                admission_owner=self.request.user).first()
            if not self.get_admission:
                self.get_admission = student_admission_details()

            self.get_admission.admission_owner = self.request.user
            self.get_admission.is_accepted = False
            self.get_admission.is_denied = False
            self.get_admission.type = int(kwargs["pk"])
            self.get_admission.admission_sy = schoolYear.objects.filter(
                until__gt=date.today()).first()
            self.get_admission.assigned_curriculum = curriculum.objects.filter(
                strand__id=int(personalDetails["first_chosen_strand"])).first()
            self.initialize_row(personalDetails)
            self.initialize_row(primarySchoolDetails)
            self.initialize_row(secondarySchoolDetails)
            self.get_admission.save()

            self.init_docu.admission = self.get_admission
            self.initialize_foreignTables(documents)
            self.init_docu.save()

            admission_batching.delay(self.get_admission.id)

            messages.success(
                self.request, "Admission saved. Kindly wait for the registrar to validate your request.")

        except Exception as e:
            messages.error(self.request, e)

        return HttpResponseRedirect(reverse("studentportal:index"))

    def get_template_names(self):
        return [self.templates[self.steps.current]]

    def render_goto_step(self, goto_step, **kwargs):
        form = self.get_form(data=self.request.POST, files=self.request.FILES)
        if form.is_valid():
            self.storage.set_step_data(
                self.steps.current, self.process_step(form))
            self.storage.set_step_files(
                self.steps.current, self.process_step_files(form))
        return super().render_goto_step(goto_step, **kwargs)

    def get_context_data(self, form, **kwargs):
        context = super().get_context_data(form, **kwargs)
        context["title"] = "Admission"
        context["user_profilePicture"] = load_userPic(
            self.request.user) if self.request.user.is_authenticated else ""
        return context

    def dispatch(self, request, *args, **kwargs):
        try:
            self.get_latest = enrollment_admission_setup.objects.filter(
                ea_setup_sy__until__gt=date.today(), end_date__gte=date.today()).first()
            if self.get_latest and self.get_latest.acceptResponses and kwargs["pk"] in student_admission_details.applicant_type.values:
                return super().dispatch(request, *args, **kwargs)
            else:
                return HttpResponseRedirect(reverse("studentportal:select_type"))
        except Exception as e:
            messages.error(request, e)
            return HttpResponseRedirect(reverse("studentportal:select_type"))


@method_decorator([login_required(login_url="usersPortal:login"), user_passes_test(student_access_only, login_url="studentportal:index")], name="dispatch")
class view_myDocumentRequest(TemplateView):
    template_name = "studentportal/documentRequests/requestedDocuments.html"
    http_method_names = ["get"]

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Document Requests"

        ongoing_requests = documentRequest.objects.annotate(
            can_resched=Case(
                default=Value(True)
            ),
            is_cancelled=Case(
                When(is_cancelledByRegistrar=True, then=Value(True)),
                default=Value(False)
            )
        ).filter(request_by=self.request.user, scheduled_date__gte=date.today()).only("document", "scheduled_date")

        previous_requests = documentRequest.objects.annotate(can_resched=Case(default=Value(False)), is_cancelled=Case(
            default=Value(False))).filter(request_by=self.request.user, scheduled_date__lt=date.today()).only("document", "scheduled_date")

        context["requestedDocuments"] = ongoing_requests.union(
            previous_requests, all=True)

        context["user_profilePicture"] = load_userPic(
            self.request.user) if self.request.user.is_authenticated else ""

        return context


@method_decorator([login_required(login_url="usersPortal:login"), user_passes_test(student_access_only, login_url="studentportal:index")], name="dispatch")
class create_documentRequest(FormView):
    template_name = "studentportal/documentRequests/makeDocumentRequest.html"
    form_class = makeDocumentRequestForm
    success_url = "/DocumentRequests/"

    def form_valid(self, form):
        try:
            checkDocu = documentRequest.objects.filter(document__id=int(
                form.cleaned_data["documents"]), request_by__id=self.request.user.id, scheduled_date__gte=date.today()).first()
            if checkDocu:
                if checkDocu and checkDocu.is_cancelledByRegistrar:
                    messages.warning(
                        self.request, f"Your request to claim {checkDocu.document.documentName} is cancelled by the registrar. You can set another date to reactivate your request.")
                    return self.form_invalid(form)
                else:
                    messages.warning(
                        self.request, f"You have an upcoming schedule to claim your {checkDocu.document.documentName} on {(checkDocu.scheduled_date).strftime('%A, %B %d, %Y')}.")
                    return self.form_invalid(form)
            documentRequest.objects.create(
                document=studentDocument.objects.get(
                    pk=int(form.cleaned_data["documents"])),
                request_by=self.request.user,
                scheduled_date=form.cleaned_data["scheduled_date"]
            )
            # email_requestDocument(self.request, self.request.user, {"type": form.cleaned_data["documents"], "schedule": (
            #     form.cleaned_data["scheduled_date"]).strftime("%A, %B %d, %Y")})
            messages.success(self.request, "Document request is sent.")
            return super().form_valid(form)

        except Exception as e:
            messages.error(self.request, e)
            return self.form_invalid(form)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Request a Document"
        context["user_profilePicture"] = load_userPic(
            self.request.user) if self.request.user.is_authenticated else ""
        return context


@method_decorator([login_required(login_url="usersPortal:login"), user_passes_test(student_access_only, login_url="studentportal:index")], name="dispatch")
class reschedDocumentRequest(FormView):
    template_name = "studentportal/documentRequests/reschedRequest.html"
    form_class = makeDocumentRequestForm
    success_url = "/DocumentRequests/"

    def get_initial(self):
        initial = super().get_initial()
        initial["documents"] = str(self.obj.document.id)
        initial["scheduled_date"] = self.obj.scheduled_date
        return initial

    def form_valid(self, form):
        if form.has_changed():
            with transaction.atomic():
                update_request = documentRequest.objects.select_for_update().get(pk=self.obj.id)
                update_request.scheduled_date = form.cleaned_data["scheduled_date"]
                if update_request.is_cancelledByRegistrar:
                    update_request.is_cancelledByRegistrar = False
                update_request.save()

            # email_requestDocument(self.request, self.request.user, {"type": form.cleaned_data["documents"], "schedule": (
            #     form.cleaned_data["scheduled_date"]).strftime("%A, %B %d, %Y")})
            return super().form_valid(form)
        return super().form_valid(form)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Reschedule of Request"
        context["user_profilePicture"] = load_userPic(
            self.request.user) if self.request.user.is_authenticated else ""
        return context

    def dispatch(self, request, *args, **kwargs):
        self.obj = documentRequest.objects.filter(pk=int(
            self.kwargs["pk"]), request_by=request.user, scheduled_date__gte=date.today()).first()
        if self.obj:
            return super().dispatch(request, *args, **kwargs)
        messages.warning(request, "No such request found.")
        return HttpResponseRedirect(reverse("studentportal:view_myDocumentRequest"))


@method_decorator([login_required(login_url="usersPortal:login"), user_passes_test(student_access_only, login_url="studentportal:index")], name="dispatch")
class enrollment_new_admission(FormView):
    template_name = "studentportal/enrollmentForms/enrollment.html"
    form_class = enrollment_form1
    success_url = "/"

    def form_valid(self, form):
        try:
            get_age = user_profile.objects.get(user=self.request.user)
            if get_age.user_age():
                save_this = student_enrollment_details()
                save_this.applicant = self.request.user
                save_this.admission = self.admObj
                save_this.strand = shs_strand.objects.get(
                    id=int(form.cleaned_data["select_strand"]))
                save_this.full_name = form.cleaned_data["full_name"]

                save_this.age = get_age.user_age()
                save_this.enrolled_school_year = schoolYear.objects.first()
                save_this.year_level = form.cleaned_data["year_level"]
                save_this.save()

                student_home_address.objects.create(
                    home_of=self.request.user, enrollment=save_this, permanent_home_address=form.cleaned_data["home_address"])
                student_contact_number.objects.create(
                    own_by=self.request.user, enrollment=save_this, cellphone_number=form.cleaned_data["contact_number"])
                student_report_card.objects.create(
                    card_from=save_this, report_card=form.cleaned_data["card"])
                student_id_picture.objects.create(
                    image_from=save_this, user_image=form.cleaned_data["profile_image"])

                self.admObj.with_enrollment = True
                self.admObj.first_chosen_strand = save_this.strand
                self.admObj.assigned_curriculum = curriculum.objects.filter(
                    strand=save_this.strand).first()
                self.admObj.save()

                enrollment_batching.delay(save_this.id)

                messages.success(
                    self.request, "We received your enrollment. Please wait us to validate it.")
                return super().form_valid(form)
            else:
                messages.warning(
                    self.request, "Enrollment Failed. Please complete your profile to continue.")
                return self.form_invalid(form)
        except Exception as e:
            # messages.error(
            #     self.request, "Enrollment Failed. Nakapag-apply kana this school year.")
            return self.form_invalid(form)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Enrollment"
        context["user_profilePicture"] = load_userPic(
            self.request.user) if self.request.user.is_authenticated else ""
        return context

    def dispatch(self, request, *args, **kwargs):
        try:
            uid = force_str(urlsafe_base64_decode(self.kwargs['uidb64']))
            self.admObj = student_admission_details.objects.get(
                pk=uid, admission_owner=request.user)
        except (TypeError, ValueError, OverflowError, ObjectDoesNotExist):
            self.admObj = None

        if self.admObj is not None and generate_enrollment_token.check_token(self.admObj, self.kwargs['token']):
            # Return true if token is still valid
            return super().dispatch(request, *args, **kwargs)
        else:
            # if there's no user found, or the token is no longer valid, or both.
            messages.error(request, "Enrollment link is no longer valid!")
            return HttpResponseRedirect(reverse("studentportal:index"))


@method_decorator([login_required(login_url="usersPortal:login"), user_passes_test(student_access_only, login_url="studentportal:index")], name="dispatch")
class enrollment_old_students(FormView):
    template_name = "studentportal/enrollmentForms/oldStudent_form.html"
    form_class = enrollment_form2
    success_url = "/"

    def form_valid(self, form):
        try:
            get_age = user_profile.objects.get(user=self.request.user)
            if get_age.user_age():
                save_this = student_enrollment_details()
                save_this.applicant = self.request.user
                save_this.admission = self.admObj
                save_this.strand = shs_strand.objects.get(
                    id=int(form.cleaned_data["select_strand"]))
                save_this.full_name = form.cleaned_data["full_name"]

                save_this.age = get_age.user_age()
                save_this.enrolled_school_year = schoolYear.objects.first()
                save_this.year_level = '12'
                save_this.save()

                student_home_address.objects.create(
                    home_of=self.request.user, enrollment=save_this, permanent_home_address=form.cleaned_data["home_address"])
                student_contact_number.objects.create(
                    own_by=self.request.user, enrollment=save_this, cellphone_number=form.cleaned_data["contact_number"])
                student_report_card.objects.create(
                    card_from=save_this, report_card=form.cleaned_data["card"])
                student_id_picture.objects.create(
                    image_from=save_this, user_image=form.cleaned_data["profile_image"])

                self.invObj.is_accepted = True
                self.invObj.save()

                self.admObj.first_chosen_strand = save_this.strand
                self.admObj.assigned_curriculum = curriculum.objects.filter(
                    strand=save_this.strand).first()
                self.admObj.save()

                enrollment_batching.delay(save_this.id)

                messages.success(
                    self.request, "We received your enrollment. Please wait us to validate it.")
                return super().form_valid(form)
            else:
                messages.warning(
                    self.request, "Enrollment Failed. Please complete your profile to continue.")
                return self.form_invalid(form)
        except Exception as e:
            messages.error(
                self.request, "Enrollment Failed. Nakapag-apply kana this school year.")
            return self.form_invalid(form)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Enrollment"
        context["user_profilePicture"] = load_userPic(
            self.request.user) if self.request.user.is_authenticated else ""
        return context

    def dispatch(self, request, *args, **kwargs):
        try:
            uid = force_str(urlsafe_base64_decode(self.kwargs['uidb64']))
            self.invObj = enrollment_invitations.objects.get(
                pk=uid, invitation_to__admission_owner=request.user)
            self.admObj = student_admission_details.objects.get(
                admission_owner=request.user)
        except (TypeError, ValueError, OverflowError, ObjectDoesNotExist):
            self.invObj = None

        if self.invObj is not None and new_enrollment_token_for_old_students.check_token(self.invObj, self.kwargs['token']):
            # Return true if token is still valid
            return super().dispatch(request, *args, **kwargs)
        else:
            # if there's no user found, or the token is no longer valid, or both.
            messages.error(request, "Enrollment link is no longer valid!")
            return HttpResponseRedirect(reverse("studentportal:index"))


@method_decorator([login_required(login_url="usersPortal:login"), user_passes_test(student_access_only, login_url="studentportal:index")], name="dispatch")
class get_submitted_admission(TemplateView):
    template_name = "studentportal/applications/admission_details.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Application"

        context["details"] = student_admission_details.objects.filter(admission_owner=self.request.user).prefetch_related(
            Prefetch("softCopy_admissionRequirements_phBorn",
                     queryset=ph_born.objects.all(), to_attr="phborndocx"),
            Prefetch("softCopy_admissionRequirements_foreigner",
                     queryset=foreign_citizen_documents.objects.all(), to_attr="fborndocx"),
            Prefetch("softCopy_admissionRequirements_dualCitizen",
                     queryset=dual_citizen_documents.objects.all(), to_attr="dborndocx")
        ).annotate(
            can_resub=Case(
                When(is_accepted=False, is_denied=True, admission_sy__until__gt=date.today(
                ), admission_sy__e_a_setup__end_date__gte=date.today(), then=Value(True)),
                default=Value(False)
            )
        )
        context["user_profilePicture"] = load_userPic(
            self.request.user) if self.request.user.is_authenticated else ""

        return context


@method_decorator([login_required(login_url="usersPortal:login"), user_passes_test(student_access_only, login_url="studentportal:index")], name="dispatch")
class resend_admission(FormView):
    template_name = "studentportal/applications/admissionForm.html"
    form_class = phb_admForms
    success_url = "/Applications/"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Resend Admission"
        context["user_profilePicture"] = load_userPic(
            self.request.user) if self.request.user.is_authenticated else ""
        return context

    def check_docu_changes(self, form_docx, change_fields):
        for docx in form_docx:
            if docx in change_fields:
                return True

    def form_valid(self, form):
        try:
            if form.has_changed():
                for field in form.changed_data:
                    match field:
                        case ("first_chosen_strand" | "second_chosen_strand"):
                            setattr(self.get_adm, field, shs_strand.objects.get(
                                id=int(form.cleaned_data[field])))
                        case ("good_moral" | "report_card" | "psa" | "alien_certificate_of_registration" | "study_permit" | "f137" | "dual_citizenship" | "philippine_passport"):
                            pass
                        case _:
                            setattr(self.get_adm, field,
                                    form.cleaned_data[field])
                self.get_adm.is_accepted = False
                self.get_adm.is_denied = False
                self.get_adm.save()

                if self.get_adm.type == '1' and self.check_docu_changes(list(admissionRequirementsForm.declared_fields.keys()), form.changed_data):
                    ph_docx = ph_born.objects.get(admission=self.get_adm)
                    for field in form.changed_data:
                        match field:
                            case ("good_moral" | "report_card" | "psa"):
                                setattr(ph_docx, field,
                                        form.cleaned_data[field])
                            case "admission":
                                setattr(ph_docx, field, self.get_adm)
                            case _:
                                pass
                    ph_docx.save()

                elif self.get_adm.type == '2' and self.check_docu_changes(list(foreignApplicantForm.declared_fields.keys()), form.changed_data):
                    fcd_docx = foreign_citizen_documents.objects.get(
                        admission=self.get_adm)
                    for field in form.changed_data:
                        match field:
                            case ("good_moral" | "report_card" | "psa" | "alien_certificate_of_registration" | "study_permit" | "f137"):
                                setattr(fcd_docx, field,
                                        form.cleaned_data[field])
                            case "admission":
                                setattr(fcd_docx, field, self.get_adm)
                            case _:
                                pass
                    fcd_docx.save()

                elif self.get_adm.type == '3' and self.check_docu_changes(list(dualCitizenApplicantForm.declared_fields.keys()), form.changed_data):
                    dcd_docx = dual_citizen_documents.objects.get(
                        admission=self.get_adm)
                    for field in form.changed_data:
                        match field:
                            case ("good_moral" | "report_card" | "psa" | "dual_citizenship" | "philippine_passport" | "f137"):
                                setattr(dcd_docx, field,
                                        form.cleaned_data[field])
                            case "admission":
                                setattr(dcd_docx, field, self.get_adm)
                            case _:
                                pass
                    dcd_docx.save()

                else:
                    pass
                admission_batching.delay(self.get_adm.id)
                messages.success(self.request, "Admission resubmitted.")
            return super().form_valid(form)
        except Exception as e:
            messages.error(self.request, e)
            return self.form_invalid(form)

    def get_form_class(self):
        if self.get_adm.type == "1":
            return super().get_form_class()
        elif self.get_adm.type == "2":
            return fa_admForms
        elif self.get_adm.type == "3":
            return dca_admForms
        else:
            pass

    def get_initial(self):
        initial = super().get_initial()

        for index, fieldname in enumerate(list(self.get_form_class().declared_fields.keys())):
            match fieldname:
                case "first_chosen_strand":
                    initial[fieldname] = str(
                        self.get_adm.first_chosen_strand.id)
                case "second_chosen_strand":
                    initial[fieldname] = str(
                        self.get_adm.second_chosen_strand.id)
                case ("good_moral" | "report_card" | "psa" | "alien_certificate_of_registration" | "study_permit" | "f137" | "dual_citizenship" | "philippine_passport"):
                    pass
                case _:
                    initial[fieldname] = getattr(self.get_adm, fieldname, "")

        return initial

    def dispatch(self, request, *args, **kwargs):
        self.get_adm = student_admission_details.objects.filter(admission_owner=request.user).annotate(
            can_resub=Case(
                When(is_accepted=False, is_denied=True, admission_sy__until__gt=date.today(
                ), admission_sy__e_a_setup__end_date__gte=date.today(), then=Value(True)),
                default=Value(False)
            )
        ).first()
        if self.get_adm and self.get_adm.can_resub:
            return super().dispatch(request, *args, **kwargs)
        else:
            messages.warning(
                request, "Application can no longer be resubmitted.")
            return HttpResponseRedirect(reverse("studentportal:get_submitted_admission"))


@method_decorator([login_required(login_url="usersPortal:login"), user_passes_test(student_access_only, login_url="studentportal:index")], name="dispatch")
class get_submitted_enrollments(TemplateView):
    template_name = "studentportal/applications/enrollment_details.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Enrollment"

        context["sy_enrolled"] = student_enrollment_details.objects.only(
            "id", "enrolled_school_year").filter(applicant=self.request.user)

        if not "key" in self.kwargs:
            context["enrollments"] = student_enrollment_details.objects.filter(applicant=self.request.user).prefetch_related(
                Prefetch("enrollment_address",
                         queryset=student_home_address.objects.all(), to_attr="address"),
                Prefetch("enrollment_contactnumber", queryset=student_contact_number.objects.all(
                ), to_attr="contactnumber"),
                Prefetch("report_card", queryset=student_report_card.objects.all(
                ), to_attr="reportcard"),
                Prefetch("stud_pict", queryset=student_id_picture.objects.all(
                ), to_attr="studentpicture"),
            ).annotate(
                can_resub=Case(
                    When(is_accepted=False, is_denied=True, enrolled_school_year__until__gt=date.today(
                    ), enrolled_school_year__e_a_setup__end_date__gte=date.today(), then=Value(True)),
                    default=Value(False)
                )
            ).first()

        else:
            context["enrollments"] = student_enrollment_details.objects.filter(id=int(self.kwargs["key"]), applicant=self.request.user).prefetch_related(Prefetch("enrollment_address", queryset=student_home_address.objects.all(), to_attr="address"), Prefetch("enrollment_contactnumber", queryset=student_contact_number.objects.all(), to_attr="contactnumber"), Prefetch(
                "report_card", queryset=student_report_card.objects.all(), to_attr="reportcard"), Prefetch("stud_pict", queryset=student_id_picture.objects.all(), to_attr="studentpicture")).annotate(can_resub=Case(When(is_accepted=False, is_denied=True, enrolled_school_year__until__gt=date.today(), enrolled_school_year__e_a_setup__end_date__gte=date.today(), then=Value(True)), default=Value(False))).first()

        context["user_profilePicture"] = load_userPic(
            self.request.user) if self.request.user.is_authenticated else ""

        return context


@method_decorator([login_required(login_url="usersPortal:login"), user_passes_test(student_access_only, login_url="studentportal:index")], name="dispatch")
class resend_enrollment(FormView):
    template_name = "studentportal/applications/resubmit_enrollment.html"
    form_class = resend_enrollment_form
    success_url = "/Applications/Enrollment/"

    def get_success_url(self):
        return super().get_success_url() + str(self.kwargs["key"])

    def form_valid(self, form):
        try:
            if form.has_changed():
                for field in form.changed_data:
                    match field:
                        case "select_strand":
                            setattr(self.get_enrollment, "strand", shs_strand.objects.get(
                                id=int(form.cleaned_data[field])))
                        case "home_address":
                            student_home_address.objects.filter(id=self.get_enrollment.address[0].id).update(
                                permanent_home_address=form.cleaned_data[field])
                        case "contact_number":
                            student_contact_number.objects.filter(id=self.get_enrollment.contactnumber[0].id).update(
                                cellphone_number=form.cleaned_data[field])
                        case "card":
                            student_report_card.objects.create(
                                card_from=self.get_enrollment, report_card=form.cleaned_data[field])
                        case "profile_image":
                            student_id_picture.objects.create(
                                image_from=self.get_enrollment, user_image=form.cleaned_data[field])
                        case _:
                            setattr(self.get_enrollment, field,
                                    form.cleaned_data[field])
                self.get_enrollment.is_accepted = False
                self.get_enrollment.is_denied = False

                to_updateFields = [field for field in form.changed_data if not field in (
                    "home_address", "contact_number", "card", "profile_image")]
                to_updateFields.append("is_accepted")
                to_updateFields.append("is_denied")

                self.get_enrollment.save(update_fields=to_updateFields)
                enrollment_batching.delay(self.get_enrollment.id)
                messages.success(
                    self.request, "Enrollment resubmitted successfully.")

            return super().form_valid(form)
        except Exception as e:
            return self.form_invalid(form)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Enrollment Resubmission"
        context["return_key"] = self.get_enrollment.id
        context["user_profilePicture"] = load_userPic(
            self.request.user) if self.request.user.is_authenticated else ""
        return context

    def get_initial(self):
        initial = super().get_initial()
        initial["full_name"] = self.get_enrollment.full_name
        initial["year_level"] = self.get_enrollment.year_level
        initial["select_strand"] = str(self.get_enrollment.strand.id)
        initial["home_address"] = str(
            self.get_enrollment.address[0].permanent_home_address)
        initial["contact_number"] = str(
            self.get_enrollment.contactnumber[0].cellphone_number)
        return initial

    def dispatch(self, request, *args, **kwargs):
        self.get_enrollment = student_enrollment_details.objects.filter(id=int(self.kwargs["key"]), applicant=self.request.user).prefetch_related(
            Prefetch("enrollment_address",
                     queryset=student_home_address.objects.all(), to_attr="address"),
            Prefetch("enrollment_contactnumber", queryset=student_contact_number.objects.all(
            ), to_attr="contactnumber"),
            Prefetch("report_card", queryset=student_report_card.objects.all(
            ), to_attr="reportcard"),
            Prefetch("stud_pict", queryset=student_id_picture.objects.all(
            ), to_attr="studentpicture")
        ).annotate(can_resub=Case(When(is_accepted=False, is_denied=True, enrolled_school_year__until__gt=date.today(), enrolled_school_year__e_a_setup__end_date__gte=date.today(), then=Value(True)), default=Value(False))).first()

        if self.get_enrollment and self.get_enrollment.can_resub:
            return super().dispatch(request, *args, **kwargs)
        else:
            return HttpResponseRedirect(reverse("studentportal:get_submitted_enrollments"))


@method_decorator([login_required(login_url="usersPortal:login"), user_passes_test(student_access_only, login_url="studentportal:index")], name="dispatch")
class view_classes(TemplateView):
    template_name = "studentportal/ClassList.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Class"
        context["classes"] = list()

        this_classes = schoolSections.objects.filter(
            classmate__enrollment__applicant__id=self.request.user.id)

        for key, section in enumerate(this_classes):
            context["classes"].append({})
            context["classes"][key]["section_name"] = section.name
            context["classes"][key]["First_sem_subjects"] = dict()

            for index, subject_details in enumerate(section.first_sem_subjects.through.objects.filter(section=section).order_by('time_in')):
                context["classes"][key]["First_sem_subjects"][
                    subject_details.subject.code] = f"{subject_details.time_in.strftime('%I:%M %p %Z')} - {subject_details.time_out.strftime('%I:%M %p %Z')}"

            context["classes"][key]["Second_sem_subjects"] = dict()
            for index, subject_details in enumerate(section.second_sem_subjects.through.objects.filter(section=section).order_by('time_in')):
                context["classes"][key]["Second_sem_subjects"][
                    subject_details.subject.code] = f"{subject_details.time_in.strftime('%I:%M %p %Z')} - {subject_details.time_out.strftime('%I:%M %p %Z')}"

        context["user_profilePicture"] = load_userPic(
            self.request.user) if self.request.user.is_authenticated else ""

        return context


@method_decorator([login_required(login_url="usersPortal:login"), user_passes_test(student_access_only, login_url="studentportal:index")], name="dispatch")
class view_grades(TemplateView):
    template_name = "studentportal/Grades.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Grades"

        try:
            dct = dict()
            this_student_grades = student_grades.objects.filter(
                student__id=self.request.user.id).select_related("subject").order_by("quarter", "-yearLevel")

            for std_grds_indx, std_grds in enumerate(this_student_grades):
                if std_grds.get_yearLevel_display() not in dct:
                    dct[std_grds.get_yearLevel_display()] = dict()
                    dct[std_grds.get_yearLevel_display(
                    )][std_grds.get_quarter_display()] = dict()
                    dct[std_grds.get_yearLevel_display()][std_grds.get_quarter_display(
                    )][std_grds.subject.code] = std_grds.grade if std_grds.grade else ""

                else:
                    if std_grds.get_quarter_display() not in dct[std_grds.get_yearLevel_display()]:
                        dct[std_grds.get_yearLevel_display(
                        )][std_grds.get_quarter_display()] = dict()
                        dct[std_grds.get_yearLevel_display()][std_grds.get_quarter_display(
                        )][std_grds.subject.code] = std_grds.grade if std_grds.grade else ""
                    else:
                        dct[std_grds.get_yearLevel_display()][std_grds.get_quarter_display(
                        )][std_grds.subject.code] = std_grds.grade if std_grds.grade else ""

        except Exception as e:
            dct = dict()

        context["grade_levels"] = dct

        context["user_profilePicture"] = load_userPic(
            self.request.user) if self.request.user.is_authenticated else ""

        return context
