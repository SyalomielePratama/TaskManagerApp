import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "../utils/axiosInstance";
import "../assets/css/Login.css";

const Login = () => {
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [signupData, setSignupData] = useState({
    username: "",
    nama_lengkap: "",
    email: "",
    password: "",
    konfirmasi_password: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleChange = (e, isLogin = true) => {
    const { name, value } = e.target;
    if (isLogin) {
      setLoginData((prev) => ({ ...prev, [name]: value }));
    } else {
      setSignupData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/auth/login/", loginData);
      const { access } = response.data;

      localStorage.setItem("token", access);

      Swal.fire({
        title: "Success!",
        text: "Login berhasil!",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/dashboard");
      });
    } catch (error) {
      Swal.fire({
        title: "Login Failed",
        text: "Username atau password salah.",
        icon: "error",
        confirmButtonText: "Coba Lagi",
      });
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    const { username, nama_lengkap, email, password, konfirmasi_password } = signupData;

    if (password !== konfirmasi_password) {
      Swal.fire({
        title: "Error",
        text: "Password dan konfirmasi tidak sama!",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      await axios.post("/auth/register/", {
        username,
        nama_lengkap,
        email,
        password,
        konfirmasi_password,
      });

      Swal.fire({
        title: "Success!",
        text: "Registrasi berhasil! Silakan login.",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/");
      });
    } catch (error) {
      Swal.fire({
        title: "Registration Gagal",
        text: "Cek kembali inputan Anda.",
        icon: "error",
        confirmButtonText: "Coba Lagi",
      });
    }
  };

  return (
    <div className="wrapper-login">
      <div className="section-login">
        <div className="container">
          <div className="row full-height justify-content-center">
            <div className="col-12 text-center align-self-center py-5">
              <div className="section pb-5 pt-5 pt-sm-2 text-center">
                <h6 className="h6log mb-0 pb-3"><span>Log In </span><span>Sign Up</span></h6>
                <input className="checkbox" type="checkbox" id="reg-log" name="reg-log" />
                <label htmlFor="reg-log"></label>
                <div className="card-3d-wrap mx-auto">
                  <div className="card-3d-wrapper">
                    {/* Login Form */}
                    <div className="card-front">
                      <div className="center-wrap">
                        <form className="section text-center" onSubmit={handleLoginSubmit}>
                          <h4 className="h4log mb-4 pb-3">Log In</h4>
                          <div className="form-group-login">
                            <input type="text" name="username" className="form-style" placeholder="Your Username" autoComplete="off"
                              value={loginData.username} onChange={(e) => handleChange(e, true)} />
                            <i className="input-icon uil uil-user"></i>
                          </div>
                          <div className="form-group-login mt-2">
                            <input type="password" name="password" className="form-style" placeholder="Your Password" autoComplete="off"
                              value={loginData.password} onChange={(e) => handleChange(e, true)} />
                            <i className="input-icon uil uil-lock-alt"></i>
                          </div>
                          <button type="submit" className="btn-login mt-4">Login</button>
                        </form>
                      </div>
                    </div>

                    {/* Sign Up Form */}
                    <div className="card-back">
                      <div className="center-wrap">
                        <form className="section text-center" onSubmit={handleSignupSubmit}>
                          <h4 className="h4log mb-4 pb-3">Sign Up</h4>
                          <div className="form-group-login">
                            <input type="text" name="username" className="form-style" placeholder="Your Username" autoComplete="off"
                              value={signupData.username} onChange={(e) => handleChange(e, false)} />
                            <i className="input-icon uil uil-user"></i>
                          </div>
                          <div className="form-group-login mt-2">
                            <input type="text" name="nama_lengkap" className="form-style" placeholder="Your Full Name" autoComplete="off"
                              value={signupData.nama_lengkap} onChange={(e) => handleChange(e, false)} />
                            <i className="input-icon uil uil-user"></i>
                          </div>
                          <div className="form-group-login mt-2">
                            <input type="email" name="email" className="form-style" placeholder="Your Email" autoComplete="off"
                              value={signupData.email} onChange={(e) => handleChange(e, false)} />
                            <i className="input-icon uil uil-at"></i>
                          </div>
                          <div className="form-group-login mt-2">
                            <input type="password" name="password" className="form-style" placeholder="Your Password" autoComplete="off"
                              value={signupData.password} onChange={(e) => handleChange(e, false)} />
                            <i className="input-icon uil uil-lock-alt"></i>
                          </div>
                          <div className="form-group-login mt-2">
                            <input type="password" name="konfirmasi_password" className="form-style" placeholder="Confirm Password" autoComplete="off"
                              value={signupData.konfirmasi_password} onChange={(e) => handleChange(e, false)} />
                            <i className="input-icon uil uil-lock-alt"></i>
                          </div>
                          <button type="submit" className="btn-login mt-4">Sign Up</button>
                        </form>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
