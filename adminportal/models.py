from django.db import models, transaction
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from django.core.validators import RegexValidator
from datetime import date

User = get_user_model()


def split_this_contactnum(cnum):
    # convert this int type into an str object
    cnum = str(cnum)

    # Initialize a list
    this_list = []

    # Iterate each str into list of str
    for obj in cnum:
        this_list.append(obj)

    # Remove 6 3 from the list
    this_list.pop(0)
    this_list.pop(0)

    # initialize new str variable
    new_doc_contact_num = ""

    # iterate each list item and append to str variable
    for each_lst in this_list:
        new_doc_contact_num += each_lst

    # convert str into int
    new_doc_contact_num = int(new_doc_contact_num)

    # return the update contact num to be display back to caller
    return new_doc_contact_num


def current_school_year():
    date_now = date.today()
    years = 1
    try:
        year_only = date_now.replace(year=date_now.year + years)
    except ValueError:
        year_only = date_now.replace(year=date_now.year + years, day=28)
    sy = " ".join(
        map(str, [date_now.strftime("%Y"), "-", year_only.strftime("%Y")]))

    return sy


class shs_track(models.Model):
    track_name = models.CharField(max_length=50, unique=True)
    definition = models.TextField()
    date_added = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return self.track_name


class shs_strand(models.Model):
    track = models.ForeignKey(
        "shs_track", on_delete=models.RESTRICT, related_name="track_strand")
    strand_name = models.CharField(max_length=5, unique=True)
    definition = models.CharField(max_length=50)
    date_added = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return self.strand_name

    def serialize1(self):
        return {
            "track": self.track.track_name,
            "strand_name": self.strand_name,
            "definition": self.definition,
            "date_added": self.date_added,
            "date_modified": self.date_modified,
            "is_deleted": self.is_deleted,
        }


class manager_ongoingSchoolEvents(models.Manager):
    # Return ongoing school events.
    def get_queryset(self):
        return super().get_queryset().filter(is_cancelled=False, start_on__gte=date.today())


class school_events(models.Model):
    name = models.CharField(max_length=200)
    start_on = models.DateField()
    is_cancelled = models.BooleanField(default=False)
    date_created = models.DateTimeField(auto_now_add=True)
    last_modified = models.DateTimeField(auto_now=True)

    objects = models.Manager()
    ongoingEvents = manager_ongoingSchoolEvents()

    class Meta:
        ordering = ["start_on", "name"]
        base_manager_name = "objects"

    def __str__(self):
        return self.name


class manager_studentDocument(models.Manager):
    # Return active documents
    def get_queryset(self):
        return super().get_queryset().filter(is_active=True)


class studentDocument(models.Model):
    documentName = models.CharField(max_length=50, unique=True)
    is_active = models.BooleanField(default=True)
    date_created = models.DateTimeField(auto_now_add=True)
    last_modified = models.DateTimeField(auto_now=True)

    objects = models.Manager()
    activeObjects = manager_studentDocument()

    def __str__(self):
        return self.documentName

    class Meta:
        ordering = ["documentName", "-date_created", "-last_modified"]


class subjectsManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(is_remove=False)


class subjects(models.Model):
    code = models.CharField(max_length=20, unique=True)
    title = models.CharField(max_length=50, unique=True)
    created_on = models.DateTimeField(auto_now_add=True)
    last_modified = models.DateTimeField(auto_now=True)
    is_remove = models.BooleanField(default=False)

    objects = models.Manager()
    activeSubjects = subjectsManager()

    class Meta:
        ordering = ["title", "-created_on"]
        unique_together = ["code", "title"]

    def __str__(self):
        return f"{self.code}: {self.title}"


class curriculumManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(effective_date__lte=date.today())


class curriculum(models.Model):
    effective_date = models.DateField()

    strand = models.ForeignKey(
        shs_strand, on_delete=models.RESTRICT, related_name="curriculum_strand")

    g11_firstSem_subjects = models.ManyToManyField(
        subjects, related_name="grade11_firstSem")
    g11_secondSem_subjects = models.ManyToManyField(
        subjects, related_name="grade11_secondSem")

    g12_firstSem_subjects = models.ManyToManyField(
        subjects, related_name="grade12_firstSem")
    g12_secondSem_subjects = models.ManyToManyField(
        subjects, related_name="grade12_secondSem")

    allObjects = models.Manager()
    objects = curriculumManager()

    def __str__(self):
        return str(self.pk)

    class Meta:
        ordering = ["-effective_date"]


class sectionManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(sy__until__gte=date.today())


class schoolSections(models.Model):
    class year_levels(models.TextChoices):
        grade_11 = '11', _('Grade 11')
        grade_12 = '12', _('Grade 12')

    name = models.CharField(max_length=30)
    yearLevel = models.CharField(max_length=2, choices=year_levels.choices)
    sy = models.ForeignKey(
        "registrarportal.schoolYear", on_delete=models.RESTRICT, related_name="sy_section")
    assignedStrand = models.ForeignKey(
        shs_strand, on_delete=models.RESTRICT, related_name="section_strand")
    first_sem_subjects = models.ManyToManyField(
        subjects, through="firstSemSchedule", related_name="firstSemSubjects")
    second_sem_subjects = models.ManyToManyField(
        subjects, through="secondSemSchedule", related_name="secondSemSubjects")
    students = models.ManyToManyField(
        "registrarportal.student_enrollment_details", through="class_student", related_name="enrolled_section")
    # Model.m2mfield.through.objects.filter(section=section)
    allowedPopulation = models.IntegerField()
    is_active = models.BooleanField(default=True)
    created_on = models.DateTimeField(auto_now_add=True)
    last_modified = models.DateTimeField(auto_now=True)

    objects = models.Manager()
    latestSections = sectionManager()

    class Meta:
        ordering = ["-created_on"]
        unique_together = ["sy", "name"]

    def __str__(self):
        return self.name


class class_manager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(section__sy__until__gte=date.today())


class class_student(models.Model):
    section = models.ForeignKey(
        schoolSections, on_delete=models.RESTRICT, related_name="classmate")
    enrollment = models.ForeignKey(
        "registrarportal.student_enrollment_details", on_delete=models.CASCADE, related_name="class_group")
    created_on = models.DateTimeField(auto_now_add=True)
    last_modified = models.DateTimeField(auto_now=True)

    objects = models.Manager()
    new_students = class_manager()

    class Meta:
        ordering = ['-created_on']


class firstSemSchedule(models.Model):
    section = models.ForeignKey(
        schoolSections, on_delete=models.RESTRICT, related_name="firstSemSched")
    subject = models.ForeignKey(
        subjects, on_delete=models.RESTRICT, related_name="firstSemSubjectSchedule")
    time_in = models.TimeField(null=True)
    time_out = models.TimeField(null=True)
    created_on = models.DateTimeField(auto_now_add=True)
    last_modified = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_on"]

    @classmethod
    def save_sched(cls, firstSemSubjects, firstSemSchedules):
        try:
            for subject, schedule in zip(firstSemSubjects, firstSemSchedules):
                with transaction.atomic():
                    update_sched = cls.objects.select_for_update().get(pk=subject.id)
                    update_sched.time_in = schedule[0]
                    update_sched.time_out = schedule[1]
                    update_sched.save()
            return True
        except Exception as e:
            return False

    def __str__(self):
        return f"{self.section.name}: {self.subject.code}: {self.time_in} - {self.time_out}"


class secondSemSchedule(models.Model):
    section = models.ForeignKey(
        schoolSections, on_delete=models.RESTRICT, related_name="secondSemSched")
    subject = models.ForeignKey(
        subjects, on_delete=models.RESTRICT, related_name="secondSemSubjectSchedule")
    time_in = models.TimeField(null=True)
    time_out = models.TimeField(null=True)
    created_on = models.DateTimeField(auto_now_add=True)
    last_modified = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_on"]

    @classmethod
    def save_sched(cls, secondSemSubjects, secondSemSchedules):
        try:
            for subject, schedule in zip(secondSemSubjects, secondSemSchedules):
                with transaction.atomic():
                    update_sched = cls.objects.select_for_update().get(pk=subject.id)
                    update_sched.time_in = schedule[0]
                    update_sched.time_out = schedule[1]
                    update_sched.save()
            return True
        except Exception as e:
            return False

    def __str__(self):
        return f"{self.section.name}: {self.subject.code}: {self.time_in} - {self.time_out}"
