import { useEffect, useState } from "react";
import StatCard from "../components/Card/StatCard";
import RecentActivity from "../components/Analytics/RecentActivity";
import MiniMap from "../components/Dashboard/MiniMap";
import { getDashboardStats } from "../services/dashboardApi";
import type { DashboardStats } from "../services/dashboardApi";
import { useAuth } from "../context/AuthContext";
import { getResearcherDashboard } from "../services/surveyApi";
import type { ResearcherDashboardSummary } from "../services/surveyApi";

const Dashboard = () => {
  const { user, isResearcher } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [researcherStats, setResearcherStats] = useState<ResearcherDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (isResearcher) {
          const res = await getResearcherDashboard();
          setResearcherStats(res);
        } else {
          const res = await getDashboardStats();
          setStats(res);
        }
      } catch (err) {
        console.error("Error loading dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isResearcher]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20 min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isResearcher) {
    if (!researcherStats) {
      return (
        <div className="max-w-7xl mx-auto p-8 text-center text-red-500">
          Failed to load researcher dashboard statistics.
        </div>
      );
    }

    return (
      <div className="max-w-7xl mx-auto p-8 animate-in fade-in duration-300">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Researcher Dashboard
            </h1>
            <p className="text-gray-500 mt-2">Welcome back, {user?.full_name}</p>
          </div>
        </div>

        {/* Top: Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-6">
          <StatCard title="Total Public Spaces" value={researcherStats.total_public_spaces || 0} icon="parks" />
          <StatCard title="Total Surveys" value={researcherStats.total_surveys} icon="survey" />
          <StatCard title="Today's Surveys" value={researcherStats.todays_surveys} icon="fair" />
          <StatCard title="Completed Surveys" value={researcherStats.completed_surveys} icon="good" />
          <StatCard title="Average Score" value={`${researcherStats.average_score} / 10`} icon="survey" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Left: Quick Analytics & Map Preview */}
          <div className="col-span-2 flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Latest Survey Submitted</h2>
              {researcherStats.latest_survey ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-xs text-gray-400 font-semibold uppercase">Public Space Name</p>
                      <p className="text-lg font-bold text-gray-850 mt-1">{researcherStats.latest_survey.public_space_name || researcherStats.latest_survey.park_name}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-xs text-gray-400 font-semibold uppercase">Date Submitted</p>
                      <p className="text-lg font-bold text-gray-850 mt-1">
                        {new Date(researcherStats.latest_survey.survey_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-xs text-gray-400 font-semibold uppercase">Assigned Score</p>
                      <p className="text-lg font-bold text-yellow-600 mt-1">{researcherStats.latest_survey.score} / 10</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-xs text-gray-400 font-semibold uppercase">Reported Condition</p>
                      <span className={`inline-block px-3 py-1 mt-2 text-xs font-bold rounded-full ${
                        researcherStats.latest_survey.condition === "Excellent" || researcherStats.latest_survey.condition === "Good"
                          ? "bg-green-105/80 text-green-800"
                          : researcherStats.latest_survey.condition === "Average"
                          ? "bg-yellow-105/85 text-yellow-800"
                          : "bg-red-105/80 text-red-800"
                      }`}>
                        {researcherStats.latest_survey.condition}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  You haven't submitted any surveys yet.
                </div>
              )}
            </div>

            <MiniMap />
          </div>

          {/* Right: Recent Activity Feed */}
          <div className="col-span-1">
            <RecentActivity />
          </div>
        </div>
      </div>
    );
  }

  // City Planner dashboard
  if (!stats) return null;

  return (
    <div className="max-w-7xl mx-auto p-8 animate-in fade-in duration-305">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Executive Overview
          </h1>
          <p className="text-gray-500 mt-2">UrbanIQ Intelligence Platform Dashboard</p>
        </div>
      </div>

      {/* Top: Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <StatCard title="Total Public Spaces" value={stats.total_public_spaces || stats.total_parks} icon="parks" />
        <StatCard title="Good Condition" value={stats.good_condition} icon="good" />
        <StatCard title="Fair Condition" value={stats.fair_condition} icon="fair" />
        <StatCard title="Poor Condition" value={stats.poor_condition} icon="poor" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Left: Quick Analytics & Map Preview */}
        <div className="col-span-2 flex flex-col gap-6">
          <MiniMap />
          
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-lg font-bold mb-2 text-gray-800">Latest Alerts</h2>
              <ul className="text-sm space-y-3 text-gray-600">
                <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span> Central Park requires maintenance</li>
                <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> Tree trimming scheduled</li>
                <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span> New inspection uploaded</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-lg font-bold mb-2 text-gray-800">Recent Uploads</h2>
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

