from celery import shared_task
from . tokenGenerators import generate_enrollment_token
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.template.loader import render_to_string
from django.core.mail import EmailMessage, send_mail
from django.contrib.sites.shortcuts import get_current_site
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from dateutil.relativedelta import relativedelta
from django.conf import settings


@shared_task
def email_users(email_receipent):
    try:
        email = EmailMessage(
            "Email Subject",
            "This is the message",
            to=[email_receipent]
        )
        email.send()
        return "Email sent"
    except Exception as e:
        return e


@shared_task
def note_task(instance):
    return instance

# @shared_task
# def add(x, y):
#     return x + y


# def loop_enrollment_email(request, admissionObj):
#     mail_subject = "Enrollment Application"
#     message = render_to_string("registrarportal/emailTemplates/enrollmentEmail.html", {
#         "user_name": admissionObj.admission_owner.display_name,
#         "domain": get_current_site(request).domain,
#         "uid": urlsafe_base64_encode(force_bytes(admissionObj.pk)),
#         "token": generate_enrollment_token.make_token(admissionObj),
#         "expiration_date": (timezone.now() + relativedelta(seconds=settings.ENROLLMENT_TOKEN_TIMEOUT)).strftime("%A, %B %d, %Y - %I:%M: %p"),
#     })
#     email = EmailMessage(mail_subject, message, to=[
#                          admissionObj.admission_owner.email])
#     try:
#         email.send()
#     except Exception as e:
#         # messages.error(request, e)
#         pass


# @shared_task
# def send_tokenized_enrollment(request, admissionObjs):
#     try:
#         loop_requests = [request for item in admissionObjs]
#         emails = list(map(loop_enrollment_email,
#                       loop_requests, admissionObjs))
#     except Exception as e:
#         # messages.error(request, e)
#         pass


# @shared_task
# def send_email_task(subject, message, recipient_list):
#     email = EmailMessage(
#         subject, message, to=[recipient_list])
#     email.send()
