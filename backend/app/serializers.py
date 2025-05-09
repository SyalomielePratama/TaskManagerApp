from django.db import models # Meskipun tidak langsung digunakan di serializer, ini untuk referensi model
from django.conf import settings
from django.utils.translation import gettext_lazy as _

# Import DRF serializers dan lainnya
from rest_framework import serializers
# Asumsi model Task ada di aplikasi yang sama di file models.py
from .models import Task
from django.contrib.auth import get_user_model
import json # Import library json, berguna untuk inspeksi data JSONField jika perlu
import re # Import modul regular expression untuk memperbaiki to_internal_value

User = get_user_model()

class TaskSerializer(serializers.ModelSerializer):
    # Field pembuat akan otomatis diset ke user yang sedang login di ViewSet,
    # required=False memungkinkan admin untuk set pembuat lain jika perlu.
    pembuat = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False)
    
    # Field status_kegiatan akan di-serialize tapi read-only karena dihitung otomatis
    # Menggunakan source='get_status_kegiatan_display' untuk mendapatkan label pilihan (misal: 'Tertunda')
    status_kegiatan = serializers.CharField(source='get_status_kegiatan_display', read_only=True)

    class Meta:
        model = Task
        fields = [
            'id', 'pembuat', 'nama_tugas', 'deskripsi', 'prioritas', 
            'tenggat_waktu', 
            'list_kegiatan_tugas', # Field JSONField untuk list string kegiatan
            'list_kegiatan_tugas_status', # Field JSONField untuk list boolean status kegiatan
            'status_kegiatan', # Field CharField untuk status keseluruhan (derived)
            'link_pendukung', # Field JSONField untuk list string link
            'dibuat_pada', 'diperbarui_pada' # Timestamps
        ]
        extra_kwargs = {
            # Menetapkan field yang wajib diisi saat input (jika tidak ada di read_only_fields atau default model)
            'prioritas': {'required': True},
            # 'deskripsi': {'required': True}, 
            'tenggat_waktu': {'required': True}, 
            # list_kegiatan_tugas_status tidak wajib di extra_kwargs karena model menyediakan default=list
        }
        # Field yang hanya bisa dibaca, tidak bisa diinput atau diubah oleh klien
        read_only_fields = ('id', 'dibuat_pada', 'diperbarui_pada') # status_kegiatan sudah read_only dari deklarasi field di atas

    def to_internal_value(self, data):

        # Kumpulkan field flattened seperti list_kegiatan_tugas_1, list_kegiatan_tugas_2, dst.
        kegiatan_tugas_list = []
        kegiatan_keys_to_pop = []

        # Buat salinan data untuk diiterasi dan dimodifikasi
        # karena mengubah dictionary saat iterasi bisa menimbulkan masalah
        mutable_data = data.copy()

        # Gunakan regex untuk mencocokkan kunci yang berakhir dengan '_' diikuti oleh angka (satu atau lebih)
        # Ini untuk mengidentifikasi field 'flattened' yang datang dari form-data atau representasi lain
        # Pola: string literal 'list_kegiatan_tugas_' diikuti 1 atau lebih digit (\d+) sampai akhir string ($)
        kegiatan_key_pattern = re.compile(r'^list_kegiatan_tugas_\d+$')

        # Iterasi pada data asli untuk identifikasi flattened keys kegiatan
        # Menggunakan list(data.items()) untuk menghindari masalah jika pop() memengaruhi iterasi
        for key, value in list(data.items()): 

            # GANTI LOGIKA startswith() dengan match() dari regex pattern
            if kegiatan_key_pattern.match(key):
                # Cek apakah value adalah string kosong atau None (jika dari form data)
                # Tambahkan value hanya jika BUKAN string kosong atau None
                if value != '' and value is not None:
                     kegiatan_tugas_list.append(value)
                kegiatan_keys_to_pop.append(key) # Kunci ini akan dihapus dari mutable_data

        # Kumpulkan link_pendukung_*
        link_pendukung_list = []
        link_keys_to_pop = []
        # Gunakan regex untuk mencocokkan kunci link yang diakhiri dengan '_' diikuti oleh angka
        link_key_pattern = re.compile(r'^link_pendukung_\d+$') 

        # Iterasi pada data asli untuk identifikasi flattened keys link
        for key, value in list(data.items()):
             # GANTI LOGIKA startswith() dengan match() dari regex pattern link
            if link_key_pattern.match(key):
                 if value != '' and value is not None:
                     link_pendukung_list.append(value)
                 link_keys_to_pop.append(key) # Kunci ini akan dihapus dari mutable_data


        # Hapus field flattened dari mutable_data sebelum memanggil super
        # Gunakan pop(key, None) agar tidak error jika key sudah dihapus (walaupun seharusnya tidak terjadi di sini)
        for key in kegiatan_keys_to_pop + link_keys_to_pop:
            mutable_data.pop(key, None) 

        # Jika ada field flattened kegiatan yang ditemukan dan dikumpulkan,
        # timpa nilai 'list_kegiatan_tugas' di mutable_data dengan list hasil rekonstruksi.
        # Ini memprioritaskan format flattened jika dikirimkan.
        if kegiatan_tugas_list:
            mutable_data['list_kegiatan_tugas'] = kegiatan_tugas_list
        # Jika tidak ada flattened keys kegiatan, nilai 'list_kegiatan_tugas' di mutable_data
        # akan tetap menggunakan nilai dari data.copy() (yang mungkin berupa array JSON standar jika dikirim)

        # Lakukan hal yang sama untuk link pendukung
        if link_pendukung_list:
            mutable_data['link_pendukung'] = link_pendukung_list
        # Jika tidak ada flattened keys link, nilai 'link_pendukung' di mutable_data
        # akan tetap menggunakan nilai dari data.copy() (yang mungkin berupa array JSON standar jika dikirim)


        
        # Panggil super().to_internal_value() dengan data yang sudah dimodifikasi
        # DRF akan memanggil validator field-specific (validate_list_kegiatan_tugas, dll.) setelah ini
        internal_value = super().to_internal_value(mutable_data)

        return internal_value


    def validate_list_kegiatan_tugas(self, value):

        if not isinstance(value, list):
            raise serializers.ValidationError(_("List kegiatan tugas harus berupa list/array."))

        for i, item in enumerate(value):
            if not isinstance(item, str):
                raise serializers.ValidationError(_("Setiap item dalam list kegiatan harus berupa string."))

        return value

    def validate_link_pendukung(self, value):

        if not isinstance(value, list):
            raise serializers.ValidationError(_("Link pendukung harus berupa list/array."))
        for i, item in enumerate(value):
            if not isinstance(item, str):
                raise serializers.ValidationError(_("Setiap item dalam link pendukung harus berupa string (URL)."))

        return value


    def validate_list_kegiatan_tugas_status(self, value):
        """
        Memvalidasi bahwa list_kegiatan_tugas_status adalah list dari boolean.
        Validasi panjang akan dilakukan di metode validate() secara keseluruhan.
        """

        if not isinstance(value, list):
            raise serializers.ValidationError(_("Status list kegiatan tugas harus berupa list/array."))
        for i, item in enumerate(value):
            # Pastikan boolean. Jika ingin permisif terhadap string "true"/"false", tambahkan logika di sini.
            if not isinstance(item, bool):
                raise serializers.ValidationError(_("Setiap item dalam status list kegiatan harus berupa boolean (true/false)."))

        return value


    def validate(self, data):
        """
        Validasi cross-field, terutama untuk panjang list_kegiatan_tugas dan list_kegiatan_tugas_status.
        """

        # Dapatkan list_kegiatan_tugas dan list_kegiatan_tugas_status dari data yang sudah divalidasi field-nya.
        # atau dari instance jika ini adalah partial update dan field tersebut tidak ada di payload.

        # list_kegiatan_tugas:
        # Ambil dari data yang sudah diproses (internal representation).
        list_kegiatan = data.get('list_kegiatan_tugas')
        # Jika tidak ada di data (misal PUT partial update tanpa field ini), ambil dari instance
        if list_kegiatan is None and self.instance:
             list_kegiatan = self.instance.list_kegiatan_tugas
        # Default ke list kosong jika masih None
        if list_kegiatan is None:
             list_kegiatan = []


        # list_kegiatan_tugas_status:
        # Ambil dari data yang sudah diproses (internal representation).
        list_status = data.get('list_kegiatan_tugas_status')
        # Jika tidak ada di data, dan ini adalah PUT partial update, ambil dari instance
        if list_status is None and self.instance:
             list_status = self.instance.list_kegiatan_tugas_status
         # Default ke list kosong jika masih None
        if list_status is None:
             list_status = [] # Meskipun model punya default, validasi ini perlu nilai awal

        # Cek panjang hanya jika KEDUANYA ada dalam bentuk list.
        # Penting: Validasi tipe data per item sudah dilakukan di validate_list_kegiatan_tugas dan validate_list_kegiatan_tugas_status
        # Jadi di sini kita asumsikan list_kegiatan dan list_status (jika ada) sudah berisi tipe item yang benar.


        # Lakukan validasi panjang HANYA jika list_kegiatan_tugas_status disediakan di payload awal.
        # Jika list_kegiatan_tugas_status tidak ada di payload, model.save() akan menanganinya.
        if 'list_kegiatan_tugas_status' in self.initial_data:
             # Pastikan keduanya list sebelum membandingkan panjang
             if isinstance(list_kegiatan, list) and isinstance(list_status, list):
                if len(list_kegiatan) != len(list_status):
                    raise serializers.ValidationError({
                        "list_kegiatan_tugas_status": _(
                            "Panjang list status ({status_len}) harus cocok dengan panjang list kegiatan tugas ({kegiatan_len})."
                        ).format(status_len=len(list_status), kegiatan_len=len(list_kegiatan))
                    })
             # Jika salah satunya bukan list pada tahap ini, berarti ada masalah validasi tipe field
             # sebelumnya yang mungkin perlu penanganan khusus jika diperlukan.
             # Tapi umumnya, validate_<field_name> sudah memastikan tipenya.

        return data # Kembalikan data yang sudah divalidasi


    def to_representation(self, instance):
        """
        Mengubah objek model menjadi representasi data (misal: JSON) untuk response API.
        Melakukan 'flattening' pada list_kegiatan_tugas dan link_pendukung.
        """

        # Dapatkan representasi standar dari ModelSerializer
        representation = super().to_representation(instance)


        # Ubah representasi pembuat dari PrimaryKey menjadi username jika ada
        # (Atau bisa gunakan SerializerMethodField jika perlu representasi yang lebih kompleks)
        if instance.pembuat:
            representation['pembuat_username'] = instance.pembuat.username
        else:
            representation['pembuat_username'] = None

        # Proses list_kegiatan_tugas: ambil list-nya dan tambahkan item-itemnya sebagai field terpisah
        kegiatan_list = representation.pop('list_kegiatan_tugas', []) # Ambil list dan hapus field aslinya
        if isinstance(kegiatan_list, list):
            for i, item in enumerate(kegiatan_list):
                # Tambahkan field baru dengan format 'list_kegiatan_tugas_1', 'list_kegiatan_tugas_2', dst.
                representation[f'list_kegiatan_tugas_{i+1}'] = item

        # Proses link_pendukung: lakukan hal yang sama seperti list_kegiatan_tugas
        link_list = representation.pop('link_pendukung', []) # Ambil list dan hapus field aslinya
        if isinstance(link_list, list):
            for i, item in enumerate(link_list):
                # Tambahkan field baru dengan format 'link_pendukung_1', 'link_pendukung_2', dst.
                representation[f'link_pendukung_{i+1}'] = item

        # Field 'status_kegiatan' sudah di-handle oleh source='get_status_kegiatan_display'
        # Field 'list_kegiatan_tugas_status' akan tetap dalam format list JSON standar

        return representation

    def create(self, validated_data):

        # Saat membuat task, set pembuatnya adalah user yang sedang login,
        # kecuali jika admin yang membuat dan secara eksplisit menyertakan field 'pembuat'.
        # Logika ini juga bisa ditangani di ViewSet.
        if 'pembuat' not in validated_data or validated_data.get('pembuat') is None:
            request = self.context.get('request')
            if request and hasattr(request, "user") and request.user.is_authenticated:
                validated_data['pembuat'] = request.user
            # else: Jika tidak terautentikasi dan pembuat tidak disediakan, 
            # model validation (null=False) akan memicu error, atau permission class sudah mencegah ini.

        # Panggil method create dari parent class (ModelSerializer) untuk menyimpan objek ke database
        instance = super().create(validated_data)
        
        return instance

    # Metode update() tidak perlu override kustom UNTUK LOGIKA SINKRONISASI STATUS
    # karena logika sinkronisasi panjang list dan perhitungan status_kegiatan
    # sudah ada di metode save() model, yang akan dipanggil oleh super().update()
    # def update(self, instance, validated_data):
    #     # Logika update kustom jika diperlukan, misalnya untuk list_kegiatan_tugas_status
    #     # return super().update(instance, validated_data)
    #    # return instance