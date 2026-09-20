from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import User
from .serializers import RegisterSerializer
from django.contrib import messages
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login,logout


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from django.contrib.auth import authenticate

from .serializers import LoginSerializer
from drf_spectacular.utils import extend_schema

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


def register_page(request):

    try:

        if request.method == "POST":

            first_name = request.POST.get('first_name', '').strip()
            
            last_name = request.POST.get('last_name', '').strip()
            
            username = f"{first_name} {last_name}".strip()
            
            email = request.POST.get('email', '').strip().lower()
            phone = request.POST.get('phone', '').strip()
            password = request.POST.get('password', '')
            confirm_password = request.POST.get('confirm_password', '')
            terms_accepted = request.POST.get('terms_accepted') == 'on'

            if password != confirm_password:
                messages.error(request,"Passwords do not match.")
                return  redirect('registers')
            
            if User.objects.filter(email=email).exists():
                print("EMAIL EXISTS")
                messages.error(request, "This email is already registered.")
                return  redirect('registers')
            
            if User.objects.filter(phone=phone).exists():
                messages.error(request, "This phone number is already registered.")
                return  redirect('registers')
            
            user = User(
                
                first_name=first_name,
                last_name=last_name,
                username=username,
                email=email,
                phone=phone,
                terms_accepted=terms_accepted,
            )
            
            user.set_password(password)
            user.save()

            messages.success(request, "Registration successful.")
            return redirect('login')

    except Exception as e:
        print("Registration Error:", e)

    return render(request, 'register.html')


def login_page(request):

    if request.method == "POST":

        email = request.POST.get('email', '').strip().lower()
        password = request.POST.get('password', '')

        user = authenticate(
            request,
            username=email,
            password=password
        )

        if user is not None:

            login(request, user)

            remember_me = request.POST.get('remember_me') == 'on'

            if remember_me:
                request.session.set_expiry(1209600)  # 14 days
            else:
                request.session.set_expiry(0)  

            return redirect('/')

        messages.error(request, "Incorrect email or password.")

    return render(request, 'login.html')


def logout_user(request):
    logout(request)
    return redirect('/')

@extend_schema(request=LoginSerializer)


class LoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        user = authenticate(
            request,
            username=email,
            password=password
        )

        if user is None:
            return Response(
                {"detail": "Incorrect email or password."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        login(request, user)

        return Response(
            {
            "message": "Login successful.",
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
        },
        status=status.HTTP_200_OK
)