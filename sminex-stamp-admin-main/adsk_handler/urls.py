from django.urls import path

from . import views

urlpatterns = [
    path("projects/<str:project_id>/users/<str:user_email>/stamp", views.get_stamp_data),
    path("logs", views.create_log),
    path("logs/documents/<str:resourceUrn>", views.get_log_by_document),
    path("logs/<str:pk>", views.update_log),
]
