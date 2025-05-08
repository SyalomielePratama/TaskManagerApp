from rest_framework import permissions

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow admins to edit objects.
    Read-only for non-admins.
    """
    def has_permission(self, request, view):
        # Allow GET, HEAD, OPTIONS requests for any user (authenticated or not for listing)
        if request.method in permissions.SAFE_METHODS:
            return True
        # Write permissions are only allowed to the admin users.
        return request.user and request.user.is_authenticated and request.user.is_admin

class IsSelfOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object or admins to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the profile or an admin.
        # obj adalah instance User yang diakses
        return obj == request.user or (request.user and request.user.is_admin)

