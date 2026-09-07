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

    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES
    )

    fragrance_family = models.CharField(max_length=50)

    notes = models.CharField(max_length=255)

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