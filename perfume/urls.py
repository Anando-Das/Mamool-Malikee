"""
URL configuration for perfume project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from products.views import (
    product_page,
    product_detail,
    cart_page,
    checkout_page,
    order_confirmation_page,
    order_details_page,
    my_orders_page,
    cancel_order,
)
from perfume import views
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    path('', views.homepage, name = 'home'),
    
    path('api/products/', include('products.urls')),
    path("api/orders/", include("orders.urls")),
    path('shop/', product_page, name='shop'),
    path('shop/product/<int:product_id>/', product_detail, name='product_detail'),
    path('cart/', cart_page, name='cart'),
    
    path('checkout/', checkout_page, name='checkout'),
    
    
    path(
        "order-confirmation/<str:order_number>/",
        order_confirmation_page,
        name="order_confirmation",
    ),

    path(
        "orders/<str:order_number>/",
        order_details_page,
        name="order_details",
    ),
    
    
    path('api/accounts/', include('accounts.urls')),
    
    # My Orders and Cancel Order
    path('my-orders/', my_orders_page, name='my_orders'),
    path('my-orders/<str:order_number>/cancel/', cancel_order, name='cancel_order'),

    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]


urlpatterns += static(
    settings.MEDIA_URL,
    document_root=settings.MEDIA_ROOT
)