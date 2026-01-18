from rest_framework.permissions import BasePermission
from rest_framework.request import Request


class NoOne(BasePermission):
    """
    Permission class that denies access to everyone.
    """

    def has_permission(self, request, view):
        return False

    def has_object_permission(self, request, view, obj):
        return False


class IsMemberOfCompany(BasePermission):
    """
    Permission to check if the user is a member of the company that owns the object.
    Works for any model that has a 'company' attribute with a 'members' relationship.
    """
    
    def has_object_permission(self, request: Request, view, obj):
        return obj.company.members.filter(id=request.user.id).exists()