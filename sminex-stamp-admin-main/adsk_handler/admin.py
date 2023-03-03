from django.contrib import admin
from django.http import HttpResponseRedirect
from django.urls import path
from .models import Sign, AdskUser, GeneralContractor, AdskProject, LogIncident
from . import forge_service


class SignInline(admin.StackedInline):
  model = Sign


class LogsInlineUser(admin.TabularInline):
  model = LogIncident
  fields = ["added", "lType", "documentName", "approvalDate", "project"]
  extra = 0
  readonly_fields = ["added", "lType",
                     "documentName", "approvalDate", "project"]


class LogsInlineProject(admin.TabularInline):
  model = LogIncident
  fields = ["added", "lType", "documentName", "approvalDate", "approverUser"]
  extra = 0
  readonly_fields = ["added", "lType",
                     "documentName", "approvalDate", "approverUser"]


class AdskUserAdmin(admin.ModelAdmin):
  #change_list_template = "change_list.html"
  search_fields = [
      "email",
  ]
  list_display = (
      "first_name",
      "last_name",
      "email",
      "company",
      "job_title",
  )
  inlines = [SignInline, LogsInlineUser]


class GeneralContractorInline(admin.StackedInline):
  model = GeneralContractor


class AdskProjectAdmin(admin.ModelAdmin):
  change_list_template = "change_list.html"
  change_form_template = "change_project_form.html"

  search_fields = [
      "name",
  ]

  list_display = (
      "name",
      "adsk_id",
  )
  inlines = [
      GeneralContractorInline,
      LogsInlineProject,
  ]

  def get_urls(self):
    urls = super().get_urls()
    my_urls = [
        path('import/', self.import_projects),
    ]
    return my_urls + urls

  def import_projects(self, request):
    forge_service.import_projects()
    self.message_user(request, "All projects be imported")
    return HttpResponseRedirect("../")


class LogAdmin(admin.ModelAdmin):
  list_display = (
      "added",
      "documentName",
      "approvalDate",
      "project",
      "approverUser",
  )

  search_fields = ["project__name", "approverUser__email", "documentName"]
  list_filter = [
      "added",
      "project__name",
      "approverUser__email",
  ]


admin.site.register(AdskUser, AdskUserAdmin)
admin.site.register(AdskProject, AdskProjectAdmin)
admin.site.register(LogIncident, LogAdmin)
