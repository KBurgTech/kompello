"""
ViewSet for Unit model.
"""

from drf_spectacular.utils import OpenApiParameter, OpenApiTypes, extend_schema
from rest_framework import permissions, status
from rest_framework.decorators import permission_classes
from rest_framework.request import Request
from rest_framework.response import Response

from kompello.core.models.billing_models import Unit
from kompello.core.models import Company
from kompello.core.permissions import NoOne, IsMemberOfCompany
from kompello.core.serializers.unit_serializers import UnitSerializer
from kompello.core.views.api.base import BaseModelViewSet


class UnitViewSet(BaseModelViewSet):
    """
    ViewSet for managing units.
    Users can only access units from companies they are members of.
    """
    
    queryset = Unit.objects.select_related("company").all()
    serializer_class = UnitSerializer
    
    def get_queryset(self):
        """Filter queryset to only include units from companies the user is a member of."""
        queryset = super().get_queryset()
        
        # For retrieve/update/destroy operations, allow all objects through
        # and rely on object-level permissions
        if self.action in ['retrieve', 'update', 'partial_update', 'destroy']:
            return queryset
        
        # Admin users can see all units in list
        if self.request.user.is_staff:
            return queryset
        
        # Regular users can only see units from their companies in list
        company_ids = Company.objects.filter(
            members__id=self.request.user.id
        ).values_list("id", flat=True)
        return queryset.filter(company_id__in=company_ids)
    
    @extend_schema(
        description="List units from companies the user is a member of.",
        parameters=[
            OpenApiParameter(
                name="company",
                type=OpenApiTypes.UUID,
                description="Filter units by company UUID.",
                required=False,
            ),
        ],
        responses=UnitSerializer(many=True),
    )
    @permission_classes([permissions.IsAuthenticated])
    def list(self, request: Request, *args, **kwargs):
        """List units from companies the user is a member of."""
        queryset = self.filter_queryset(self.get_queryset())
        
        # Optional filter by company UUID
        company_uuid = request.query_params.get("company")
        if company_uuid:
            queryset = queryset.filter(company__uuid=company_uuid)
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @extend_schema(
        description="Retrieve a specific unit by UUID.",
        responses=UnitSerializer,
    )
    @permission_classes([IsMemberOfCompany | permissions.IsAdminUser])
    def retrieve(self, request: Request, *args, **kwargs):
        """Retrieve a specific unit by UUID."""
        return super().retrieve(request, *args, **kwargs)
    
    @extend_schema(
        description="Create a new unit.",
        request=UnitSerializer,
        responses={201: UnitSerializer},
    )
    @permission_classes([permissions.IsAuthenticated])
    def create(self, request: Request, *args, **kwargs):
        """
        Create a new unit.
        User must be a member of the specified company.
        """
        company_uuid = request.data.get("company")
        if not company_uuid:
            return Response(
                {"company": ["This field is required."]},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            company = Company.objects.get(uuid=company_uuid)
        except Company.DoesNotExist:
            return Response(
                {"company": ["Company not found."]},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if user is a member of the company (unless admin)
        if not request.user.is_staff:
            if not company.members.filter(id=request.user.id).exists():
                return Response(
                    {"detail": "You do not have permission to add units to this company."},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        return super().create(request, *args, **kwargs)
    
    @extend_schema(
        description="Update an existing unit.",
        request=UnitSerializer,
        responses=UnitSerializer,
    )
    @permission_classes([IsMemberOfCompany | permissions.IsAdminUser])
    def update(self, request: Request, *args, **kwargs):
        """Update an existing unit."""
        return super().update(request, *args, **kwargs)
    
    @extend_schema(
        description="Partially update an existing unit.",
        request=UnitSerializer,
        responses=UnitSerializer,
    )
    @permission_classes([IsMemberOfCompany | permissions.IsAdminUser])
    def partial_update(self, request: Request, *args, **kwargs):
        """Partially update an existing unit."""
        return super().partial_update(request, *args, **kwargs)
    
    @extend_schema(
        description="Delete a unit (disabled).",
        responses={405: None},
    )
    @permission_classes([NoOne])
    def destroy(self, request: Request, *args, **kwargs):
        """Deletion is disabled for units."""
        return Response(
            {"detail": "Deletion is not allowed for units."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )
