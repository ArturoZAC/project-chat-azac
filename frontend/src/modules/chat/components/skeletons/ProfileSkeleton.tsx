export function ProfileSkeleton() {
  return (
    <div className="flex-1 flex items-start justify-center overflow-y-auto bg-gray-ultra animate-pulse">
      <div className="max-w-2xl w-full px-6 py-10">
        <div className="bg-white rounded-2xl border border-gray-light shadow-sm p-8">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gray-light mb-4" />
            <div className="h-6 w-40 bg-gray-light rounded-lg mb-1" />
            <div className="h-4 w-60 bg-gray-light rounded" />
            <div className="h-5 w-16 bg-gray-light rounded-full mt-2" />
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
            <div className="h-[68px] bg-gray-light rounded-xl" />
            <div className="h-[68px] bg-gray-light rounded-xl" />
            <div className="h-[68px] bg-gray-light rounded-xl sm:col-span-2" />
          </div>

          {/* Button */}
          <div className="h-11 w-full bg-gray-light rounded-lg" />
        </div>

        {/* Footer phrase */}
        <div className="h-4 w-72 bg-gray-light rounded mx-auto mt-6" />
      </div>
    </div>
  );
}
