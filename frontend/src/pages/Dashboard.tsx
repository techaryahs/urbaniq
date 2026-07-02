import { useEffect, useState } from "react";
import StatCard from "../components/Card/StatCard";
import RecentActivity from "../components/Analytics/RecentActivity";
import MiniMap from "../components/Dashboard/MiniMap";
import { getDashboardStats } from "../services/dashboardApi";
import type { DashboardStats } from "../services/dashboardApi";

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return <div className="p-8 text-center">Loading dashboard data...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-4xl font-bold">Executive Overview</h1>
          <p className="text-gray-500 mt-2">UrbanIQ Intelligence Platform Dashboard</p>
        </div>
      </div>

      {/* Top: Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <StatCard title="Total Parks" value={stats.total_parks} />
        <StatCard title="Good Condition" value={stats.good_condition} />
        <StatCard title="Fair Condition" value={stats.fair_condition} />
        <StatCard title="Poor Condition" value={stats.poor_condition} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Left: Quick Analytics & Map Preview */}
        <div className="col-span-2 flex flex-col gap-6">
          <MiniMap />
          
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-lg font-bold mb-2">Latest Alerts</h2>
              <ul className="text-sm space-y-3 text-gray-600">
                <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span> Central Park requires maintenance</li>
                <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> Tree trimming scheduled</li>
                <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span> New inspection uploaded</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-lg font-bold mb-2">Recent Uploads</h2>
              <ul className="text-sm space-y-3 text-gray-600">
                <li>geojson_parks_2023.zip</li>
                <li>survey_data_Q2.csv</li>
                <li>maintenance_log.xlsx</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right: Recent Activity Feed */}
        <div className="col-span-1">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
