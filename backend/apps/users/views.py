"""Authentication endpoints."""

from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed, ValidationError
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from apps.common.permissions import IsAdminRole

from .serializers import (
    CustomerSignupSerializer,
    LoginSerializer,
    RegisterSerializer,
    UserSerializer,
    UserUpdateSerializer,
)


def token_pair_for(user):
    refresh = RefreshToken.for_user(user)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}


class LoginView(APIView):
    """POST /api/auth/login/ — accepts a username or email plus password."""

    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = authenticate(
            request,
            username=serializer.validated_data["username"],
            password=serializer.validated_data["password"],
        )
        if user is None:
            raise AuthenticationFailed("Invalid username or password.")

        return Response({**token_pair_for(user), "user": UserSerializer(user).data})


class LogoutView(APIView):
    """POST /api/auth/logout/ — blacklists the supplied refresh token."""

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            raise ValidationError({"refresh": "This field is required."})
        try:
            RefreshToken(refresh_token).blacklist()
        except TokenError:
            raise ValidationError({"refresh": "Invalid or expired token."})
        return Response({"detail": "Logged out successfully."})


class RegisterView(APIView):
    """POST /api/auth/register/ — restricted to administrators."""

    permission_classes = [IsAdminRole]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class CustomerSignupView(APIView):
    """POST /api/auth/signup/ — public storefront registration for customers."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CustomerSignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {**token_pair_for(user), "user": UserSerializer(user).data},
            status=status.HTTP_201_CREATED,
        )


class MeView(APIView):
    """GET/PATCH /api/auth/me/ — current signed-in user profile."""

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        # Refresh from DB so nested customer profile reflects updates.
        request.user.refresh_from_db()
        return Response(UserSerializer(request.user).data)


class HealthView(APIView):
    """GET /api/auth/health/ — lightweight unauthenticated readiness check."""

    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"status": "ok", "service": "divs-mall"})
