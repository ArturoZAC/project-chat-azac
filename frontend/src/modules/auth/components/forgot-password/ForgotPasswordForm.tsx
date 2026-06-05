import Link from "next/link";
import { IconArrowLeft, IconLockFilled } from "@tabler/icons-react";
import { ForgotPasswordFormFields } from "./ForgotPasswordFormFields";

export const ForgotPasswordForm = () => {
  return (
    <div className="w-full max-w-xl bg-white rounded-2xl border border-gray-light p-8 flex flex-col gap-6">
      {/* Icon */}
      <div className="flex justify-center">
        <div className="w-12 h-12 rounded-full bg-primary-light border-2 border-accent flex items-center justify-center">
          <span className="text-primary text-xl">
            <IconLockFilled />
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-1 text-center">
        <h4>Recuperar contraseña</h4>
        <p className="p-muted text-center">
          Ingresa tu email y te enviaremos las instrucciones para restablecer tu contraseña.
        </p>
      </div>

      {/* Form */}
      <ForgotPasswordFormFields />

      {/* Divider */}
      <div className="h-px bg-gray-light" />

      {/* Back link */}
      <div className="flex justify-center">
        <Link
          href="/login"
          className="flex items-center gap-1.5 small-primary font-bold hover:underline transition-colors duration-150"
        >
          <IconArrowLeft size={14} />
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  );
};
