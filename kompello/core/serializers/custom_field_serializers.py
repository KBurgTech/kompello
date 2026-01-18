from rest_framework import serializers
from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import ValidationError as DjangoValidationError
from drf_spectacular.utils import extend_schema_field
from drf_spectacular.types import OpenApiTypes

from kompello.core.models.custom_field_models import CustomFieldDefinition, CustomFieldInstance
from kompello.core.models.company_models import Company


class ContentTypeSlugField(serializers.SlugRelatedField):
    def __init__(self, **kwargs):
        super().__init__(slug_field="id", queryset=ContentType.objects.all(), **kwargs)


class CompanyUuidField(serializers.SlugRelatedField):
    def __init__(self, **kwargs):
        super().__init__(slug_field="uuid", queryset=Company.objects.all(), **kwargs)


class CustomFieldDefinitionSerializer(serializers.ModelSerializer):
    data_type = serializers.ChoiceField(choices=CustomFieldDefinition.FieldDataType.choices)
    model_type = ContentTypeSlugField()
    company = CompanyUuidField()

    class Meta:
        model = CustomFieldDefinition
        fields = [
            "uuid",
            "key",
            "name",
            "data_type",
            "model_type",
            "company",
            "track_history",
            "is_archived",
            "show_in_ui",
            "extra_data",
            "created_on",
            "modified_on",
        ]
        read_only_fields = ["uuid", "created_on", "modified_on"]

    def update(self, instance, validated_data):
        # Prevent changing data_type when instances exist
        new_type = validated_data.get("data_type", instance.data_type)
        if instance.data_type != new_type:
            # check for existing instances
            from kompello.core.models.custom_field_models import CustomFieldInstance

            if CustomFieldInstance.objects.filter(custom_field=instance).exists():
                raise serializers.ValidationError({
                    "data_type": "Cannot change data_type while instances exist for this custom field."
                })

        return super().update(instance, validated_data)


class CustomFieldDefinitionReadSerializer(CustomFieldDefinitionSerializer):
    # represent model_type with model/app label to help client
    model_type = serializers.SerializerMethodField()

    def get_model_type(self, obj):
        return {"id": obj.model_type.id, "app_label": obj.model_type.app_label, "model": obj.model_type.model}


class ModelTypeChoiceSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    app_label = serializers.CharField()
    model = serializers.CharField()


class DataTypeChoiceSerializer(serializers.Serializer):
    value = serializers.IntegerField()
    label = serializers.CharField()


class CustomFieldMetadataSerializer(serializers.Serializer):
    model_types = ModelTypeChoiceSerializer(many=True)
    data_types = DataTypeChoiceSerializer(many=True)


class CustomFieldInstanceSerializer(serializers.Serializer):
    """
    Serializer for custom field instances.
    This is a flat representation optimized for API usage.
    Each custom field is represented by its key and value.
    """
    key = serializers.CharField(source='custom_field.key', read_only=True)
    name = serializers.CharField(source='custom_field.name', read_only=True)
    data_type = serializers.IntegerField(source='custom_field.data_type', read_only=True)
    value = serializers.JSONField()

    class Meta:
        fields = ['key', 'name', 'data_type', 'value']


@extend_schema_field(OpenApiTypes.OBJECT)
class CustomFieldValueSerializer(serializers.Serializer):
    """
    Simplified serializer for writing custom field values.
    Used when creating/updating objects with custom fields.
    Maps field keys to their values.
    """
    # This is a dynamic serializer that accepts any key-value pairs
    def to_internal_value(self, data):
        """Validate that data is a dictionary."""
        if not isinstance(data, dict):
            raise serializers.ValidationError("Custom fields must be a dictionary of key-value pairs.")
        return data

    def to_representation(self, instance):
        """Convert custom field instances to a simple key-value dictionary."""
        if not instance:
            return {}
        # Handle both querysets/lists and GenericRelatedObjectManager
        if hasattr(instance, 'all'):
            instance = instance.all()
        return {cf.custom_field.key: cf.value for cf in instance}


class CustomFieldMixin:
    """
    Mixin to add custom field support to any ModelSerializer.
    
    Usage:
        class MyModelSerializer(CustomFieldMixin, serializers.ModelSerializer):
            class Meta:
                model = MyModel
                fields = [..., 'custom_fields']
    
    The mixin adds:
    - custom_fields field to the serializer (read/write)
    - Automatic creation/update of CustomFieldInstance objects
    - Validation that custom fields belong to the correct company and model type
    """
    
    def get_fields(self):
        """Add custom_fields field dynamically if not already declared."""
        fields = super().get_fields()
        # Only add custom_fields if it's in Meta.fields but not already in the fields dict
        # If it's already declared on the class, don't replace it
        if 'custom_fields' in getattr(self.Meta, 'fields', []) and 'custom_fields' not in fields:
            fields['custom_fields'] = CustomFieldValueSerializer(required=False, allow_null=True)
        return fields
    
    def to_representation(self, instance):
        """Include custom fields in the serialized output."""
        data = super().to_representation(instance)
        
        # Get all custom field instances for this object
        if hasattr(instance, 'custom_fields'):
            custom_field_instances = instance.custom_fields.select_related('custom_field').all()
            data['custom_fields'] = {cf.custom_field.key: cf.value for cf in custom_field_instances}
        else:
            data['custom_fields'] = {}
        
        return data
    
    def create(self, validated_data):
        """Create instance with custom fields."""
        custom_fields_data = validated_data.pop('custom_fields', {})
        instance = super().create(validated_data)
        
        if custom_fields_data:
            self._save_custom_fields(instance, custom_fields_data)
        
        return instance
    
    def update(self, instance, validated_data):
        """Update instance with custom fields."""
        custom_fields_data = validated_data.pop('custom_fields', None)
        instance = super().update(instance, validated_data)
        
        if custom_fields_data is not None:
            self._save_custom_fields(instance, custom_fields_data)
        
        return instance
    
    def _save_custom_fields(self, instance, custom_fields_data):
        """
        Save custom field instances for the given object.
        
        Args:
            instance: The model instance to attach custom fields to
            custom_fields_data: Dictionary mapping field keys to values
        """
        if not custom_fields_data:
            return
        
        # Get the content type for this model
        content_type = ContentType.objects.get_for_model(instance)
        
        # Get the company from the instance
        if not hasattr(instance, 'company'):
            raise serializers.ValidationError({
                "custom_fields": "Model does not have a company field. Custom fields require company association."
            })
        
        company = instance.company
        
        # Get all custom field definitions for this model type and company
        field_definitions_qs = CustomFieldDefinition.objects.filter(
            model_type=content_type,
            company=company
        )
        field_definitions = {cfd.key: cfd for cfd in field_definitions_qs}
        
        # Process each custom field in the data
        for field_key, value in custom_fields_data.items():
            # Validate that the field definition exists
            if field_key not in field_definitions:
                raise serializers.ValidationError({
                    "custom_fields": f"Custom field '{field_key}' does not exist for this model type and company."
                })
            
            field_definition = field_definitions[field_key]
            
            # Check if field is archived
            if field_definition.is_archived:
                raise serializers.ValidationError({
                    "custom_fields": f"Cannot set value for archived custom field '{field_key}'."
                })
            
            # Validate value type based on data_type
            self._validate_custom_field_value(field_definition, field_key, value)
            
            # Create or update the custom field instance
            try:
                CustomFieldInstance.objects.update_or_create(
                    custom_field=field_definition,
                    content_type=content_type,
                    object_id=instance.id,
                    defaults={'value': value}
                )
            except DjangoValidationError as e:
                raise serializers.ValidationError({
                    "custom_fields": f"Error saving custom field '{field_key}': {str(e)}"
                })
    
    def _validate_custom_field_value(self, field_definition, field_key, value):
        """
        Validate that the value matches the expected data type.
        
        Args:
            field_definition: The CustomFieldDefinition instance
            field_key: The field key (for error messages)
            value: The value to validate
        """
        if value is None:
            return  # Allow null values
        
        data_type = field_definition.data_type
        
        if data_type == CustomFieldDefinition.FieldDataType.TEXT:
            if not isinstance(value, str):
                raise serializers.ValidationError({
                    "custom_fields": f"Custom field '{field_key}' expects a text value, got {type(value).__name__}."
                })
        
        elif data_type == CustomFieldDefinition.FieldDataType.NUMBER:
            if not isinstance(value, (int, float)):
                raise serializers.ValidationError({
                    "custom_fields": f"Custom field '{field_key}' expects a number value, got {type(value).__name__}."
                })
        
        elif data_type == CustomFieldDefinition.FieldDataType.BOOLEAN:
            if not isinstance(value, bool):
                raise serializers.ValidationError({
                    "custom_fields": f"Custom field '{field_key}' expects a boolean value, got {type(value).__name__}."
                })
