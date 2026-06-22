export default function ResetPasswordLoading() {
  return (
    <div className="w-full max-w-lg flex flex-col gap-7 animate-pulse">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="h-8 w-72 bg-gray-light rounded-lg" />
        <div className="h-4 w-80 bg-gray-light rounded" />
      </div>

      {/* Password field */}
      <div className="flex flex-col gap-1.5">
        <div className="h-3 w-28 bg-gray-light rounded" />
        <div className="h-12 w-full bg-gray-light rounded-lg" />
      </div>

      {/* Confirm password field */}
      <div className="flex flex-col gap-1.5">
        <div className="h-3 w-36 bg-gray-light rounded" />
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

      {/* Submit button */}
      <div className="h-12 w-full bg-gray-light rounded-lg" />

      {/* Cancel link */}
      <div className="flex justify-center">
        <div className="h-3 w-52 bg-gray-light rounded" />
      </div>
    </div>
  );
}
