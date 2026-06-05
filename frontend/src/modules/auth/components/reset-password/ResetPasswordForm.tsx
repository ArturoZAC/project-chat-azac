import Link from "next/link";
import { ResetPasswordFormFields } from "./ResetPasswordFormFields";

export const ResetPasswordForm = () => {
  return (
    <div className="w-full max-w-lg flex flex-col gap-7">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2>Restablecer contraseña</h2>
        <p className="p-muted">Ingresa tu nueva clave de acceso para asegurar tu cuenta.</p>
      </div>

      {/* Form */}
      <ResetPasswordFormFields />

      {/* Cancel link */}
      <div className="flex justify-center">
        <Link
          href="/login"
          className="small-primary font-bold hover:underline transition-colors duration-150"
        >
          Cancelar y volver al inicio
        </Link>
      </div>
    </div>
  );
};
