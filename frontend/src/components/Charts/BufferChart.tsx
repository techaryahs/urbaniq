import { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { getAnalyticsBuffer } from "../../services/analyticsApi";

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  inside?: number;
  outside?: number;
}

const BufferChart = ({ inside, outside }: Props) => {
  const [dataStats, setDataStats] = useState<{ inside: number; outside: number } | null>(null);

  useEffect(() => {
    if (inside === undefined || outside === undefined) {
      getAnalyticsBuffer().then((data: any) => setDataStats(data));
    }
  }, [inside, outside]);

  const activeStats = (inside !== undefined && outside !== undefined) 
    ? { inside, outside } 
    : (dataStats || { inside: 0, outside: 0 });

  const data = {
    labels: ["Inside Buffer", "Outside Buffer"],
    datasets: [
      {
        data: [activeStats.inside, activeStats.outside],
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
