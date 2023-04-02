from celery import shared_task
from registrarportal.models import student_admission_details, student_enrollment_details, enrollment_batch, admission_batch
from django.db.models import Count, Q, F, Min


@shared_task
def enrollment_batching(enrollmentPk):
    try:
        this_enrollment = student_enrollment_details.objects.get(
            id=int(enrollmentPk))

        get_batches = enrollment_batch.new_batches.filter(
            sy=this_enrollment.enrolled_school_year, section__assignedStrand=this_enrollment.strand, section__yearLevel=this_enrollment.year_level).alias(
                count_members=Count("members", filter=Q(members__is_denied=False))).exclude(count_members__gte=F("section__allowedPopulation")).first()

        if get_batches:
            get_batches.members.add(this_enrollment)
            return f"Added Successfully to the batch."

        else:
            min_batch = enrollment_batch.objects.filter(
                sy=this_enrollment.enrolled_school_year, section__assignedStrand=this_enrollment.strand, section__yearLevel=this_enrollment.year_level).annotate(
                    count_members=Count("members", filter=Q(members__is_denied=False)))

            if min_batch:
                this_batch = min_batch.filter(count_members__lte=min_batch.aggregate(
                    val=Min('count_members'))['val']).first()
                this_batch.members.add(this_enrollment)
                return f"Added successfully to the minimum batch."

            else:
                return f"No mininum batch found."

    except Exception as e:
        return e


@shared_task
def admission_batching(admissionPk):
    try:
        this_admission = student_admission_details.objects.get(
            id=int(admissionPk))

        get_batch = admission_batch.objects.alias(
            count_applicants=Count("members", filter=Q(members__is_denied=False))).filter(
                sy=this_admission.admission_sy).exclude(count_applicants__gte=50).first()

        if not get_batch:
            get_batch = admission_batch.objects.create(
                sy=this_admission.admission_sy)

        get_batch.members.add(this_admission)

        return f"Added successfully to the admission batch."

    except Exception as e:
        return e
