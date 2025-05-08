# user/signals.py
from django.db.models.signals import post_migrate
from django.dispatch import receiver
from django.conf import settings
from django.contrib.auth.hashers import make_password

@receiver(post_migrate)
def create_default_admin(sender, **kwargs):
    # Pastikan signal ini hanya berjalan untuk aplikasi 'user'
    # untuk menghindari eksekusi berulang kali saat migrasi aplikasi lain.
    if sender.name == 'user':
        User = settings.AUTH_USER_MODEL
        # Dinamis mendapatkan model User
        # Ini lebih baik daripada mengimpor langsung jika model User bisa berubah
        from django.apps import apps
        UserModel = apps.get_model(User)

        username = 'admin'
        password = 'admin123'
        email = 'admin@example.com' # Ganti dengan email yang sesuai

        # Cek apakah admin sudah ada
        if not UserModel.objects.filter(username=username).exists():
            UserModel.objects.create(
                username=username,
                password=make_password(password), # Pastikan password di-hash
                email=email,
                nama_lengkap='Admin Utama Aplikasi',
                is_admin=True,
                is_user=False, # Sesuai permintaan, admin bukan 'user' biasa
                is_staff=True, # Agar bisa login ke Django admin site
                is_superuser=True, # Semua permission
                is_active=True
            )
            print(f"\nPengguna admin default '{username}' dengan password '{password}' berhasil dibuat melalui signals.")
        else:
            print(f"\nPengguna admin default '{username}' sudah ada.")
