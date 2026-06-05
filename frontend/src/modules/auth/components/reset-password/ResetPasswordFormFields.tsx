"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconEye,
  IconEyeOff,
  IconArrowRight,
  IconCircleCheck,
  IconCircle,
} from "@tabler/icons-react";
import { resetPasswordSchema, type ResetPasswordInput } from "@/modules/auth/schemas/auth.schema";

export const ResetPasswordFormFields = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const passwordValue = watch("password", "");
  const hasMinLength = passwordValue.length >= 8;
  const hasUpperAndNumber = /[A-Z]/.test(passwordValue) && /[0-9]/.test(passwordValue);

  // Nivel de seguridad
  const strength = [hasMinLength, hasUpperAndNumber].filter(Boolean).length;
  const strengthColors = ["bg-gray-light", "bg-yellow-400", "bg-green-500"];
  const strengthColor = strengthColors[strength];

  const onSubmit = async (data: ResetPasswordInput) => {
    // TODO: conectar con backend
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {/* Nueva contraseña */}
      <div className="flex flex-col gap-1.5">
        <label className="tracking-widest">Nueva contraseña</label>
        <div className="relative">
          <input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="w-full pl-4 pr-11 py-3 border border-gray-light rounded-lg bg-white placeholder:text-gray-mid focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all duration-150"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-mid hover:text-gray-dark transition-colors duration-150 border-none bg-transparent cursor-pointer"
          >
            {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
          </button>
        </div>

        {/* Barra de seguridad */}
        <div className="flex gap-1.5 mt-1">
          {[0, 1].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i < strength ? strengthColor : "bg-gray-light"
              }`}
            />
          ))}
        </div>
        <small className="text-gray-mid">Nivel de seguridad</small>

        {errors.password && <small className="text-error">{errors.password.message}</small>}
      </div>

      {/* Confirmar contraseña */}
      <div className="flex flex-col gap-1.5">
        <label className="tracking-widest">Confirmar contraseña</label>
        <div className="relative">
          <input
            {...register("confirmPassword")}
            type={showConfirm ? "text" : "password"}
            placeholder="••••••••"
            className="w-full pl-4 pr-11 py-3 border border-gray-light rounded-lg bg-white placeholder:text-gray-mid focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all duration-150"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-mid hover:text-gray-dark transition-colors duration-150 border-none bg-transparent cursor-pointer"
          >
            {showConfirm ? <IconEyeOff size={16} /> : <IconEye size={16} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <small className="text-error">{errors.confirmPassword.message}</small>
        )}
      </div>

      {/* Checklist de requisitos */}
      <div className="flex flex-col gap-2 p-4 bg-gray-ultra rounded-lg border border-gray-light">
        <div className="flex items-center gap-2">
          {hasMinLength ? (
            <IconCircleCheck size={16} className="text-primary" />
          ) : (
            <IconCircle size={16} className="text-gray-mid" />
          )}
          <small className={hasMinLength ? "small-primary" : "small-muted"}>
            Mínimo 8 caracteres
          </small>
        </div>
        <div className="flex items-center gap-2">
          {hasUpperAndNumber ? (
            <IconCircleCheck size={16} className="text-primary" />
          ) : (
            <IconCircle size={16} className="text-gray-mid" />
          )}
          <small className={hasUpperAndNumber ? "small-primary" : "small-muted"}>
            Al menos una mayúscula y un número
          </small>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 py-3 px-5 bg-primary hover:bg-primary-hover disabled:opacity-60 rounded-lg transition-colors duration-150 btn-sans font-bold cursor-pointer border-none"
      >
        <span className="p-white font-bold">
          {isSubmitting ? "Guardando..." : "Guardar contraseña"}
        </span>
        {!isSubmitting && <IconArrowRight size={16} color="#ffffff" />}
      </button>
    </form>
  );
};
