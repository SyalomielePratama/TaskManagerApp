// pages/TaskCreate.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axiosInstance";
import Swal from "sweetalert2";
import Sidebar from "../components/sidebar/Sidebar";
import TaskForm from "../components/Tasks/TaskForm";

const TaskCreate = () => {
    const navigate = useNavigate();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    const [formData, setFormData] = useState({
        nama_tugas: "",
        deskripsi: "",
        prioritas: "rendah",
        tenggat_waktu: "",
        list_kegiatan: [],
        link_pendukung: [],
        list_kegiatan_status: [],
    });

    useEffect(() => {
        const handleResize = () => setScreenWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleSidebarCollapse = (isCollapsed) => setSidebarCollapsed(isCollapsed);

    const mainStyle = {
        transition: "all 0.4s ease",
        ...(screenWidth >= 1024
            ? { marginLeft: sidebarCollapsed ? "85px" : "270px" }
            : { marginLeft: "0", marginTop: "0" }),
    };

    const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleListChange = (index, value, field) => {
        const updated = [...formData[field]];
        updated[index] = value;
        setFormData((prev) => ({ ...prev, [field]: updated }));
    };

    const handleStatusToggle = (index) => {
        const updated = [...formData.list_kegiatan_status];
        updated[index] = !updated[index];
        setFormData((prev) => ({ ...prev, list_kegiatan_status: updated }));
    };

    const addListItem = (field) => {
        setFormData((prev) => {
            const newState = { ...prev, [field]: [...prev[field], ""] };
            if (field === "list_kegiatan") {
                newState.list_kegiatan_status = [...prev.list_kegiatan_status, false];
            }
            return newState;
        });
    };

    const removeListItem = (index, field) => {
        setFormData((prev) => {
            const updated = prev[field].filter((_, i) => i !== index);
            const newState = { ...prev, [field]: updated };
            if (field === "list_kegiatan") {
                newState.list_kegiatan_status = prev.list_kegiatan_status.filter((_, i) => i !== index);
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
            list_kegiatan_tugas: formData.list_kegiatan.filter((i) => i.trim() !== ""),
            list_kegiatan_tugas_status: formData.list_kegiatan
                .map((_, idx) => formData.list_kegiatan_status[idx] || false)
                .filter((_, idx) => formData.list_kegiatan[idx]?.trim() !== ""),
            link_pendukung: formData.link_pendukung.filter((l) => l.trim() !== ""),
        };

        try {
            await axios.post("/api/app/tasks/", payload);
            Swal.fire("Berhasil", "Tugas berhasil ditambahkan", "success");
            navigate("/manage-task");
        } catch (err) {
            console.error("Gagal menambah tugas:", err);
            Swal.fire("Gagal", "Tugas gagal ditambahkan", "error");
        }
    };

    return (
        <div className="wrapper-edit">
            <div className="d-flex flex-column flex-lg-row">
                <Sidebar onCollapse={handleSidebarCollapse} />
                <main className="flex-grow-1 p-4" style={mainStyle}>
                    <div className="container">
                        <h2 className="fw-bold mb-4 welcome">Tambah Tugas</h2>
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <TaskForm
                                    formData={formData}
                                    handleChange={handleChange}
                                    handleListChange={handleListChange}
                                    removeListItem={removeListItem}
                                    addListItem={addListItem}
                                    handleStatusToggle={handleStatusToggle}
                                    handleSubmit={handleSubmit}
                                />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default TaskCreate;
