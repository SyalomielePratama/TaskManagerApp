from rest_framework import permissions

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object or admins to edit or view it.
    """
    def has_object_permission(self, request, view, obj):
        # Izin baca (GET, HEAD, OPTIONS) diberikan jika objek adalah milik user atau user adalah admin.
        if request.method in permissions.SAFE_METHODS:
            return obj.pembuat == request.user or (request.user and request.user.is_admin)
        
        # Izin tulis (PUT, PATCH, DELETE) hanya untuk pemilik objek atau admin.
        return obj.pembuat == request.user or (request.user and request.user.is_admin)

class IsAdminUserForTasks(permissions.BasePermission):
    """
    Custom permission to only allow admin users to perform certain actions (e.g., list all tasks).
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_admin
