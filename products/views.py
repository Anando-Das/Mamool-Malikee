from django.shortcuts import render
from rest_framework import generics

from .models import Product
from .serializers import ProductSerializer


class ProductListCreateAPIView(generics.ListCreateAPIView):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer


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

    return render(request, "product.html", {
        "products": products,

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