from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models import Avg
from django.db import models
from django.utils import timezone


class UserAddress(models.Model): #مرتبط است با  'RestaurantUser یک به چند
    user_account = models.ForeignKey('RestaurantUser', on_delete=models.CASCADE, related_name='user_addresses')
    city_name = models.CharField(max_length=100)
    neighborhood_name = models.CharField(max_length=100)
    block_number = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country_name = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.neighborhood_name}, {self.city_name}, {self.country_name}, Block {self.block_number}"


class RestaurantUser(AbstractUser): #مدل یوزر
    ROLE_OPTIONS = (
        ('admin', 'Admin'),
        ('customer', 'Customer'),
        ('employee', 'Employee'),
    )

    user_role = models.CharField(max_length=10, choices=ROLE_OPTIONS)
    contact_number = models.CharField(max_length=11, blank=True, null=True)
    default_address = models.ForeignKey(UserAddress, on_delete=models.SET_NULL, null=True, blank=True)

    groups = models.ManyToManyField(
        'auth.Group',
        related_name='restaurantuser_set',  
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='restaurantuser_set',  
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )

    def __str__(self):
        return self.username



class MenuItem(models.Model):
    CATEGORY_OPTIONS = [
        ('fast_food', 'Fast Food'),
        ('beverage', 'Beverage'),
        ('traditional_food', 'Traditional Food'),
        ('dessert', 'Dessert'),
    ]
    

    item_name = models.CharField(max_length=255)
    item_description = models.TextField(null=True, blank=True)
    item_price = models.DecimalField(max_digits=10, decimal_places=0)
    item_category = models.CharField(max_length=20, choices=CATEGORY_OPTIONS)
    item_image = models.ImageField(upload_to='images/', blank=True, null=True)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)

    def update_average_rating(self):
        avg_rating = ItemRating.objects.filter(rated_item=self).aggregate(Avg('user_rating'))['user_rating__avg']
        self.average_rating = avg_rating if avg_rating is not None else 0.0
        self.save()

    def __str__(self):
        return self.item_name


class ItemRating(models.Model):
    rated_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    rated_by_user = models.ForeignKey(RestaurantUser, on_delete=models.CASCADE)
    user_rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    rating_comment = models.TextField(blank=True, null=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.rated_item.update_average_rating()

    def __str__(self):
        return f"Rating {self.user_rating} by {self.rated_by_user.username} for {self.rated_item.item_name}"


class ShoppingCart(models.Model):
    associated_user = models.OneToOneField('RestaurantUser', on_delete=models.CASCADE, related_name='shopping_cart')
    created_on = models.DateTimeField(auto_now_add=True)

    def calculate_total_price(self):
        return sum(item.calculate_item_total() for item in self.cart_items.all())
    

    def __str__(self):
        return f"Shopping Cart for {self.associated_user.username}"


class ShoppingCartItem(models.Model):
    shopping_cart = models.ForeignKey(ShoppingCart, on_delete=models.CASCADE, related_name='cart_items')
    menu_item = models.ForeignKey(MenuItem, on_delete=models.PROTECT)
    item_quantity = models.PositiveIntegerField(default=1)

    def calculate_item_total(self):
        return self.menu_item.item_price * self.item_quantity
    

    def __str__(self):
        return f"{self.menu_item.item_name} x{self.item_quantity}"


class CustomerOrder(models.Model):
    ORDER_STATUSES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('canceled', 'Canceled'),
    )

    ordered_by_user = models.ForeignKey('RestaurantUser', on_delete=models.CASCADE, related_name='customer_orders')
    order_status = models.CharField(max_length=20, choices=ORDER_STATUSES, default='pending')
    delivery_address = models.ForeignKey('UserAddress', on_delete=models.CASCADE, blank=True, null=True)
    order_created_on = models.DateTimeField(auto_now_add=True)
    order_updated_on = models.DateTimeField(auto_now=True)
    total_price_after_discount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)


    def calculate_order_total(self):
        return sum(item.calculate_item_total() for item in self.order_items.all())

    def __str__(self):
        return f"Order {self.id} by {self.ordered_by_user.username} - Status: {self.order_status}"


class OrderItem(models.Model):
    associated_order = models.ForeignKey(CustomerOrder, on_delete=models.CASCADE, related_name='order_items')
    ordered_menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    ordered_quantity = models.PositiveIntegerField(default=1)

    def calculate_item_total(self):
        return self.ordered_menu_item.item_price * self.ordered_quantity

    def __str__(self):
        return f"{self.ordered_menu_item.item_name} x{self.ordered_quantity}"
    



class DiscountCode(models.Model):
    code = models.CharField(max_length=8, unique=True)  # کد تخفیف
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2)  # درصد تخفیف
    expiration_date = models.DateTimeField()  # تاریخ انقضا
    is_active = models.BooleanField(default=True)  # وضعیت فعال بودن
    created_at = models.DateTimeField(auto_now_add=True)  # زمان ایجاد

    def __str__(self):
        return self.code

    def is_expired(self):
        """بررسی اینکه کد تخفیف منقضی شده یا نه"""
        return timezone.now() > self.expiration_date

    def deactivate_if_expired(self):
        """غیرفعال کردن کد در صورت منقضی شدن"""
        if self.is_expired():
            self.is_active = False
            self.save()

    def apply_discount(self, total_price):
        """
        اعمال تخفیف روی قیمت کل
        اگر کد تخفیف منقضی یا غیرفعال باشد، خطا می‌دهد.
        """
        if self.is_expired() or not self.is_active:
            raise ValueError("کد تخفیف منقضی یا غیر فعال است.")
        return total_price * (1 - float(self.discount_percentage) / 100)



# class DiscountUsage(models.Model):
#     user = models.ForeignKey(RestaurantUser, on_delete=models.CASCADE, related_name='discount_usages')  # ارجاع به مدل سفارشی شما
#     discount_code = models.ForeignKey(DiscountCode, on_delete=models.CASCADE, related_name='usages')
#     used_at = models.DateTimeField(auto_now_add=True)  # زمان استفاده از کد

#     def __str__(self):
#         return f"{self.user.username} used {self.discount_code.code} at {self.used_at}"
class DiscountUsage(models.Model):
    user = models.OneToOneField(
        RestaurantUser,
        on_delete=models.CASCADE,
        related_name='discount_usage'  # استفاده از related_name برای دسترسی یک به یک
    )
    discount_code = models.ForeignKey(
        DiscountCode,
        on_delete=models.CASCADE,
        related_name='usages'  # هر کد تخفیف می‌تواند چند بار استفاده شود
    )
    used_at = models.DateTimeField(auto_now_add=True)  # زمان استفاده از کد

    def __str__(self):
        return f"{self.user.username} used {self.discount_code.code} at {self.used_at}"

