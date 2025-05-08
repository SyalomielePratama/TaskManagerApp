"""
URL configuration for task_manager_project project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls), # Django admin site
    
    # URL untuk otentikasi dan manajemen user
    path('auth/', include('user.urls')), # Menggunakan 'auth/' sebagai prefix
    
    # URL untuk aplikasi utama (task)
    path('api/app/', include('app.urls')), # Sesuai permintaan, /api/app/

    # Anda bisa menambahkan endpoint lain di sini jika perlu
    # path('api-auth/', include('rest_framework.urls', namespace='rest_framework')), # Untuk browsable API login/logout
]

# Tambahkan ini untuk menyajikan file media selama pengembangan
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) # Jika Anda menggunakan staticfiles_dirs

