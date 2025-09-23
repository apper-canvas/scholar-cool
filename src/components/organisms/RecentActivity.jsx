import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";

const RecentActivity = ({ activities }) => {
  const getActivityIcon = (type) => {
    const icons = {
      enrollment: "UserPlus",
      grade: "BookOpen", 
      attendance: "Calendar",
      graduation: "GraduationCap"
    };
    return icons[type] || "Activity";
  };

  const getActivityColor = (type) => {
    const colors = {
      enrollment: "text-success",
      grade: "text-primary",
      attendance: "text-warning", 
      graduation: "text-info"
    };
    return colors[type] || "text-secondary";
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <ApperIcon name="Activity" className="h-5 w-5 text-secondary" />
      </div>

      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.slice(0, 8).map((activity) => (
            <div key={activity.Id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150">
              <div className={`p-2 rounded-full bg-gray-100 ${getActivityColor(activity.type)}`}>
                <ApperIcon name={getActivityIcon(activity.type)} className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {activity.description}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-secondary">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                  <Badge variant="default" className="text-xs">
                    {activity.type}
                  </Badge>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <ApperIcon name="Activity" className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-secondary">No recent activity</p>
          </div>
        )}
      </div>

      {activities.length > 8 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button className="w-full text-sm text-primary hover:text-blue-600 font-medium transition-colors duration-200">
            View All Activity
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;