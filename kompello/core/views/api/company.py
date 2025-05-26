from rest_framework import permissions
from drf_spectacular.utils import extend_schema
from rest_framework.decorators import action, permission_classes
from rest_framework.request import Request
from rest_framework.response import Response

from kompello.core.models import Company
from kompello.core.serializers.company_serializers import CompanySerializer
from kompello.core.serializers.user_serializers import UserSerializer
from kompello.core.views.api.base import BaseModelViewSet


class IsMemberOfCompany(permissions.BasePermission):
    def has_object_permission(self, request: Request, view, obj: Company):
        if obj.members.filter(id=request.user.id).exists():
            return True
        return False


class CompanyViewSet(BaseModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer

    @extend_schema(
        responses={200: UserSerializer(many=True)},
        description="Get all members of a company (does not include customers).",
        operation_id="company_members",
    )
    @action(detail=True, methods=["get"])
    @permission_classes([IsMemberOfCompany | permissions.IsAdminUser])
    def members(self, request: Request, uuid=None):
        company = self.get_object()
        serializer = UserSerializer(company.members.all(), many=True)
        return Response(serializer.data)
