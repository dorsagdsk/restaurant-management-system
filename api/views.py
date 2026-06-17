from django.shortcuts import render
from django.http import JsonResponse
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.generics import ListAPIView
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from rest_framework.parsers import MultiPartParser, FormParser
from main.models import MenuItem ,RestaurantUser,UserAddress,ShoppingCart,CustomerOrder,DiscountCode, OrderItem, ShoppingCartItem,DiscountUsage
from .serializers import MenuItemSerializer,EmployeeSerializer ,CustomerSerializer,ShoppingCartSerializer,CustomerOrderSerializer, DiscountCodeSerializer,UserAddressSerializer,OrderItemSerializer,ShoppingCartItemSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import  AllowAny
from main.permissions import IsAdminUserRole ,IsCustomerRole ,IsEmployeeRole
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
import logging
from django.db.models import Sum
from datetime import datetime
from django.utils.dateparse import parse_datetime
from django.utils.timezone import make_aware, timezone
from django.db.models import F, Sum
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.utils import timezone
from datetime import timedelta



class LoginAPIView(APIView):


    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user is not None:
            token, created = Token.objects.get_or_create(user=user)
            print(user.user_role)
            response =  JsonResponse({
                'token': token.key,
                'role': user.user_role,
                'username':user.username
            })
            response.set_cookie(
                key='auth_token',
                value=token.key,
                httponly=True,
                samesite='Lax',
                max_age=86400
            )
            return response
        else:
            return Response({'detail': 'Invalid credentials'})
        

class LogoutAPIView(APIView):

    def post(self, request, *args, **kwargs):
        try:
            # حذف توکن کاربر
            request.user.auth_token.delete()
        except Token.DoesNotExist:
            return Response({"detail": "Token not found."}, status=400)

        # حذف کوکی auth_token (در صورت وجود)
        response = Response({"detail": "Successfully logged out."})
        response.delete_cookie('auth_token')
        return response
    

     
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')

        # if RestaurantUser.objects.filter(username=username, user_role='customer').exists():
        #     return Response({'detail': 'این نام کاربری قبلاً توسط یک مشتری ثبت شده است. لطفاً یک نام کاربری متفاوت وارد کنید.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = CustomerSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            response = Response({
                'message': 'ثبت‌نام با موفقیت انجام شد!',
                'token': token.key
            }, status=status.HTTP_201_CREATED)

            response.set_cookie(
                key='auth_token',
                value=token.key,
                httponly=True,
                samesite='Lax',
                max_age=86400
            )
            return response
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

    
class AddFoodAPIView(APIView):
    permission_classes = [IsAdminUserRole]  # فقط کاربران احراز هویت شده می‌توانند غذا اضافه کنند
    authentication_classes = [TokenAuthentication]
    parser_classes = [MultiPartParser, FormParser]  # برای پردازش فرم‌ها و فایل‌ها

    def post(self, request, *args, **kwargs):
        # دریافت داده‌های ارسال شده
        serializer = MenuItemSerializer(data=request.data)
        
        if serializer.is_valid():  # اگر داده‌ها معتبر باشند
            food = serializer.save()  # ذخیره غذا در دیتابیس
            return Response(serializer.data, status=status.HTTP_201_CREATED)  # بازگشت به همراه داده‌ها
        print("Errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)  # در صورت خطا
    

class MenuItemListView(ListAPIView):
      permission_classes = [IsAdminUserRole]
      authentication_classes = [TokenAuthentication]
      model = MenuItem
      serializer_class =MenuItemSerializer
      queryset = MenuItem.objects.all()



class MenuItemDeleteView(APIView):
    permission_classes = [IsAdminUserRole]
    authentication_classes = [TokenAuthentication]

    def delete(self, request, pk):
        try:
            menu_item = MenuItem.objects.get(pk=pk)
            menu_item.delete()
            return Response({"message": "غذا حذف شد"}, status=status.HTTP_204_NO_CONTENT)
        except MenuItem.DoesNotExist:
            return Response({"error": "غذا پیدا نشد"}, status=status.HTTP_404_NOT_FOUND)


    
class EditFoodAPIView(APIView):
    permission_classes = [IsAdminUserRole]
    authentication_classes = [TokenAuthentication]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request, pk):
        try:
            food = MenuItem.objects.get(pk=pk)
            serializer = MenuItemSerializer(food)
            return Response(serializer.data)
        except MenuItem.DoesNotExist:
            return Response({'detail': 'Food not found.'}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk):
        try:
            food = MenuItem.objects.get(pk=pk)

            # ایجاد کپی قابل تغییر از داده‌ها
            mutable_data = request.data.copy()

            # بررسی وجود و ارسال تصویر (در صورتی که ارسال نشده باشد، حذف می‌شود)
            if 'item_image' not in mutable_data or not mutable_data['item_image']:
                mutable_data.pop('item_image', None)

            serializer = MenuItemSerializer(food, data=mutable_data, partial=True)
            if serializer.is_valid():
                food = serializer.save()
                response_data = serializer.data
                # ارسال URL تصویر در صورت وجود
                response_data['image_url'] = food.item_image.url if food.item_image else None
                return Response(response_data, status=200)

            return Response(serializer.errors, status=400)

        except MenuItem.DoesNotExist:
            return Response({'detail': 'Food not found.'}, status=404)
        except Exception as e:
            # مدیریت خطاهای غیرمنتظره
            return Response({'detail': str(e)}, status=500)


    
class AddEmployeeAPIView(APIView):
    permission_classes = [IsAdminUserRole]
    authentication_classes = [TokenAuthentication]

    def post(self, request, *args, **kwargs):
        serializer = EmployeeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class EmployeeListAPIView(APIView):
    permission_classes = [IsAdminUserRole]
    authentication_classes = [TokenAuthentication]

    def get(self, request):
        employees = RestaurantUser.objects.filter(user_role='employee')  # فیلتر کردن فقط کاربران با نقش کارمند
        serializer = EmployeeSerializer(employees, many=True)
        return Response(serializer.data)


class EmployeeManagementAPIView(APIView):
    permission_classes = [IsAdminUserRole]
    authentication_classes = [TokenAuthentication]

    def get(self, request, pk):
        try:
            employee = RestaurantUser.objects.get(pk=pk, user_role='employee')
            serializer = EmployeeSerializer(employee)
            return Response(serializer.data)
        except RestaurantUser.DoesNotExist:
            return Response({'detail': 'کارمند پیدا نشد'}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            employee = RestaurantUser.objects.get(pk=pk, user_role='employee')
            employee.delete()
            return Response({'detail': 'کارمند با موفقیت حذف شد'}, status=status.HTTP_204_NO_CONTENT)
        except RestaurantUser.DoesNotExist:
            return Response({'detail': 'کارمند پیدا نشد'}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request, pk):
        try:
            employee = RestaurantUser.objects.get(pk=pk, user_role='employee')
        except RestaurantUser.DoesNotExist:
            return Response({'detail': 'کارمند پیدا نشد'}, status=status.HTTP_404_NOT_FOUND)

        serializer = EmployeeSerializer(employee, data=request.data, partial=True)  # partial=True برای ویرایش جزئی
        if serializer.is_valid():
            serializer.save()
            return Response({'detail': 'کارمند با موفقیت ویرایش شد'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class UserProfileView(APIView):
    permission_classes = [IsCustomerRole]
    authentication_classes = [TokenAuthentication]

    def get(self, request):
        user = request.user
        addresses = UserAddress.objects.filter(user_account=user)
        addresses_data = [
            {
                'id': address.id,
                'city': address.city_name,
                'neighborhood': address.neighborhood_name,
                'block': address.block_number,
                'postal_code': address.postal_code,
                'country': address.country_name,
            }
            for address in addresses
        ]
        return Response({
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'phone_number': user.contact_number,
            'addresses': addresses_data
        })


class PopularFoodsPagination(PageNumberPagination):
    page_size = 5  # تعداد آیتم‌ها در هر صفحه
    page_size_query_param = 'page_size'
    max_page_size = 20

class PopularFoodsAPIView(ListAPIView):
    queryset = MenuItem.objects.filter(average_rating__gt=3).order_by('-average_rating')
    serializer_class = MenuItemSerializer
    pagination_class = PopularFoodsPagination


    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class FoodFilterAPIView(APIView):
    permission_classes = [IsCustomerRole]
    authentication_classes = [TokenAuthentication]
    pagination_class = PopularFoodsPagination

    def get(self, request, *args, **kwargs):
        category = request.GET.get('category', None)
        queryset = MenuItem.objects.all()

        # بررسی دسته‌بندی وارد شده
        if category:
            valid_categories = [option[0] for option in MenuItem.CATEGORY_OPTIONS]
            if category in valid_categories:
                queryset = queryset.filter(item_category=category)
        

        paginator = PopularFoodsPagination()
        paginated_queryset = paginator.paginate_queryset(queryset, request)
        serializer = MenuItemSerializer(paginated_queryset, many=True)

        return paginator.get_paginated_response(serializer.data)
    
class AddAddressView(APIView):
    permission_classes = [IsCustomerRole]
    authentication_classes = [TokenAuthentication]

    def post(self, request):
        user = request.user
        data = request.data

        # اعتبارسنجی داده‌های ورودی
        required_fields = ['city', 'neighborhood', 'block', 'postal_code', 'country']
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return Response(
                {'detail': f'فیلدهای زیر خالی هستند: {", ".join(missing_fields)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ایجاد آدرس جدید
        address = UserAddress.objects.create(
            user_account=user,
            city_name=data.get('city'),
            neighborhood_name=data.get('neighborhood'),
            block_number=data.get('block'),
            postal_code=data.get('postal_code'),
            country_name=data.get('country'),
        )

        return Response(
            {
                'id': address.id,
                'city': address.city_name,
                'neighborhood': address.neighborhood_name,
                'block': address.block_number,
                'postal_code': address.postal_code,
                'country': address.country_name,
            },
            status=status.HTTP_201_CREATED
        )



class CartView(APIView):
    permission_classes = [IsCustomerRole]
    authentication_classes = [TokenAuthentication]

    def get(self, request):

            # بررسی اینکه کاربر احراز هویت شده است
            if not request.user.is_authenticated:
                return Response(
                    {"error": "User is not authenticated."},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            try:
                cart = ShoppingCart.objects.get(associated_user=request.user)
                print(f"Cart: {cart}, Created: False")
            except ShoppingCart.DoesNotExist:
                cart = None
                print("Cart not found, does not exist.")

            # اگر سبد خرید وجود نداشته باشد
            if cart is None:
                return Response(
                    {"error": "No shopping cart found for this user."},
                    status=status.HTTP_404_NOT_FOUND
                )

            # سریالایز کردن سبد خرید
            serializer = ShoppingCartSerializer(cart)
            response_data = serializer.data
            print(f"Response Data: {response_data}")

            # بازگرداندن پاسخ موفق
            return Response(response_data, status=status.HTTP_200_OK)




class AddToCartView(APIView):
    permission_classes = [IsCustomerRole]
    authentication_classes = [TokenAuthentication]

    def post(self, request, food_id):
        print(f"User: {request.user}")
        print(f"Authenticated: {request.user.is_authenticated}")
        print(f"Token: {request.headers.get('Authorization')}")
        
        try:
            logger.info(f"Request received for adding food_id: {food_id} by user: {request.user}")

            # بررسی وجود منوی مورد نظر
            menu_item = MenuItem.objects.filter(id=food_id).first()
            if not menu_item:
                logger.error(f"Menu item with id {food_id} not found")
                return Response({'error': 'Menu item not found'}, status=status.HTTP_404_NOT_FOUND)

            # بررسی وجود سبد خرید برای کاربر
            user = request.user
            shopping_cart, created = ShoppingCart.objects.get_or_create(associated_user=user)
            logger.info(f"Shopping cart fetched/created for user {user.username}")

            # بررسی وجود آیتم در سبد خرید
            cart_item, created = ShoppingCartItem.objects.get_or_create(
                shopping_cart=shopping_cart,
                menu_item=menu_item,
                defaults={'item_quantity': 1}
            )

            # اگر آیتم قبلاً در سبد خرید بود، تعداد آن را افزایش می‌دهیم
            if not created:
                cart_item.item_quantity += 1
                cart_item.save()

            logger.info(f"Item {menu_item.item_name} added to cart for user {user.username}")

            return Response({
                'message': 'Item added to cart',
                'cart_item': {
                    'id': cart_item.id,
                    'menu_item': {
                        'id': menu_item.id,
                        'name': menu_item.item_name,
                        'price': str(menu_item.item_price),
                    },
                    'quantity': cart_item.item_quantity,
                    'total_price': str(cart_item.calculate_item_total())
                }
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error adding to cart: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        


class ManageCartItemView(APIView):
    permission_classes = [IsCustomerRole]
    authentication_classes = [TokenAuthentication]

    def post(self, request, item_id):
        print(f"Received request with item_id: {item_id}")
        print(f"Request user: {request.user.username}")
        print(f"Request data: {request.data}")

        # پیدا کردن سبد خرید مرتبط با کاربر
        cart = get_object_or_404(ShoppingCart, associated_user=request.user)
        print(f"Found cart for user {request.user.username}: {cart}")

        # چاپ کردن همه آیتم‌ها در سبد خرید کاربر
        cart_items = ShoppingCartItem.objects.filter(shopping_cart=cart)
        print(f"All items in the user's cart:")
        for item in cart_items:
            print(f"Cart Item ID: {item.id}, Menu Item ID: {item.menu_item.id}, Quantity: {item.item_quantity}")

        # پیدا کردن آیتم در سبد خرید کاربر
        cart_item = get_object_or_404(ShoppingCartItem, shopping_cart=cart, menu_item__id=item_id)
        print(f"Found cart item: {cart_item}")

        # دریافت مقدار جدید برای تعداد
        quantity = request.data.get('quantity')
        print(f"Received quantity: {quantity}")

        if quantity is None:
            print("Error: Quantity is required")
            return Response({'error': 'Quantity is required'}, status=status.HTTP_400_BAD_REQUEST)

        if quantity == -1:
          logger.info(f"Decreasing cart item quantity from {cart_item.item_quantity} to {cart_item.item_quantity - 1}")
          cart_item.item_quantity -= 1
          if cart_item.item_quantity == 0:
            cart_item.delete()
            logger.info(f"Item with id {item_id} deleted from cart.")
          else:
              cart_item.save()
              logger.info(f"Updated cart item with new quantity: {cart_item.item_quantity}")


        if quantity== 1:
            cart_item.item_quantity =  cart_item.item_quantity+1
            cart_item.save()
            print(f"Updated cart item with new quantity 2: {cart_item.item_quantity}")
         
        # لاگ‌گذاری عملیات
        logger.info(f"User {request.user.username} updated cart item {cart_item.id} with quantity: {quantity}")
         # سریالایز کردن داده و ارسال پاسخ
        serializer = ShoppingCartItemSerializer(cart_item)
        print(f"Serialized cart item data: {serializer.data}")
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, item_id):
        print(f"Received delete request for item_id: {item_id}")
        print(f"Request user: {request.user.username}")

        # پیدا کردن سبد خرید مرتبط با کاربر
        cart = get_object_or_404(ShoppingCart, associated_user=request.user)
        print(f"Found cart for user {request.user.username}: {cart}")

        # چاپ کردن همه آیتم‌ها در سبد خرید کاربر
        cart_items = ShoppingCartItem.objects.filter(shopping_cart=cart)
        print(f"All items in the user's cart before deletion:")
        for item in cart_items:
            print(f"Cart Item ID: {item.id}, Menu Item ID: {item.menu_item.id}, Quantity: {item.item_quantity}")

        # پیدا کردن آیتم در سبد خرید کاربر
        cart_item = get_object_or_404(ShoppingCartItem, shopping_cart=cart, menu_item__id=item_id)
        print(f"Found cart item to delete: {cart_item}")

        # حذف آیتم از سبد خرید
        cart_item.delete()
        print(f"Deleted cart item with id: {item_id}")

        # لاگ‌گذاری عملیات حذف
        logger.info(f"User {request.user.username} removed cart item {item_id} from cart")

        # ارسال پاسخ موفقیت
        return Response({'message': f'Item {item_id} removed from cart'}, status=status.HTTP_200_OK)



class CheckoutView(APIView):
    permission_classes = [IsCustomerRole]
    authentication_classes = [TokenAuthentication]

    def post(self, request):
        user = request.user
        # گرفتن سبد خرید کاربر
        cart = ShoppingCart.objects.filter(associated_user=user).first()

        if not cart or not cart.cart_items.exists():
            return Response({'error': 'سبد خرید شما خالی است.'}, status=status.HTTP_400_BAD_REQUEST)

        # بررسی آدرس تحویل
        delivery_address_id = request.data.get('delivery_address_id')
        delivery_address = UserAddress.objects.filter(id=delivery_address_id, user_account=user).first()
        if not delivery_address:
            return Response({'error': 'آدرس معتبری انتخاب نشده است.'}, status=status.HTTP_400_BAD_REQUEST)

        # بررسی کد تخفیف
        discount_code_input = request.data.get('discount_code')
        discount_code = None
        if discount_code_input:
            discount_code = DiscountCode.objects.filter(code=discount_code_input).first()
            if not discount_code or discount_code.is_expired() or not discount_code.is_active:
                return Response({'error': 'کد تخفیف نامعتبر یا منقضی است.'}, status=status.HTTP_400_BAD_REQUEST)

            if DiscountUsage.objects.filter(user=user, discount_code=discount_code).exists():
                return Response({'error': 'شما قبلاً از این کد تخفیف استفاده کرده‌اید.'},
                                status=status.HTTP_400_BAD_REQUEST)

        # ایجاد سفارش جدید
        order = CustomerOrder.objects.create(
            ordered_by_user=user,
            delivery_address=delivery_address,
            order_status='pending'
        )

        # انتقال آیتم‌های سبد خرید به سفارش
        for cart_item in cart.cart_items.all():
            OrderItem.objects.create(
                associated_order=order,
                ordered_menu_item=cart_item.menu_item,
                ordered_quantity=cart_item.item_quantity
            )

        # اعمال تخفیف در صورت وجود
        if discount_code:
            DiscountUsage.objects.create(user=user, discount_code=discount_code)
            total_price = order.calculate_order_total()
            total_price_after_discount = discount_code.apply_discount(total_price)
            order.total_price_after_discount = total_price_after_discount  # فرض کنیم فیلد دارید
            order.save()

        # خالی کردن سبد خرید
        cart.cart_items.all().delete()

        # سریالایز و بازگشت پاسخ
        serializer = CustomerOrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
class ApplyDiscountView(APIView):
    permission_classes = [IsCustomerRole]
    authentication_classes = [TokenAuthentication]

    def post(self, request):
        user = request.user
        discount_code_input = request.data.get('discount_code')

        # بررسی ارسال کد تخفیف
        if not discount_code_input:
            return Response({'error': 'کد تخفیف ارسال نشده است.'}, status=status.HTTP_400_BAD_REQUEST)

        # جستجوی کد تخفیف
        discount_code = DiscountCode.objects.filter(code=discount_code_input).first()
        if not discount_code or not discount_code.is_active or discount_code.is_expired():
            return Response({'error': 'کد تخفیف نامعتبر یا منقضی است.'}, status=status.HTTP_400_BAD_REQUEST)

        # بررسی استفاده قبلی از کد تخفیف
        if DiscountUsage.objects.filter(user=user, discount_code=discount_code).exists():
            return Response({'error': 'شما قبلاً از این کد تخفیف استفاده کرده‌اید.'},
                            status=status.HTTP_400_BAD_REQUEST)

        # بررسی وجود سبد خرید و محاسبه قیمت کل
        cart = ShoppingCart.objects.filter(associated_user=user).first()
        if not cart or not cart.cart_items.exists():
            return Response({'error': 'سبد خرید شما خالی است.'}, status=status.HTTP_400_BAD_REQUEST)

        total_price = cart.calculate_total_price()  # محاسبه قیمت کل سبد خرید
        try:
            discounted_price = discount_code.apply_discount(total_price)  # اعمال تخفیف
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'discounted_price': discounted_price}, status=status.HTTP_200_OK)



class UserAddressesView(APIView):
    permission_classes = [IsCustomerRole]
    authentication_classes = [TokenAuthentication]


    def get(self, request):
        # استفاده از فیلد user_account برای فیلتر کردن آدرس‌ها
        user = request.user
        addresses = UserAddress.objects.filter(user_account=user)
        
        # ارسال queryset به سریالایزر
        serializer = UserAddressSerializer(addresses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class DiscountCodeListCreateAPIView(APIView):
    permission_classes = [IsAdminUserRole]  # دسترسی محدود به ادمین‌ها
    authentication_classes = [TokenAuthentication]  # احراز هویت با توکن

    def get(self, request, *args, **kwargs):
        """نمایش لیست کدهای تخفیف"""
        discount_codes = DiscountCode.objects.all()
        serializer = DiscountCodeSerializer(discount_codes, many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        """ایجاد کد تخفیف جدید"""
        serializer = DiscountCodeSerializer(data=request.data)
        if serializer.is_valid():
            # کد تخفیف جدید را ذخیره می‌کند
            serializer.save(is_active=True)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DiscountCodeDeleteAPIView(APIView):
    permission_classes = [IsAdminUserRole]  # دسترسی محدود به ادمین‌ها
    authentication_classes = [TokenAuthentication]  # احراز هویت با توکن

    def delete(self, request, pk, *args, **kwargs):
        # استفاده از get_object_or_404 برای سادگی و امن
        #     یت بیشتر
        discount_code = get_object_or_404(DiscountCode, pk=pk)

        # حذف کد تخفیف
        discount_code.delete()

        return Response({
            "message": "کد تخفیف با موفقیت حذف شد."
        }, status=status.HTTP_200_OK)
class EmployeeOrderListView(APIView):
    permission_classes = [IsEmployeeRole]
    authentication_classes = [TokenAuthentication]

    def get(self, request):
        status = request.GET.get('status')

        if request.user.user_role != 'employee':
            return Response({"detail": "Unauthorized"}, status=403)

        orders = CustomerOrder.objects.filter(order_status=status).order_by('-order_created_on')
        serializer = CustomerOrderSerializer(orders, many=True)
        return Response(serializer.data)

class UpdateOrderStatusView(APIView):
    permission_classes = [IsEmployeeRole]
    authentication_classes = [TokenAuthentication]

    def post(self, request, order_id):
        if request.user.user_role != 'employee':
            return Response({"detail": "Unauthorized"}, status=403)

        try:
            order = CustomerOrder.objects.get(id=order_id)
        except CustomerOrder.DoesNotExist:
            return Response({"detail": "Order not found"}, status=404)

        new_status = request.data.get('status')
        if new_status not in ['confirmed', 'canceled']:
            return Response({"detail": "Invalid status"}, status=400)

        order.order_status = new_status
        order.save()
        return Response({"detail": "Order status updated"})


logger = logging.getLogger(__name__)

class BestSellingProductsView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request, *args, **kwargs):
        try:
             #سفارشات رو دز میاره
            orders = CustomerOrder.objects.filter(order_status='confirmed')

            #استم های سفارش در میاره اسم شو در  میاره با مقدارش بع صورت نزوولی مرتب میکنه
            products_sales = OrderItem.objects.filter(associated_order__in=orders) \
                .values('ordered_menu_item__item_name') \
                .annotate(total_sales=Sum('ordered_quantity')) \
                .order_by('-total_sales')

            result = [
                {'product_name': product['ordered_menu_item__item_name'], 'total_sales': product['total_sales']}
                for product in products_sales
            ]

            return Response(result)

        except Exception as e:
            logger.error(f"Error in BestSellingProductsView: {str(e)}")
            return Response({"error": "An error occurred while processing the request."}, status=500)



class OrderReportView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request, *args, **kwargs):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if not start_date or not end_date:
            return Response({'error': 'Start date and end date are required.'}, status=400)

        try:
            start_date = parse_datetime(start_date) or datetime.strptime(start_date, '%Y-%m-%d')
            end_date = parse_datetime(end_date) or datetime.strptime(end_date, '%Y-%m-%d')
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD or ISO-8601.'}, status=400)

        if timezone.is_naive(start_date):
            start_date = make_aware(start_date)
        if timezone.is_naive(end_date):
            end_date = make_aware(end_date)

        if start_date > end_date:
            return Response({'error': 'Start date cannot be after end date.'}, status=400)

        if end_date > timezone.now():
            return Response({'error': 'End date cannot be in the future.'}, status=400)

        approved_orders = CustomerOrder.objects.filter(
            order_created_on__range=(start_date, end_date),
            order_status="confirmed"
        ).prefetch_related('order_items__ordered_menu_item')

        total_income = approved_orders.annotate(
            order_income=F('order_items__ordered_quantity') * F('order_items__ordered_menu_item__item_price')
        ).aggregate(total_income=Sum('order_income'))['total_income']

        serialized_orders = CustomerOrderSerializer(approved_orders, many=True)

        return Response({
            'total_income': total_income or 0,
            'orders': serialized_orders.data
        })


class UserOrdersView(APIView):
    permission_classes = [IsCustomerRole]
    authentication_classes = [TokenAuthentication]

    def get(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'User not authenticated'}, status=401)

        user_orders = CustomerOrder.objects.filter(ordered_by_user=request.user)
        serializer = CustomerOrderSerializer(user_orders, many=True)
        return Response(serializer.data)
    



class CancelOrderView(APIView):
    permission_classes = [IsCustomerRole]  
    authentication_classes = [TokenAuthentication]

    def post(self, request, order_id):
        try:
            # تلاش برای پیدا کردن سفارش مربوط به کاربر جاری
            order = CustomerOrder.objects.get(id=order_id, ordered_by_user=request.user)

            # بررسی وضعیت سفارش؛ اگر سفارش تایید شده یا لغو شده باشد، امکان لغو وجود ندارد
            if order.order_status in ['confirmed', 'canceled']:
                return Response({"error": "Order cannot be canceled."}, status=403)  # 403 Forbidden

            # بررسی اینکه آیا زمان سپری شده از سفارش بیشتر از 30 دقیقه است
            time_difference = timezone.now() - order.order_created_on
            if time_difference > timedelta(minutes=30):
                return Response({"error": "You can only cancel an order within 30 minutes of placing it."},
                                status=403)  # 403 Forbidden

            # تغییر وضعیت سفارش به 'canceled' و ذخیره آن
            order.order_status = 'canceled'
            order.save()

            return Response({"message": "Order canceled successfully."}, status=200)  # 200 OK

        except CustomerOrder.DoesNotExist:
            return Response({"error": "Order not found."}, status=400)  # 400 Bad Request





    