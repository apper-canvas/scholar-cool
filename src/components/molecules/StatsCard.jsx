import ApperIcon from "@/components/ApperIcon";

const StatsCard = ({ 
  title, 
  value, 
  change, 
  icon, 
  trend = "neutral",
  className = ""
}) => {
  const trendColors = {
    up: "text-success",
    down: "text-error", 
    neutral: "text-secondary"
  };

  const trendIcons = {
    up: "TrendingUp",
    down: "TrendingDown",
    neutral: "Minus"
  };

  return (
    <div className={`card ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-secondary">{title}</p>
          <div className="mt-2 flex items-baseline">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {change && (
              <div className={`ml-2 flex items-center ${trendColors[trend]}`}>
                <ApperIcon name={trendIcons[trend]} className="h-4 w-4" />
                <span className="text-sm font-medium ml-1">{change}</span>
              </div>
            )}
          </div>
        </div>
        {icon && (
          <div className="bg-gradient-to-br from-primary/10 to-blue-100 p-3 rounded-lg">
            <ApperIcon name={icon} className="h-6 w-6 text-primary" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;