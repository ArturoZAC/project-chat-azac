export function SettingsSkeleton() {
  return (
    <div className="flex-1 flex items-start justify-center overflow-y-auto bg-gray-ultra animate-pulse">
      <div className="max-w-2xl w-full px-6 py-10">
        <div className="h-7 w-36 bg-gray-light rounded-lg mb-6" />

        <div className="flex flex-col gap-4">
          {/* Account Section */}
          <div className="bg-white rounded-2xl border border-gray-light shadow-sm p-6">
            <div className="h-5 w-16 bg-gray-light rounded mb-4" />
            <div className="flex flex-col gap-4">
              <div className="h-[52px] bg-gray-light rounded-lg" />
              <div className="h-[52px] bg-gray-light rounded-lg" />
              <div className="h-[52px] bg-gray-light rounded-lg" />
            </div>
          </div>

          {/* Notifications Section */}
          <div className="bg-white rounded-2xl border border-gray-light shadow-sm p-6">
            <div className="h-5 w-28 bg-gray-light rounded mb-4" />
            <div className="flex flex-col gap-4">
              <div className="h-[52px] bg-gray-light rounded-lg" />
              <div className="h-[52px] bg-gray-light rounded-lg" />
            </div>
          </div>

          {/* Session Section */}
          <div className="bg-white rounded-2xl border border-gray-light shadow-sm p-6">
            <div className="h-5 w-16 bg-gray-light rounded mb-4" />
            <div className="h-11 w-full bg-gray-light rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
