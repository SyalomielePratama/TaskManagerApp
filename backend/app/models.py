from django.db import models
from django.conf import settings # Untuk ForeignKey ke User
from django.utils.translation import gettext_lazy as _ # Untuk terjemahan

class Task(models.Model):
    class PrioritasChoices(models.TextChoices):
        RENDAH = 'rendah', _('Rendah')
        SEDANG = 'sedang', _('Sedang')
        TINGGI = 'tinggi', _('Tinggi')

    class StatusKegiatanChoices(models.TextChoices):
        PENDING = 'pending', _('Tertunda')
        ON_GOING = 'on_going', _('Sedang Dikerjakan')
        COMPLETE = 'complete', _('Selesai')

    pembuat = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='tasks',
        verbose_name=_('Pembuat Tugas')
    )
    nama_tugas = models.CharField(max_length=200, verbose_name=_('Nama Tugas'))
    deskripsi = models.TextField(blank=True, null=True, verbose_name=_('Deskripsi Tugas'))
    prioritas = models.CharField(
        max_length=10,
        choices=PrioritasChoices.choices,
        default=PrioritasChoices.SEDANG,
        verbose_name=_('Prioritas')
    )
    tenggat_waktu = models.DateTimeField(blank=True, null=True, verbose_name=_('Tenggat Waktu'))
    
    list_kegiatan_tugas = models.JSONField(default=list, blank=True, verbose_name=_('List Kegiatan Tugas'))
    # Field baru untuk menyimpan status penyelesaian setiap kegiatan
    list_kegiatan_tugas_status = models.JSONField(default=list, blank=True, verbose_name=_('Status Setiap Kegiatan Tugas'))
    
    link_pendukung = models.JSONField(default=list, blank=True, verbose_name=_('Link Pendukung'))
    
    # Field baru untuk status keseluruhan tugas berdasarkan list_kegiatan_tugas_status
    status_kegiatan = models.CharField(
        max_length=20, # Cukup untuk 'sedang_dikerjakan'
        choices=StatusKegiatanChoices.choices,
        default=StatusKegiatanChoices.PENDING,
        verbose_name=_('Status Kegiatan')
    )
    
    # Timestamps
    dibuat_pada = models.DateTimeField(auto_now_add=True)
    diperbarui_pada = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.nama_tugas} (oleh {self.pembuat.username})"

    def save(self, *args, **kwargs):
        # Pastikan list_kegiatan_tugas adalah list
        if not isinstance(self.list_kegiatan_tugas, list):
            self.list_kegiatan_tugas = []

        # Pastikan list_kegiatan_tugas_status adalah list
        if not isinstance(self.list_kegiatan_tugas_status, list):
            self.list_kegiatan_tugas_status = []

        # Sinkronkan panjang list_kegiatan_tugas_status dengan list_kegiatan_tugas
        # Item baru di list_kegiatan_tugas akan mendapatkan status default False
        len_kegiatan = len(self.list_kegiatan_tugas)
        len_status = len(self.list_kegiatan_tugas_status)

        if len_kegiatan > len_status:
            # Tambahkan False untuk item status baru
            self.list_kegiatan_tugas_status.extend([False] * (len_kegiatan - len_status))
        elif len_kegiatan < len_status:
            # Potong item status jika list kegiatan menyusut
            self.list_kegiatan_tugas_status = self.list_kegiatan_tugas_status[:len_kegiatan]
        
        # Pastikan semua item di list_kegiatan_tugas_status adalah boolean
        # Ini penting jika data berasal dari sumber yang tidak terjamin tipenya (misal, form data string "true")
        # Namun, serializer idealnya sudah memastikan ini.
        self.list_kegiatan_tugas_status = [bool(s) for s in self.list_kegiatan_tugas_status]

        # Hitung status_kegiatan berdasarkan list_kegiatan_tugas_status
        if not self.list_kegiatan_tugas: # Tidak ada sub-tugas
            self.status_kegiatan = self.StatusKegiatanChoices.PENDING
        else:
            # Jika list_kegiatan_tugas ada, tapi list_kegiatan_tugas_status mungkin kosong setelah inisialisasi
            # atau jika panjangnya tidak sinkron (seharusnya sudah ditangani di atas)
            if not self.list_kegiatan_tugas_status or len(self.list_kegiatan_tugas_status) != len_kegiatan:
                 # Inisialisasi ulang jika ada ketidaksesuaian yang tidak terduga
                self.list_kegiatan_tugas_status = [False] * len_kegiatan

            if all(self.list_kegiatan_tugas_status):
                self.status_kegiatan = self.StatusKegiatanChoices.COMPLETE
            elif any(self.list_kegiatan_tugas_status):
                self.status_kegiatan = self.StatusKegiatanChoices.ON_GOING
            else:
                self.status_kegiatan = self.StatusKegiatanChoices.PENDING
            
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = _('Tugas')
        verbose_name_plural = _('Tugas')
        ordering = ['-dibuat_pada'] # Urutkan berdasarkan terbaru dulu
