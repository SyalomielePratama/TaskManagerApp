import React, { useState, useEffect } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import Swal from "sweetalert2";
import axios from "../utils/axiosInstance";
import ProfilePicture from "../components/Profile/ProfilePicture";
import ProfileHeader from "../components/Profile/ProfileHeader";
import ProfileForm from "../components/Profile/ProfileForm";
import "../assets/css/profile.css";

const Profile = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    const [formData, setFormData] = useState({
        nama_lengkap: "",
        email: "",
        foto_profil: null,
    });
    const [fotoPreview, setFotoPreview] = useState(null);

    useEffect(() => {
        const handleResize = () => setScreenWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        axios.get("/api/app/profile/")
            .then((res) => {
                setFormData({
                    nama_lengkap: res.data.nama_lengkap || "",
                    email: res.data.email || "",
                    foto_profil: null,
                });
                if (res.data.foto_profil) {
                    setFotoPreview(res.data.foto_profil);
                }
            })
            .catch((err) => {
                console.error("Gagal memuat profil:", err);
            });
    }, []);

    const handleSidebarCollapse = (isCollapsed) => setSidebarCollapsed(isCollapsed);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData((prev) => ({ ...prev, foto_profil: file }));
            setFotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append("nama_lengkap", formData.nama_lengkap);
        data.append("email", formData.email);
        if (formData.foto_profil) {
            data.append("foto_profil", formData.foto_profil);
        }

        try {
            await axios.put("/api/app/profile/", data, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            Swal.fire("Berhasil", "Profil berhasil diperbarui.", "success");
        } catch (err) {
            Swal.fire("Gagal", "Gagal memperbarui profil.", "error");
        }
    };

    const mainStyle = {
        transition: "all 0.4s ease",
        ...(screenWidth >= 1024
            ? { marginLeft: sidebarCollapsed ? "85px" : "270px" }
            : { marginLeft: "0", marginTop: "0" }),
    };

    return (
        <div className="wrapper-edit">
            <div className="d-flex flex-column flex-lg-row">
                <Sidebar onCollapse={handleSidebarCollapse} />
                <main className="flex-grow-1 p-4" style={mainStyle}>
                    <div className="container-fluid">
                        <h2 className="fw-bold mb-4 welcome">Pengaturan Profile</h2>
                    </div>
                    <div className="container">
                        <div className="row flex-lg-nowrap">
                            <div className="col">
                                <div className="card shadow-lg rounded-4">
                                    <div className="card-body">
                                        <div className="e-profile">
                                            <div className="row">
                                                <div className="col-12 col-sm-auto mb-3">
                                                    <ProfilePicture
                                                        fotoPreview={fotoPreview}
                                                        handleFileChange={handleFileChange}
                                                    />
                                                </div>
                                                <ProfileHeader nama={formData.nama_lengkap} />
                                            </div>
                                            <div className="tab-content pt-3">
                                                <div className="tab-pane active">
                                                    <ProfileForm
                                                        formData={formData}
                                                        handleChange={handleChange}
                                                        handleSubmit={handleSubmit}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Profile;
