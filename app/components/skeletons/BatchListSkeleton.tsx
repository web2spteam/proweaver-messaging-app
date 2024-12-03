const SkeletonLoader = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded bg-gray-300 ${className}`}></div>
);

const BatchListSkeleton = () => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800"
        >
          {/* Skeleton for batch name */}
          <SkeletonLoader className="mb-4 h-6 w-3/4" />

          {/* Skeleton for school year */}
          <SkeletonLoader className="mb-6 h-4 w-1/2" />

          {/* Skeleton for view students button */}
          <SkeletonLoader className="h-10 w-1/3" />
        </div>
      ))}
    </div>
  );
};

export default BatchListSkeleton;
