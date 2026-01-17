"""
Serializers for Customer and Address models.
"""

from rest_framework import serializers

from kompello.core.models.customer_models import Address, Customer
from kompello.core.models import Company


class AddressSerializer(serializers.ModelSerializer):
    """Serializer for the Address model."""
    
    class Meta:
        model = Address
        fields = [
            "uuid",
            "street",
            "street_2",
            "city",
            "state",
            "postal_code",
            "country",
            "created_on",
            "modified_on",
        ]
        read_only_fields = ["uuid", "created_on", "modified_on"]


class CustomerSerializer(serializers.ModelSerializer):
    """Serializer for the Customer model with nested address."""
    
    address = AddressSerializer(required=False, allow_null=True)
    company = serializers.SlugRelatedField(
        slug_field='uuid',
        queryset=Company.objects.all(),
        required=True
    )
    
    class Meta:
        model = Customer
        fields = [
            "uuid",
            "company",
            "title",
            "firstname",
            "lastname",
            "birthdate",
            "email",
            "mobile_phone",
            "landline_phone",
            "address",
            "notes",
            "is_active",
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
    
    def create(self, validated_data):
        """Create a customer with an optional nested address."""
        address_data = validated_data.pop("address", None)
        
        # Create address if provided
        if address_data:
            address = Address.objects.create(**address_data)
            validated_data["address"] = address
        
        customer = Customer.objects.create(**validated_data)
        return customer
    
    def update(self, instance, validated_data):
        """Update a customer and its nested address."""
        address_data = validated_data.pop("address", None)
        
        # Update or create address
        if address_data is not None:
            if instance.address:
                # Update existing address
                for attr, value in address_data.items():
                    setattr(instance.address, attr, value)
                instance.address.save()
            else:
                # Create new address
                address = Address.objects.create(**address_data)
                instance.address = address
        
        # Update customer fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        return instance


class CustomerListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for customer list views."""
    
    address_summary = serializers.SerializerMethodField()
    
    class Meta:
        model = Customer
        fields = [
            "uuid",
            "title",
            "firstname",
            "lastname",
            "email",
            "mobile_phone",
            "landline_phone",
            "address_summary",
            "is_active",
            "created_on",
        ]
        read_only_fields = fields
    
    def get_address_summary(self, obj) -> str | None:
        """Return a brief address summary."""
        if obj.address:
            return f"{obj.address.city}, {obj.address.country}"
        return None
