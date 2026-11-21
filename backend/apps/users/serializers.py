"""Serializers for authentication and user administration."""

import re

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from rest_framework import serializers

from apps.customers.models import Customer

User = get_user_model()


class CustomerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ["id", "name", "email", "phone", "address", "city", "state", "pincode"]
        read_only_fields = ["id", "email"]


class UserSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "role", "profile"]
        read_only_fields = ["id"]

    def get_profile(self, obj):
        try:
            profile = obj.customer_profile
        except Customer.DoesNotExist:
            return None
        return {
            "id": profile.id,
            "name": profile.name,
            "email": profile.email,
            "phone": profile.phone,
            "address": profile.address,
            "city": profile.city,
            "state": profile.state,
            "pincode": profile.pincode,
        }


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(trim_whitespace=True)
    password = serializers.CharField(write_only=True, trim_whitespace=False)


class RegisterSerializer(serializers.ModelSerializer):
    """Admin-only account creation. Public self-registration is intentionally disabled."""

    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "password",
            "password2",
        ]
        read_only_fields = ["id"]

    def validate_password(self, value):
        validate_password(value)
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password2": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("password2")
        password = validated_data.pop("password")
        is_admin = validated_data.get("role") == User.Role.ADMIN
        user = User(**validated_data)
        user.set_password(password)
        user.is_staff = is_admin
        user.save()
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """Self-service profile update (never allows role escalation)."""

    phone = serializers.CharField(required=False, allow_blank=True, write_only=True)
    address = serializers.CharField(required=False, allow_blank=True, write_only=True)
    city = serializers.CharField(required=False, allow_blank=True, write_only=True)
    state = serializers.CharField(required=False, allow_blank=True, write_only=True)
    pincode = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "email",
            "phone",
            "address",
            "city",
            "state",
            "pincode",
        ]

    def validate_phone(self, value):
        value = value.strip()
        if value and not re.fullmatch(r"[+]?[0-9][0-9\s-]{6,24}", value):
            raise serializers.ValidationError("Enter a valid phone number.")
        return value

    def validate_pincode(self, value):
        value = value.strip()
        if value and not re.fullmatch(r"[0-9]{4,10}", value):
            raise serializers.ValidationError("Enter a valid pincode (4-10 digits).")
        return value

    def update(self, instance, validated_data):
        profile_fields = {
            key: validated_data.pop(key)
            for key in ["phone", "address", "city", "state", "pincode"]
            if key in validated_data
        }
        new_email = validated_data.get("email")
        user = super().update(instance, validated_data)

        if not profile_fields and new_email is None:
            return user

        try:
            profile = user.customer_profile
        except Customer.DoesNotExist:
            profile = None

        if profile:
            if new_email:
                profile.email = new_email
            if new_email or validated_data.get("first_name") or validated_data.get("last_name"):
                name = f"{user.first_name} {user.last_name}".strip() or user.username
                profile.name = name
            for field, value in profile_fields.items():
                setattr(profile, field, value)
            profile.save()

        return user


class CustomerSignupSerializer(serializers.Serializer):
    """Public storefront registration: creates a customer user and profile."""

    username = serializers.CharField(trim_whitespace=True, min_length=3, max_length=150)
    email = serializers.EmailField()
    first_name = serializers.CharField(trim_whitespace=True, allow_blank=True, required=False, default="")
    last_name = serializers.CharField(trim_whitespace=True, allow_blank=True, required=False, default="")
    phone = serializers.CharField(trim_whitespace=True)
    address = serializers.CharField(trim_whitespace=True, allow_blank=True, required=False, default="")
    city = serializers.CharField(trim_whitespace=True, allow_blank=True, required=False, default="")
    state = serializers.CharField(trim_whitespace=True, allow_blank=True, required=False, default="")
    pincode = serializers.CharField(trim_whitespace=True, allow_blank=True, required=False, default="")
    password = serializers.CharField(write_only=True, min_length=8, trim_whitespace=False)
    password2 = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate_email(self, value):
        value = value.strip().lower()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        if Customer.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A customer with this email already exists.")
        return value

    def validate_phone(self, value):
        value = value.strip()
        if not re.fullmatch(r"[+]?[0-9][0-9\s-]{6,24}", value):
            raise serializers.ValidationError("Enter a valid phone number.")
        if Customer.objects.filter(phone=value).exists():
            raise serializers.ValidationError("A customer with this phone number already exists.")
        return value

    def validate_pincode(self, value):
        value = value.strip()
        if value and not re.fullmatch(r"[0-9]{4,10}", value):
            raise serializers.ValidationError("Enter a valid pincode (4-10 digits).")
        return value

    def validate_password(self, value):
        validate_password(value)
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password2": "Passwords do not match."})
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        validated_data.pop("password2")
        password = validated_data.pop("password")
        phone = validated_data.pop("phone")
        address = validated_data.pop("address", "")
        city = validated_data.pop("city", "")
        state = validated_data.pop("state", "")
        pincode = validated_data.pop("pincode", "")
        first_name = validated_data.pop("first_name", "")
        last_name = validated_data.pop("last_name", "")

        user = User(
            username=validated_data["username"],
            email=validated_data["email"],
            first_name=first_name,
            last_name=last_name,
            role=User.Role.CUSTOMER,
            is_staff=False,
        )
        user.set_password(password)
        user.save()

        name = f"{first_name} {last_name}".strip() or user.username
        Customer.objects.create(
            user=user,
            name=name,
            email=user.email,
            phone=phone,
            address=address,
            city=city,
            state=state,
            pincode=pincode,
        )
        return user
