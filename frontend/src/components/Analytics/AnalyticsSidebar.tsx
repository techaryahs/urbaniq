import { Activity } from "lucide-react";
import SpatialStats from "./SpatialStats";
import ConditionPieChart from "../Charts/ConditionPieChart";
import BufferChart from "../Charts/BufferChart";
import OrganizationBarChart from "../Charts/OrganizationBarChart";
import RecentActivity from "./RecentActivity";

interface Props {
  stats: {
    total: number;
    good: number;
    fair: number;
    poor: number;
  };
  spatialStats: {
    totalVisible: number;
    avgDistance: number;
    bufferCoverage: number;
    avgLat: number;
    avgLng: number;
  };
  bufferStats: {
    inside: number;
    outside: number;
  } | null;
}

const AnalyticsSidebar = ({ stats, spatialStats, bufferStats }: Props) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-5">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          Analytics
        </h3>
        
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-500 mb-2 uppercase">Conditions</h4>
          <ConditionPieChart good={stats.good} fair={stats.fair} poor={stats.poor} />
        </div>

        {bufferStats && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-500 mb-2 uppercase">Buffer Analysis</h4>
            <BufferChart inside={bufferStats.inside} outside={bufferStats.outside} />
          </div>
        )}

        <div>
          <h4 className="text-sm font-semibold text-gray-500 mb-2 uppercase">Organizations</h4>
          <OrganizationBarChart />
        </div>
      </div>

      <SpatialStats {...spatialStats} />
      <RecentActivity />
    </div>
  );
};

export default AnalyticsSidebar;
