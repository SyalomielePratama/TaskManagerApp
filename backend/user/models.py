from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone

class UserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError('User harus memiliki alamat email')
        if not username:
            raise ValueError('User harus memiliki username')

        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_admin', True) # Admin juga superuser
        extra_fields.setdefault('is_user', False) # Superuser bukan user biasa dalam konteks ini
        extra_fields.setdefault('is_active', True)


        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser harus memiliki is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser harus memiliki is_superuser=True.')

        return self.create_user(username, email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=150, unique=True, verbose_name='Username')
    email = models.EmailField(max_length=255, unique=True, verbose_name='Alamat Email')
    nama_lengkap = models.CharField(max_length=255, verbose_name='Nama Lengkap', blank=True, null=True)
    foto_profil = models.ImageField(upload_to='profile_pics/', blank=True, null=True, verbose_name='Foto Profil')
    
    is_active = models.BooleanField(default=True, verbose_name='Aktif')
    is_staff = models.BooleanField(default=False, verbose_name='Staff (akses admin site)') # Untuk akses Django Admin
    is_admin = models.BooleanField(default=False, verbose_name='Admin Aplikasi') # Role admin aplikasi
    is_user = models.BooleanField(default=True, verbose_name='User Biasa') # Role user biasa

    date_joined = models.DateTimeField(default=timezone.now, verbose_name='Tanggal Bergabung')

    objects = UserManager()

    USERNAME_FIELD = 'username' # Bisa juga 'email' jika ingin login dengan email
    REQUIRED_FIELDS = ['email'] # Fields yang diminta saat membuat superuser selain USERNAME_FIELD dan password

    def __str__(self):
        return self.username

    class Meta:
        verbose_name = 'Pengguna'
        verbose_name_plural = 'Pengguna'
