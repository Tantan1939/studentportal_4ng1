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
from .tasks import enrollment_acceptance
from adminportal.models import firstSemSchedule, secondSemSchedule


def loop_enrollment_invitation(request, invitation):
    mail_subject = "Enrollment"
    message = render_to_string("registrarportal/emailTemplates/oldStudents_enrollmentEmail.html", {
        "user_name": invitation.invitation_to.admission_owner.display_name,
        "domain": get_current_site(request).domain,
        "uid": urlsafe_base64_encode(force_bytes(invitation.pk)),
        "token": new_enrollment_token_for_old_students.make_token(invitation),
        "expiration_date": (timezone.now() + relativedelta(seconds=settings.ENROLLMENT_TOKEN_TIMEOUT)).strftime("%A, %B %d, %Y - %I:%M: %p"),
    })
    email = EmailMessage(mail_subject, message, to=[
                         invitation.invitation_to.admission_owner.email])
    try:
        email.send()
        return True
    except Exception as e:
        # messages.error(request, e)
        return False


def enrollment_invitation_emails(request, invitations):
    try:
        loop_requests = [request for item in invitations]
        emails = list(map(loop_enrollment_invitation,
                      loop_requests, invitations))

        messages.success(
            request, f"{emails.count(True)} out of {np.size(emails)} enrollment token has been sent.")

    except Exception as e:
        pass


def enrollment_acceptance_email(request, recipient, name, classDetails):
    get_firstSemDetails = firstSemSchedule.objects.values(
        'subject__title', 'time_in', 'time_out').filter(section__id=classDetails.id)

    get_secondSemDetails = secondSemSchedule.objects.values(
        'subject__title', 'time_in', 'time_out').filter(section__id=classDetails.id)

    mail = render_to_string("registrarportal/emailTemplates/enrollment_acceptance.html", {
        "account_name": name,
        "section_name": classDetails.name,
        "yearlevel": classDetails.get_yearLevel_display(),
        "strand": classDetails.assignedStrand.strand_name,
        "first_sem": get_firstSemDetails,
        "second_sem": get_secondSemDetails
    })
    enrollment_acceptance.delay(mail, recipient)
