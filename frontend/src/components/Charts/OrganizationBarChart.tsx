import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const OrganizationBarChart = () => {
  const data = {
    labels: ["Parks Dept", "Trust for Public Land", "Local Community", "City Council"],
    datasets: [
      {
        label: "Number of Parks",
        data: [42, 18, 12, 5],
        backgroundColor: "rgba(59, 130, 246, 0.8)", // Blue 500
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="h-48">
      <Bar data={data} options={options} />
    </div>
  );
};

export default OrganizationBarChart;
