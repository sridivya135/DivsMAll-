"""Shared error types and response helpers."""

from rest_framework import status
from rest_framework.exceptions import APIException
from rest_framework.response import Response
from rest_framework.views import exception_handler


class BusinessRuleViolation(APIException):
    """A domain rule was broken (stock, quantity, totals, etc.)."""

    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Invalid request."
    default_code = "business_rule_violation"


def error_response(message, status_code=status.HTTP_400_BAD_REQUEST):
    """Build a consistent ``{"detail": message}`` error response."""
    return Response({"detail": message}, status=status_code)


def custom_exception_handler(exc, context):
    """Never leak internal exception details to API clients."""
    response = exception_handler(exc, context)
    if response is None:
        return error_response(
            "Something went wrong. Please try again later.",
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
    return response
