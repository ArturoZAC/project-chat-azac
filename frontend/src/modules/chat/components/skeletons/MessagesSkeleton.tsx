export function MessagesSkeleton() {
  const skeletonItems = Array.from({ length: 4 });

  return (
    <div className="flex flex-col gap-1">
      {skeletonItems.map((_placeholder, index) => (
        <div key={index} className="flex items-start gap-3 px-4 py-3">
          <div className="w-10 h-10 rounded-xl bg-gray-light shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="h-4 w-28 bg-gray-light rounded" />
              <div className="h-3 w-10 bg-gray-light rounded" />
            </div>
            <div className="h-3 w-full bg-gray-light rounded" />
          </div>
          <div className="w-6 h-5 bg-gray-light rounded-full shrink-0 mt-1" />
        </div>
      ))}
    </div>
  );
}
