from django.contrib.auth.mixins import AccessMixin
from django.urls import reverse_lazy


class AdminAccessMixin(AccessMixin):
    permission_denied_message = "You are not allowed to access this page."
    login_url = reverse_lazy("usersPortal:login")

    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            # if user is not authenticated
            return self.handle_no_permission()

        if request.user.is_superuser:
            return super().dispatch(request, *args, **kwargs)

        return self.handle_no_permission()
