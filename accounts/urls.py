from django.urls import path

from .views import (
    RegisterView,
    register_page,
    login_page,
    logout_user,
    LoginAPIView,
)


urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('registers/', register_page, name='registers'),
    path('login/', login_page, name='login'),
    path('logout/', logout_user, name='logout'),
    path('login-api/', LoginAPIView.as_view(), name='login-api'),
]