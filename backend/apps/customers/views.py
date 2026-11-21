"""Customer endpoints: register, list, search and view."""

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Customer
from .serializers import CustomerSerializer


class CustomerViewSet(viewsets.ModelViewSet):
    serializer_class = CustomerSerializer
    search_fields = ["id", "name", "email", "phone", "city"]
    ordering_fields = ["id", "name", "created_at"]
    ordering = ["-created_at"]
    http_method_names = ["get", "post", "put", "patch", "head", "options"]

    def get_queryset(self):
        return Customer.objects.all()
