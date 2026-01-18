"""
Serializer for Currency model.
"""

from rest_framework import serializers

from kompello.core.models.billing_models import Currency
from kompello.core.models import Company


class CurrencySerializer(serializers.ModelSerializer):
    """Serializer for the Currency model."""
    
    company = serializers.SlugRelatedField(
        slug_field='uuid',
        queryset=Company.objects.all(),
        required=True
    )
    
    class Meta:
        model = Currency
        fields = [
            "uuid",
            "company",
            "symbol",
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
