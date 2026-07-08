import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { getRecentActivity } from "../../services/dashboardApi";
import type { Activity } from "../../services/dashboardApi";

const RecentActivity = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecentActivity()
      .then(setActivities)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-4 text-center text-sm text-gray-500">Loading activity...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow p-4 sm:p-5 mt-6">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-blue-600" />
        Recent GIS Activity
      </h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-3 sm:gap-4">
            <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500"></div>
            <div className="min-w-0">
              <p className="break-words font-semibold text-gray-800">{activity.action}</p>
              <p className="text-sm text-gray-500">
                {activity.details} <span className="text-gray-300 mx-1">•</span> {new Date(activity.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
