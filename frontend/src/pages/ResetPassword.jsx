import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "../utils/axiosInstance";
import '../assets/css/Reset.css'; // (Opsional) styling

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();

    const uid = searchParams.get("uid");
    const token = searchParams.get("token");

    const handleReset = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`/auth/reset-password/?uid=${uid}&token=${token}`, {
                new_password: newPassword,
                confirm_password: confirmPassword
            });
            Swal.fire("Berhasil", "Password telah direset. Silakan login.", "success");
            navigate("/"); // kembali ke halaman login
        } catch (error) {
            Swal.fire("Gagal", error.response?.data?.error || "Terjadi kesalahan", "error");
        }
    };

    return (
        <div className="reset-wrapper-login">
            <div className="reset-section-login">
                <div className="reset-container text-center py-5">
                    <h3 className="reset-title">Atur Ulang Password</h3>
                    <form onSubmit={handleReset} className="reset-form-container mt-4">
                        <input
                            type="password"
                            placeholder="Password Baru"
                            className="reset-form-style"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Konfirmasi Password"
                            className="reset-form-style mt-2"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <button type="submit" className="reset-btn-login mt-3">Reset Password</button>
                        <span className="reset-password-link mt-3" onClick={() => navigate("/")}>
                            Kembali Ke Login
                        </span>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
