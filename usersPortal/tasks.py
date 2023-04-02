from celery import shared_task
from django.core.mail import EmailMessage


@shared_task
def email_account_activation_link(mail_subject, message, receiver, user_name):
    email = EmailMessage(mail_subject, message, to=[receiver])

    try:
        email.send()
        return f"Account activation link for {user_name} is sent to {receiver}"

    except Exception as e:
        return e


@shared_task
def email_account_reset_link(mail_subject, message, receiver, user_name):
    email = EmailMessage(mail_subject, message, to=[receiver])

    try:
        email.send()
        return f"Account reset link for {user_name} is sent to {receiver}"

    except Exception as e:
        return e
