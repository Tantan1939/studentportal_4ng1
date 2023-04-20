from rest_framework.serializers import ModelSerializer
from rest_framework import serializers
from . models import *
from adminportal.models import schoolSections


def add_school_year(start_year, year):
    try:
        return start_year.replace(year=start_year.year + year)
    except ValueError:
        return start_year.replace(year=start_year.year + year, day=28)


class Ph_born_Serializer(serializers.ModelSerializer):
    class Meta:
        model = ph_born
        fields = ['good_moral', 'report_card', 'psa']


class Fc_docx_Serializer(serializers.ModelSerializer):
    class Meta:
        model = foreign_citizen_documents
        fields = ['good_moral', 'report_card', 'psa',
                  'alien_certificate_of_registration', 'study_permit', 'f137']


class Dc_docx_Serializers(serializers.ModelSerializer):
    class Meta:
        model = dual_citizen_documents
        fields = ['good_moral', 'report_card', 'psa',
                  'dual_citizenship', 'philippine_passport', 'f137']


class AdmissionSerializer(serializers.ModelSerializer):
    admission_owner = serializers.SlugRelatedField(
        many=False,
        read_only=True,
        slug_field='email'
    )
    softCopy_admissionRequirements_phBorn = Ph_born_Serializer(
        many=True, read_only=True, required=False)
    softCopy_admissionRequirements_foreigner = Fc_docx_Serializer(
        many=True, read_only=True, required=False)
    softCopy_admissionRequirements_dualCitizen = Dc_docx_Serializers(
        many=True, read_only=True, required=False)
    type = serializers.CharField(source='get_type_display')
    first_chosen_strand = serializers.SlugRelatedField(
        many=False,
        read_only=True,
        slug_field='strand_name'
    )
    second_chosen_strand = serializers.SlugRelatedField(
        many=False,
        read_only=True,
        slug_field='strand_name'
    )

    class Meta:
        model = student_admission_details
        fields = ['id', 'admission_owner', 'first_name', 'middle_name', 'last_name', 'sex', 'date_of_birth', 'birthplace', 'nationality',
                  'elem_name', 'elem_address', 'elem_region', 'elem_year_completed',
                  'jhs_name', 'jhs_address', 'jhs_region', 'jhs_year_completed',
                  'first_chosen_strand', 'second_chosen_strand', 'type',
                  'softCopy_admissionRequirements_phBorn', 'softCopy_admissionRequirements_foreigner', 'softCopy_admissionRequirements_dualCitizen']


class BatchAdmissionSerializer(serializers.ModelSerializer):
    members = AdmissionSerializer(many=True, read_only=True)
    number_of_applicants = serializers.IntegerField()

    class Meta:
        model = admission_batch
        fields = ['id', 'members', 'number_of_applicants']


class displayCourseSerializer(serializers.RelatedField):
    def to_representation(self, value):
        return f"{value.track.track_name}: {value.strand_name}"


class SchoolYearRelationSerializer(serializers.RelatedField):
    def to_representation(self, value):
        return " ".join(map(str, [value.start_on.strftime("%Y"), "-", (add_school_year(value.start_on, 1)).strftime("%Y")]))


class ReportCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = student_report_card
        fields = ['report_card']


class StudentPicSerializer(serializers.ModelSerializer):
    class Meta:
        model = student_id_picture
        fields = ['user_image']


class EnrollmentSerializer(serializers.ModelSerializer):
    applicant = serializers.SlugRelatedField(
        many=False,
        read_only=True,
        slug_field='email'
    )
    strand = displayCourseSerializer(many=False, read_only=True)
    year_level = serializers.CharField(source='get_year_level_display')
    enrollment_address = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field='permanent_home_address'
    )
    enrollment_contactnumber = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field='cellphone_number'
    )
    report_card = ReportCardSerializer(many=True, read_only=True)
    stud_pict = StudentPicSerializer(many=True, read_only=True)

    class Meta:
        model = student_enrollment_details
        fields = ['id', 'applicant', 'strand', 'year_level', 'full_name', 'age',
                  'enrollment_address', 'enrollment_contactnumber', 'report_card', 'stud_pict']


class Batch_AssignedSection_Serializer(serializers.RelatedField):
    def to_representation(self, value):
        return f"{value.name}"


class EnrollmentBatchSerializer(serializers.ModelSerializer):
    section = Batch_AssignedSection_Serializer(many=False, read_only=True)
    members = EnrollmentSerializer(many=True, read_only=True)
    number_of_enrollment = serializers.IntegerField()

    class Meta:
        model = enrollment_batch
        fields = ['id', 'section', 'members', 'number_of_enrollment']


class batchMemberSerializer(serializers.ModelSerializer):
    stud_pict = StudentPicSerializer(many=True, read_only=True)

    class Meta:
        model = student_enrollment_details
        fields = ['id', 'full_name', 'age', 'stud_pict']


class batchSerializer(serializers.ModelSerializer):
    section = Batch_AssignedSection_Serializer(many=False, read_only=True)
    is_full = serializers.BooleanField()
    allowed_students = serializers.CharField()
    count_members = serializers.IntegerField()
    members = batchMemberSerializer(many=True, read_only=True)

    class Meta:
        model = enrollment_batch
        fields = ['id', 'section', 'is_full', 'members',
                  'allowed_students', 'count_members']


class schoolyear_serializer(serializers.ModelSerializer):
    start_on = serializers.DateField()
    until = serializers.DateField()
    can_update_startdate = serializers.BooleanField()

    class Meta:
        model = schoolYear
        fields = ['id', 'start_on', 'until', 'can_update_startdate']


class ea_setup_serializer(serializers.ModelSerializer):
    can_update_startdate = serializers.BooleanField()
    can_update_this_setup = serializers.BooleanField()
    ea_setup_sy = SchoolYearRelationSerializer(many=False, read_only=True)
    start_date = serializers.DateField()
    end_date = serializers.DateField()

    class Meta:
        model = enrollment_admission_setup
        fields = ['id', 'can_update_startdate', 'can_update_this_setup',
                  'ea_setup_sy', 'start_date', 'end_date']


class student_serializer(serializers.ModelSerializer):
    full_name = serializers.CharField()
    age = serializers.IntegerField()
    admission = serializers.SlugRelatedField(
        many=False, read_only=True, slug_field='sex')

    class Meta:
        model = student_enrollment_details
        fields = ['id', 'full_name', 'age', 'admission']


class section_serializer(serializers.ModelSerializer):
    name = serializers.CharField()
    students = student_serializer(many=True, read_only=True)
    count_students = serializers.IntegerField()

    class Meta:
        model = schoolSections
        fields = ['id', 'name', 'count_students', 'students']


class classList_serializer(serializers.ModelSerializer):
    sy_section = section_serializer(many=True, read_only=True, required=False)
    display_sy = serializers.CharField()

    class Meta:
        model = schoolYear
        fields = ['id', 'display_sy', 'sy_section']


class re_token_enrollment_Serializer(serializers.ModelSerializer):
    admission_owner = serializers.SlugRelatedField(
        many=False, read_only=True, slug_field='email')

    class Meta:
        model = student_admission_details
        fields = ['id', 'admission_owner']
