from django.shortcuts import render
from django.http import HttpResponse, HttpResponseForbidden, JsonResponse
from rest_framework.authtoken.models import Token
from main.permissions import IsAdminUserRole ,IsEmployeeRole,IsCustomerRole
from django.shortcuts import render
from main.permissions import IsAdminUserRole, IsEmployeeRole, IsCustomerRole
from functools import wraps
from django.http import HttpResponseForbidden
from main.permissions import IsAdminUserRole, IsEmployeeRole, IsCustomerRole

def permission_required(permission_class):
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            permission = permission_class()
            if not permission.has_permission(request, None):
                return HttpResponseForbidden("You do not have permission to view this page.")
            return view_func(request, *args, **kwargs)
        return _wrapped_view
    return decorator


def index(request):
    token_key = request.COOKIES.get('auth_token')
    if token_key:
        token = Token.objects.get(key=token_key)
        user = token.user
        if user.user_role == 'admin':
            return render(request, 'admin_dashboard.html')
        elif user.user_role == 'employee':
            return render(request, 'employee_dashboard.html')
        elif user.user_role == 'customer':
            return render(request, 'customer_dashboard.html')
    return render(request, 'index.html')

def login_page(request):
    return render(request, 'login.html')  

def register_view(request):
    return render(request, 'register_customer.html')

@permission_required(IsAdminUserRole)
def admin_dashboard_view(request):
    return render(request, 'admin_dashboard.html')

@permission_required(IsAdminUserRole)
def add_food_view(request):
    return render(request, 'add_food.html')

@permission_required(IsAdminUserRole)
def food_list(request):
    return render(request, 'list_food.html')

@permission_required(IsAdminUserRole)
def edit_food_page(request, food_id):
    return render(request, 'edit-food.html', {'food_id': food_id})

@permission_required(IsAdminUserRole)
def add_employee(request):
    return render(request, 'add-employee.html')

@permission_required(IsEmployeeRole)
def employee_dashboard_view(request):
    return render(request, 'employee_dashboard.html')

@permission_required(IsAdminUserRole)
def manage_employees_view(request):
    return render(request, 'manage_employees.html')

@permission_required(IsAdminUserRole)
def edit_employee(request, pk):
    return render(request, 'edit_employee.html', {'employeeId': pk})

@permission_required(IsCustomerRole)
def customer_dashboard_view(request):
    return render(request, 'customer_dashboard.html')

@permission_required(IsCustomerRole)
def show_profile(request):
    return render(request, 'profile.html')

@permission_required(IsCustomerRole)
def show_carts(request):
    return render(request, 'cart.html')

@permission_required(IsCustomerRole)
def show_order_customers(request):
    return render(request, 'show-order-customer.html')

@permission_required(IsAdminUserRole)
def show_discount_page(request):
    return render(request, 'show-discount-page.html')

@permission_required(IsAdminUserRole)
def show_best_selling_products(request):
    return render(request, 'best-selling-products.html')

@permission_required(IsAdminUserRole)
def show_order_for_admin(request):
    return render(request, 'show-order-for-admin.html')
