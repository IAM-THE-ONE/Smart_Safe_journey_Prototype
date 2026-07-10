from rest_framework.permissions import BasePermission


class IsTourist(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "tourist"


class IsPolice(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "police"


class IsTourismDept(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "tourism_dept"


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "admin"


class IsPoliceOrTourismDept(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ("police", "tourism_dept", "admin")


class IsAdminOrTourismDept(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ("admin", "tourism_dept")
