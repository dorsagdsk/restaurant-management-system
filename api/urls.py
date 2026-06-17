from django.urls import path
from .views import MenuItemListView ,LoginAPIView, LogoutAPIView,AddFoodAPIView, MenuItemDeleteView,EditFoodAPIView, AddEmployeeAPIView,EmployeeManagementAPIView,EmployeeListAPIView
from .views import RegisterView , UserProfileView,PopularFoodsAPIView,FoodFilterAPIView,AddAddressView ,CartView,DiscountCodeListCreateAPIView ,DiscountCodeDeleteAPIView,CancelOrderView
from .views import AddToCartView ,UserAddressesView, ManageCartItemView,CheckoutView, ApplyDiscountView,UserOrdersView ,BestSellingProductsView,OrderReportView,EmployeeOrderListView ,UpdateOrderStatusView

urlpatterns = [
    path('login', LoginAPIView.as_view(), name='login'),
    path('logout/', LogoutAPIView.as_view(), name='logout'),
    path('add-food/', AddFoodAPIView.as_view(), name='add_food_api'),
    path('menu-items/', MenuItemListView.as_view(), name='menu-item-list'), 
    path('menu-items-delete/<int:pk>/', MenuItemDeleteView.as_view(), name='menu-item-delete'),
    path('menu-items-edit/<int:pk>/', EditFoodAPIView.as_view(), name='edit_food_api'),
    path('add-employee/', AddEmployeeAPIView.as_view(), name='add-employee'),
    path('employees/', EmployeeListAPIView.as_view(), name='employee-list'),
    path('delete-employees/<int:pk>/',  EmployeeManagementAPIView.as_view(), name='delete-employees'),
    path('edit-employees/<int:pk>/',    EmployeeManagementAPIView.as_view(), name='edit-employees'),
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', UserProfileView.as_view(), name='customer-profile'),
    path('profile/address/', AddAddressView.as_view(), name='add_address'),
    path('foods_filter/', FoodFilterAPIView.as_view(), name='food-filter'),  
    path('popular-foods/', PopularFoodsAPIView.as_view(), name='popular-foods'),
    path('discounts/', DiscountCodeListCreateAPIView.as_view(), name='discount_code_create'),
    path('discounts/<int:pk>/delete/',DiscountCodeDeleteAPIView.as_view(), name='discount_code_delete'),
    path('addresses/', UserAddressesView.as_view(), name='user-addresses'),
    path('cart/add/<int:food_id>/',  AddToCartView.as_view(), name='add_to_cart'),
    path('cart/', CartView.as_view(), name='cart'),
    path('cart/item/<int:item_id>/', ManageCartItemView.as_view(), name='manage_cart_item'),
    path('apply-discount/', ApplyDiscountView.as_view(), name='apply-discount'),
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    path('orders/', UserOrdersView.as_view(), name='user_orders'),  # مشاهده تمام سفارش‌های کاربر
    path('orders-report/', OrderReportView.as_view(), name='orders-report'),
    path('employee/order/', EmployeeOrderListView.as_view(), name='employee-orders'),
    path('employee/order/<int:order_id>/update/', UpdateOrderStatusView.as_view(), name='update-order-status'),
    path('admin/best-selling-products/', BestSellingProductsView.as_view(), name='best-selling-products'),
    path('orders/<int:order_id>/cancel/', CancelOrderView.as_view(), name='cancel_order'),

 
]
    


