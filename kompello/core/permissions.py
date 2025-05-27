from rest_framework.permissions import BasePermission


class NoOne(BasePermission):
    """
    Permission class that denies access to everyone.
    """

    def has_permission(self, request, view):
        return False

    def has_object_permission(self, request, view, obj):
        return False