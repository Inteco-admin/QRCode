import base64
import requests
from .models import AdskProject

from django.conf import settings


def get_token(APS_CLIENT_ID, APS_CLIENT_SECRET):
  url = "https://developer.api.autodesk.com/authentication/v1/authenticate"

  payload = f"client_id={APS_CLIENT_ID}&client_secret={APS_CLIENT_SECRET}&grant_type=client_credentials&scope=data%3Awrite%20data%3Aread%20bucket%3Aread%20data%3Acreate"
  headers = {"Content-Type": "application/x-www-form-urlencoded"}

  response = requests.request("POST", url, headers=headers, data=payload)

  return response.json()["access_token"]


def get_hub(token: str) -> str:
  """GET info about Autodesk account HUB adn return ID

  Args:
      token (str): bearer token
  Returns:
      str: hub id
  """

  url = "https://developer.api.autodesk.com/project/v1/hubs"

  payload = {}
  headers = {"Authorization": f"Bearer {token}"}

  response = requests.request("GET", url, headers=headers, data=payload)

  return response.json()["data"][0]["id"]


def get_projects(token: str, hub_id: str) -> list:
  """ GET list of projects by hub id

  Args:
      token (str): bearer token
      hub_id (str): autodesk hub id

  Returns:
      list: list of projects
  """

  url = f"https://developer.api.autodesk.com/project/v1/hubs/{hub_id}/projects"

  payload = {}
  headers = {
      'Authorization': f'Bearer {token}'
  }

  response = requests.request("GET", url, headers=headers, data=payload)

  return response.json()["data"]


def import_projects():
  """ Import projects from adsk hub and save or update AdskProject's in database
  """

  bearer = get_token(settings.APS_CLIENT_ID, settings.APS_CLIENT_SECRET)

  id = get_hub(bearer)
  projects = get_projects(bearer, id)
  for p in projects:
    AdskProject.objects.update_or_create(
        adsk_id=p["id"], name=p["attributes"]["name"])
