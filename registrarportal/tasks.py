from celery import shared_task
from django.core.mail import EmailMessage
from django.utils.translation import gettext_lazy as _
from django.template.loader import render_to_string


@shared_task
def email_enrollment_invitation(mail_details, receiver):
    try:
        mail_subject = "Enrollment Invitation"
        email = EmailMessage(mail_subject, mail_details, to=[receiver])
        email.send()
        return f"Enrollment Invitation sent"
    except Exception as e:
        return e


@shared_task
def failed_admission(mail_details, receiver):
    try:
        mail_subject = "Admission Validation Failed"
        email = EmailMessage(mail_subject, mail_details, to=[receiver])
        email.send()
        return f"Admission Validation Failed Email is Sent"
    except Exception as e:
        return e


@shared_task
def failed_enrollment(mail_details, receiver):
    try:
        mail_subject = "Enrollment Validation Failed"
        email = EmailMessage(mail_subject, mail_details, to=[receiver])
        email.send()
        return f"Enrollment Validation Failed Email is Sent"
    except Exception as e:
        return e


@shared_task
def enrollment_acceptance(mail_details, receiver):
    try:
        mail_subject = "Validated Enrollment"
        email = EmailMessage(mail_subject, mail_details, to=[receiver])
        email.send()
        return f"Validated Enrollment Email is Sent"
    except Exception as e:
        return e


@shared_task
def email_tokenized_enrollment_link(instance_dict, send_to):
    try:
        mail_subject = "Enrollment Application"
        message = render_to_string("registrarportal/emailTemplates/enrollmentEmail.html", {
            "user_name": instance_dict["username"],
            "domain": instance_dict["domain"],
            "uid": instance_dict["uid"],
            "token": instance_dict["token"],
            "expiration_date": instance_dict["expiration_date"],
        })
        email = EmailMessage(mail_subject, message, to=[send_to])
        email.send()
        return f"Email Sent"
    except Exception as e:
        return e


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
