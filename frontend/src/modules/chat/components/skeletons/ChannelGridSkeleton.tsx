export function ChannelGridSkeleton() {
  const skeletonCards = Array.from({ length: 4 });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {skeletonCards.map((_placeholder, index) => (
        <div key={index} className="border border-gray-light rounded-xl p-4">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gray-light" />
            <div>
              <div className="h-4 w-28 bg-gray-light rounded" />
              <div className="h-3 w-16 bg-gray-light rounded mt-1" />
            </div>
          </div>
          <div className="h-3 w-full bg-gray-light rounded mb-1" />
          <div className="h-3 w-3/4 bg-gray-light rounded mb-3" />
          <div className="flex justify-between">
            <div className="h-3 w-20 bg-gray-light rounded" />
            <div className="h-7 w-16 bg-gray-light rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
