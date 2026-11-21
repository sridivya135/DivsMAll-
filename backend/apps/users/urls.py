from django.urls import path

from .views import CustomerSignupView, HealthView, LoginView, LogoutView, MeView, RegisterView

app_name = "users"

urlpatterns = [
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("register/", RegisterView.as_view(), name="register"),
    path("signup/", CustomerSignupView.as_view(), name="signup"),
    path("me/", MeView.as_view(), name="me"),
    path("health/", HealthView.as_view(), name="health"),
]
