from rest_framework import generics, status, viewsets, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.utils.encoding import force_bytes
from django.conf import settings
from django.utils.encoding import force_str
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.core.mail import send_mail
from django.urls import reverse
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

class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            reset_url = f"{settings.FRONTEND_BASE_URL}/reset-password?uid={uid}&token={token}"
            send_mail(
                subject="Reset Password",
                message=f"Kunjungi link berikut untuk mengatur ulang password: {reset_url}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
            return Response({"message": "Link reset password telah dikirim ke email."})
        except User.DoesNotExist:
            return Response({"error": "Email tidak ditemukan."}, status=404)

class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        uidb64 = request.query_params.get('uid')
        token = request.query_params.get('token')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')

        if new_password != confirm_password:
            return Response({"error": "Password tidak cocok."}, status=400)

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)

            if default_token_generator.check_token(user, token):
                user.set_password(new_password)
                user.save()
                return Response({"message": "Password berhasil direset."})
            else:
                return Response({"error": "Token tidak valid atau kadaluarsa."}, status=400)

        except Exception:
            return Response({"error": "Terjadi kesalahan saat mereset password."}, status=400)