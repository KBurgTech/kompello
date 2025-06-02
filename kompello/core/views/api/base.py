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
        # Check if the action is set, if not, use the default permissions
        # This indicates that the action is not defined or the wrong HTTP method is used
        if self.action is None:
            return super().get_permissions()

        action = getattr(self, self.action, None)
        if action and hasattr(action, "permission_classes"):
            return super().get_permissions() + [permission() for permission in action.permission_classes]
        return super().get_permissions()
