import Link from "next/link";
import { IconCircleCheck, IconAlertCircle, IconArrowRight, IconSend } from "@tabler/icons-react";

interface Props {
  success: boolean;
}

export const VerifyEmailView = ({ success }: Props) => {
  if (!success) {
    return (
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-light p-8 flex flex-col items-center gap-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center">
          <IconAlertCircle size={28} className="text-error" />
        </div>

        <div className="flex flex-col gap-2">
          <h4>Enlace inválido</h4>
          <p className="p-muted">
            El enlace de verificación es inválido o ha expirado. Solicita uno nuevo a continuación.
          </p>
        </div>

        <button className="w-full flex items-center justify-center gap-2 py-3 px-5 bg-white hover:bg-gray-ultra border border-primary rounded-lg transition-colors duration-150 btn-sans font-bold cursor-pointer">
          <IconSend size={16} className="text-primary" />
          <span className="span-primary font-bold">Reenviar correo de verificación</span>
        </button>

        <small className="small-muted text-center">
          ¿No recibiste nada? Revisa tu carpeta de spam o espera unos minutos.
        </small>

        <div className="h-px bg-gray-light w-full" />

        <Link
          href="/register"
          className="small-primary font-bold hover:underline transition-colors duration-150"
        >
          Usar otro correo electrónico
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white rounded-2xl border border-gray-light p-8 flex flex-col items-center gap-6 text-center">
      <div className="relative flex items-center justify-center">
        <div className="absolute w-24 h-24 rounded-full bg-primary-light animate-ping opacity-20" />
        <div className="absolute w-20 h-20 rounded-full bg-primary-light opacity-40" />
        <div className="w-16 h-16 rounded-full bg-primary-light border-2 border-accent flex items-center justify-center z-10">
          <IconCircleCheck size={30} className="text-primary" />
        </div>
      </div>

      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-light rounded-full">
        <IconCircleCheck size={12} className="text-primary" />
        <span className="h1-badge-primary font-bold tracking-widest">CUENTA ACTIVADA</span>
      </span>

      <div className="flex flex-col gap-2">
        <h4>¡Email verificado!</h4>
        <p className="p-muted leading-relaxed">
          Tu cuenta ha sido activada correctamente. Bienvenido a{" "}
          <span className="span-primary font-bold">4Z4C</span>. Ya puedes acceder a tu panel.
        </p>
      </div>

      <Link
        href="/login"
        className="w-full flex items-center justify-center gap-2 py-3 px-5 bg-primary hover:bg-primary-hover rounded-lg transition-colors duration-150 btn-sans font-bold"
      >
        <span className="p-white font-bold">Ir al inicio de sesión</span>
        <IconArrowRight size={16} color="#ffffff" />
      </Link>

      <small className="small-muted">
        ¿Problemas para acceder?{" "}
        <Link href="/forgot-password" className="small-primary font-bold hover:underline">
          Recupera tu contraseña
        </Link>
      </small>
    </div>
  );
};
