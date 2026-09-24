import uuid

from django.conf import settings
from django.db import models

from products.models import Product, ProductVariant, ShippingZone


def generate_order_number():
    return f"MM-{uuid.uuid4().hex[:10].upper()}"


class Order(models.Model):

    PAYMENT_METHOD_CHOICES = [
        ("cod", "Cash on Delivery"),
        ("bkash", "bKash"),
        ("nagad", "Nagad"),
        ("sslcommerz", "SSLCommerz"),
    ]

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("confirmed", "Confirmed"),
        ("processing", "Processing"),
        ("shipped", "Shipped"),
        ("delivered", "Delivered"),
        ("cancelled", "Cancelled"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="orders",
    )

    order_number = models.CharField(
        max_length=20,
        unique=True,
        default=generate_order_number,
        editable=False,
    )

    full_name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=30)

    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    postcode = models.CharField(max_length=20)

    shipping_zone = models.ForeignKey(
        ShippingZone,
        on_delete=models.PROTECT,
        related_name="orders",
    )

    shipping_location = models.CharField(max_length=100)

    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
    )

    order_note = models.TextField(
        blank=True,
        null=True,
    )

    save_address = models.BooleanField(default=False)

    coupon_code = models.CharField(
        max_length=50,
        blank=True,
        null=True,
    )

    subtotal = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    shipping_cost = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    coupon_discount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.order_number


class OrderItem(models.Model):

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items",
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name="order_items",
    )

    variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.PROTECT,
        related_name="order_items",
    )

    # Snapshot data
    product_name = models.CharField(max_length=200)
    size = models.CharField(max_length=50)
    unit_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    quantity = models.PositiveIntegerField()

    item_total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    def get_total(self):
        return self.item_total
    
    @property
    def price(self):
        return self.unit_price

    def __str__(self):
        return f"{self.product_name} - {self.size}"