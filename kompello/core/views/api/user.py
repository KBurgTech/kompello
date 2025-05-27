from drf_spectacular.utils import extend_schema
from rest_framework import permissions, status
from rest_framework.decorators import action, permission_classes
from rest_framework.request import Request
from rest_framework.response import Response

from kompello.core.models.auth_models import KompelloUser
from kompello.core.permissions import NoOne
from kompello.core.serializers.user_serializers import (
    PasswordSerializer,
    UserSerializer,
)
from kompello.core.views.api.base import BaseModelViewSet


class OwnUserObjectPermission(permissions.BasePermission):
    """
    Allows a user to only access their own user object
    """

    def has_object_permission(self, request, view, obj):
        return request.user == obj


class UserViewSet(BaseModelViewSet):
    queryset = KompelloUser.objects.all()
    serializer_class = UserSerializer

    @permission_classes([permissions.IsAdminUser])
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @permission_classes([OwnUserObjectPermission | permissions.IsAdminUser])
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @permission_classes([OwnUserObjectPermission | permissions.IsAdminUser])
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @permission_classes([OwnUserObjectPermission | permissions.IsAdminUser])
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @permission_classes([OwnUserObjectPermission | permissions.IsAdminUser])
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @permission_classes([NoOne])
    def destroy(self, request, *args, **kwargs):
        print(self.permission_classes)
        return super().destroy(request, *args, **kwargs)

    @extend_schema(
        responses={200: UserSerializer},
        description="Gets the currently logged in user",
        operation_id="users_me",
    )
    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
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
    @permission_classes([OwnUserObjectPermission | permissions.IsAdminUser])
    def set_password(self, request: Request, uuid=None):
        user: KompelloUser = self.get_object()
        serializer = PasswordSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            user.set_password(serializer.validated_data["password"])
            user.save()
            return Response(status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
