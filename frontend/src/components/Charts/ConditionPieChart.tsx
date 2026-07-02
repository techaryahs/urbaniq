import { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import { getAnalyticsConditions } from "../../services/analyticsApi";
import type { ConditionStat } from "../../services/analyticsApi";

ChartJS.register(ArcElement, Tooltip, Legend);

// We accept optional props in case a parent wants to override, but default to fetching
interface Props {
  stats?: { good: number; fair: number; poor: number };
}

const ConditionPieChart = ({ stats }: Props) => {
  const [dataStats, setDataStats] = useState<{ good: number; fair: number; poor: number } | null>(null);

  useEffect(() => {
    if (!stats) {
      getAnalyticsConditions().then((conditions: ConditionStat[]) => {
        const parsed = { good: 0, fair: 0, poor: 0 };
        conditions.forEach(c => {
          if (c.condition === "Good") parsed.good = c.count;
          if (c.condition === "Fair") parsed.fair = c.count;
          if (c.condition === "Poor") parsed.poor = c.count;
        });
        setDataStats(parsed);
      });
    }
  }, [stats]);

  const activeStats = stats || (dataStats || { good: 0, fair: 0, poor: 0 });

  const data = {
    labels: ["Good", "Fair", "Poor"],
    datasets: [
      {
        data: [activeStats.good, activeStats.fair, activeStats.poor],
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
