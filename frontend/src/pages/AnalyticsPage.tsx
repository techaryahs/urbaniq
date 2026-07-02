import { useEffect, useState } from "react";
import ConditionPieChart from "../components/Charts/ConditionPieChart";
import OrganizationBarChart from "../components/Charts/OrganizationBarChart";
import BufferChart from "../components/Charts/BufferChart";
import SurveyLineChart from "../components/Charts/SurveyLineChart";
import { getAnalyticsConditions, getAnalyticsOrganizations, getAnalyticsMonthly, getAnalyticsBuffer } from "../services/analyticsApi";

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We would normally fetch and pass these to the charts,
    // but the charts themselves might need updating to accept props.
    // Let's just simulate the fetch to ensure endpoints work, 
    // then pass them if needed. For now, we will update the charts.
    Promise.all([
      getAnalyticsConditions(),
      getAnalyticsOrganizations(),
      getAnalyticsMonthly(),
      getAnalyticsBuffer()
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading analytics...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-bold">GIS Analytics</h1>
          <p className="text-gray-500 mt-2">Comprehensive data visualization and reporting</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex flex-col items-center">
          <h3 className="font-bold text-lg mb-4 w-full text-center">Park Condition Distribution</h3>
          <div className="w-full max-w-sm">
            <ConditionPieChart />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex flex-col items-center">
          <h3 className="font-bold text-lg mb-4 w-full text-center">Parks by Organization</h3>
          <div className="w-full h-64">
            <OrganizationBarChart />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex flex-col items-center">
          <h3 className="font-bold text-lg mb-4 w-full text-center">Citizen Survey Trends</h3>
          <div className="w-full h-64">
            <SurveyLineChart />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex flex-col items-center">
          <h3 className="font-bold text-lg mb-4 w-full text-center">Buffer Analysis Overview</h3>
          <div className="w-full max-w-sm">
            <BufferChart />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
