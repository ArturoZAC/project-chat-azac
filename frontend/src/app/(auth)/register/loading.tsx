export default function RegisterLoading() {
  return (
    <div className="w-full max-w-lg flex flex-col gap-5 animate-pulse">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-2">
        <div className="h-8 w-64 bg-gray-light rounded-lg" />
        <div className="h-4 w-80 bg-gray-light rounded" />
      </div>

      {/* Username field */}
      <div className="flex flex-col gap-1.5">
        <div className="h-3 w-16 bg-gray-light rounded" />
        <div className="h-12 w-full bg-gray-light rounded-lg" />
      </div>

      {/* Email field */}
      <div className="flex flex-col gap-1.5">
        <div className="h-3 w-12 bg-gray-light rounded" />
        <div className="h-12 w-full bg-gray-light rounded-lg" />
      </div>

      {/* Password field */}
      <div className="flex flex-col gap-1.5">
        <div className="h-3 w-20 bg-gray-light rounded" />
        <div className="h-12 w-full bg-gray-light rounded-lg" />
      </div>

      {/* Checklist skeleton */}
      <div className="flex flex-col gap-2 p-4 bg-gray-ultra rounded-lg border border-gray-light">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-light rounded" />
          <div className="h-3 w-40 bg-gray-light rounded" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-light rounded" />
          <div className="h-3 w-52 bg-gray-light rounded" />
        </div>
      </div>

      {/* T&C */}
      <div className="flex items-start gap-2.5">
        <div className="w-4 h-4 bg-gray-light rounded shrink-0 mt-0.5" />
        <div className="h-3 w-full bg-gray-light rounded" />
      </div>

      {/* Submit button */}
      <div className="h-12 w-full bg-gray-light rounded-lg" />

      {/* Footer links */}
      <div className="flex justify-center gap-4">
        <div className="h-3 w-40 bg-gray-light rounded" />
        <div className="h-3 w-24 bg-gray-light rounded" />
      </div>
    </div>
  );
}
