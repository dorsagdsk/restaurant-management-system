from django.contrib import admin
from .models import RestaurantUser, UserAddress, MenuItem, ItemRating, CustomerOrder, OrderItem

from .models import DiscountCode,DiscountUsage,ShoppingCart,ShoppingCartItem



admin.site.register(RestaurantUser)




class UserAddressAdmin(admin.ModelAdmin):
    list_display = ['id', 'city_name', 'neighborhood_name', 'block_number', 'postal_code', 'country_name']

admin.site.register(UserAddress, UserAddressAdmin)


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ('item_name', 'item_category', 'item_price', 'average_rating')
    list_filter = ('item_category',)
    search_fields = ('item_name', 'item_description')


@admin.register(ItemRating)
class ItemRatingAdmin(admin.ModelAdmin):
    list_display = ('rated_item', 'rated_by_user', 'user_rating', 'rating_comment')
    list_filter = ('user_rating',)
    search_fields = ('rated_item__item_name', 'rated_by_user__username', 'rating_comment')


@admin.register(CustomerOrder)
class CustomerOrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'ordered_by_user', 'order_status', 'order_created_on', 'order_updated_on')
    list_filter = ('order_status', 'order_created_on')
    search_fields = ('ordered_by_user__username',)


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('associated_order', 'ordered_menu_item', 'ordered_quantity', 'calculate_item_total')
    search_fields = ('associated_order__id', 'ordered_menu_item__item_name')



@admin.register(DiscountCode)
class DiscountCodeAdmin(admin.ModelAdmin):
    list_display = ('code', 'discount_percentage', 'expiration_date', 'is_active', 'created_at')
    search_fields = ('code',)
    list_filter = ('is_active', 'expiration_date')


@admin.register(DiscountUsage)
class DiscountUsageAdmin(admin.ModelAdmin):
    list_display = ('user', 'discount_code', 'used_at')
    search_fields = ('user__username', 'discount_code__code')

@admin.register(ShoppingCart)
class ShoppingCartAdmin(admin.ModelAdmin):
    list_display = ('associated_user', 'created_on')
    search_fields = ('associated_user__username',)


@admin.register(ShoppingCartItem)
class ShoppingCartItemAdmin(admin.ModelAdmin):
    list_display = ('shopping_cart', 'menu_item', 'item_quantity')
    search_fields = ('menu_item__item_name', 'shopping_cart__associated_user__username')

