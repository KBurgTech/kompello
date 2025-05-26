from rest_framework import serializers

from kompello.core.models.auth_models import KompelloUser


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = KompelloUser
        fields = [
            "uuid",
            "email",
            "first_name",
            "last_name",
            "is_active",
            "created_on",
            "modified_on",
        ]
        read_only_fields = ["id", "uuid", "created_on", "modified_on"]


class PasswordSerializer(serializers.Serializer):
    password = serializers.CharField()
