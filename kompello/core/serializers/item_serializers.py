"""
Serializers for Item model.
"""

from rest_framework import serializers

from kompello.core.models.billing_models import Item, Currency, Unit
from kompello.core.models import Company
from kompello.core.serializers.currency_serializers import CurrencySerializer
from kompello.core.serializers.unit_serializers import UnitSerializer


class ItemSerializer(serializers.ModelSerializer):
    """Serializer for the Item model with nested currency and unit details."""
    
    company = serializers.SlugRelatedField(
        slug_field='uuid',
        queryset=Company.objects.all(),
        required=True
    )
    currency = serializers.SlugRelatedField(
        slug_field='uuid',
        queryset=Currency.objects.all(),
        required=True
    )
    unit = serializers.SlugRelatedField(
        slug_field='uuid',
        queryset=Unit.objects.all(),
        required=True
    )
    
    # Nested read-only representations for display
    currency_details = CurrencySerializer(source='currency', read_only=True)
    unit_details = UnitSerializer(source='unit', read_only=True)
    
    class Meta:
        model = Item
        fields = [
            "uuid",
            "company",
            "name",
            "description",
            "currency",
            "currency_details",
            "unit",
            "unit_details",
            "price_per_unit",
            "price_max",
            "created_on",
            "modified_on",
        ]
        read_only_fields = ["uuid", "created_on", "modified_on", "currency_details", "unit_details"]
    
    def get_fields(self):
        """Make company read-only on updates but writable on creation."""
        fields = super().get_fields()
        if self.instance is not None:  # On update
            fields['company'].read_only = True
        return fields
    
    def validate(self, data):
        """
        Validate that currency and unit belong to the same company as the item.
        Also validate that price_max is greater than or equal to price_per_unit.
        """
        company = data.get('company', getattr(self.instance, 'company', None))
        currency = data.get('currency', getattr(self.instance, 'currency', None))
        unit = data.get('unit', getattr(self.instance, 'unit', None))
        
        if currency and currency.company != company:
            raise serializers.ValidationError({
                "currency": "Currency must belong to the same company as the item."
            })
        
        if unit and unit.company != company:
            raise serializers.ValidationError({
                "unit": "Unit must belong to the same company as the item."
            })
        
        # Validate price range
        price_per_unit = data.get('price_per_unit', getattr(self.instance, 'price_per_unit', None))
        price_max = data.get('price_max', getattr(self.instance, 'price_max', None))
        
        if price_max is not None and price_per_unit is not None:
            if price_max < price_per_unit:
                raise serializers.ValidationError({
                    "price_max": "Maximum price must be greater than or equal to the base price."
                })
        
        return data


class ItemListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing items."""
    
    currency_symbol = serializers.CharField(source='currency.symbol', read_only=True)
    unit_short_name = serializers.CharField(source='unit.short_name', read_only=True)
    
    class Meta:
        model = Item
        fields = [
            "uuid",
            "company",
            "name",
            "price_per_unit",
            "price_max",
            "currency_symbol",
            "unit_short_name",
            "created_on",
        ]
        read_only_fields = ["uuid", "company", "created_on", "currency_symbol", "unit_short_name"]
