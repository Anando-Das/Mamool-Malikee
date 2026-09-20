from django.db import models
from django.core.validators import FileExtensionValidator
from django.core.exceptions import ValidationError

def validate_image_size(image):
    max_size = 2 * 1024 * 1024  # 2 MB

    if image.size > max_size:
        raise ValidationError(
            "Image size must be 2 MB or less."
        )

class Product(models.Model):
    CATEGORY_CHOICES = [
        ('oud', 'OUD Malikee'),
        ('mamool', 'Mamool Incense'),
        ('bakhoor', 'Bakhoor'),
    ]

    BADGE_CHOICES = [
        ('', 'No Badge'),
        ('bestseller', 'Bestseller'),
        ('new', 'New'),
        ('sold_out', 'Sold Out'),
    ]

    name = models.CharField(max_length=200)

    sku = models.CharField(max_length=50, unique=True, null=True, blank=True)
    
    longevity = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )
    
    ingredients = models.TextField(
        null=True,
        blank=True
    )
    
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES
    )

    fragrance_family = models.CharField(max_length=50)

    notes = models.CharField(max_length=255)
    
    description = models.TextField(
        null=True,
        blank=True
    )
    
    top_notes = models.CharField(
        max_length=255,
        null=True,
        blank=True
    )
    
    heart_notes = models.CharField(
        max_length=255,
        null=True,
        blank=True
    )
    

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    original_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )

    rating = models.DecimalField(
        max_digits=2,
        decimal_places=1,
        default=0
    )

    review_count = models.PositiveIntegerField(default=0)

    image = models.ImageField(
        upload_to='products/',
        validators=[
            FileExtensionValidator(
                allowed_extensions=['jpg', 'jpeg', 'png', 'webp']
            ),
            validate_image_size,
        ]
    )

    badge = models.CharField(
        max_length=20,
        choices=BADGE_CHOICES,
        blank=True
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    
class ProductVariant(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="variants"
    )

    size = models.CharField(max_length=20)

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    original_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )

    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.product.name} - {self.size}"
    
    

class ShippingZone(models.Model):
    ZONE_CHOICES = [
        ("inside_sylhet", "Inside Sylhet City"),
        ("outside_sylhet", "Outside Sylhet"),
        ("dhaka_city", "Dhaka City"),
        ("outside_dhaka", "Outside Dhaka"),
    ]

    code = models.CharField(
        max_length=30,
        choices=ZONE_CHOICES,
        unique=True
    )
    charge = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.get_code_display()
    
    
class Coupon(models.Model):
    DISCOUNT_TYPE_CHOICES = [
        ("percentage", "Percentage"),
        ("fixed", "Fixed Amount"),
    ]

    code = models.CharField(
        max_length=50,
        unique=True
    )

    discount_type = models.CharField(
        max_length=20,
        choices=DISCOUNT_TYPE_CHOICES
    )

    discount_value = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    minimum_order_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    max_discount_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )

    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.code