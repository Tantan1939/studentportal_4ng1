from rest_framework import permissions


class EnrollmentValidationPermissions(permissions.BasePermission):
    message = "Not allowed to access."

    def has_permission(self, request, view):
        if request.user.is_authenticated and request.user.is_registrar:
            return True
        return False
