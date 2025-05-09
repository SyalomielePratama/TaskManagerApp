import React, { useState, useEffect } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import Swal from "sweetalert2";
import axios from "../utils/axiosInstance";

const Setting = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    const [showPassword, setShowPassword] = useState({
        old: false,
        new: false,
        confirm: false,
    });


    const [form, setForm] = useState({
        old_password: "",
        new_password: "",
        new_konfirmasi_password: "",
    });

    const togglePassword = (field) => {
        setShowPassword((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.new_password !== form.new_konfirmasi_password) {
            Swal.fire("Error", "Password baru dan konfirmasi tidak cocok!", "error");
            return;
        }

        try {
            const res = await axios.put("/api/app/password/change/", form);
            Swal.fire("Berhasil", "Password berhasil diganti!", "success");
            setForm({
                old_password: "",
                new_password: "",
                new_konfirmasi_password: "",
            });
        } catch (err) {
            Swal.fire("Gagal", err.response?.data?.detail || "Terjadi kesalahan", "error");
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

    const handleSidebarCollapse = (isCollapsed) => setSidebarCollapsed(isCollapsed);

    return (
        <div className="wrapper-edit">
            <div className="d-flex flex-column flex-lg-row">
                <Sidebar onCollapse={handleSidebarCollapse} />
                <main className="flex-grow-1 p-4" style={mainStyle}>
                    <div className="container-fluid">
                        <h2 className="fw-bold mb-4 welcome">Pengaturan Password</h2>

                        <div className="card shadow-lg rounded-4 p-4">
                            <h4 className="mb-4">Ganti Password</h4>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Password Lama</label>
                                    <div className="input-group">
                                        <input
                                            type={showPassword.old ? "text" : "password"}
                                            className="form-control"
                                            name="old_password"
                                            value={form.old_password}
                                            onChange={handleChange}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={() => togglePassword("old")}
                                        >
                                            <i className={`bi ${showPassword.old ? "bi-eye-slash" : "bi-eye"}`}></i>
                                        </button>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Password Baru</label>
                                    <div className="input-group">
                                        <input
                                            type={showPassword.new ? "text" : "password"}
                                            className="form-control"
                                            name="new_password"
                                            value={form.new_password}
                                            onChange={handleChange}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={() => togglePassword("new")}
                                        >
                                            <i className={`bi ${showPassword.new ? "bi-eye-slash" : "bi-eye"}`}></i>
                                        </button>
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label className="form-label">Konfirmasi Password Baru</label>
                                    <div className="input-group">
                                        <input
                                            type={showPassword.confirm ? "text" : "password"}
                                            className="form-control"
                                            name="new_konfirmasi_password"
                                            value={form.new_konfirmasi_password}
                                            onChange={handleChange}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={() => togglePassword("confirm")}
                                        >
                                            <i className={`bi ${showPassword.confirm ? "bi-eye-slash" : "bi-eye"}`}></i>
                                        </button>
                                    </div>
                                </div>
                            </form>
                                <button type="submit" className="mt-auto btn btn btn-primary" onClick={handleSubmit}>
                                    Ganti dan Simpan
                                </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Setting;
