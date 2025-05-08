from rest_framework import serializers
from .models import Task
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _ # Untuk terjemahan

User = get_user_model()

class TaskSerializer(serializers.ModelSerializer):
    pembuat = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False)
    # Field status_kegiatan akan di-serialize tapi read-only karena dihitung otomatis
    status_kegiatan = serializers.CharField(source='get_status_kegiatan_display', read_only=True)


    class Meta:
        model = Task
        fields = [
            'id', 'pembuat', 'nama_tugas', 'deskripsi', 'prioritas', 
            'tenggat_waktu', 'list_kegiatan_tugas', 'list_kegiatan_tugas_status', # Field baru ditambahkan
            'status_kegiatan', # Field baru ditambahkan
            'link_pendukung',
            'dibuat_pada', 'diperbarui_pada'
        ]
        extra_kwargs = {
            'prioritas': {'required': True},
            'deskripsi': {'required': True}, # Sesuai kode asli
            'tenggat_waktu': {'required': True}, # Sesuai kode asli
            # list_kegiatan_tugas_status bersifat opsional saat input, akan di-default di model jika tidak ada
        }
        read_only_fields = ('id', 'dibuat_pada', 'diperbarui_pada') # status_kegiatan sudah read_only dari deklarasi di atas

    def validate_list_kegiatan_tugas(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError(_("List kegiatan tugas harus berupa list/array."))
        for item in value:
            if not isinstance(item, str):
                raise serializers.ValidationError(_("Setiap item dalam list kegiatan harus berupa string."))
        return value

    def validate_link_pendukung(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError(_("Link pendukung harus berupa list/array."))
        for item in value:
            if not isinstance(item, str): # Anda bisa menambahkan validasi URL di sini jika perlu
                raise serializers.ValidationError(_("Setiap item dalam link pendukung harus berupa string (URL)."))
        return value

    def validate_list_kegiatan_tugas_status(self, value):
        """
        Memvalidasi bahwa list_kegiatan_tugas_status adalah list dari boolean.
        Validasi panjang akan dilakukan di metode validate() secara keseluruhan.
        """
        if not isinstance(value, list):
            raise serializers.ValidationError(_("Status list kegiatan tugas harus berupa list/array."))
        for item in value:
            if not isinstance(item, bool):
                # Jika Anda ingin lebih permisif terhadap input string "true"/"false" dari form-data:
                # if isinstance(item, str) and item.lower() in ['true', 'false']:
                #     pass # Akan dikonversi nanti atau dihandle oleh JSONField/model
                # else:
                raise serializers.ValidationError(_("Setiap item dalam status list kegiatan harus berupa boolean (true/false)."))
        return value

    def validate(self, data):
        """
        Validasi cross-field, terutama untuk panjang list_kegiatan_tugas dan list_kegiatan_tugas_status.
        """
        # Dapatkan list_kegiatan_tugas dan list_kegiatan_tugas_status dari data yang divalidasi
        # atau dari instance jika ini adalah partial update dan field tersebut tidak ada di payload.
        
        # list_kegiatan_tugas:
        # Jika 'list_kegiatan_tugas' ada di 'data', itu berarti sedang diupdate atau dibuat.
        # Jika tidak, dan ini adalah update (self.instance ada), gunakan nilai dari instance.
        # Jika ini create dan tidak ada di 'data', maka akan default ke [] (dari model).
        if 'list_kegiatan_tugas' in data:
            list_kegiatan = data['list_kegiatan_tugas']
        elif self.instance:
            list_kegiatan = self.instance.list_kegiatan_tugas
        else:
            list_kegiatan = [] # Default untuk create jika tidak disediakan

        # list_kegiatan_tugas_status:
        # Hanya periksa jika 'list_kegiatan_tugas_status' secara eksplisit ada di payload (self.initial_data).
        # Jika tidak ada di payload, model akan menanganinya.
        if 'list_kegiatan_tugas_status' in self.initial_data:
            list_status = data.get('list_kegiatan_tugas_status') # Mungkin None jika gagal validasi tipe individu

            if isinstance(list_kegiatan, list) and isinstance(list_status, list):
                if len(list_kegiatan) != len(list_status):
                    raise serializers.ValidationError({
                        "list_kegiatan_tugas_status": _(
                            "Panjang list status ({status_len}) harus cocok dengan panjang list kegiatan tugas ({kegiatan_len})."
                        ).format(status_len=len(list_status), kegiatan_len=len(list_kegiatan))
                    })
            elif isinstance(list_status, list) and list_status and not isinstance(list_kegiatan, list):
                # Jika list_status ada (dan tidak kosong) tapi list_kegiatan tidak ada (atau bukan list)
                raise serializers.ValidationError({
                    "list_kegiatan_tugas_status": _("Tidak dapat menyediakan list status jika tidak ada list kegiatan tugas atau list kegiatan tugas kosong.")
                })
        return data
    
    def to_representation(self, instance):
        """
        Mengubah representasi output.
        Field status_kegiatan akan menggunakan label dari choices.
        Field list_kegiatan_tugas_status akan direpresentasikan sebagai list boolean.
        Logika flattening untuk list_kegiatan_tugas dan link_pendukung dipertahankan.
        """
        representation = super().to_representation(instance)
        
        # Ubah representasi pembuat menjadi username jika ada
        if instance.pembuat:
            representation['pembuat_username'] = instance.pembuat.username
        else:
            # Jika pembuat adalah None (misalnya jika allowNull=True di ForeignKey dan tidak diset)
            representation['pembuat_username'] = None 
        
        # Proses list_kegiatan_tugas (flattening seperti kode asli)
        kegiatan_list = representation.pop('list_kegiatan_tugas', []) 
        if isinstance(kegiatan_list, list):
            for i, item in enumerate(kegiatan_list):
                representation[f'list_kegiatan_tugas_{i+1}'] = item
        
        # Proses link_pendukung (flattening seperti kode asli)
        link_list = representation.pop('link_pendukung', []) 
        if isinstance(link_list, list):
            for i, item in enumerate(link_list):
                representation[f'link_pendukung_{i+1}'] = item
                
        # status_kegiatan sudah di-handle oleh source='get_status_kegiatan_display'
        # list_kegiatan_tugas_status akan tetap sebagai list JSON standar dalam representasi
        # representation['list_kegiatan_tugas_status'] = instance.list_kegiatan_tugas_status # Sudah ada dari super()

        return representation

    def to_internal_value(self, data):
        """
        Mengubah data input kembali ke format list jika ada field_1, field_2, dst.
        untuk list_kegiatan_tugas dan link_pendukung.
        list_kegiatan_tugas_status diharapkan sebagai array JSON standar.
        """
        # Kumpulkan list_kegiatan_tugas_*
        kegiatan_tugas_list = []
        kegiatan_keys_to_pop = [] # Simpan kunci yang akan dihapus
        
        # Buat salinan data untuk diiterasi dan dimodifikasi
        # karena mengubah dictionary saat iterasi bisa menimbulkan masalah
        mutable_data = data.copy()

        for key, value in data.items(): # Iterasi pada data asli untuk identifikasi
            if key.startswith('list_kegiatan_tugas_'):
                # Cek apakah value adalah string kosong, jika iya, jangan tambahkan
                # Ini untuk kasus di mana form-data mengirim field kosong
                if value != '' or value is not None:
                    kegiatan_tugas_list.append(value)
                kegiatan_keys_to_pop.append(key)
        
        # Kumpulkan link_pendukung_*
        link_pendukung_list = []
        link_keys_to_pop = []
        for key, value in data.items():
            if key.startswith('link_pendukung_'):
                if value != '' or value is not None:
                    link_pendukung_list.append(value)
                link_keys_to_pop.append(key)

        # Hapus field _1, _2 dari mutable_data sebelum memanggil super
        # agar tidak diproses lebih lanjut oleh default DRF jika tidak sesuai format JSONField
        for key in kegiatan_keys_to_pop + link_keys_to_pop:
            mutable_data.pop(key, None)
        
        # Jika ada list_kegiatan_tugas_* yang ditemukan, set di mutable_data
        # Ini akan menimpa jika 'list_kegiatan_tugas' juga dikirim sebagai array JSON
        # Prioritaskan format _1, _2 jika ada, sesuai perilaku kode asli
        if kegiatan_tugas_list:
            mutable_data['list_kegiatan_tugas'] = kegiatan_tugas_list
        
        if link_pendukung_list:
            mutable_data['link_pendukung'] = link_pendukung_list

        # Panggil super().to_internal_value() dengan data yang sudah dimodifikasi
        internal_value = super().to_internal_value(mutable_data)
            
        return internal_value

    def create(self, validated_data):
        # Jika pembuat tidak diset oleh admin (atau tidak ada di validated_data), 
        # set ke user yang sedang login dari context.
        # Ini adalah fallback jika perform_create di ViewSet tidak secara eksplisit mengatur pembuat.
        if 'pembuat' not in validated_data or validated_data.get('pembuat') is None:
            request = self.context.get('request')
            if request and hasattr(request, "user") and request.user.is_authenticated:
                validated_data['pembuat'] = request.user
            # else:
                # Jika tidak ada request atau user, biarkan kosong, akan gagal di validasi model jika 'pembuat' adalah null=False
                # atau jika ada logic di perform_create viewset yang akan menanganinya.
                # Umumnya, permission class sudah harus memastikan user terautentikasi.
        return super().create(validated_data)

    # def update(self, instance, validated_data):
    #     # Logika update kustom jika diperlukan, misalnya untuk list_kegiatan_tugas_status
    #     # Namun, metode save() pada model sudah menangani sinkronisasi dan perhitungan status.
    #     return super().update(instance, validated_data)

