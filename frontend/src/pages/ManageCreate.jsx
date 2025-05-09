import { useState, useEffect } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import TaskCard from "../components/Tasks/TaskCard";
import axios from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import "../assets/css/ManageCreate.css";

const ManageCreate = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    const [tasks, setTasks] = useState([]);
    const [filterStatus, setFilterStatus] = useState("Semua");

    const navigate = useNavigate();

    // Update screen width on resize
    useEffect(() => {
        const handleResize = () => setScreenWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleSidebarCollapse = (isCollapsed) => {
        setSidebarCollapsed(isCollapsed);
    };

    const mainStyle = {
        transition: "all 0.4s ease",
        ...(screenWidth >= 1024
            ? { marginLeft: sidebarCollapsed ? "85px" : "270px" }
            : { marginLeft: "0", marginTop: "0" }),
    };

    // Fetch tasks
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axios.get("/api/app/tasks/");
                setTasks(response.data.results);
            } catch (error) {
                console.error("Gagal memuat data tugas:", error);
            }
        };
        fetchTasks();
    }, []);

    // Filter tasks by status
    const filteredTasks = tasks.filter((task) =>
        filterStatus === "Semua"
            ? true
            : task.status_kegiatan.toLowerCase() === filterStatus.toLowerCase()
    );

    return (
        <div className="wrapper-create">
            <div className="d-flex flex-column flex-lg-row">
                <Sidebar onCollapse={handleSidebarCollapse} />
                <main className="flex-grow-1 p-4" style={mainStyle}>
                    <div className="container-fluid">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h2 className="fw-bold welcome">Kelola Tugas</h2>
                            <div className="d-flex align-items-center gap-2">
                                <label htmlFor="statusFilter" className="me-2 fw-semibold">Filter:</label>
                                <select
                                    id="statusFilter"
                                    className="form-select form-select-sm w-75"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <option value="Semua">Semua</option>
                                    <option value="Selesai">Selesai</option>
                                    <option value="Sedang Dikerjakan">Sedang Dikerjakan</option>
                                    <option value="Tertunda">Tertunda</option>
                                </select>
                            </div>
                        </div>

                        <div className="row g-4">
                            {filteredTasks.length > 0 ? (
                                filteredTasks.map((task) => (
                                    <TaskCard key={task.id} task={task} />
                                ))
                            ) : (
                                <div className="col-12">
                                    <div className="alert alert-warning text-center">
                                        Tidak ada tugas dengan status <strong>{filterStatus}</strong>.
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ManageCreate;
