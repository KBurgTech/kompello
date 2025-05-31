from rest_framework import permissions
from drf_spectacular.utils import extend_schema
from rest_framework.decorators import action, permission_classes
from rest_framework.generics import QuerySet
from rest_framework.request import Request
from rest_framework.response import Response

from kompello.core.models import Company
from kompello.core.permissions import NoOne
from kompello.core.serializers.company_serializers import CompanySerializer
from kompello.core.serializers.user_serializers import UserSerializer
from kompello.core.views.api.base import BaseModelViewSet


class IsMemberOfCompany(permissions.BasePermission):
    def has_object_permission(self, request: Request, view, obj: Company | QuerySet):
        return obj.members.filter(id=request.user.id).exists()


class CompanyViewSet(BaseModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer

    @permission_classes([IsMemberOfCompany | permissions.IsAdminUser])
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        queryset = queryset.filter(members__id=request.user.id) if not request.user.is_staff else queryset
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @permission_classes([IsMemberOfCompany | permissions.IsAdminUser])
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @permission_classes([permissions.IsAdminUser])
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @permission_classes([IsMemberOfCompany | permissions.IsAdminUser])
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @permission_classes([IsMemberOfCompany | permissions.IsAdminUser])
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @permission_classes([NoOne])
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

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
