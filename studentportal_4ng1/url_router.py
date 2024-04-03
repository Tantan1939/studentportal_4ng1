from django.urls import reverse_lazy


def login_router(user, next=None):
    url = ""

    if next is None:
        if user.is_superuser:
            url = reverse_lazy("adminportal:index")
        elif user.is_registrar:
            url = reverse_lazy("registrarportal:dashboard")
        else:
            url = "/"

    else:
        url = next

    return url
