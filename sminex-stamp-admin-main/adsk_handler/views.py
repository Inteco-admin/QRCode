import json
from django.shortcuts import get_object_or_404

from django.http import HttpRequest, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.forms.models import model_to_dict


from .models import AdskProject, AdskUser, GeneralContractor, Sign, LogIncident


def get_stamp_data(request: HttpRequest, project_id: str, user_email: str):
  if request.method == "GET":
    project = get_object_or_404(AdskProject, adsk_id=project_id)
    gc = get_object_or_404(GeneralContractor, adsk_project=project.id)
    user = get_object_or_404(AdskUser, email=user_email)
    sign = get_object_or_404(Sign, adsk_user=user.id)
    data = {"result": "success", "url": sign.img.url, "contactor": gc.name}

    return JsonResponse(data)


@csrf_exempt
@require_http_methods(["POST"])
def create_log(req: HttpRequest):
  data = json.loads(req.body)
  project = get_object_or_404(AdskProject, adsk_id=data["adsk_project"])
  try:
    user = AdskUser.objects.get(email=data["adsk_user"])
  except AdskUser.DoesNotExist:
    user = AdskUser.objects.create(
      email=data["adsk_user"],
    )
    user.save()
  log = LogIncident.objects.create(
      documentName=data["documentName"],
      lType=data["lType"],
      added=data["added"],
      reviewId=data["reviewId"],
      approvalDate=data["approvalDate"],
      resourceUrn=data["resourceUrn"],
      project=project,
      approverUser=user,
  )
  log.save()

  return JsonResponse({"result": "created", "id": log.id}, status=201)


@csrf_exempt
@require_http_methods(["PATCH"])
def update_log(req: HttpRequest, pk):
  data = json.loads(req.body)
  log = get_object_or_404(LogIncident, id=pk)
  if data["added"] and data["added"] == True and data["approvedResourceUrn"]:
    log.added = True
    log.approvedResourceUrn = data["approvedResourceUrn"]
    log.save()

    return JsonResponse({"result": "updated", "id": log.id}, status=200)


@require_http_methods(["GET"])
def get_log_by_document(req: HttpRequest, resourceUrn):
  log = get_object_or_404(LogIncident, resourceUrn=resourceUrn)
  res = model_to_dict(log)
  res["id"] = log.id
  res["adsk_project"] = log.project.adsk_id
  res["adsk_user"] = log.approverUser.email

  return JsonResponse(res)
