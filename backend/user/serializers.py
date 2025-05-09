from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    konfirmasi_password = serializers.CharField(write_only=True, required=True, label="Konfirmasi Password", style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ('username', 'email', 'nama_lengkap', 'password', 'konfirmasi_password', 'foto_profil')
        extra_kwargs = {
            'foto_profil': {'required': False, 'allow_null': True},
            'nama_lengkap': {'required': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['konfirmasi_password']:
            raise serializers.ValidationError({"password": "Password tidak cocok."})
        # Hapus konfirmasi_password karena tidak ada di model User
        attrs.pop('konfirmasi_password')
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            nama_lengkap=validated_data.get('nama_lengkap'),
            foto_profil=validated_data.get('foto_profil'),
            is_user=True, # Default role untuk registrasi adalah 'user'
            is_admin=False
        )
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Tambahkan custom claims jika diperlukan
        token['username'] = user.username
        token['is_admin'] = user.is_admin
        token['is_user'] = user.is_user
        token['email'] = user.email
        token['nama_lengkap'] = user.nama_lengkap
        if user.foto_profil:
            token['foto_profil'] = user.foto_profil.url
        else:
            token['foto_profil'] = None
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # Tambahkan data user ke response login
        data.update({
            'user_id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'nama_lengkap': self.user.nama_lengkap,
            'is_admin': self.user.is_admin,
            'is_user': self.user.is_user,
            'foto_profil': self.user.foto_profil.url if self.user.foto_profil else None
        })
        return data


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'nama_lengkap', 'foto_profil', 'is_admin', 'is_user', 'date_joined')
        read_only_fields = ('id', 'username', 'is_admin', 'is_user', 'date_joined') # Username tidak boleh diubah oleh user biasa

class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('email', 'nama_lengkap', 'foto_profil')
        extra_kwargs = {
            'email': {'required': False},
            'nama_lengkap': {'required': False},
            'foto_profil': {'required': False, 'allow_null': True}
        }

    def validate_email(self, value):
        # Pastikan email unik jika diubah
        user = self.context['request'].user
        if User.objects.exclude(pk=user.pk).filter(email=value).exists():
            raise serializers.ValidationError("Email ini sudah digunakan.")
        return value

class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})
    new_password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})
    new_konfirmasi_password = serializers.CharField(required=True, write_only=True, label="Konfirmasi Password Baru", style={'input_type': 'password'})

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Password lama salah.")
        return value

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_konfirmasi_password']:
            raise serializers.ValidationError({"new_password": "Password baru tidak cocok."})
        # Anda bisa menambahkan validasi kekuatan password di sini jika perlu
        return attrs

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user

# Serializer untuk Admin CRUD User
class AdminUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'nama_lengkap', 'foto_profil', 
                  'is_admin', 'is_user', 'is_active', 'is_staff', 'password')
        read_only_fields = ('id',)
        extra_kwargs = {
            'username': {'required': True},
            'email': {'required': True},
        }

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        else:
            # Jika admin membuat user tanpa password, set password yang tidak bisa digunakan
            user.set_unusable_password() 
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        
        # Update field lainnya
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance
