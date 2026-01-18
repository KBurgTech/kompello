from rest_framework import serializers
from django.contrib.contenttypes.models import ContentType

from kompello.core.models.custom_field_models import CustomFieldDefinition
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
