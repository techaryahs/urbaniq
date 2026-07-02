import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  good: number;
  fair: number;
  poor: number;
}

const ConditionPieChart = ({ good, fair, poor }: Props) => {
  const data = {
    labels: ["Good", "Fair", "Poor"],
    datasets: [
      {
        data: [good, fair, poor],
        backgroundColor: ["#22c55e", "#f97316", "#ef4444"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
  };

  return (
    <div className="h-48">
      <Pie data={data} options={options} />
    </div>
  );
};

export default ConditionPieChart;
