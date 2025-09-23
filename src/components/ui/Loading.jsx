const Loading = () => {
  return (
    <div className="animate-pulse space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="h-10 bg-gray-200 rounded w-32"></div>
      </div>
      
      {/* Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
            </div>
            <div className="mt-4">
              <div className="h-8 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-24 mt-2"></div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Table skeleton */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="h-10 bg-gray-200 rounded w-64"></div>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="px-6 py-4">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-48"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Loading;