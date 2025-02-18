# Generated by Django 4.1.2 on 2023-05-02 22:40

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('registrarportal', '0010_alter_dual_citizen_documents_admission_and_more'),
        ('adminportal', '0002_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='class_student',
            name='enrollment',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='class_group', to='registrarportal.student_enrollment_details'),
        ),
    ]
