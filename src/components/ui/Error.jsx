import ApperIcon from "@/components/ApperIcon";

const Error = ({ message = "Something went wrong", onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-full p-6 mb-6">
        <ApperIcon name="AlertCircle" className="h-12 w-12 text-error" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Oops! Something went wrong
      </h3>
      
      <p className="text-secondary text-center max-w-md mb-6">
        {message}
      </p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-primary flex items-center space-x-2"
        >
          <ApperIcon name="RefreshCw" className="h-4 w-4" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};

export default Error;