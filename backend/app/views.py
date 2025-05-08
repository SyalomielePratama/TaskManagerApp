from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Task # Pastikan path import .models sesuai struktur proyek Anda
from .serializers import TaskSerializer # Pastikan path import .serializers sesuai
from .permissions import IsOwnerOrAdmin, IsAdminUserForTasks # Pastikan path import .permissions sesuai

from django.db.models import Count, Q
from collections import OrderedDict # Untuk menjaga urutan field dalam response

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    # permission_classes akan diatur per-action jika perlu

    def get_queryset(self):
        """
        Filter queryset berdasarkan role user.
        Admin bisa melihat semua task.
        User biasa hanya bisa melihat task miliknya.
        """
        user = self.request.user
        if user.is_authenticated:
            # Pastikan atribut 'is_admin' dan 'is_user' ada pada model User Anda
            # atau sesuaikan dengan atribut yang relevan (misal: user.is_staff, user.is_superuser)
            if hasattr(user, 'is_admin') and user.is_admin:
                return Task.objects.all().order_by('-diperbarui_pada')
            # Jika 'is_user' adalah default untuk non-admin yang terautentikasi
            elif (hasattr(user, 'is_user') and user.is_user) or (not (hasattr(user, 'is_admin') and user.is_admin)): 
                return Task.objects.filter(pembuat=user).order_by('-diperbarui_pada')
        return Task.objects.none() # Jika tidak terotentikasi atau role tidak jelas

    def get_permissions(self):
        """
        Atur permissions berdasarkan action.
        """
        if self.action == 'list':
            self.permission_classes = [permissions.IsAuthenticated]
        elif self.action in ['retrieve', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsOwnerOrAdmin]
        elif self.action == 'create':
            self.permission_classes = [permissions.IsAuthenticated]
        else:
            self.permission_classes = [permissions.IsAdminUser] # Default, atau sesuaikan
        return super().get_permissions()

    def perform_create(self, serializer):
        """
        Saat membuat task, set pembuatnya adalah user yang sedang login,
        kecuali jika admin yang membuat dan menyertakan field 'pembuat'.
        """
        user = self.request.user
        # Sesuaikan 'user.is_admin' jika atributnya berbeda di model User Anda
        if hasattr(user, 'is_admin') and user.is_admin and 'pembuat' in serializer.validated_data:
            serializer.save()
        else:
            serializer.save(pembuat=user)

    def list(self, request, *args, **kwargs):
        # Dapatkan queryset yang sudah difilter sesuai get_queryset() dan filter lain (jika ada)
        queryset = self.filter_queryset(self.get_queryset())

        # Hitung data agregat
        aggregation_results = queryset.aggregate(
            total_seluruh_tugas=Count('id'),
            total_seluruh_tugas_pending=Count('id', filter=Q(status_kegiatan=Task.StatusKegiatanChoices.PENDING)),
            total_seluruh_tugas_on_going=Count('id', filter=Q(status_kegiatan=Task.StatusKegiatanChoices.ON_GOING)),
            total_seluruh_tugas_selesai=Count('id', filter=Q(status_kegiatan=Task.StatusKegiatanChoices.COMPLETE)),
            total_seluruh_tugas_prioritas_rendah=Count('id', filter=Q(prioritas=Task.PrioritasChoices.RENDAH)),
            total_seluruh_tugas_prioritas_sedang=Count('id', filter=Q(prioritas=Task.PrioritasChoices.SEDANG)),
            total_seluruh_tugas_prioritas_tinggi=Count('id', filter=Q(prioritas=Task.PrioritasChoices.TINGGI)),
        )

        # Panggil method list dari parent class untuk mendapatkan response standar (termasuk paginasi)
        response = super().list(request, *args, **kwargs)

        # Siapkan data tambahan untuk dimasukkan ke response
        additional_data = {
            'total_seluruh_tugas': aggregation_results['total_seluruh_tugas'],
            'total_seluruh_tugas_pending': aggregation_results['total_seluruh_tugas_pending'],
            'total_seluruh_tugas_on_going': aggregation_results['total_seluruh_tugas_on_going'],
            'total_seluruh_tugas_selesai': aggregation_results['total_seluruh_tugas_selesai'],
            'total_seluruh_tugas_prioritas_rendah': aggregation_results['total_seluruh_tugas_prioritas_rendah'],
            'total_seluruh_tugas_prioritas_sedang': aggregation_results['total_seluruh_tugas_prioritas_sedang'],
            'total_seluruh_tugas_prioritas_tinggi': aggregation_results['total_seluruh_tugas_prioritas_tinggi'],
        }

        # Tambahkan data agregat ke response.data
        # Cek apakah response di-paginate atau tidak
        if isinstance(response.data, list): 
            # Jika tidak di-paginate, response.data adalah list. Bungkus dengan OrderedDict.
            new_data = OrderedDict()
            new_data.update(additional_data) # Tambahkan data agregat
            new_data['results'] = response.data # Tambahkan list task
            response.data = new_data
        elif isinstance(response.data, dict) and 'results' in response.data:
            # Jika di-paginate, response.data adalah dict (biasanya OrderedDict)
            # yang berisi 'count', 'next', 'previous', 'results'.
            # Kita buat OrderedDict baru untuk menjaga urutan.
            current_data = response.data
            new_data = OrderedDict()

            # Field paginasi standar
            if 'count' in current_data: new_data['count'] = current_data['count'] # Ini adalah total_seluruh_tugas dari paginator
            if 'next' in current_data: new_data['next'] = current_data['next']
            if 'previous' in current_data: new_data['previous'] = current_data['previous']
            
            # Tambahkan data agregat kustom kita
            new_data.update(additional_data)
            
            # Tambahkan 'results' di akhir
            new_data['results'] = current_data['results']
            
            response.data = new_data
        # else: bisa ditambahkan penanganan jika format response.data tidak terduga

        return response