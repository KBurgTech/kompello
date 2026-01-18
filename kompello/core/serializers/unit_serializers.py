"""
Serializer for Unit model.
"""

from rest_framework import serializers

from kompello.core.models.billing_models import Unit
from kompello.core.models import Company


class UnitSerializer(serializers.ModelSerializer):
    """Serializer for the Unit model."""
    
    company = serializers.SlugRelatedField(
        slug_field='uuid',
        queryset=Company.objects.all(),
        required=True
    )
    
    class Meta:
        model = Unit
        fields = [
            "uuid",
            "company",
            "short_name",
            "long_name",
            "created_on",
            "modified_on",
        ]
        read_only_fields = ["uuid", "created_on", "modified_on"]
    
    def get_fields(self):
        """Make company read-only on updates but writable on creation."""
        fields = super().get_fields()
        if self.instance is not None:  # On update
            fields['company'].read_only = True
        return fields
