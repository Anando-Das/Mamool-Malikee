from django.urls import path
from .views import ProductListCreateAPIView, product_page

urlpatterns = [
    path('', ProductListCreateAPIView.as_view()),
    
]