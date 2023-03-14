from rest_framework.serializers import ModelSerializer
from rest_framework import serializers
from . models import note, student_enrollment_details, enrollment_batch, student_report_card, student_id_picture


def add_school_year(start_year, year):
    try:
        return start_year.replace(year=start_year.year + year)
    except ValueError:
        return start_year.replace(year=start_year.year + year, day=28)


class NoteSerializer(ModelSerializer):
    class Meta:
        model = note
        fields = '__all__'


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
    enrolled_school_year = SchoolYearRelationSerializer(
        many=False, read_only=True)
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
        fields = ['applicant', 'strand', 'year_level', 'full_name', 'age', 'is_accepted',
                  'is_denied', 'enrolled_school_year', 'enrollment_address', 'enrollment_contactnumber', 'report_card', 'stud_pict']


class BatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = enrollment_batch
        fields = ['id']


class EnrolleesPkSerializer(serializers.ModelSerializer):
    class Meta:
        model = student_enrollment_details
        fields = ['id']
