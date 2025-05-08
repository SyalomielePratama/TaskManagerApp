from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet
from user.views import UserProfileView,PasswordChangeView,AdminUserViewSet

router = DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'admin/users', AdminUserViewSet, basename='admin-user') # Endpoint untuk admin CRUD user

urlpatterns = [
    path('', include(router.urls)),
    # Profile endpoint
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    # Password management
    path('password/change/', PasswordChangeView.as_view(), name='password-change'),
    
    # Admin User Management (jika tidak menggunakan router di atas)
    # path('admin/users/', AdminUserListView.as_view(), name='admin-user-list'),
    # path('admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail')
]
