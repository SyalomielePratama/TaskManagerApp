from django.contrib import admin
from .models import Task

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('pembuat', 'nama_tugas', 'deskripsi', 'prioritas', 'tenggat_waktu','status_kegiatan')
    search_fields = ('pembuat', 'nama_tugas', 'deskripsi')
    list_filter = ('pembuat', 'prioritas', 'tenggat_waktu')