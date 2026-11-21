from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class AuthApiTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin",
            email="admin@example.com",
            password="StrongPass123!",
            role=User.Role.ADMIN,
        )
        self.staff = User.objects.create_user(
            username="staff",
            email="staff@example.com",
            password="StrongPass123!",
            role=User.Role.STAFF,
        )

    def test_login_with_username_or_email_returns_tokens(self):
        for identifier in ("admin", "ADMIN@example.com"):
            response = self.client.post(
                reverse("users:login"),
                {"username": identifier, "password": "StrongPass123!"},
                format="json",
            )
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertIn("access", response.data)
            self.assertIn("refresh", response.data)
            self.assertEqual(response.data["user"]["role"], "admin")

    def test_invalid_login_has_expected_message(self):
        response = self.client.post(
            reverse("users:login"),
            {"username": "admin", "password": "wrong-password"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(str(response.data["detail"]), "Invalid username or password.")

    def test_registration_is_admin_only(self):
        payload = {
            "username": "newstaff",
            "email": "newstaff@example.com",
            "password": "AnotherPass123!",
            "password2": "AnotherPass123!",
            "role": "staff",
        }
        self.client.force_authenticate(self.staff)
        self.assertEqual(
            self.client.post(reverse("users:register"), payload, format="json").status_code,
            status.HTTP_403_FORBIDDEN,
        )

        self.client.force_authenticate(self.admin)
        response = self.client.post(reverse("users:register"), payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username="newstaff").exists())

    def test_logout_blacklists_refresh_token(self):
        login = self.client.post(
            reverse("users:login"),
            {"username": "admin", "password": "StrongPass123!"},
            format="json",
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
        response = self.client.post(
            reverse("users:logout"), {"refresh": login.data["refresh"]}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        retry = self.client.post(
            reverse("users:logout"), {"refresh": login.data["refresh"]}, format="json"
        )
        self.assertEqual(retry.status_code, status.HTTP_400_BAD_REQUEST)
