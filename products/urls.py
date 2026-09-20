from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import (
    ProductViewSet,
    ProductVariantViewSet,
    ShippingZoneViewSet,
    CouponViewSet,
    CouponApplyAPIView,
)

router = DefaultRouter()

router.register(
    'variants',
    ProductVariantViewSet,
    basename='product-variant'
)

router.register(
    'shipping-zones',
    ShippingZoneViewSet,
    basename='shipping-zone'
)

router.register(
    'coupons',
    CouponViewSet,
    basename='coupon'
)

router.register(
    '',
    ProductViewSet,
    basename='product'
)

urlpatterns = router.urls

urlpatterns = [
    path(
        'coupons/apply/',
        CouponApplyAPIView.as_view(),
        name='coupon-apply'
    ),
]

urlpatterns += router.urls