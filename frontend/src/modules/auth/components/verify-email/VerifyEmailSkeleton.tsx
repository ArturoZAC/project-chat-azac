export const VerifyEmailSkeleton = () => {
  return (
    <div className="w-full max-w-md bg-white rounded-2xl border border-gray-light p-8 flex flex-col items-center gap-6">
      {/* Icono */}
      <div className="w-16 h-16 rounded-full bg-gray-light animate-pulse" />

      {/* Badge */}
      <div className="w-32 h-6 rounded-full bg-gray-light animate-pulse" />

      {/* Texto */}
      <div className="flex flex-col gap-3 w-full items-center">
        <div className="w-48 h-5 rounded-lg bg-gray-light animate-pulse" />
        <div className="w-full h-4 rounded-lg bg-gray-light animate-pulse" />
        <div className="w-3/4 h-4 rounded-lg bg-gray-light animate-pulse" />
      </div>

      {/* Botón */}
      <div className="w-full h-12 rounded-lg bg-gray-light animate-pulse" />

      {/* Footer */}
      <div className="w-40 h-3 rounded-lg bg-gray-light animate-pulse" />
    </div>
  );
};
