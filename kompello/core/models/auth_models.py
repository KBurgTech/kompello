from django.contrib.auth.models import AbstractUser
from django.db import models
from kompello.core.models.base_models import BaseModel, HistoryModel


class KompelloUser(BaseModel, HistoryModel, AbstractUser):
    """
    Custom user model for Kompello.
    Inherits from AbstractUser to extend the default user model
    Model is auditable and has a history of changes.
    """
    email = models.EmailField(unique=True)
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]
