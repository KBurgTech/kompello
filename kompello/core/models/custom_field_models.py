from auditlog.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.core.serializers.json import DjangoJSONEncoder
from django.core.exceptions import ValidationError
from kompello.core.models.base_models import BaseModel, HistoryModel
from django.db import models

from kompello.core.models.company_models import Company


class CustomFieldDefinition(BaseModel, HistoryModel):
    """Model to define custom fields for various entities."""

    class FieldDataType(models.IntegerChoices):
        """Enumeration for different data types of custom fields."""
        TEXT = 1
        NUMBER = 2
        BOOLEAN = 3

    # key identifies the custom field uniquely across all entities
    key = models.CharField(max_length=256, null=False, blank=False)

    # name is the display name of the custom field
    name = models.CharField(max_length=256, null=False, blank=False)

    # data_type is the type of data stored in the custom field
    data_type = models.IntegerField(choices=FieldDataType.choices, default=FieldDataType.TEXT, null=False, blank=False)

    # model_type indicates the type of entity this custom field is associated with
    model_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=False, blank=False)

    # allow for separate custom fields for different companies
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='custom_fields', null=False, blank=False)

    # should changes to field instances be tracked in history
    track_history = models.BooleanField(default=True, null=False, blank=False)

    # is_archived marks if this field definition is archived (no new instances can be created)
    is_archived = models.BooleanField(default=False, null=False, blank=False)

    # show_in_ui controls if this field should be displayed in the UI
    show_in_ui = models.BooleanField(default=True, null=False, blank=False)

    # extra_data can store additional information like validation rules, options for dropdowns, etc.
    extra_data = models.JSONField(null=True, blank=True)

    class Meta:
        unique_together = ('key', 'model_type', 'company')  # Ensure unique custom field per model type and company

    def delete(self, *args, **kwargs):
        """Prevent deletion if instances exist to avoid data loss"""
        if self.instances.exists():
            raise ValidationError(
                f"Cannot delete custom field definition '{self.key}' with existing instances. This would result in data loss."
            )
        return super().delete(*args, **kwargs)


class CustomFieldInstance(BaseModel, HistoryModel):
    """Model to store instances of custom fields for specific entities."""

    # custom_field is a foreign key to the CustomFieldDefinition
    custom_field = models.ForeignKey(CustomFieldDefinition, on_delete=models.PROTECT, related_name='instances')

    # tracking which model this field instance belongs to using GenericForeignKey
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveBigIntegerField()
    content_object = GenericForeignKey("content_type", "object_id")

    # value stores the actual value of the custom field instance
    value = models.JSONField(null=True, blank=True, encoder=DjangoJSONEncoder)

    def save(self, *args, **kwargs):
        # Prevent creating new instances for archived custom field definitions
        if self.pk is None and self.custom_field_id and self.custom_field.is_archived:
            raise ValidationError(
                f"Cannot create instances for archived custom field: {self.custom_field.key}"
            )
        super().save(*args, **kwargs)

    class Meta:
        indexes = [
            models.Index(fields=["content_type", "object_id"]),
        ]
        unique_together = ('custom_field', 'object_id')  # Ensure unique custom field per entity