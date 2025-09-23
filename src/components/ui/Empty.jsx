import ApperIcon from "@/components/ApperIcon";

const Empty = ({ 
  title = "No data found", 
  description = "There's no data to display at the moment.",
  action,
  actionLabel = "Add New",
  icon = "Database"
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full p-6 mb-6">
        <ApperIcon name={icon} className="h-12 w-12 text-primary" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      
      <p className="text-secondary text-center max-w-md mb-6">
        {description}
      </p>
      
      {action && (
        <button
          onClick={action}
          className="btn-primary flex items-center space-x-2"
        >
          <ApperIcon name="Plus" className="h-4 w-4" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};

export default Empty;