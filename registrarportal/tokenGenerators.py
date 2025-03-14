from django.contrib.auth.tokens import PasswordResetTokenGenerator
import six
from datetime import date
from django.conf import settings
from django.utils.crypto import constant_time_compare, salted_hmac
from django.utils.http import base36_to_int, int_to_base36
from django.core.exceptions import ObjectDoesNotExist


class enrollment_token_generator(PasswordResetTokenGenerator):

    def check_token(self, enrObj, token):
        """
        Check that a enrollment token is correct for a given user.
        """
        from registrarportal.models import schoolYear, enrollment_admission_setup

        if not (enrObj and token):
            return False
        # Parse the token
        try:
            ts_b36, _ = token.split("-")
        except ValueError:
            return False

        try:
            ts = base36_to_int(ts_b36)
        except ValueError:
            return False

        # Check that the timestamp/uid has not been tampered with
        for secret in [self.secret, *self.secret_fallbacks]:
            if constant_time_compare(
                self._make_token_with_timestamp(enrObj, ts, secret),
                token,
            ):
                break
        else:
            return False

        # # Check the timestamp is within limit.
        # if (self._num_seconds(self._now()) - ts) > settings.ENROLLMENT_TOKEN_TIMEOUT:
        #     return False
        this_sy = schoolYear.objects.first()

        if not this_sy:
            return False

        if this_sy.until < date.today():
            return False

        try:
            admission_period = enrollment_admission_setup.objects.get(
                ea_setup_sy=this_sy)

            if admission_period.end_date < date.today():
                return False

        except ObjectDoesNotExist:
            return False

        return True

    def _make_hash_value(self, enrObj, timestamp):
        return (
            six.text_type(enrObj.pk) + six.text_type(timestamp) + six.text_type(enrObj.admission_owner.id) + six.text_type(enrObj.first_name) + six.text_type(
                enrObj.is_accepted) + six.text_type(enrObj.admission_sy.id) + six.text_type(enrObj.type) + six.text_type(enrObj.is_denied) + six.text_type(
                    enrObj.with_enrollment) + six.text_type(enrObj.created_on) + six.text_type(enrObj.admission_owner.is_active)
        )


class re_enroll_token_generator(PasswordResetTokenGenerator):

    def check_token(self, inv_object, token):
        """
        Check that a enrollment token is correct for a given user.
        """
        from registrarportal.models import schoolYear, enrollment_admission_setup

        if not (inv_object and token):
            return False
        # Parse the token
        try:
            ts_b36, _ = token.split("-")
        except ValueError:
            return False

        try:
            ts = base36_to_int(ts_b36)
        except ValueError:
            return False

        # Check that the timestamp/uid has not been tampered with
        for secret in [self.secret, *self.secret_fallbacks]:
            if constant_time_compare(
                self._make_token_with_timestamp(inv_object, ts, secret),
                token,
            ):
                break
        else:
            return False

        # Check the timestamp is within limit.
        # if (self._num_seconds(self._now()) - ts) > settings.ENROLLMENT_TOKEN_TIMEOUT:
        #     return False

        this_sy = schoolYear.objects.first()

        if not this_sy:
            return False

        if this_sy.until < date.today():
            return False

        try:
            admission_period = enrollment_admission_setup.objects.get(
                ea_setup_sy=this_sy)

            if admission_period.end_date < date.today():
                return False

        except ObjectDoesNotExist:
            return False

        return True

    def _make_hash_value(self, inv_object, timestamp):
        return (six.text_type(inv_object.pk) + six.text_type(timestamp) + six.text_type(inv_object.invitation_to.admission_owner.id) + six.text_type(inv_object.is_accepted) + six.text_type(inv_object.modified_on))


class deniedAdmissionAccessToken(PasswordResetTokenGenerator):
    def check_token(self, admissionObject, token):
        """
        Check that a enrollment token is correct for a given user.
        """
        from registrarportal.models import schoolYear, enrollment_admission_setup

        if not (admissionObject and token):
            return False
        # Parse the token
        try:
            ts_b36, _ = token.split("-")
        except ValueError:
            return False

        try:
            ts = base36_to_int(ts_b36)
        except ValueError:
            return False

        # Check that the timestamp/uid has not been tampered with
        for secret in [self.secret, *self.secret_fallbacks]:
            if constant_time_compare(
                self._make_token_with_timestamp(admissionObject, ts, secret),
                token,
            ):
                break
        else:
            return False

        # Check the timestamp is within limit.
        # if (self._num_seconds(self._now()) - ts) > settings.ENROLLMENT_TOKEN_TIMEOUT:
        #     return False

        this_sy = schoolYear.objects.first()

        if not this_sy:
            return False

        if this_sy.until < date.today():
            return False

        try:
            admission_period = enrollment_admission_setup.objects.get(
                ea_setup_sy=this_sy)

            if admission_period.end_date < date.today():
                return False

        except ObjectDoesNotExist:
            return False

        return True

    def _make_hash_value(self, admissionObject, timestamp):
        return (six.text_type(admissionObject.pk) + six.text_type(timestamp) + six.text_type(admissionObject.admission_owner.id) + six.text_type(
            admissionObject.is_accepted) + six.text_type(admissionObject.is_denied) + six.text_type(admissionObject.admission_sy.id) + six.text_type(
                admissionObject.with_enrollment) + six.text_type(admissionObject.modified_on) + six.text_type(admissionObject.created_on))


class deniedEnrollmentAccessToken(PasswordResetTokenGenerator):
    def check_token(self, enrollmentObject, token):
        """
        Check that a enrollment token is correct for a given user.
        """
        from registrarportal.models import schoolYear, enrollment_admission_setup

        if not (enrollmentObject and token):
            return False
        # Parse the token
        try:
            ts_b36, _ = token.split("-")
        except ValueError:
            return False

        try:
            ts = base36_to_int(ts_b36)
        except ValueError:
            return False

        # Check that the timestamp/uid has not been tampered with
        for secret in [self.secret, *self.secret_fallbacks]:
            if constant_time_compare(
                self._make_token_with_timestamp(enrollmentObject, ts, secret),
                token,
            ):
                break
        else:
            return False

        # Check the timestamp is within limit.
        # if (self._num_seconds(self._now()) - ts) > settings.ENROLLMENT_TOKEN_TIMEOUT:
        #     return False

        this_sy = schoolYear.objects.first()

        if not this_sy:
            return False

        if this_sy.until < date.today():
            return False

        try:
            admission_period = enrollment_admission_setup.objects.get(
                ea_setup_sy=this_sy)

            if admission_period.end_date < date.today():
                return False

        except ObjectDoesNotExist:
            return False

        return True

    def _make_hash_value(self, enrollmentObject, timestamp):
        return (six.text_type(enrollmentObject.pk) + six.text_type(timestamp) + six.text_type(enrollmentObject.applicant.id) + six.text_type(
            enrollmentObject.admission.id) + six.text_type(enrollmentObject.is_accepted) + six.text_type(enrollmentObject.is_denied) + six.text_type(
                enrollmentObject.enrolled_school_year.id) + six.text_type(enrollmentObject.modified_on) + six.text_type(enrollmentObject.created_on) + six.text_type(
                    enrollmentObject.applicant.is_active))


generate_enrollment_token = enrollment_token_generator()
new_enrollment_token_for_old_students = re_enroll_token_generator()
admissionAccessToken = deniedAdmissionAccessToken()
enrollmentAccessToken = deniedEnrollmentAccessToken()
