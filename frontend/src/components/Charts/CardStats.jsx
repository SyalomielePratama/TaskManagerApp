const CardStats = ({ title, count, icon, color }) => {
    return (
      <div className="col-sm-6 col-lg-3">
        <div className={`card border-0 text-white card-dashboard ${color}`}>
          <div className="card-body d-flex align-items-center justify-content-between">
            <div>
              <h6 className="card-title fw-semibold">{title}</h6>
              <h3 className="card-text">{count}</h3>
            </div>
            <i className={`bi ${icon} fs-1 opacity-75 icon-dashboard`}></i>
          </div>
        </div>
      </div>
    );
  };
  
  export default CardStats;
  