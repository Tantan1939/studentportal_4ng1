from django.urls import path, include, re_path
from .views import *


app_name = "adminportal"

urlpatterns = [
    path("", index.as_view(), name="index"),

    path("Courses/", include([
        path("", shs_courses.as_view(), name="view_courses"),
        path("add_track/", add_courseTrack.as_view(), name="add_track"),
        path("Track_details/<track_id>/",
             edit_courseTrack.as_view(), name="edit_track"),
        path("Delete_track/<pk>/", delete_courseTrack.as_view(), name="delete_track"),
        path("Add_strand/<track_id>/",
             add_trackStrand.as_view(), name="add_strand"),
        path("Edit_strand/<strand_id>/",
             update_trackStrand.as_view(), name="edit_strand"),
        path("Delete_strand/<pk>/",
             delete_trackStrand.as_view(), name="delete_strand"),
    ])),

    path("schoolDocuments/", include([
        path("", view_schoolDocuments_canRequest.as_view(), name="schoolDocuments"),
        re_path(r"AddOrEdit/(?:(?P<docuId>[0-9]+)/)?$",
                addEditDocument.as_view(), name="addEditDocument"),
        path("hideDocument/<pk>/", hideDocument.as_view(), name="hideDocument"),
    ])),

    path("school_events/", include([
        path("", get_ongoingSchoolEvents.as_view(),
             name="get_ongoingSchoolEvents"),
        path("Add/", add_schoolEvent.as_view(), name="add_schoolEvent"),
        path("Update/<pk>/", edit_schoolEvent.as_view(), name="edit_schoolEvent"),
    ])),

    re_path(r"subjects/(?:(?P<key>[a-zA-ZñÑ\d\s]+)/)?$",
            get_subjects.as_view(), name="getSubjects"),

    path("Subject/", include([
        path("Add/", add_subjects.as_view(), name="addSubjects"),
        path("Update/<pk>", update_subjects.as_view(), name="updateSubjects"),
    ])),

    path("Curriculums/", include([
        path("", view_curriculum.as_view(), name="view_curriculum"),
        path("Add/", add_curriculum.as_view(), name="add_curriculum"),
        path("Update/<pk>", update_curriculum.as_view(), name="update_curriculum"),
    ])),

    path("Sections/", include([
        re_path(r"(?:(?P<year>[0-9]+)/)?$",
                get_sections.as_view(), name="get_sections"),
        path("Generate/", make_section.as_view(), name="new_section"),
        path("Scheduling/", generate_classSchedule.as_view(),
             name="generate_classSchedule"),
    ])),

    path("Schoolyears/", include([
        path("", school_year_index.as_view(), name="schoolyear"),
        path("Add/", add_schoolYear.as_view(), name="add_schoolyear"),
    ])),

]
