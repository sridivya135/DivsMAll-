"""Customer records."""

import re

from django.conf import settings
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import models


class Customer(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="customer_profile",
        null=True,
        blank=True,
    )
    name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, unique=True)
    address = models.TextField(blank=True, default="")
    city = models.CharField(max_length=100, blank=True, default="")
    state = models.CharField(max_length=100, blank=True, default="")
    pincode = models.CharField(max_length=10, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "customers"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["name"]),
            models.Index(fields=["phone"]),
        ]

    def clean(self):
        if self.pincode and not re.fullmatch(r"[0-9]{4,10}", self.pincode):
            raise DjangoValidationError({"pincode": "Enter a valid pincode (4-10 digits)."})

    def __str__(self) -> str:
        return f"{self.name} (#{self.pk})"
