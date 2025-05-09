from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserRegistrationView, 
    CustomTokenObtainPairView,
    ForgotPasswordView,
    ResetPasswordView
)
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()

urlpatterns = [
    # Auth endpoints
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),

    # Include router URLs
    path('', include(router.urls)),
]
