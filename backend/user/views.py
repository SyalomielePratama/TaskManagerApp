from rest_framework import generics, status, viewsets, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .serializers import (
    UserRegistrationSerializer, 
    CustomTokenObtainPairSerializer,
    UserProfileSerializer,
    UserProfileUpdateSerializer,
    PasswordChangeSerializer,
    AdminUserSerializer
)

User = get_user_model()

class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny] # Siapapun bisa registrasi

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        # Anda bisa memilih untuk langsung login user setelah registrasi atau tidak
        # Jika iya, generate token di sini dan kirimkan
        return Response({
            "message": "User berhasil diregistrasi.",
            "user_id": user.id,
            "username": user.username
        }, status=status.HTTP_201_CREATED)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny] # Siapapun bisa login

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated] # Hanya user terotentikasi

    def get_object(self):
        return self.request.user # Mengambil profil user yang sedang login

    def get_serializer_class(self):
        if self.request.method == 'PUT' or self.request.method == 'PATCH':
            return UserProfileUpdateSerializer
        return UserProfileSerializer
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been used, then clear the cache.
            instance._prefetched_objects_cache = {}
        
        # Return data dari UserProfileSerializer untuk konsistensi
        profile_data = UserProfileSerializer(instance, context={'request': request}).data
        return Response(profile_data)


class PasswordChangeView(generics.UpdateAPIView):
    serializer_class = PasswordChangeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Password berhasil diubah."}, status=status.HTTP_200_OK)

# ViewSet untuk Admin CRUD User
class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('id')
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAdminUser] # Hanya admin Django (is_staff=True) yang bisa akses

    # Anda bisa override metode create, update, destroy jika perlu kustomisasi lebih lanjut
    # Misalnya, untuk memastikan admin tidak bisa menghapus dirinya sendiri, dll.
