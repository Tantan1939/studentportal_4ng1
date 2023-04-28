from django.contrib.postgres.operations import UnaccentExtension
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('registrarportal', '0002_initial'),
    ]

    operations = [
        UnaccentExtension()
    ]
