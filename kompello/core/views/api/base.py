from rest_framework import viewsets, permissions


class BaseModelViewSet(viewsets.ModelViewSet):
    lookup_field = "uuid"
    permission_classes = [permissions.IsAuthenticated]
