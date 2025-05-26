from django.middleware.csrf import get_token
from drf_spectacular.utils import extend_schema
from rest_framework import permissions, serializers
from rest_framework.decorators import action, permission_classes
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet


class CsrfSerializer(serializers.Serializer):
    csrfToken = serializers.CharField()


class SystemApiViews(ViewSet):
    @extend_schema(
        responses={200: CsrfSerializer()},
        description="Get the CSRF token for the current session.",
        operation_id="system_get_csrf_token",
    )
    @action(detail=False, methods=["get"])
    @permission_classes([permissions.IsAuthenticated])
    def get_csrf_token(self, request):
        """
        Returns the CSRF token for the current session.
        """
        csrf_token = get_token(request)
        serializer = CsrfSerializer(data={"csrfToken": csrf_token})
        serializer.is_valid()
        return Response(serializer.validated_data)
