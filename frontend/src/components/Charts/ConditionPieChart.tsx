import { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

import { getAnalyticsConditions } from "../../services/analyticsApi";

import type { ConditionStat } from "../../services/analyticsApi";

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  stats?: {
    good: number;
    fair: number;
    poor: number;
  };
}

const ConditionPieChart = ({ stats }: Props) => {
  const [dataStats, setDataStats] = useState({
    good: 0,
    fair: 0,
    poor: 0,
  });

  useEffect(() => {
    if (stats) {
      setDataStats(stats);
      return;
    }

    getAnalyticsConditions().then((conditions: ConditionStat[]) => {
      const parsed = {
        good: 0,
        fair: 0,
        poor: 0,
      };

      conditions.forEach((c) => {
        if (c.condition === "Good") parsed.good = c.count;
        if (c.condition === "Fair") parsed.fair = c.count;
        if (c.condition === "Poor") parsed.poor = c.count;
      });

      setDataStats(parsed);
    });
  }, [stats]);

  const total = dataStats.good + dataStats.fair + dataStats.poor;

  const data = {
    labels: ["Good", "Fair", "Poor"],

    datasets: [
      {
        data: [dataStats.good, dataStats.fair, dataStats.poor],

        backgroundColor: ["#22c55e", "#f59e0b", "#ef4444"],

        hoverBackgroundColor: ["#16a34a", "#d97706", "#dc2626"],

        borderColor: "#ffffff",

        borderWidth: 3,

        hoverOffset: 12,
      },
    ],
  };

  const options = {
    responsive: true,

    maintainAspectRatio: false,

    cutout: "70%",

    plugins: {
      legend: {
        position: "bottom" as const,

        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 13,
          },
        },
      },

      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw;

            const percent = total ? ((value / total) * 100).toFixed(1) : 0;

            return `${context.label}: ${value} (${percent}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="relative h-64">
      <Doughnut data={data} options={options} />

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-3xl font-bold">{total}</span>

        <span className="text-gray-500 text-sm">Total Parks</span>
      </div>
    </div>
  );
};

export default ConditionPieChart;
