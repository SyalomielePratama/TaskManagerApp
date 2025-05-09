// components/task/TaskCard.jsx
import { useNavigate } from "react-router-dom";

const TaskCard = ({ task }) => {
    const navigate = useNavigate();
    const total = task.list_kegiatan_tugas_status.length;
    const selesai = task.list_kegiatan_tugas_status.filter(Boolean).length;
    const progress = total > 0 ? (selesai / total) * 100 : 0;

    const formatDate = (isoDate) => {
        const date = new Date(isoDate);
        return date.toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const getBadgeColor = (status) => {
        switch (status.toLowerCase()) {
            case "selesai": return "success";
            case "sedang dikerjakan": return "warning";
            case "tertunda": return "secondary";
            default: return "dark";
        }
    };

    const getPriorityColor = (prioritas) => {
        switch (prioritas.toLowerCase()) {
            case "tinggi": return "danger";
            case "sedang": return "warning";
            case "rendah": return "info";
            default: return "secondary";
        }
    };

    return (
        <div className="col-sm-6 col-lg-4">
            <div className="card h-100 position-relative card-create">
                <div className="card-body pb-4">
                    <div className="d-flex justify-content-between align-items-start">
                        <div>
                            <span className={`badge bg-${getBadgeColor(task.status_kegiatan)} me-2 mb-2`}>
                                <i className="bi bi-check-circle me-1"></i>
                                {task.status_kegiatan}
                            </span>
                            <span className={`badge bg-${getPriorityColor(task.prioritas)} mb-2`}>
                                <i className="bi bi-exclamation-circle me-1"></i>
                                {task.prioritas}
                            </span>
                        </div>
                        <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => navigate(`/tasks/edit/${task.id}`)}
                            title="Edit Tugas"
                        >
                            <i className="bi bi-pencil-square"></i>
                        </button>
                    </div>

                    <h5 className="card-title mt-2">{task.nama_tugas}</h5>
                    <h6 className="card-subtitle text-muted mb-2">{task.deskripsi}</h6>

                    <div className="mb-2 small text-muted">
                        <i className="bi bi-calendar-event me-1"></i>
                        Tenggat: {formatDate(task.tenggat_waktu)}
                    </div>

                    <div className="progress mb-2" style={{ height: "20px" }}>
                        {progress === 0 ? (
                            <div
                                className="progress-bar bg-secondary d-flex justify-content-center align-items-center"
                                role="progressbar"
                                style={{ width: "100%" }}
                            >
                                Belum ada progress
                            </div>
                        ) : (
                            <div
                                className={`progress-bar ${progress < 40
                                    ? 'bg-danger'
                                    : progress < 80
                                        ? 'bg-warning'
                                        : 'bg-success'
                                    }`}
                                role="progressbar"
                                style={{ width: `${progress}%` }}
                            >
                                {`${selesai}/${total} selesai`}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskCard;
