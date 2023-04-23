from django.template.loader import render_to_string
from django.core.mail import EmailMessage
from django.contrib.sites.shortcuts import get_current_site
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from . tokenGenerators import generate_enrollment_token, new_enrollment_token_for_old_students
from django.contrib import messages
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from dateutil.relativedelta import relativedelta
from django.conf import settings
import numpy as np
from .tasks import enrollment_acceptance, failed_enrollment, failed_admission, email_enrollment_invitation, cancelledDocumentEmailSend
from adminportal.models import firstSemSchedule, secondSemSchedule


def loop_enrollment_invitation(request, invitation):
    message = render_to_string("registrarportal/emailTemplates/oldStudents_enrollmentEmail.html", {
        "user_name": invitation.invitation_to.admission_owner.display_name,
        "domain": get_current_site(request).domain,
        "uid": urlsafe_base64_encode(force_bytes(invitation.pk)),
        "token": new_enrollment_token_for_old_students.make_token(invitation),
        "expiration_date": (timezone.now() + relativedelta(seconds=settings.ENROLLMENT_TOKEN_TIMEOUT)).strftime("%A, %B %d, %Y - %I:%M: %p"),
    })
    email_enrollment_invitation.delay(
        message, invitation.invitation_to.admission_owner.email)
    return True


def enrollment_invitation_emails(request, invitations):
    # Loop through email invitation
    try:
        loop_requests = [request for item in invitations]
        emails = list(map(loop_enrollment_invitation,
                      loop_requests, invitations))

        messages.success(
            request, "Success.")

    except Exception as e:
        pass


def enrollment_acceptance_email(request, recipient, name, classDetails):
    get_firstSemDetails = firstSemSchedule.objects.filter(section__id=classDetails.id).order_by(
        "time_in").values('subject__title', 'time_in', 'time_out')

    get_secondSemDetails = secondSemSchedule.objects.filter(section__id=classDetails.id).order_by(
        "time_in").values('subject__title', 'time_in', 'time_out')

    mail = render_to_string("registrarportal/emailTemplates/enrollment_acceptance.html", {
        "account_name": name,
        "section_name": classDetails.name,
        "yearlevel": classDetails.get_yearLevel_display(),
        "strand": classDetails.assignedStrand.strand_name,
        "first_sem": get_firstSemDetails,
        "second_sem": get_secondSemDetails
    })
    enrollment_acceptance.delay(mail, recipient)


def denied_enrollment_email(request, recipient, name):
    mail = render_to_string("registrarportal/emailTemplates/deniedEnrollmentEmail.html", {
        "account_name": name,
        "domain": get_current_site(request).domain,
    })
    failed_enrollment.delay(mail, recipient)


def denied_admission_email(request, recipient, name):
    mail = render_to_string("registrarportal/emailTemplates/deniedAdmissionEmail.html", {
        "account_name": name,
        "domain": get_current_site(request).domain,
    })
    failed_admission.delay(mail, recipient)


def cancelDocumentRequest(request, receiver_email, receiver_name, cancelled_date, cancelled_document):
    mail = render_to_string("registrarportal/emailTemplates/cancelledDocumentRequest.html", {
        "account_name": receiver_name,
        "domain": get_current_site(request).domain,
        "document": cancelled_document
    })
    cancelledDocumentEmailSend.delay(mail, cancelled_document, receiver_email)
