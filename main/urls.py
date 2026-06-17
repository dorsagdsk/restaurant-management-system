# main/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('login/', views.login_page, name='login'),
    path('admin_dashboard/', views.admin_dashboard_view, name='admin_dashboard'),
    path('food_list/', views.food_list, name='menu-items'), 
    path('add-food/', views.add_food_view, name='add_food'),
    path('edit-food/<int:food_id>/', views.edit_food_page, name='edit-food-page'), 
    path('add-employee/', views.add_employee, name='add_employee'),
    path('manage-employees/', views.manage_employees_view, name='manage-employees'),
    path('edit_employees/<int:pk>/', views.edit_employee, name='edit_employee'),
    path('show-discount-page/',views.show_discount_page, name='show_discount_page'),
    path('employee_dashboard/', views.employee_dashboard_view, name='employee_dashboard'),
    path('register_customer/', views.register_view, name='register_customer'),
    path('customer_dashboard/', views.customer_dashboard_view, name='customer_dashboard'),
    path('profile/',views.show_profile, name='profile'),
    path('show-order-customer/',views.show_order_customers, name='show_order_customers'),
    path('show_cart/',views.show_carts, name='show_cart'),
    path('show-best-selling-prouducts/',views.show_best_selling_products, name='show_best_selling_products'),
    path('show-order-for-admin/',views.show_order_for_admin, name='show-order-for-admin'),
    
  
   
   
]
