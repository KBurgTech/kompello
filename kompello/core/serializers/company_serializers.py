from rest_framework import serializers

from kompello.core.models.company_models import Company


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ["uuid", "name", "description", "logo", "created_on", "modified_on"]
        read_only_fields = ["id", "uuid", "logo", "created_on", "modified_on"]
