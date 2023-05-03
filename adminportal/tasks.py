from celery import shared_task
from django.contrib.auth import get_user_model
from django.db.models import Count, Q
User = get_user_model()


@shared_task
def remove_dump_datas():
    try:
        dump_datas = User.objects.filter(is_student=True).alias(count_enrollment=Count(
            "stud_enrollment", filter=Q(stud_enrollment__is_accepted=True))).exclude(count_enrollment__gte=1)
        dump_datas.delete()
        return "Dump data deleted successfully."
    except Exception as e:
        return e
