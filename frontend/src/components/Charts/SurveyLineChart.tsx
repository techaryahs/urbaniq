import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import type { ChartData } from "chart.js";
import { Line } from "react-chartjs-2";
import { getAnalyticsMonthly } from "../../services/analyticsApi";
import type { MonthlySurvey } from "../../services/analyticsApi";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const SurveyLineChart = () => {
  const [data, setData] = useState<ChartData<"line"> | null>(null);

  useEffect(() => {
    getAnalyticsMonthly().then((monthly: MonthlySurvey[]) => {
      setData({
        labels: monthly.map((m) => m.month),
        datasets: [
          {
            label: "Surveys Collected",
            data: monthly.map((m) => m.surveys),
            borderColor: "#8b5cf6",
            backgroundColor: "rgba(139, 92, 246, 0.5)",
            tension: 0.3,
          },
        ],
      });
    });
  }, []);

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
      {!data ? <div className="text-sm text-gray-500">Loading chart...</div> : <Line data={data} options={options} />}
    </div>
  );
};

export default SurveyLineChart;
