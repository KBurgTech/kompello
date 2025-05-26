from kompello.core.models.auth_models import KompelloUser
from kompello.core.models.base_models import BaseModel, HistoryModel
from django.db import models


class Company(BaseModel, HistoryModel):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    logo = models.FileField(upload_to="company_logos/", blank=True, null=True)
    members = models.ManyToManyField(KompelloUser, related_name="companies", blank=True)
