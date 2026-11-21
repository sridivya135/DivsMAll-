"""Customer validation and representation."""

import re

from rest_framework import serializers

from .models import Customer


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = [
            "id",
            "name",
            "email",
            "phone",
            "address",
            "city",
            "state",
            "pincode",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]
        extra_kwargs = {
            "name": {"required": True, "allow_blank": False},
            "email": {"required": True},
            "phone": {"required": True, "allow_blank": False},
        }

    def validate_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Name is required.")
        return value

    def validate_phone(self, value):
        value = value.strip()
        if not re.fullmatch(r"[+]?[0-9][0-9\s-]{6,24}", value):
            raise serializers.ValidationError("Enter a valid phone number.")
        return value

    def validate_pincode(self, value):
        value = value.strip()
        if value and not re.fullmatch(r"[0-9]{4,10}", value):
            raise serializers.ValidationError("Enter a valid pincode (4-10 digits).")
        return value
