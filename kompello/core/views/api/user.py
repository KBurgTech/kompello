from drf_spectacular.utils import extend_schema
from rest_framework import permissions, status
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response

from kompello.core.models.auth_models import KompelloUser
from kompello.core.permissions import NoOne
from kompello.core.serializers.user_serializers import (
    PasswordSerializer,
    UserSerializer,
)
from kompello.core.views.api.base import BaseModelViewSet


class KompelloUserPermissions(permissions.BasePermission):
    """
    Allows a user to only access their own user object
    """

    def has_object_permission(self, request, view, obj):
        return request.user == obj


class UserViewSet(BaseModelViewSet):
    queryset = KompelloUser.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action == "destroy":
            permission_classes = [NoOne]
        elif self.action == "list":
            permission_classes = [permissions.IsAdminUser]
        elif self.action in (
            "retrieve",
            "update",
            "partial_update",
            "set_password",
        ):
            permission_classes = [KompelloUserPermissions | permissions.IsAdminUser]
        else:
            permission_classes = [permissions.IsAuthenticated]

        return [permission() for permission in permission_classes]

    @extend_schema(
        responses={200: UserSerializer},
        description="Gets the currently logged in user",
        operation_id="users_me",
    )
    @action(detail=False, methods=["get"])
    def me(self, request: Request):
        user = request.user
        return Response(UserSerializer(user).data)

    @extend_schema(
        request=PasswordSerializer,
        responses={200: {}, 403: {}},
        description="Change a users password",
        operation_id="users_set_password",
    )
    @action(detail=True, methods=["post"])
    def set_password(self, request: Request, uuid=None):
        user: KompelloUser = self.get_object()
        serializer = PasswordSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            user.set_password(serializer.validated_data["password"])
            user.save()
            return Response(status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
