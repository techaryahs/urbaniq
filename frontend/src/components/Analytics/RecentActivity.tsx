import { Clock } from "lucide-react";

const RecentActivity = () => {
  const activities = [
    { id: 1, action: "Added new park", time: "10 mins ago", detail: "Central Park Ext" },
    { id: 2, action: "Applied buffer", time: "1 hour ago", detail: "1000m radius" },
    { id: 3, action: "Condition updated", time: "3 hours ago", detail: "Lincoln Sq to Good" },
  ];

  return (
    <div className="bg-white rounded-xl shadow p-5 mt-6">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-blue-600" />
        Recent GIS Activity
      </h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-4">
            <div className="mt-1 w-2 h-2 rounded-full bg-blue-500"></div>
            <div>
              <p className="font-semibold text-gray-800">{activity.action}</p>
              <p className="text-sm text-gray-500">
                {activity.detail} <span className="text-gray-300 mx-1">•</span> {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
