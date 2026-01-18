"""
ViewSet for Item model.
"""

from drf_spectacular.utils import OpenApiParameter, OpenApiTypes, extend_schema
from rest_framework import permissions, status
from rest_framework.decorators import permission_classes
from rest_framework.request import Request
from rest_framework.response import Response

from kompello.core.models.billing_models import Item
from kompello.core.models import Company
from kompello.core.permissions import NoOne, IsMemberOfCompany
from kompello.core.serializers.item_serializers import ItemSerializer, ItemListSerializer
from kompello.core.views.api.base import BaseModelViewSet


class ItemViewSet(BaseModelViewSet):
    """
    ViewSet for managing items.
    Users can only access items from companies they are members of.
    """
    
    queryset = Item.objects.select_related("company", "currency", "unit").all()
    serializer_class = ItemSerializer
    
    def get_queryset(self):
        """Filter queryset to only include items from companies the user is a member of."""
        queryset = super().get_queryset()
        
        # For retrieve/update/destroy operations, allow all objects through
        # and rely on object-level permissions
        if self.action in ['retrieve', 'update', 'partial_update', 'destroy']:
            return queryset
        
        # Admin users can see all items in list
        if self.request.user.is_staff:
            return queryset
        
        # Regular users can only see items from their companies in list
        company_ids = Company.objects.filter(
            members__id=self.request.user.id
        ).values_list("id", flat=True)
        return queryset.filter(company_id__in=company_ids)
    
    def get_serializer_class(self):
        """Use lightweight serializer for list views."""
        if self.action == "list":
            return ItemListSerializer
        return ItemSerializer
    
    @extend_schema(
        description="List items from companies the user is a member of.",
        parameters=[
            OpenApiParameter(
                name="company",
                type=OpenApiTypes.UUID,
                description="Filter items by company UUID.",
                required=False,
            ),
        ],
        responses=ItemListSerializer(many=True),
    )
    @permission_classes([permissions.IsAuthenticated])
    def list(self, request: Request, *args, **kwargs):
        """List items from companies the user is a member of."""
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
        description="Retrieve a specific item by UUID.",
        responses=ItemSerializer,
    )
    @permission_classes([IsMemberOfCompany | permissions.IsAdminUser])
    def retrieve(self, request: Request, *args, **kwargs):
        """Retrieve a specific item by UUID."""
        return super().retrieve(request, *args, **kwargs)
    
    @extend_schema(
        description="Create a new item.",
        request=ItemSerializer,
        responses={201: ItemSerializer},
    )
    @permission_classes([permissions.IsAuthenticated])
    def create(self, request: Request, *args, **kwargs):
        """
        Create a new item.
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
                    {"detail": "You do not have permission to add items to this company."},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        return super().create(request, *args, **kwargs)
    
    @extend_schema(
        description="Update an existing item.",
        request=ItemSerializer,
        responses=ItemSerializer,
    )
    @permission_classes([IsMemberOfCompany | permissions.IsAdminUser])
    def update(self, request: Request, *args, **kwargs):
        """Update an existing item."""
        return super().update(request, *args, **kwargs)
    
    @extend_schema(
        description="Partially update an existing item.",
        request=ItemSerializer,
        responses=ItemSerializer,
    )
    @permission_classes([IsMemberOfCompany | permissions.IsAdminUser])
    def partial_update(self, request: Request, *args, **kwargs):
        """Partially update an existing item."""
        return super().partial_update(request, *args, **kwargs)
    
    @extend_schema(
        description="Delete an item (disabled).",
        responses={405: None},
    )
    @permission_classes([NoOne])
    def destroy(self, request: Request, *args, **kwargs):
        """Deletion is disabled for items."""
        return Response(
            {"detail": "Deletion is not allowed for items."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )
