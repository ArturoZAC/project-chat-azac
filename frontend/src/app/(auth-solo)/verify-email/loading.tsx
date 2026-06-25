export default function VerifyEmailLoading() {
  return (
    <div className="w-full max-w-md bg-white rounded-2xl border border-gray-light p-8 flex flex-col items-center gap-6 animate-pulse">
      {/* Icono */}
      <div className="w-16 h-16 rounded-full bg-gray-light" />

      {/* Badge */}
      <div className="w-32 h-6 rounded-full bg-gray-light" />

      {/* Texto */}
      <div className="flex flex-col gap-3 w-full items-center">
        <div className="w-48 h-5 rounded-lg bg-gray-light" />
        <div className="w-full h-4 rounded-lg bg-gray-light" />
        <div className="w-3/4 h-4 rounded-lg bg-gray-light" />
      </div>

      {/* Botón */}
      <div className="w-full h-12 rounded-lg bg-gray-light" />

      {/* Footer */}
      <div className="w-40 h-3 rounded-lg bg-gray-light" />
    </div>
  );
}
