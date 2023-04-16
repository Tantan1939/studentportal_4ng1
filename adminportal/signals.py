from django.db.models.signals import post_save
from django.dispatch import receiver
from . models import schoolSections, class_student, subjects
from registrarportal.models import enrollment_batch, student_grades
from django.db.models import Prefetch


@receiver(post_save, sender=schoolSections)
def enrollmentBatch(sender, instance, created, **kwargs):
    if created:
        # Create new batch for newly-added sections, both grade 11 and 12 sections
        enrollment_batch.objects.create(sy=instance.sy, section=instance)


def get_q_subjects(subjects):
    try:
        this_subjects = []

        for subject in subjects.subjects:
            this_subjects.append(subject)

        return this_subjects

    except Exception as e:
        print(e)
        return []


def save_q_subjects(quarter, student, year_level, subjects):
    try:
        for subject in subjects:
            student_grades.objects.create(
                student=student,
                subject=subject,
                quarter=quarter,
                yearLevel=year_level
            )

        return True
    except Exception as e:
        print(e)
        return False


@receiver(post_save, sender=class_student)
def add_to_studentGrades(sender, instance, created, **kwargs):
    if created:
        quarters = student_grades.quarter_choices.choices
        student_user = instance.enrollment.applicant
        year_level = instance.enrollment.year_level
        f1_subjects = get_q_subjects(schoolSections.objects.filter(id=instance.section.id).prefetch_related(
            Prefetch("first_sem_subjects", queryset=subjects.objects.all(), to_attr="subjects")).first())
        f2_subjects = get_q_subjects(schoolSections.objects.filter(id=instance.section.id).prefetch_related(
            Prefetch("second_sem_subjects", queryset=subjects.objects.all(), to_attr="subjects")).first())

        save_q_subjects(quarters[0][0], student_user, year_level, f1_subjects)
        save_q_subjects(quarters[1][0], student_user, year_level, f1_subjects)
        save_q_subjects(quarters[2][0], student_user, year_level, f2_subjects)
        save_q_subjects(quarters[3][0], student_user, year_level, f2_subjects)

        print("success")
