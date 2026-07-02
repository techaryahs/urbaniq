import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  inside: number;
  outside: number;
}

const BufferChart = ({ inside, outside }: Props) => {
  const data = {
    labels: ["Inside Buffer", "Outside Buffer"],
    datasets: [
      {
        data: [inside, outside],
        backgroundColor: ["#3b82f6", "#9ca3af"],
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
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default BufferChart;
