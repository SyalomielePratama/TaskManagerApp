import React, { useState } from "react";
import Swal from "sweetalert2";
import axios from "../utils/axiosInstance";
import '../assets/css/Forget.css'; // Import CSS
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("/auth/forgot-password/", { email });
            Swal.fire("Email Terkirim", "Silakan cek email untuk reset password.", "success");
        } catch (error) {
            Swal.fire("Gagal", "Terjadi kesalahan. Coba lagi nanti.", "error");
        }
    };

    return (
        <div className="forget-wrapper-login">
            <div className="forget-section-login">
                <div className="forget-container text-center py-5">
                    <h3 className="forget-title">Lupa Password</h3>
                    <form onSubmit={handleSubmit} className="forget-form-container mt-4">
                        <input
                            type="email"
                            name="email"
                            placeholder="Masukkan email Anda"
                            className="forget-form-style"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <button type="submit" className="forget-btn-login mt-3">Kirim Link Reset</button>
                        <span className="forgot-password-link mt-3" onClick={() => navigate("/")}>
                            Kembali Ke login?
                        </span>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
