import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import type { ChartData } from "chart.js";
import { Bar } from "react-chartjs-2";
import { getAnalyticsOrganizations } from "../../services/analyticsApi";
import type { OrganizationStat } from "../../services/analyticsApi";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const OrganizationBarChart = () => {
  const [data, setData] = useState<ChartData<"bar"> | null>(null);

  useEffect(() => {
    getAnalyticsOrganizations().then((orgs: OrganizationStat[]) => {
      setData({
        labels: orgs.map((o) => o.organization),
        datasets: [
          {
            label: "Parks Managed",
            data: orgs.map((o) => o.count),
            backgroundColor: "#3b82f6",
            borderRadius: 4,
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
      { !data ? <div className="text-sm text-gray-500">Loading chart...</div> : <Bar data={data} options={options} /> }
    </div>
  );
};

export default OrganizationBarChart;
