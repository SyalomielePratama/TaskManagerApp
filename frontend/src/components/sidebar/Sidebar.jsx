// src/components/Sidebar.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../../assets/css/Sidebar.css";

const Sidebar = ({ onCollapse }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMenuActive, setIsMenuActive] = useState(false);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    // Panggil callback jika tersedia untuk menginform Dashboard
    if (onCollapse) {
      onCollapse(newCollapsed);
    }
  };

  const toggleMenu = () => setIsMenuActive(!isMenuActive);

  const handleLogout = () => {
    Swal.fire({
      title: "Yakin ingin keluar?",
      text: "Anda akan keluar dari aplikasi.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, keluar",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        Swal.fire({
          title: "Berhasil keluar",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          navigate("/");
        });
      }
    });
  };

  // Kode useEffect untuk penyesuaian tinggi sidebar, dsb.
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        if (sidebarRef.current) {
          sidebarRef.current.style.height = "calc(100vh - 32px)";
        }
      } else {
        if (sidebarRef.current) {
          sidebarRef.current.classList.remove("collapsed");
          sidebarRef.current.style.height = "auto";
        }
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (sidebarRef.current && window.innerWidth < 1024) {
      sidebarRef.current.style.height = isMenuActive
        ? `${sidebarRef.current.scrollHeight}px`
        : "56px";
    }
  }, [isMenuActive]);

  const navItems = [
    ["bi-speedometer2", "Dashboard", "/dashboard"],
    ["bi-calendar", "Buat Task", "/calendar"],
    ["bi-list-task", "Kelola Task", "/notifications"],
    ["bi-journal-plus", "Pengaturan", "/settings"],
  ];

  const bottomNav = [
    ["bi-person-circle", "Profile", "/profile"],
    ["bi-box-arrow-right", "Logout", "/logout"],
  ];

  return (
    <div className="wrapper-sidebar">
      <aside
        className={`sidebar ${isCollapsed ? "collapsed" : ""} ${isMenuActive ? "menu-active" : ""}`}
        ref={sidebarRef}
      >
        <header className="sidebar-header">
          <Link to="/" className="header-logo text-decoration-none">
            <span className="logo-text">{isCollapsed ? "TASK" : "TASK MANAGER"}</span>
          </Link>
          <button className="toggler sidebar-toggler" onClick={toggleSidebar}>
            <i className="bi bi-chevron-left"></i>
          </button>
          <button className="toggler menu-toggler" onClick={toggleMenu}>
            <i className={`bi ${isMenuActive ? "bi-x-lg" : "bi-list"}`}></i>
          </button>
        </header>

        <nav className="sidebar-nav">
          <ul className="nav-list primary-nav">
            {navItems.map(([icon, label, path]) => (
              <li className="nav-item" key={label}>
                <Link
                  to={path}
                  className="nav-link"
                  onMouseDown={() => document.activeElement.blur()}
                  onMouseUp={() => document.activeElement.blur()}
                  onBlur={() => document.activeElement.blur()}
                  tabIndex={-1}
                >
                  <i className={`nav-icon ${icon}`}></i>
                  <span className="nav-label">{label}</span>
                </Link>
                <span className="nav-tooltip">{label}</span>
              </li>
            ))}
          </ul>

          <ul className="nav-list secondary-nav">
            {bottomNav.map(([icon, label, path]) => (
              <li className="nav-item" key={label}>
                {label === "Logout" ? (
                  <>
                    <button
                      className="nav-link"
                      onClick={(e) => {
                        e.currentTarget.blur();
                        handleLogout();
                      }}
                    >
                      <i className={`nav-icon ${icon}`}></i>
                      <span className="nav-label">{label}</span>
                    </button>
                    <span className="nav-tooltip">{label}</span>
                  </>
                ) : (
                  <>
                    <Link
                      to={path}
                      className="nav-link"
                      onMouseDown={() => document.activeElement.blur()}
                      onMouseUp={() => document.activeElement.blur()}
                      onBlur={() => document.activeElement.blur()}
                      tabIndex={-1}
                    >
                      <i className={`nav-icon ${icon}`}></i>
                      <span className="nav-label">{label}</span>
                    </Link>
                    <span className="nav-tooltip">{label}</span>
                  </>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </div>
  );
};

export default Sidebar;
