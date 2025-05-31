from rest_framework import viewsets, permissions

class BaseModelViewSet(viewsets.ModelViewSet):
    lookup_field = "uuid"
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        """
        Returns the list of permissions that the current action requires.

        If the current action method has a 'permission_classes' attribute, instantiate and return those permissions.
        Otherwise, defer to the superclass implementation.

        Returns:
            list: A list of instantiated permission classes.
        """
        action = getattr(self, self.action, None)
        if action and hasattr(action, "permission_classes"):
            return super().get_permissions() + [permission() for permission in action.permission_classes]
        return super().get_permissions()
