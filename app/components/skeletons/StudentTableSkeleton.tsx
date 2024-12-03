const SkeletonLoader = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded bg-gray-300 ${className}`}></div>
);

const StudentTableSkeleton = () => {
  return (
    <tbody>
      {Array.from({ length: 4 }).map((_, index) => (
        <tr key={index} className="border-b dark:border-gray-700">
          <td className="w-4 px-4 py-3">
            <div className="flex items-center">
              <SkeletonLoader className="size-4" />
            </div>
          </td>
          <td className="w-28 px-4 py-3">
            <SkeletonLoader className="h-6 w-16" />
          </td>
          <td className="mr-12 flex items-center space-x-6 whitespace-nowrap px-4 py-3">
            <div className="relative inline-flex size-10 items-center justify-center overflow-hidden rounded-full">
              <SkeletonLoader className="size-full" />
            </div>
            <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
              <SkeletonLoader className="mb-1 h-4 w-32" />
              <SkeletonLoader className="h-4 w-40" />
            </div>
          </td>
          <td className="px-4 py-3">
            <SkeletonLoader className="h-4 w-32" />
          </td>
          <td className="px-4 py-3">
            <SkeletonLoader className="h-4 w-20" />
          </td>
          <td className="flex items-center justify-end px-4 py-3">
            <SkeletonLoader className="size-8 rounded" />
          </td>
        </tr>
      ))}
    </tbody>
  );
};

export default StudentTableSkeleton;
