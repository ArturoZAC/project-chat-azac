import Link from "next/link";
import { LoginFormFields } from "./LoginFormFields";

export const LoginForm = () => {
  return (
    <div className="w-full max-w-105 flex flex-col gap-7">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2>Bienvenido de nuevo</h2>
        <p className="p-muted">Ingresa tus credenciales para acceder a tu panel.</p>
      </div>

      {/* Form interactivo */}
      <LoginFormFields />

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-light" />
      </div>

      {/* Register link */}
      <div className="flex flex-col gap-y-2">
        <p className="text-center p-muted">
          ¿No tienes una cuenta?{" "}
          <Link href="/register" className="span-primary font-bold hover:underline">
            Regístrate gratis
          </Link>
        </p>

        {/* Link olvidaste contraseña */}
        <div className="flex justify-center">
          <Link
            href="/forgot-password"
            className="small-primary hover:underline transition-colors duration-150 font-bold"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </div>
    </div>
  );
};
