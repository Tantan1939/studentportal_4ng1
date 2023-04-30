from django import forms
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from . models import *
from registrarportal.forms import validate_startDate

User = get_user_model()


def validate_startDate(date):
    if date < date.today():
        raise ValidationError(
            "Invalid Date! Do not select the previous date.")


def validate_endDate(date):
    if date <= date.today():
        raise ValidationError(
            "Invalid Date! Do not select the previous or current date.")


def validate_newStrand(strand):
    obj = shs_strand.objects.filter(strand_name=strand).first()
    if obj:
        if obj.is_deleted == False:
            raise ValidationError("%s already exist." % strand)


def setup_form_DateValidation(date):
    if date <= date.today():
        raise ValidationError(
            "Invalid Date! Do not select the previous or current date.")


def validate_eventName_uniqueness(name):
    if school_events.ongoingEvents.filter(name__unaccent__icontains=name).exists():
        raise ValidationError(f"{name} is an ongoing event.")


def validate_sectionPopulation(population):
    if int(population) < 15:
        raise ValidationError("Must have 15 students and above.")


def validate_sectionCount(count):
    if int(count) < 1 or int(count) > 26:
        raise ValidationError("Invalid amount.")


class add_shs_track(forms.Form):
    name = forms.CharField(label="Track Name", max_length=50)
    details = forms.CharField(label="Track Details", widget=forms.Textarea)


class add_strand_form(forms.Form):
    track = forms.CharField(label="Course Track", disabled=True)
    strand_name = forms.CharField(
        label="Strand", max_length=5, validators=[validate_newStrand])
    strand_details = forms.CharField(
        label="Complete Strand Name", max_length=50)


class edit_strand_form(forms.Form):
    track = forms.CharField(label="Course Track", disabled=True)
    strand_name = forms.CharField(
        label="Strand", max_length=5)
    strand_details = forms.CharField(
        label="Complete Strand Name", max_length=50)


class makeDocument(forms.Form):
    documentName = forms.CharField(label="Document Name", max_length=50)


class addEventForm(forms.Form):
    name = forms.CharField(label="Event Name", max_length=100, validators=[
                           validate_eventName_uniqueness, ])
    start_on = forms.DateField(label="Start Date", validators=[
                               validate_startDate], widget=forms.DateInput(attrs={'type': 'date'}))


class updateEventForm(forms.Form):
    name = forms.CharField(label="Event Name", max_length=100)
    start_on = forms.DateField(label="Start Date", validators=[
                               validate_startDate], widget=forms.DateInput(attrs={'type': 'date'}))


class addSubjectForm(forms.Form):
    code = forms.CharField(label="Subject Code", max_length=20)
    title = forms.CharField(label="Subject Title", max_length=50)


class g11_firstSem(forms.Form):
    def __init__(self, *args, **kwargs):
        strand_choices = ((strand.id, f"{strand.track.track_name} - {strand.strand_name}")
                          for strand in shs_strand.objects.filter(is_deleted=False))
        subject_choices = ((subject.id, f"{subject.code}: {subject.title}")
                           for subject in subjects.activeSubjects.only("id", "code", "title"))
        super(g11_firstSem, self).__init__(*args, **kwargs)
        self.fields["strand"] = forms.TypedChoiceField(choices=strand_choices)
        self.fields["g11_firstSem_subjects"] = forms.TypedMultipleChoiceField(
            choices=subject_choices)

    effective_date = forms.DateField(label="Effective Date", validators=[
                                     setup_form_DateValidation, ], widget=forms.DateInput(attrs={'type': 'date'}))
    strand = forms.TypedChoiceField(label="Strand", choices=(), coerce=str)
    g11_firstSem_subjects = forms.TypedMultipleChoiceField(
        label="Grade 11 - First Semester Subjects", choices=(), coerce=str)


class g11_secondSem(forms.Form):
    def __init__(self, *args, **kwargs):
        choices = ((subject.id, f"{subject.code} - {subject.title}")
                   for subject in subjects.activeSubjects.only("id", "code", "title"))
        super(g11_secondSem, self).__init__(*args, **kwargs)
        self.fields["g11_secondSem_subjects"] = forms.TypedMultipleChoiceField(
            choices=choices)

    g11_secondSem_subjects = forms.TypedMultipleChoiceField(
        label="Grade 11 - Second Semester Subjects", choices=(), coerce=str)


class g12_firstSem(forms.Form):
    def __init__(self, *args, **kwargs):
        choices = ((subject.id, f"{subject.code} - {subject.title}")
                   for subject in subjects.activeSubjects.only("id", "code", "title"))
        super(g12_firstSem, self).__init__(*args, **kwargs)
        self.fields["g12_firstSem_subjects"] = forms.TypedMultipleChoiceField(
            choices=choices)

    g12_firstSem_subjects = forms.TypedMultipleChoiceField(
        label="Grade 12 - First Semester Subjects", choices=(), coerce=str)


class g12_secondSem(forms.Form):
    def __init__(self, *args, **kwargs):
        choices = ((subject.id, f"{subject.code} - {subject.title}")
                   for subject in subjects.activeSubjects.only("id", "code", "title"))
        super(g12_secondSem, self).__init__(*args, **kwargs)
        self.fields["g12_secondSem_subjects"] = forms.TypedMultipleChoiceField(
            choices=choices)

    g12_secondSem_subjects = forms.TypedMultipleChoiceField(
        label="Grade 12 - Second Semester Subjects", choices=(), coerce=str)


class makeSectionForm(forms.Form):
    def __init__(self, *args, **kwargs):
        choices = ((strand.strand.id, f"{strand.strand.track.track_name}: {strand.strand.strand_name}")
                   for strand in curriculum.objects.filter(strand__is_deleted=False).order_by('strand').distinct('strand'))
        super(makeSectionForm, self).__init__(*args, **kwargs)
        self.fields["yearLevel"] = forms.TypedChoiceField(
            choices=schoolSections.year_levels.choices)
        self.fields["strand"] = forms.TypedChoiceField(choices=choices)

    yearLevel = forms.TypedChoiceField(
        label="Year Level", choices=(), coerce=str)
    strand = forms.TypedChoiceField(label="Strand", choices=(), coerce=str)
    allowedPopulation = forms.CharField(label="Number of students per sections",
                                        help_text="Minimum of 15 students", widget=forms.NumberInput, validators=[validate_sectionPopulation, ], max_length=2)
    numberOfSection = forms.CharField(label="Number of sections to create for this strand",
                                      help_text="Minimum of 1 section.", validators=[validate_sectionCount], max_length=2)


class generate_schedule(forms.Form):
    def __init__(self, *args, **kwargs):
        choices = (((strand.yearLevel, strand.assignedStrand.id), f"{strand.yearLevel}: {strand.assignedStrand.strand_name}")
                   for strand in schoolSections.latestSections.order_by('yearLevel', 'assignedStrand').distinct('yearLevel', 'assignedStrand'))
        super(generate_schedule, self).__init__(*args, **kwargs)
        self.fields["strand"] = forms.TypedChoiceField(choices=choices)

    strand = forms.TypedChoiceField(label="Strand", choices=(), coerce=str)
    class_hours = forms.CharField(
        label="Number of class hours", widget=forms.NumberInput)
    start_time = forms.TimeField(
        label="Start time", widget=forms.TimeInput(attrs={'type': 'time'}))


class add_schoolyear_form(forms.Form):
    start_on = forms.DateField(label="S.Y - Start Date", validators=[
                               validate_startDate], widget=forms.DateInput(attrs={'type': 'date'}))
    until = forms.DateField(label="S.Y - End Date", validators=[
                            validate_endDate], widget=forms.DateInput(attrs={'type': 'date'}))


class ea_setup_form(forms.Form):
    start_date = forms.DateField(label="Admission Start Date", validators=[
                                 setup_form_DateValidation], widget=forms.DateInput(attrs={'type': 'date'}))
    end_date = forms.DateField(label="Admission End Date", validators=[
                               setup_form_DateValidation], widget=forms.DateInput(attrs={'type': 'date'}))
    students_perBatch = forms.CharField(
        label="Number of applicants per admission batch", widget=forms.NumberInput, max_length=2)
