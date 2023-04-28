from django import forms
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
import re
from adminportal.models import *
from registrarportal.models import *
# from usersPortal.forms import validate_imageSize

User = get_user_model()


def validate_imageSize(picture):
    if picture.size > 2*1024*1024:
        raise ValidationError(
            "File size is too big. 2mb is the maximum allowed size.")


def validate_email_chars(email):
    regex_email = re.compile(r"""^([a-zA-Z0-9_\.]+)
                            @
                            (gmail)
                            \.
                            (com)$
                            """, re.VERBOSE)
    res = regex_email.fullmatch(email)
    if not res:
        raise ValidationError("Invalid email address. Try again.")


def validate_username(name):
    regex_name = re.compile(r""" ([a-z\s]+) """, re.VERBOSE | re.IGNORECASE)

    res = regex_name.fullmatch(name)

    if not res:
        raise ValidationError(
            "Username must be a plain texts. Spaces are allowed.")


def birthdate_validator(dt):
    if dt >= date.today():
        raise ValidationError("Invalid date.")


def boolean_choices():
    bool_choices = (
        (True, 'Yes'),
        (False, 'No'),
    )
    return bool_choices


def validate_cp_number(number):
    regex = r"^(09)([0-9]{9})$"
    if not re.match(regex, str(number)):
        raise ValidationError("Invalid Contact Number")


def validate_schedule(dt):
    if dt <= date.today():
        raise ValidationError("Invalid Date.")


class admission_personal_details(forms.Form):
    def __init__(self, *args, **kwargs):
        sex_choices = student_admission_details.SexChoices.choices
        first_strand_choices = ((strand.assignedStrand.id, f"{strand.assignedStrand.track.track_name}: {strand.assignedStrand.strand_name}")
                                for strand in schoolSections.latestSections.order_by('assignedStrand').distinct('assignedStrand'))
        second_strand_choices = ((strand.assignedStrand.id, f"{strand.assignedStrand.track.track_name}: {strand.assignedStrand.strand_name}")
                                 for strand in schoolSections.latestSections.order_by('assignedStrand').distinct('assignedStrand'))
        super(admission_personal_details, self).__init__(*args, **kwargs)
        self.fields["sex"] = forms.TypedChoiceField(choices=sex_choices)
        self.fields["first_chosen_strand"] = forms.TypedChoiceField(
            choices=first_strand_choices)
        self.fields["second_chosen_strand"] = forms.TypedChoiceField(
            choices=second_strand_choices)

    first_name = forms.CharField(
        label="First Name", max_length=20)
    middle_name = forms.CharField(
        label="Middle Name", max_length=20)
    last_name = forms.CharField(
        label="Last Name", max_length=20)
    sex = forms.TypedChoiceField(
        label="Sex", choices=(), coerce=str)
    date_of_birth = forms.DateField(label="Birthdate", validators=[
        birthdate_validator], widget=forms.DateInput(attrs={'type': 'date'}))
    birthplace = forms.CharField(
        label="Place of birth", max_length=200)
    nationality = forms.CharField(
        label="Nationality", max_length=50)
    first_chosen_strand = forms.TypedChoiceField(
        label="Choose First Strand", choices=(), coerce=str)
    second_chosen_strand = forms.TypedChoiceField(
        label="Choose Second Strand", choices=(), coerce=str)


class elementary_school_details(forms.Form):
    elem_name = forms.CharField(
        label="Elementary School Name", max_length=50)
    elem_address = forms.CharField(
        label="Elementary School Address", max_length=50)
    elem_region = forms.CharField(
        label="School Region", max_length=30)
    elem_year_completed = forms.DateField(label="Year Completed", validators=[
                                          birthdate_validator], widget=forms.DateInput(attrs={'type': 'date'}))
    elem_pept_passer = forms.TypedChoiceField(
        label="Are you a passer of Philippine Educational Placement Test (PEPT) for Elementary Level?", choices=boolean_choices(), coerce=str, required=False)
    elem_pept_date_completion = forms.DateField(label="Date Completed", validators=[
                                                birthdate_validator], widget=forms.DateInput(attrs={'type': 'date'}), required=False, help_text="Enter date completion if PEPT passer")
    elem_ae_passer = forms.TypedChoiceField(
        label="Are you a passer of Accreditation and Equivalency (A&E) Test for Elementary Level?", coerce=str, choices=boolean_choices(), required=False)
    elem_ae_date_completion = forms.DateField(label="Date Completed", validators=[
                                              birthdate_validator], widget=forms.DateInput(attrs={'type': 'date'}), required=False, help_text="Enter date completion if A&E passer")
    elem_community_learning_center = forms.CharField(
        label="Name of Community Learning Center", max_length=50, required=False, help_text="If applicable")
    elem_clc_address = forms.CharField(
        label="Community Learning Center Address", max_length=50, required=False, help_text="If applicable")


class jhs_details(forms.Form):
    jhs_name = forms.CharField(
        label="Junior High School Name", max_length=50)
    jhs_address = forms.CharField(
        label="Junior High School Address", max_length=50)
    jhs_region = forms.CharField(
        label="School Region", max_length=30)
    jhs_year_completed = forms.DateField(label="Year Completed", validators=[
        birthdate_validator], widget=forms.DateInput(attrs={'type': 'date'}))
    jhs_pept_passer = forms.TypedChoiceField(
        label="Are you a passer of Philippine Educational Placement Test (PEPT) for JHS Level?", coerce=str, choices=boolean_choices(), required=False)
    jhs_pept_date_completion = forms.DateField(label="Date Completed", validators=[
                                               birthdate_validator], widget=forms.DateInput(attrs={'type': 'date'}), required=False, help_text="Enter date completion if PEPT passer")
    jhs_ae_passer = forms.TypedChoiceField(
        label="Are you a passer of Accreditation and Equivalency (A&E) Test for JHS Level?", coerce=str, choices=boolean_choices(), required=False)
    jhs_ae_date_completion = forms.DateField(label="Date Completed", validators=[
                                             birthdate_validator], widget=forms.DateInput(attrs={'type': 'date'}), required=False, help_text="Enter date completion if A&E passer")
    jhs_community_learning_center = forms.CharField(
        label="Name of Community Learning Center", max_length=50, required=False, help_text="If applicable")
    jhs_clc_address = forms.CharField(
        label="Community Learning Center Address", max_length=50, required=False, help_text="If applicable")


class admissionRequirementsForm(forms.Form):
    good_moral = forms.FileField(label="Good Moral Certificate", widget=forms.ClearableFileInput(
    ), validators=[validate_imageSize, ])
    report_card = forms.FileField(label="Report Card", widget=forms.ClearableFileInput(
    ), validators=[validate_imageSize, ])
    psa = forms.FileField(label="Philippine Birth Certificate", widget=forms.ClearableFileInput(
    ), validators=[validate_imageSize, ])


class foreignApplicantForm(admissionRequirementsForm):
    alien_certificate_of_registration = forms.FileField(label="Alien Certificate of Registration", widget=forms.ClearableFileInput(
    ), validators=[validate_imageSize, ])
    study_permit = forms.FileField(label="Study Permit", widget=forms.ClearableFileInput(
    ), validators=[validate_imageSize, ])
    f137 = forms.FileField(label="School Permanent Record (F137)", widget=forms.ClearableFileInput(
    ), validators=[validate_imageSize, ])


class dualCitizenApplicantForm(admissionRequirementsForm):
    dual_citizenship = forms.FileField(label="Certificate of Dual Citizenship", widget=forms.ClearableFileInput(
    ), validators=[validate_imageSize, ])
    philippine_passport = forms.FileField(label="Philippine Passport", widget=forms.ClearableFileInput(
    ), validators=[validate_imageSize, ])
    f137 = forms.FileField(label="School Permanent Record (F137)", widget=forms.ClearableFileInput(
    ), validators=[validate_imageSize, ])


class dummy_form(forms.Form):
    name = forms.CharField(max_length=20, label="Nothing...", required=False)


class enrollment_form1(forms.Form):
    def __init__(self, *args, **kwargs):
        yr_level_choices = student_enrollment_details.year_levels.choices
        strand_choices = ((strand.assignedStrand.id, f"{strand.assignedStrand.track.track_name}: {strand.assignedStrand.strand_name}")
                          for strand in schoolSections.latestSections.order_by('assignedStrand').distinct('assignedStrand'))
        super(enrollment_form1, self).__init__(*args, **kwargs)
        self.fields["year_level"] = forms.TypedChoiceField(
            choices=yr_level_choices)
        self.fields["select_strand"] = forms.TypedChoiceField(
            choices=strand_choices)

    # Form for g11 and transferees
    full_name = forms.CharField(
        max_length=60, label='Full Name (Surname, First Name, Middle Name)')
    year_level = forms.TypedChoiceField(
        label="Year Level (Now)", choices=(), coerce=str)
    select_strand = forms.TypedChoiceField(
        label="Select Strand", choices=(), coerce=str)
    home_address = forms.CharField(
        max_length=50, label='Home address (Current)')
    contact_number = forms.CharField(
        label="Contact Number", widget=forms.NumberInput, validators=[validate_cp_number])
    card = forms.ImageField(
        label="Report card", help_text="Report card from previous year or quarter")
    profile_image = forms.ImageField(
        label="Student Photo", help_text="White background with no filters")


class makeDocumentRequestForm(forms.Form):
    def __init__(self, *args, **kwargs):
        docx_choices = studentDocument.activeObjects.values_list(
            "pk", "documentName")
        super(makeDocumentRequestForm, self).__init__(*args, **kwargs)
        self.fields["documents"] = forms.TypedChoiceField(choices=docx_choices)

    documents = forms.TypedChoiceField(
        label="Document Type", choices=(), coerce=str)
    scheduled_date = forms.DateField(label="Schedule", validators=[
                                     validate_schedule], widget=forms.DateInput(attrs={'type': 'date'}))


class enrollment_form2(forms.Form):
    def __init__(self, *args, **kwargs):
        strand_choices = ((strand.assignedStrand.id, f"{strand.assignedStrand.track.track_name}: {strand.assignedStrand.strand_name}")
                          for strand in schoolSections.latestSections.order_by('assignedStrand').distinct('assignedStrand'))
        super(enrollment_form2, self).__init__(*args, **kwargs)
        self.fields["select_strand"] = forms.TypedChoiceField(
            choices=strand_choices)

    # Form for g11 and transferees
    full_name = forms.CharField(
        max_length=60, label='Full Name (Surname, First Name, Middle Name)')
    select_strand = forms.TypedChoiceField(
        label="Select Strand", choices=(), coerce=str)
    home_address = forms.CharField(
        max_length=50, label='Home address (Current)')
    contact_number = forms.CharField(
        label="Contact Number", widget=forms.NumberInput, validators=[validate_cp_number])
    card = forms.ImageField(
        label="Report card", help_text="Report card from previous year or quarter")
    profile_image = forms.ImageField(
        label="Student Photo", help_text="White background with no filters")


class admission_forms(jhs_details, elementary_school_details, admission_personal_details):
    pass


class phb_admForms(admissionRequirementsForm, admission_forms):
    def __init__(self, *args, **kwargs):
        super(phb_admForms, self).__init__(*args, **kwargs)
        self.fields["good_moral"].required = False
        self.fields["report_card"].required = False
        self.fields["psa"].required = False


class fa_admForms(foreignApplicantForm, phb_admForms):
    def __init__(self, *args, **kwargs):
        super(fa_admForms, self).__init__(*args, **kwargs)
        self.fields["alien_certificate_of_registration"].required = False
        self.fields["study_permit"].required = False
        self.fields["f137"].required = False


class dca_admForms(dualCitizenApplicantForm, phb_admForms):
    def __init__(self, *args, **kwargs):
        super(dca_admForms, self).__init__(*args, **kwargs)
        self.fields["dual_citizenship"].required = False
        self.fields["philippine_passport"].required = False
        self.fields["f137"].required = False


class resend_enrollment_form(enrollment_form1):
    def __init__(self, *args, **kwargs):
        super(resend_enrollment_form, self).__init__(*args, **kwargs)
        self.fields["card"].required = False
        self.fields["profile_image"].required = False
