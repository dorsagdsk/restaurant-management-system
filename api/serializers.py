from rest_framework import serializers
from main.models import RestaurantUser, UserAddress, MenuItem, ItemRating, ShoppingCart, ShoppingCartItem, CustomerOrder, OrderItem, DiscountCode, DiscountUsage

from django.utils import timezone

class UserAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAddress
        fields = ['id', 'city_name', 'neighborhood_name', 'block_number', 'postal_code', 'country_name']

    def validate(self, data):
        """
        اعتبارسنجی کلی داده‌های ورودی برای اطمینان از کامل بودن اطلاعات
        """
        required_fields = ['city_name', 'neighborhood_name', 'block_number', 'postal_code', 'country_name']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            raise serializers.ValidationError(
                f'فیلدهای زیر الزامی هستند و باید پر شوند: {", ".join(missing_fields)}'
            )

        # بررسی صحت داده‌های ورودی (در صورت وجود شرط خاص)
        if len(data['postal_code']) < 5:
            raise serializers.ValidationError('کد پستی باید حداقل ۵ رقم باشد.')

        return data

    def create(self, validated_data):
        """
        ایجاد و ذخیره آدرس جدید
        """
        try:
            address = UserAddress.objects.create(**validated_data)
            return address
        except Exception as e:
            raise serializers.ValidationError(
                f"خطایی در ذخیره آدرس رخ داده است: {str(e)}"
            )

    def to_representation(self, instance):
        """
        تبدیل داده‌های آدرس برای نمایش به فرمت کاربرپسندتر
        """
        return {
            'id': instance.id,
            'city': instance.city_name,
            'neighborhood': instance.neighborhood_name,
            'block': instance.block_number,
            'postal_code': instance.postal_code,
            'country': instance.country_name,
        }




class RestaurantUserSerializer(serializers.ModelSerializer):
    addresses = UserAddressSerializer(many=True)
    default_address = UserAddressSerializer()

    class Meta:
        model = RestaurantUser
        fields = ['id', 'username', 'email', 'user_role', 'contact_number', 'addresses', 'default_address']
        extra_kwargs = {
            'password': {'write_only': True}  # رمز عبور فقط برای نوشتن باشد
        }

class EmployeeSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = RestaurantUser
        fields = ['id', 'username', 'password', 'first_name', 'last_name', 'user_role', 'contact_number', 'default_address']
        extra_kwargs = {'user_role': {'read_only': True}}

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        if RestaurantUser.objects.filter(username=username, user_role='employee').exists():
            raise serializers.ValidationError({'username': 'این نام کاربری قبلاً ثبت شده است. لطفاً نام کاربری متفاوتی وارد کنید.'})
        if RestaurantUser.objects.filter(password=password, user_role='employee').exists():
            raise serializers.ValidationError('password  تکراری')
        if not data.get('username'):
            raise serializers.ValidationError("Username is required.")
        if not data.get('first_name') or not data.get('last_name'):
            raise serializers.ValidationError("First name and last name are required.")
        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = RestaurantUser.objects.create(user_role='employee', **validated_data)
        user.set_password(password)
        user.save()
        return user

class CustomerSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = RestaurantUser
        fields = ['id', 'username', 'password', 'first_name', 'last_name', 'user_role', 'contact_number', 'default_address']
        extra_kwargs = {'user_role': {'read_only': True}}

    def validate(self, data):
        username = data.get('username')
        if RestaurantUser.objects.filter(username=username, user_role='customer').exists():
            raise serializers.ValidationError({'username': 'این نام کاربری قبلاً ثبت شده است. لطفاً نام کاربری متفاوتی وارد کنید.'})
        if not data.get('username'):
            raise serializers.ValidationError("Username is required.")
        if not data.get('first_name') or not data.get('last_name'):
            raise serializers.ValidationError("First name and last name are required.")
        return data
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = RestaurantUser.objects.create(user_role='customer', **validated_data)
        user.set_password(password)
        user.save()
        return user




class MenuItemSerializer(serializers.ModelSerializer):
    average_rating = serializers.FloatField(read_only=True)  # نمایش میانگین امتیاز
    item_image = serializers.ImageField(required=False)

    class Meta:
        model = MenuItem
        fields = ['id', 'item_name', 'item_description', 'item_price', 'item_category', 'item_image', 'average_rating']


class ItemRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemRating
        fields = ['id', 'rated_item', 'rated_by_user', 'user_rating', 'rating_comment']

    def validate_user_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value

    def create(self, validated_data):
        # پس از ذخیره‌سازی امتیاز، میانگین امتیاز را به‌روز رسانی کنید
        rating = super().create(validated_data)
        rating.rated_item.update_average_rating()
        return rating




class ShoppingCartItemSerializer(serializers.ModelSerializer):
    menu_item = MenuItemSerializer()
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = ShoppingCartItem
        fields = ['id', 'menu_item', 'item_quantity', 'total_price']

    def get_total_price(self, obj):
        return obj.menu_item.item_price * obj.item_quantity



    
class ShoppingCartSerializer(serializers.ModelSerializer):
    cart_items = ShoppingCartItemSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField()
    associated_user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = ShoppingCart
        fields = ['id', 'associated_user', 'cart_items', 'total_price']

    def get_total_price(self, obj):
        return sum(item.calculate_item_total() for item in obj.cart_items.all())


class OrderItemSerializer(serializers.ModelSerializer):
    ordered_menu_item = MenuItemSerializer()

    class Meta:
        model = OrderItem
        fields = ['id', 'ordered_menu_item', 'ordered_quantity']

    def get_total_price(self, obj):
        return obj.ordered_menu_item.item_price * obj.ordered_quantity


class CustomerOrderSerializer(serializers.ModelSerializer):
    order_items = OrderItemSerializer(many=True, read_only=True)
    delivery_address = UserAddressSerializer()
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = CustomerOrder
        fields = ['id', 'ordered_by_user', 'order_status', 'delivery_address', 'order_created_on', 'order_updated_on', 'order_items', 'total_price']

    def get_total_price(self, obj):
        # محاسبه قیمت کل سفارش
        return sum(item.ordered_menu_item.item_price * item.ordered_quantity for item in obj.order_items.all())



class DiscountCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiscountCode
        fields = ['id', 'code', 'discount_percentage', 'expiration_date', 'is_active', 'created_at']

    def validate_code(self, value):
        """اعتبارسنجی طول کد تخفیف"""
        if len(value) != 8:
            raise serializers.ValidationError("کد تخفیف باید 8 کاراکتر باشد.")
        return value

    def validate_expiration_date(self, value):
        """اعتبارسنجی تاریخ انقضا"""
        if value <= timezone.now():
            raise serializers.ValidationError("تاریخ انقضا باید در آینده باشد.")
        return value

    def validate_discount_percentage(self, value):
        """اعتبارسنجی درصد تخفیف"""
        if not (0 < value <= 100):
            raise serializers.ValidationError("درصد تخفیف باید عددی بین 1 و 100 باشد.")
        return value



class DiscountUsageSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiscountUsage
        fields = ['id', 'user', 'discount_code', 'used_at']
        read_only_fields = ['used_at']  # زمان استفاده فقط خواندنی باشد

