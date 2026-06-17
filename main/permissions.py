from rest_framework.permissions import BasePermission
from rest_framework.authtoken.models import Token

# class BaseUserRolePermission(BasePermission):
#     """کلاس پایه برای بررسی دسترسی بر اساس نقش کاربر"""

#     required_role = None  # این مقدار در کلاس‌های فرزند مشخص می‌شود

#     def has_permission(self, request, view):
#         cookie = request.COOKIES.get('auth_token')
#         header = request.headers.get('Authorization')
#         token = None
#         token_key = cookie if cookie else (header.split(' ')[1] if header else None)
#         print(f"User p: {request.user}")
#         print(f"Authenticated p: {request.user.is_authenticated}")
#         print(f"Token p: {request.headers.get('Authorization')}")


#         if token_key:
#             try:
#                 token = Token.objects.get(key=token_key)
#                 user = token.user
#                 if user.user_role == self.required_role:
#                     return True
#             except Token.DoesNotExist:
#                 return False

#         return False

# # کلاس‌های مخصوص هر نقش
# class IsAdminUserRole(BaseUserRolePermission):
#     required_role = 'admin'

# class IsEmployeeRole(BaseUserRolePermission):
#     required_role = 'employee'

# class IsCustomerRole(BaseUserRolePermission):

#     required_role = 'customer'

from rest_framework.permissions import BasePermission
from rest_framework.authtoken.models import Token
class IsAdminUserRole(BasePermission):

    def has_permission(self, request, view):
        cookie = request.COOKIES.get('auth_token')
        header = request.headers.get('Authorization') 
        token = None
        token_key = request.COOKIES.get('auth_token')

        if header or cookie:
            token_key = cookie if cookie else header.split(' ')[1]
            token = Token.objects.get(key=token_key)
            user = token.user
            if user.user_role == 'admin':
                return True
        return False

class IsEmployeeRole(BasePermission):
    def has_permission(self, request, view):
        cookie = request.COOKIES.get('auth_token')
        header = request.headers.get('Authorization')
        token = None
        token_key = request.COOKIES.get('auth_token')

        if header or cookie:
            token_key = cookie if cookie else header.split(' ')[1]
            token = Token.objects.get(key=token_key)
            user = token.user
            if user.user_role == 'employee':
                return True
        return False

class IsCustomerRole(BasePermission):
    def has_permission(self, request, view):
        cookie = request.COOKIES.get('auth_token')
        header = request.headers.get('Authorization')
        token = None
        token_key = request.COOKIES.get('auth_token')
        if header or cookie:
            token_key = cookie if cookie else header.split(' ')[1]
            token = Token.objects.get(key=token_key)
            user = token.user
            if user.user_role == 'customer':
                return True
        return False


