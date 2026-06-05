import Link from "next/link";
import { RegisterFormFields } from "./RegisterFormFields";

export const RegisterForm = () => {
  return (
    <div className="w-full max-w-105 flex flex-col gap-7">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2>Crear una cuenta</h2>
        <p className="p-muted">Únete a la comunidad de alto rendimiento.</p>
      </div>

      {/* Form interactivo */}
      <RegisterFormFields />

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-light" />
      </div>

      {/* Login link */}
      <p className="text-center p-muted">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="span-primary font-bold hover:underline">
          Inicia sesión aquí
        </Link>
      </p>
    </div>
  );
};
