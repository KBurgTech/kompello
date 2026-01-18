"""
ViewSets for Customer and Address management.
"""

from drf_spectacular.utils import OpenApiParameter, OpenApiTypes, extend_schema
from rest_framework import permissions, status
from rest_framework.decorators import permission_classes
from rest_framework.request import Request
from rest_framework.response import Response

from kompello.core.models import Customer, Company
from kompello.core.permissions import NoOne
from kompello.core.serializers.customer_serializers import (
    CustomerSerializer,
    CustomerListSerializer,
)
from kompello.core.views.api.base import BaseModelViewSet


class IsMemberOfCustomerCompany(permissions.BasePermission):
    """
    Permission to check if the user is a member of the company that owns the customer.
    """
    
    def has_object_permission(self, request: Request, view, obj: Customer):
        return obj.company.members.filter(id=request.user.id).exists()


class CustomerViewSet(BaseModelViewSet):
    """
    ViewSet for managing customers.
    Users can only access customers from companies they are members of.
    """
    
    queryset = Customer.objects.select_related("company", "address").all()
    serializer_class = CustomerSerializer
    
    def get_queryset(self):
        """Filter queryset to only include customers from companies the user is a member of (for list operations)."""
        queryset = super().get_queryset()
        
        # For retrieve/update/destroy operations, allow all objects through
        # and rely on object-level permissions
        if self.action in ['retrieve', 'update', 'partial_update', 'destroy']:
            return queryset
        
        # Admin users can see all customers in list
        if self.request.user.is_staff:
            return queryset
        
        # Regular users can only see customers from their companies in list
        company_ids = Company.objects.filter(
            members__id=self.request.user.id
        ).values_list("id", flat=True)
        return queryset.filter(company_id__in=company_ids)
    
    def get_serializer_class(self):
        """Use lightweight serializer for list views."""
        if self.action == "list":
            return CustomerListSerializer
        return CustomerSerializer
    
    @extend_schema(
        description="List customers from companies the user is a member of.",
        parameters=[
            OpenApiParameter(
                name="company",
                type=OpenApiTypes.UUID,
                description="Filter customers by company UUID.",
                required=False,
            ),
            OpenApiParameter(
                name="is_active",
                type=OpenApiTypes.BOOL,
                description="Filter customers by active status.",
                required=False,
            ),
        ],
        responses=CustomerListSerializer(many=True),
    )
    @permission_classes([permissions.IsAuthenticated])
    def list(self, request: Request, *args, **kwargs):
        """List customers from companies the user is a member of."""
        queryset = self.filter_queryset(self.get_queryset())
        
        # Optional filter by company UUID
        company_uuid = request.query_params.get("company")
        if company_uuid:
            queryset = queryset.filter(company__uuid=company_uuid)
        
        # Optional filter by active status
        is_active = request.query_params.get("is_active")
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == "true")
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @permission_classes([IsMemberOfCustomerCompany | permissions.IsAdminUser])
    def retrieve(self, request: Request, *args, **kwargs):
        """Retrieve a single customer."""
        return super().retrieve(request, *args, **kwargs)
    
    @permission_classes([permissions.IsAuthenticated])
    def create(self, request: Request, *args, **kwargs):
        """
        Create a new customer.
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
                    {"detail": "You do not have permission to add customers to this company."},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        return super().create(request, *args, **kwargs)
    
    @permission_classes([IsMemberOfCustomerCompany | permissions.IsAdminUser])
    def update(self, request: Request, *args, **kwargs):
        """Update a customer (full update)."""
        # Prevent changing the company
        if "company" in request.data:
            instance = self.get_object()
            if str(instance.company.uuid) != str(request.data.get("company")):
                return Response(
                    {"company": ["Cannot change the company of an existing customer."]},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return super().update(request, *args, **kwargs)
    
    @permission_classes([IsMemberOfCustomerCompany | permissions.IsAdminUser])
    def partial_update(self, request: Request, *args, **kwargs):
        """Update a customer (partial update)."""
        # Prevent changing the company
        if "company" in request.data:
            instance = self.get_object()
            if str(instance.company.uuid) != str(request.data.get("company")):
                return Response(
                    {"company": ["Cannot change the company of an existing customer."]},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return super().partial_update(request, *args, **kwargs)
    
    @permission_classes([NoOne])
    def destroy(self, request: Request, *args, **kwargs):
        """
        Destroy is disabled. Use is_active flag instead to deactivate customers.
        """
        return super().destroy(request, *args, **kwargs)
