export default function Loading() {
  return (
    <div className="bg-slate-900 text-white min-h-screen">
      {/* Hero Skeleton */}
      <div className="relative h-screen bg-gray-800 animate-pulse">
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 p-8 flex flex-col justify-center h-full">
          <div className="h-12 bg-gray-700 rounded mb-4 w-1/2"></div>
          <div className="h-6 bg-gray-700 rounded mb-2 w-3/4"></div>
          <div className="h-6 bg-gray-700 rounded mb-2 w-2/3"></div>
          <div className="h-6 bg-gray-700 rounded w-1/2"></div>
          <div className="flex space-x-4 mt-6">
            <div className="h-12 bg-crimson-600 rounded w-24"></div>
            <div className="h-12 bg-gray-600 rounded w-24"></div>
          </div>
        </div>
      </div>

      {/* Rows Skeleton */}
      <div className="p-8">
        <div className="h-8 bg-gray-700 rounded mb-4 w-48"></div>
        <div className="flex space-x-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-48">
              <div className="bg-gray-700 rounded w-full h-72 animate-pulse"></div>
              <div className="h-4 bg-gray-700 rounded mt-2 w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}