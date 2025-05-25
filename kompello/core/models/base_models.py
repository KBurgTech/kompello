import uuid as uuid

from auditlog.models import AuditlogHistoryField
from django.db import models


class BaseModel(models.Model):
    """Base model for all models in the application."""
    uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    modified_on = models.DateTimeField(auto_now=True)
    created_on = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True


class HistoryModel(models.Model):
    """Model that includes audit logging for tracking changes."""
    history = AuditlogHistoryField()

    class Meta:
        abstract = True
