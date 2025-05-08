from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

class UserAdmin(BaseUserAdmin):
    # Field yang akan ditampilkan di list display admin
    list_display = ('username', 'email', 'nama_lengkap', 'is_admin', 'is_user', 'is_staff', 'is_active', 'date_joined')
    # Field yang bisa dijadikan link untuk edit
    list_display_links = ('username', 'email')
    # Filter di sidebar
    list_filter = ('is_admin', 'is_user', 'is_staff', 'is_active')
    # Field yang bisa dicari
    search_fields = ('username', 'email', 'nama_lengkap')
    # Urutan field
    ordering = ('-date_joined',)

    # Fieldsets untuk form tambah dan edit user di admin
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Informasi Pribadi', {'fields': ('email', 'nama_lengkap', 'foto_profil')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_admin', 'is_user', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    # add_fieldsets untuk form tambah user (superuser)
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password', 'konfirmasi_password', # konfirmasi_password untuk konfirmasi
                       'nama_lengkap', 'is_active', 'is_staff', 'is_admin', 'is_user', 'is_superuser'),
        }),
    )
    # Override form untuk add user jika diperlukan (misal, untuk validasi konfirmasi_password)

admin.site.register(User, UserAdmin)
