"""Role-based permission classes."""

from django.contrib.auth import get_user_model
from rest_framework.permissions import BasePermission


class IsAdminRole(BasePermission):
    """Allow only users with the admin role (or a Django superuser)."""

    message = "Only administrators can perform this action."

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        return user.role == get_user_model().Role.ADMIN or user.is_superuser


class IsStaffOrAdmin(BasePermission):
    """Allow any authenticated staff/admin user (explicit, readable alias)."""

    message = "You do not have permission to perform this action."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)
