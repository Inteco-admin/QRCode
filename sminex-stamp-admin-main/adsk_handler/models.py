import uuid

from django.db import models
from django.utils.translation import gettext_lazy as _


class AdskUser(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    first_name = models.CharField(max_length=200, null=True, blank=True)
    last_name = models.CharField(max_length=200, null=True, blank=True)
    job_title = models.CharField(max_length=200, null=True, blank=True)
    email = models.CharField(max_length=200)
    company = models.CharField(max_length=200, null=True, blank=True)
    adsk_id = models.CharField(max_length=200, db_index=True, null=True, blank=True)

    def __str__(self):
        return self.email


class Sign(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    img = models.ImageField(upload_to="signs/")
    adsk_user = models.OneToOneField(
        AdskUser,
        on_delete=models.CASCADE,
    )

    def __str__(self):
        return self.title


class AdskProject(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    adsk_id = models.CharField(max_length=200, db_index=True)

    def __str__(self):
        return self.name


class GeneralContractor(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    adsk_project = models.OneToOneField(AdskProject, on_delete=models.CASCADE)


class LogIncident(models.Model):
    # class Meta:
    #     managed = False

    class LogType(models.TextChoices):
        QRC = "QRC", _("QR code")
        STA = "STA", _("Stamp")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # documentName, projectName, type, added, approverUserId, reviewId, approvalDate, resourceUrn, projectId
    documentName = models.CharField(max_length=200)
    lType = models.CharField(max_length=200, choices=LogType.choices)
    added = models.BooleanField(default=False)
    reviewId = models.CharField(max_length=200)
    approvalDate = models.DateField()
    resourceUrn = models.CharField(max_length=200)
    approvedResourceUrn = models.CharField(max_length=200, null=True, blank=True)

    project = models.ForeignKey(AdskProject, on_delete=models.CASCADE)
    approverUser = models.ForeignKey(AdskUser, on_delete=models.CASCADE)
