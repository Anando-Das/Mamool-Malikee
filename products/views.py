from django.shortcuts import render
from django.shortcuts import render, get_object_or_404
from .models import Product,ProductVariant,ShippingZone,Coupon
from .serializers import ProductSerializer,ProductVariantSerializer,ShippingZoneSerializer,CouponSerializer
from rest_framework import viewsets
from decimal import Decimal, InvalidOperation
from django.contrib.auth.decorators import login_required

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from orders.models import Order, OrderItem
from django.db import transaction

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    
class ProductVariantViewSet(viewsets.ModelViewSet):
    queryset = ProductVariant.objects.filter(is_active=True)
    serializer_class = ProductVariantSerializer
    
class ShippingZoneViewSet(viewsets.ModelViewSet):
    queryset = ShippingZone.objects.filter(is_active=True)
    serializer_class = ShippingZoneSerializer
    
class CouponViewSet(viewsets.ModelViewSet):
    queryset = Coupon.objects.filter(is_active=True)
    serializer_class = CouponSerializer

def build_filter_url(request, **new_params):
    params = request.GET.copy()

    for key, value in new_params.items():
        if value is None:
            params.pop(key, None)
        else:
            params[key] = value

    query_string = params.urlencode()

    if query_string:
        return f"/shop/?{query_string}"

    return "/shop/"

def product_page(request):
    total_products = Product.objects.filter(is_active=True).count()
    category = request.GET.get("category")
    fragrance = request.GET.get("fragrance")
    min_price = request.GET.get("min_price")
    max_price = request.GET.get("max_price")
    sort = request.GET.get("sort")

    products = Product.objects.filter(is_active=True)

    if category:
        products = products.filter(category=category)

    if fragrance:
        products = products.filter(fragrance_family=fragrance)

    if min_price:
        products = products.filter(price__gte=min_price)

    if max_price:
        products = products.filter(price__lte=max_price)

    # Sorting
    if sort == "price_low":
        products = products.order_by("price")

    elif sort == "price_high":
        products = products.order_by("-price")

    elif sort == "newest":
        products = products.order_by("-created_at")

    elif sort == "rating":
        products = products.order_by("-rating")

    else:
        products = products.order_by("-created_at")

    for product in products:
        rating = float(product.rating)

        product.full_stars = int(rating)
        product.half_star = 1 if rating - int(rating) >= 0.5 else 0
        product.empty_stars = 5 - product.full_stars - product.half_star
        product.default_variant = ProductVariant.objects.filter(
            product=product,
            is_active=True
        ).order_by("price").first()
        
        

    return render(request, "product.html", {
        "products": products,
        
        "total_products": total_products,

        "oud_url": build_filter_url(request, category="oud"),
        "mamool_url": build_filter_url(request, category="mamool"),
        "bakhoor_url": build_filter_url(request, category="bakhoor"),

        "oud_fragrance_url": build_filter_url(request, fragrance="Oud"),
        "floral_fragrance_url": build_filter_url(request, fragrance="Floral"),
        "woody_fragrance_url": build_filter_url(request, fragrance="Woody"),
        "fresh_fragrance_url": build_filter_url(request, fragrance="Fresh"),
        "sweet_fragrance_url": build_filter_url(request, fragrance="Sweet"),
        "musk_fragrance_url": build_filter_url(request, fragrance="Musk"),
    })
    
def product_detail(request, product_id):
    product = get_object_or_404(
        Product,
        id=product_id,
        is_active=True
    )

    rating = float(product.rating)

    product.full_stars = int(rating)
    product.half_star = 1 if rating - int(rating) >= 0.5 else 0
    product.empty_stars = 5 - product.full_stars - product.half_star

    related_product = Product.objects.filter(
        is_active = True
    ).exclude(id=product.id).order_by("-created_at")[:4]
    
    variants = ProductVariant.objects.filter(
        product=product,
        is_active=True
    ).order_by("price")
    
    selected_variant = variants.filter(
        price=product.price
    ).first()
    
    return render(request, "product_details.html", 
                  
        {"product": product,
         "related_products": related_product,
         "variants": variants,
        }
        
    )


class CouponApplyAPIView(APIView):

    def get(self, request):
        code = request.GET.get("code", "").strip().upper()
        subtotal_value = request.GET.get("subtotal", "0")

        if not code:
            return Response(
                {"detail": "Coupon code is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            subtotal = Decimal(subtotal_value)
        except (InvalidOperation, ValueError, TypeError):
            return Response(
                {"detail": "Invalid subtotal."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if subtotal < 0:
            return Response(
                {"detail": "Invalid subtotal."},
                status=status.HTTP_400_BAD_REQUEST
            )

        coupon = Coupon.objects.filter(
            code__iexact=code,
            is_active=True
        ).first()

        if not coupon:
            return Response(
                {"detail": "Invalid or inactive coupon."},
                status=status.HTTP_404_NOT_FOUND
            )

        if subtotal < coupon.minimum_order_amount:
            return Response(
                {
                    "detail": (
                        f"Minimum order amount is "
                        f"৳{coupon.minimum_order_amount}"
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if coupon.discount_type == "percentage":
            discount = (
                subtotal * coupon.discount_value / Decimal("100")
            )

            if (
                coupon.max_discount_amount is not None
                and discount > coupon.max_discount_amount
            ):
                discount = coupon.max_discount_amount

        else:
            discount = coupon.discount_value

        if discount > subtotal:
            discount = subtotal

        return Response({
            "code": coupon.code,
            "discount_type": coupon.discount_type,
            "discount_value": coupon.discount_value,
            "discount_amount": discount,
            "subtotal": subtotal,
        })

    


@login_required(login_url='login')
def cart_page(request):
    shipping_zones = ShippingZone.objects.filter(
        is_active=True
    )

    return render(request, "cart.html", {
        "shipping_zones": shipping_zones,
    })


@login_required(login_url='login')
def checkout_page(request):
    shipping_zones = ShippingZone.objects.filter(
        is_active=True
    )

    return render(request, "checkout.html", {
        "shipping_zones": shipping_zones,
    })


@login_required(login_url='login')
def order_confirmation_page(request, order_number):
    order = get_object_or_404(
        Order,
        order_number=order_number,
        user=request.user,
    )

    return render(request, "order_confirmation.html", {
        "order": order,
    })


@login_required(login_url='login')
def order_details_page(request, order_number):
    order = get_object_or_404(
        Order.objects.prefetch_related(
            "items__product",
            "items__variant",
        ),
        order_number=order_number,
        user=request.user,
    )

    return render(request, "order_details.html", {
        "order": order,
    })

@login_required(login_url='login')
def my_orders_page(request):
    orders = Order.objects.filter(user=request.user).order_by("-created_at").prefetch_related("items")
    return render(request, "my_orders.html", {
        "orders": orders,
    })

@login_required(login_url='login')
def cancel_order(request, order_number):
    if request.method != "POST":
        from django.http import HttpResponseNotAllowed
        return HttpResponseNotAllowed(["POST"])
    
    order = get_object_or_404(
        Order,
        order_number=order_number,
        user=request.user,
    )
    
    if order.status not in ["pending", "confirmed", "processing"]:
        # Rather than returning a JSON response, let's redirect with an error message since this is a traditional Django app flow
        from django.contrib import messages
        from django.shortcuts import redirect
        messages.error(request, f"Order {order.order_number} cannot be cancelled as it is already {order.status}.")
        return redirect("my_orders")
    
    with transaction.atomic():
        order.status = "cancelled"
        order.save()
        
    from django.contrib import messages
    from django.shortcuts import redirect
    messages.success(request, f"Order {order.order_number} has been cancelled.")
    
    return redirect("my_orders")
