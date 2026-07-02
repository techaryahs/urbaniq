import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import type { ChartData, ChartOptions } from "chart.js";
import { Bar } from "react-chartjs-2";

import { getAnalyticsOrganizations } from "../../services/analyticsApi";

import type { OrganizationStat } from "../../services/analyticsApi";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const OrganizationBarChart = () => {
  const [data, setData] = useState<ChartData<"bar"> | null>(null);

  useEffect(() => {
    getAnalyticsOrganizations().then((orgs: OrganizationStat[]) => {
      // Highest first
      const sorted = [...orgs].sort((a, b) => b.count - a.count);

      setData({
        labels: sorted.map((o) => o.organization),
        datasets: [
          {
            label: "Parks",
            data: sorted.map((o) => o.count),

            backgroundColor: [
              "#2563eb",
              "#3b82f6",
              "#60a5fa",
              "#93c5fd",
              "#38bdf8",
              "#0ea5e9",
              "#0284c7",
              "#06b6d4",
              "#0891b2",
              "#7dd3fc",
            ],

            borderRadius: 8,
            borderSkipped: false,
            barThickness: 20,
          },
        ],
      });
    });
  }, []);

  const options: ChartOptions<"bar"> = {
    indexAxis: "y",

    responsive: true,

    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.raw} Parks`,
        },
      },
    },

    scales: {
      x: {
        beginAtZero: true,

        ticks: {
          precision: 0,
        },

        grid: {
          color: "#e5e7eb",
        },
      },

      y: {
        grid: {
          display: false,
        },

        ticks: {
          font: {
            size: 12,
          },
        },
      },
    },
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Loading organizations...
      </div>
    );
  }

  return (
    <div className="h-72">
      <Bar data={data} options={options} />
    </div>
  );
};

export default OrganizationBarChart;
