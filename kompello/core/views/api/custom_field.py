from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action, permission_classes
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes
from django.contrib.contenttypes.models import ContentType

from kompello.core.views.api.base import BaseModelViewSet
from kompello.core.models.custom_field_models import CustomFieldDefinition
from kompello.core.serializers.custom_field_serializers import (
    CustomFieldDefinitionSerializer,
    CustomFieldDefinitionReadSerializer,
    CustomFieldMetadataSerializer,
)
from kompello.core.models.company_models import Company
from kompello.core.permissions import IsMemberOfCompany


class CustomFieldDefinitionViewSet(BaseModelViewSet):
    queryset = CustomFieldDefinition.objects.all()
    serializer_class = CustomFieldDefinitionSerializer

    @permission_classes([IsMemberOfCompany | permissions.IsAdminUser])
    def list(self, request, *args, **kwargs):
        # members should only see fields for their companies unless admin
        qs = self.get_queryset()
        if not request.user.is_staff:
            qs = qs.filter(company__members__id=request.user.id)
        serializer = CustomFieldDefinitionReadSerializer(qs, many=True)
        return Response(serializer.data)

    @permission_classes([IsMemberOfCompany | permissions.IsAdminUser])
    def retrieve(self, request, *args, **kwargs):
        self.serializer_class = CustomFieldDefinitionReadSerializer
        return super().retrieve(request, *args, **kwargs)

    @permission_classes([permissions.IsAuthenticated])
    def create(self, request, *args, **kwargs):
        # allow company members to create: validate membership on payload company
        company_uuid = request.data.get("company")
        if not request.user.is_staff:
            if company_uuid is None:
                return Response({"company": "This field is required."}, status=status.HTTP_400_BAD_REQUEST)
            try:
                company = Company.objects.get(uuid=company_uuid)
            except Company.DoesNotExist:
                return Response({"company": "Invalid company."}, status=status.HTTP_400_BAD_REQUEST)
            if not company.members.filter(id=request.user.id).exists():
                return Response(status=status.HTTP_403_FORBIDDEN)

        return super().create(request, *args, **kwargs)

    @permission_classes([IsMemberOfCompany | permissions.IsAdminUser])
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @permission_classes([IsMemberOfCompany | permissions.IsAdminUser])
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @permission_classes([IsMemberOfCompany | permissions.IsAdminUser])
    def destroy(self, request, *args, **kwargs):
        from django.core.exceptions import ValidationError as DjangoValidationError
        
        try:
            return super().destroy(request, *args, **kwargs)
        except DjangoValidationError as e:
            return Response(
                {"detail": str(e.message) if hasattr(e, 'message') else str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @extend_schema(
        responses={200: CustomFieldMetadataSerializer},
        description="Get metadata for client: available model types and data types.",
    )
    @action(detail=False, methods=["get"])
    def metadata(self, request):
        from kompello.core.models.billing_models import Item
        
        # Hardcoded list of models that support custom fields
        supported_models = [Item]
        
        model_types = []
        for model in supported_models:
            ct = ContentType.objects.get_for_model(model)
            model_types.append({
                "id": ct.id,
                "app_label": ct.app_label,
                "model": ct.model
            })
        
        data_types = [
            {"value": v, "label": l} for v, l in CustomFieldDefinition.FieldDataType.choices
        ]
        return Response({"model_types": model_types, "data_types": data_types})

    @extend_schema(
        description="Get custom field definitions for a specific model type and company, filtered by show_in_ui flag.",
        parameters=[
            OpenApiParameter(
                name="model_type_id",
                type=OpenApiTypes.INT,
                description="ContentType ID for the model (e.g., from metadata endpoint)",
                required=True,
            ),
            OpenApiParameter(
                name="company_uuid",
                type=OpenApiTypes.UUID,
                description="Company UUID",
                required=True,
            ),
            OpenApiParameter(
                name="show_in_ui",
                type=OpenApiTypes.BOOL,
                description="If true, only return fields with show_in_ui=true. Default: true",
                required=False,
            ),
        ],
        responses=CustomFieldDefinitionReadSerializer(many=True),
    )
    @action(detail=False, methods=["get"])
    @permission_classes([permissions.IsAuthenticated])
    def for_model(self, request):
        """
        Get custom field definitions for a specific model type and company.
        
        Query parameters:
        - model_type_id: ContentType ID for the model (required)
        - company_uuid: Company UUID (required)
        - show_in_ui: If true, only return fields with show_in_ui=true (optional, default=true)
        """
        model_type_id = request.query_params.get("model_type_id")
        company_uuid = request.query_params.get("company_uuid")
        show_in_ui = request.query_params.get("show_in_ui", "true").lower() == "true"
        
        if not model_type_id or not company_uuid:
            return Response(
                {"detail": "model_type_id and company_uuid query parameters are required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            model_type = ContentType.objects.get(id=model_type_id)
        except ContentType.DoesNotExist:
            return Response(
                {"detail": "Invalid model_type_id."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            company = Company.objects.get(uuid=company_uuid)
        except Company.DoesNotExist:
            return Response(
                {"detail": "Invalid company_uuid."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check user is member of company
        if not request.user.is_staff and not company.members.filter(id=request.user.id).exists():
            return Response(status=status.HTTP_403_FORBIDDEN)
        
        # Filter by model type, company, not archived
        queryset = CustomFieldDefinition.objects.filter(
            model_type=model_type,
            company=company,
            is_archived=False
        )
        
        if show_in_ui:
            queryset = queryset.filter(show_in_ui=True)
        
        queryset = queryset.order_by("name")
        serializer = CustomFieldDefinitionReadSerializer(queryset, many=True)
        return Response(serializer.data)
