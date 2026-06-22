export default function LoginLoading() {
  return (
    <div className="w-full max-w-lg flex flex-col gap-5 animate-pulse">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-2">
        <div className="h-8 w-56 bg-gray-light rounded-lg" />
        <div className="h-4 w-72 bg-gray-light rounded" />
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

      {/* Checkbox */}
      <div className="flex items-center gap-2.5">
        <div className="w-4 h-4 bg-gray-light rounded" />
        <div className="h-3 w-28 bg-gray-light rounded" />
      </div>

      {/* Submit button */}
      <div className="h-12 w-full bg-gray-light rounded-lg" />

      {/* Footer links */}
      <div className="flex justify-center gap-4">
        <div className="h-3 w-32 bg-gray-light rounded" />
        <div className="h-3 w-24 bg-gray-light rounded" />
      </div>
    </div>
  );
}
