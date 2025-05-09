    import { useEffect, useState } from "react";
    import { useParams, useNavigate } from "react-router-dom";
    import axios from "../utils/axiosInstance";
    import Swal from "sweetalert2";
    import Sidebar from "../components/sidebar/Sidebar";
    import "../assets/css/editTask.css";

    const TaskEdit = () => {
      const { id } = useParams();
      const navigate = useNavigate();
      const [task, setTask] = useState(null); // Sebaiknya tidak diperlukan jika hanya formData yang dipakai di form
      const [loading, setLoading] = useState(true);
      const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
      const [screenWidth, setScreenWidth] = useState(window.innerWidth);

      const [formData, setFormData] = useState({
        nama_tugas: "",
        deskripsi: "",
        prioritas: "rendah",
        tenggat_waktu: "",
        list_kegiatan: [], // Diubah dari [""] menjadi []
        link_pendukung: [], // Diubah dari [""] menjadi []
        list_kegiatan_status: [], // Diubah dari [false] menjadi []
      });


      useEffect(() => {
        const fetchTask = async () => {
          try {
            const response = await axios.get(`/api/app/tasks/${id}/`);
            const data = response.data;

            // TAMBAHKAN BARIS INI UNTUK MELIHAT STRUKTUR DATA DARI API
            // console.log("Data dari API:", JSON.stringify(data, null, 2));

            // Proses list kegiatan
            const listKegiatanArray = [];
            let i = 1;
            while (data[`list_kegiatan_tugas_${i}`]) {
              listKegiatanArray.push(data[`list_kegiatan_tugas_${i}`] || "");
              i++;
            }

            // Proses link pendukung
            const linkPendukungArray = [];
            let j = 1;
            while (data[`link_pendukung_${j}`]) {
              linkPendukungArray.push(data[`link_pendukung_${j}`] || "");
              j++;
            }

            setFormData({
              nama_tugas: data.nama_tugas || "",
              deskripsi: data.deskripsi || "",
              prioritas: data.prioritas || "rendah",
              tenggat_waktu: data.tenggat_waktu?.slice(0, 16) || "",
              list_kegiatan: listKegiatanArray,
              link_pendukung: linkPendukungArray,
              list_kegiatan_status: data.list_kegiatan_tugas_status || [],
            });
            setLoading(false);
          } catch (error) {
            console.error("Gagal mengambil data tugas:", error);
            setLoading(false);
          }
        };
        fetchTask();
      }, [id]);

      const handleChange = (e) => {
        setFormData((prev) => ({
          ...prev,
          [e.target.name]: e.target.value,
        }));
      };

      const handleListChange = (index, value, field) => {
        const updated = [...formData[field]];
        updated[index] = value;
        setFormData((prev) => ({
          ...prev,
          [field]: updated,
        }));
      };

      const handleStatusToggle = (index) => {
        const updatedStatus = [...formData.list_kegiatan_status];
        updatedStatus[index] = !updatedStatus[index];
        setFormData((prev) => ({
          ...prev,
          list_kegiatan_status: updatedStatus,
        }));
      };

      const addListItem = (field) => {
        setFormData((prev) => {
          const newState = {
            ...prev,
            [field]: [...prev[field], ""], // prev[field] akan menjadi array kosong jika sebelumnya tidak ada item
          };
          if (field === "list_kegiatan") {
            // Pastikan prev.list_kegiatan_status adalah array sebelum menyebarkannya
            newState.list_kegiatan_status = [...(prev.list_kegiatan_status || []), false];
          }
          return newState;
        });
      };

      const removeListItem = (index, field) => {
        setFormData((prev) => {
          const updatedList = prev[field].filter((_, i) => i !== index);
          const newState = {
            ...prev,
            // Jika updatedList kosong, hasilnya akan menjadi [], bukan [""]
            [field]: updatedList.length > 0 ? updatedList : [],
          };
          if (field === "list_kegiatan") {
            // Pastikan prev.list_kegiatan_status adalah array sebelum memfilter
            const updatedStatusList = (prev.list_kegiatan_status || []).filter((_, i) => i !== index);
            // Jika updatedStatusList kosong, hasilnya akan menjadi [], bukan [false]
            newState.list_kegiatan_status = updatedStatusList.length > 0 ? updatedStatusList : [];
          }
          return newState;
        });
      };

      const handleSubmit = async (e) => {
      e.preventDefault();
      const payload = {
        nama_tugas: formData.nama_tugas,
        deskripsi: formData.deskripsi,
        prioritas: formData.prioritas,
        tenggat_waktu: formData.tenggat_waktu,
        list_kegiatan_tugas: formData.list_kegiatan.filter((item) => item.trim() !== ""),
        list_kegiatan_tugas_status: formData.list_kegiatan
          .map((_, index) => formData.list_kegiatan_status[index] || false)
          .filter((_, index) => formData.list_kegiatan[index]?.trim() !== ""),
        link_pendukung: formData.link_pendukung.filter((link) => link.trim() !== ""),
      };

      console.log("Payload yang dikirim:", JSON.stringify(payload, null, 2));

      try {
        await axios.put(`/api/app/tasks/${id}/`, payload);
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Tugas berhasil diperbarui.",
          timer: 2000,
          showConfirmButton: false,
        });
        navigate("/manage-task");
      } catch (error) {
        console.error("Gagal mengupdate tugas:", error);
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: "Terjadi kesalahan saat memperbarui tugas.",
        });
      }
    };

      const handleDelete = async () => {
        const confirm = await Swal.fire({
          title: "Yakin ingin menghapus tugas ini?",
          text: "Tindakan ini tidak dapat dibatalkan.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Ya, hapus!",
          cancelButtonText: "Batal",
        });

        if (confirm.isConfirmed) {
          try {
            await axios.delete(`/api/app/tasks/${id}/`);
            Swal.fire("Dihapus!", "Tugas telah dihapus.", "success");
            navigate("/manage-task");
          } catch (error) {
            Swal.fire("Gagal", "Tugas gagal dihapus.", "error");
          }
        }
      };

      useEffect(() => {
        const handleResize = () => setScreenWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
      }, []);

      const mainStyle = {
        transition: "all 0.4s ease",
        ...(screenWidth >= 1024
          ? { marginLeft: sidebarCollapsed ? "85px" : "270px" }
          : { marginLeft: "0", marginTop: "0" }),
      };

      const handleSidebarCollapse = (collapsed) => setSidebarCollapsed(collapsed);

      if (loading) return <div className="text-center mt-5">Memuat data tugas...</div>;

      return (
        <div className="wrapper-edit">
          <div className="d-flex flex-column flex-lg-row">
            <Sidebar onCollapse={handleSidebarCollapse} />
            <main className="flex-grow-1 p-4" style={mainStyle}>
              <div className="container">
                <h2 className="fw-bold mb-4 welcome">Edit Tugas</h2>

                <div className="card shadow-sm">
                  <div className="card-body">
                    <form onSubmit={handleSubmit}>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label className="form-label">Nama Tugas</label>
                          <input
                            type="text"
                            className="form-control"
                            name="nama_tugas"
                            value={formData.nama_tugas}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Prioritas</label>
                          <select
                            className="form-select"
                            name="prioritas"
                            value={formData.prioritas}
                            onChange={handleChange}
                          >
                            <option value="rendah">Rendah</option>
                            <option value="sedang">Sedang</option>
                            <option value="tinggi">Tinggi</option>
                          </select>
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Deskripsi</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          name="deskripsi"
                          value={formData.deskripsi}
                          onChange={handleChange}
                        ></textarea>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Tenggat Waktu</label>
                        <input
                          type="datetime-local"
                          className="form-control"
                          name="tenggat_waktu"
                          value={formData.tenggat_waktu}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      {/* List Kegiatan */}
                      <div className="mb-3">
                        <label className="form-label me-3">List Kegiatan</label>
                        {formData.list_kegiatan.map((item, idx) => (
                          <div className="input-group mb-2" key={idx}>
                            <input
                              type="text"
                              className="form-control"
                              placeholder={`Kegiatan ${idx + 1}`}
                              value={item}
                              onChange={(e) =>
                                handleListChange(idx, e.target.value, "list_kegiatan")
                              }
                            />
                            <button
                              type="button"
                              className="btn btn-outline-danger"
                              onClick={() => removeListItem(idx, "list_kegiatan")}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                            {/* Status Toggle */}
                            <button
                              type="button"
                              className={`btn btn-sm btn-selesai ${formData.list_kegiatan_status[idx] ? 'btn-success' : 'btn-outline-success'} ms-2`}
                              onClick={() => handleStatusToggle(idx)}
                            >
                              <i className={`bi ${formData.list_kegiatan_status[idx] ? 'bi-check-circle' : 'bi-circle'} me-1`}></i>
                              {formData.list_kegiatan_status[idx] ? 'Selesai' : 'Belum Selesai'}
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => addListItem("list_kegiatan")}
                        >
                          <i className="bi bi-plus"></i> Tambah Kegiatan
                        </button>
                      </div>

                      {/* Link Pendukung */}
                      <div className="mb-4">
                        <label className="form-label me-3">Link Pendukung</label>
                        {formData.link_pendukung.map((link, idx) => (
                          <div className="input-group mb-2" key={idx}>
                            <input
                              type="text"
                              className="form-control"
                              placeholder={`Link ${idx + 1}`}
                              value={link}
                              onChange={(e) =>
                                handleListChange(idx, e.target.value, "link_pendukung")
                              }
                            />
                            <button
                              type="button"
                              className="btn btn-outline-danger"
                              onClick={() => removeListItem(idx, "link_pendukung")}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm "
                          onClick={() => addListItem("link_pendukung")}
                        >
                          <i className="bi bi-plus"></i> Tambah Link
                        </button>
                      </div>

                      <div className="d-flex gap-2">
                        <button type="submit" className="btn btn-success">Simpan Perubahan</button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => navigate("/manage-task")}
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger ms-auto"
                          onClick={handleDelete}
                        >
                          <i className="bi bi-trash-fill me-1"></i> Hapus Tugas
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      );
    };

    export default TaskEdit;