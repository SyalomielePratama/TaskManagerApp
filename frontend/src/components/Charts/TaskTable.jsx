const TaskTable = ({ tasks }) => {
    const getPriorityBadgeClass = (priority) => {
      switch (priority) {
        case "rendah": return "bg-success text-white";
        case "sedang": return "bg-warning text-dark";
        case "tinggi": return "bg-danger text-white";
        default: return "bg-secondary text-white";
      }
    };
  
    const getStatusBadgeClass = (status) => {
      switch (status) {
        case "Selesai": return "bg-success text-white";
        case "Tertunda": return "bg-warning text-dark";
        case "Sedang Dikerjakan": return "bg-info text-white";
        default: return "bg-secondary text-white";
      }
    };
  
    return (
      <div className="my-4 card-table p-3">
        <h4 className="fw-bold mb-3">Tugas Terkini</h4>
        <div className="table-responsive">
          <table className="table table-striped table-hover table-bordered shadow-sm">
            <thead className="table-dark table-head-color">
              <tr>
                <th>Nama Tugas</th>
                <th>Deskripsi Tugas</th>
                <th>Prioritas</th>
                <th>Tenggat Waktu</th>
                <th>Status Tugas</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.nama_tugas}</td>
                  <td>{task.deskripsi}</td>
                  <td>
                    <span className={`badge ${getPriorityBadgeClass(task.prioritas)}`}>
                      {task.prioritas}
                    </span>
                  </td>
                  <td>{new Date(task.tenggat_waktu).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(task.status_kegiatan)}`}>
                      {task.status_kegiatan}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  export default TaskTable;
  