export default function ForgotPasswordLoading() {
  return (
    <div className="w-full max-w-lg flex flex-col gap-5 animate-pulse">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-2">
        <div className="h-8 w-56 bg-gray-light rounded-lg" />
        <div className="h-4 w-80 bg-gray-light rounded" />
      </div>

      {/* Email field */}
      <div className="flex flex-col gap-1.5">
        <div className="h-3 w-12 bg-gray-light rounded" />
        <div className="h-12 w-full bg-gray-light rounded-lg" />
      </div>

      {/* Submit button */}
      <div className="h-12 w-full bg-gray-light rounded-lg" />

      {/* Back link */}
      <div className="flex justify-center">
        <div className="h-3 w-44 bg-gray-light rounded" />
      </div>
    </div>
  );
}
