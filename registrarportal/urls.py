from django.urls import path, include, re_path
from . views import *
from . import views

app_name = "registrarportal"

urlpatterns = [
    path("", registrarDashboard.as_view(), name="dashboard"),
    path("RequestDocuments/", getList_documentRequest.as_view(),
         name="requestedDocuments"),

    path("schoolyear/", include([
        # path("", view_schoolYears.as_view(), name="schoolyear"),
        # path("Update/<pk>/", update_schoolYear.as_view(), name="updateSchoolYear"),

        path("View/", include([
            path("", get_react_app.as_view(), name="view_schoolyears"),
            path("YearLevel/", get_react_app.as_view()),
        ])),

        path("Api/", include([
            path("", get_schoolYears.as_view()),
            path("get_schoolyear/", get_update_schoolyear_details.as_view()),
            path("admission_schedule/", get_update_admission_schedule.as_view()),
        ])),

    ])),

    path("Admission/", include([
        path("", get_react_app.as_view(), name="view_admissions"),
        path("enrollment_generate/", enrollment_invitation_oldStudents.as_view(),
             name="enrollment_invitation_oldStudents"),
        path("Update_schedule/", update_admission_schedule.as_view(),
             name="update_admission_schedule"),
        re_path(r"admitted_students/(?:(?P<key>[a-zA-Z\d\s]+)/)?$",
                get_admitted_students.as_view(), name="get_admitted_students"),

        path("Api/", include([
            path("get/", get_admissions.as_view()),
            path("denied/", denied_admission.as_view()),
            path("admit/", admit_students.as_view()),
        ])),
    ])),

    path("Enrollment/", include([
        path("", get_react_app.as_view(), name="validate_enrollment"),
        re_path(r"Enrolled_students/(?:(?P<key>[a-zA-Z\d\s]+)/)?$",
                get_enrolled_students.as_view(), name="get_enrolled_students"),

        path("Api/", include([
            path("Get/", get_enrollment_batches.as_view()),
            path("Denied/", denied_enrollee.as_view()),
            path("Accept/", accept_enrollees.as_view()),
            path("Batches/<batchID>/<pk>/", get_available_batchs.as_view()),
            path("Swap_v1/", swap_batches_v1.as_view()),
            path("Swap_v2/", swap_batches_v2.as_view()),
            path("Batchesv2/<batchId>/", get_available_batches_v2.as_view()),
        ])),
    ])),

    # For DRF API
    path("Notes/", include([
        path("", get_notes.as_view(), name="get_notes"),
        path("Details/<pk>/", get_note_details.as_view(), name="get_note_details"),
    ])),
]
