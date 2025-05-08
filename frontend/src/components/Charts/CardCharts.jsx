import { Pie, Bar } from "react-chartjs-2";

const ChartCard = ({ title, type, data }) => {
  return (
    <div className="col-sm-6 col-lg-6">
      <div className="card border-0 card-chart">
        <div className="card-body">
          <h4 className="fw-bold mb-3">{title}</h4>
          <div className="chart-container py-3 m-auto d-flex justify-content-center align-items-center">
            {type === "pie" ? <Pie data={data} /> : <Bar data={data} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartCard;
