from rest_framework import serializers

class UuidListSerializer(serializers.Serializer):
    uuids = serializers.ListField(child=serializers.UUIDField())
