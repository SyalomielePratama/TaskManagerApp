import React, { useState, useEffect } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import Swal from "sweetalert2";
import axios from "../utils/axiosInstance";
import CardStats from "../components/Charts/CardStats";
import ChartCard from "../components/Charts/CardCharts";
import TaskTable from "../components/Charts/TaskTable";
import "../assets/css/Dashboard.css";

const Dashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [userName, setUserName] = useState("");
  const [taskCounts, setTaskCounts] = useState({ total: 0, pending: 0, ongoing: 0, selesai: 0 });
  const [taskPriorities, setTaskPriorities] = useState({ rendah: 0, sedang: 0, tinggi: 0 });
  const [tasks, setTasks] = useState([]); // State for storing tasks

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get("/api/app/profile/");
        setUserName(response.data.nama_lengkap);
      } catch (error) {
        console.error("Gagal mengambil profile:", error);
        Swal.fire("Gagal", "Tidak dapat mengambil data profil.", "error");
      }
    };

    const fetchTasks = async () => {
      try {
        const response = await axios.get("/api/app/tasks/");
        const data = response.data;

        setTaskCounts({
          total: data.total_seluruh_tugas || 0,
          pending: data.total_seluruh_tugas_pending || 0,
          ongoing: data.total_seluruh_tugas_on_going || 0,
          selesai: data.total_seluruh_tugas_selesai || 0,
        });

        setTaskPriorities({
          rendah: data.total_seluruh_tugas_prioritas_rendah || 0,
          sedang: data.total_seluruh_tugas_prioritas_sedang || 0,
          tinggi: data.total_seluruh_tugas_prioritas_tinggi || 0,
        });

        setTasks(data.results.slice(0, 5)); // Set only the first 5 tasks
      } catch (error) {
        console.error("Gagal mengambil data tugas:", error);
        Swal.fire("Gagal", "Tidak dapat mengambil data tugas.", "error");
      }
    };

    fetchProfile();
    fetchTasks();
  }, []);

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

  const cardData = [
    { title: "Total Tugas", count: taskCounts.total, icon: "bi-list-check", color: "bg-primary" },
    { title: "Tugas Pending", count: taskCounts.pending, icon: "bi-hourglass-split", color: "bg-warning text-dark" },
    { title: "Tugas On Going", count: taskCounts.ongoing, icon: "bi-arrow-repeat", color: "bg-info text-dark" },
    { title: "Tugas Selesai", count: taskCounts.selesai, icon: "bi-check-circle", color: "bg-success" },
  ];

  const pieData = {
    labels: ['Pending', 'Ongoing', 'Selesai'],
    datasets: [{
      data: [taskCounts.pending, taskCounts.ongoing, taskCounts.selesai],
      backgroundColor: ['#FFC107', '#17A2B8', '#28A745'],
      hoverBackgroundColor: ['#FFB300', '#138496', '#218838'],
    }],
  };

  const barData = {
    labels: ['Rendah', 'Sedang', 'Tinggi'],
    datasets: [{
      label: 'Prioritas Tugas',
      data: [taskPriorities.rendah, taskPriorities.sedang, taskPriorities.tinggi],
      backgroundColor: ['#FFCF00', '#F18B42', '#A81C07'],
      hoverBackgroundColor: ['#EBC133', '#FF7F00', '#A40000'],
    }],
  };

  return (
    <div className="wrapper-dashboard">
      <div className="d-flex flex-column flex-lg-row">
        <Sidebar onCollapse={handleSidebarCollapse} />

        <main className="flex-grow-1 p-4" style={mainStyle}>
          <div className="container-fluid">
            <h2 className="fw-bold mb-4 welcome">Hello!! {userName || "..."}</h2>

            <div className="row g-4">
              {cardData.map((card, idx) => (
                <CardStats key={idx} {...card} />
              ))}
            </div>

            <div className="chart-wrapper my-4 m-auto">
              <div className="row g-4">
                <ChartCard title="Grafik Status Tugas" type="pie" data={pieData} />
                <ChartCard title="Grafik Prioritas Tugas" type="bar" data={barData} />
              </div>
            </div>

            <TaskTable tasks={tasks} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
