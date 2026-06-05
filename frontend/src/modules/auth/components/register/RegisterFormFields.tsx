"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconUser,
  IconMail,
  IconLock,
  IconEye,
  IconEyeOff,
  IconInfoCircle,
  IconCircleCheck,
  IconCircle,
} from "@tabler/icons-react";
import { registerSchema, type RegisterInput } from "@/modules/auth/schemas/auth.schema";
import { useToastStore } from "@/store/toast.store";
import { motion /*  type Variants */ } from "framer-motion";
import { registerAction } from "../../actions/register.action";
import { useAuthStore } from "../../store/auth.store";
import { resendVerificationAction } from "../../actions/resend-verification.action";

// const bannerVariants: Variants = {
//   hidden: { opacity: 0, y: -8, scale: 0.98 },
//   visible: {
//     opacity: 1,
//     y: 0,
//     scale: 1,
//     transition: { duration: 0.3, ease: "easeInOut" },
//   },
// };

export const RegisterFormFields = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [registered, setRegistered] = useState(false);
  const { success, error } = useToastStore();
  const { registeredEmail, setRegisteredEmail } = useAuthStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const passwordValue = watch("password") ?? "";
  const hasMinLength = passwordValue.length >= 8;
  const hasUpperAndNumber = /[A-Z]/.test(passwordValue) && /[0-9]/.test(passwordValue);

  const handleResend = async () => {
    if (!registeredEmail) return;
    const result = await resendVerificationAction(registeredEmail);
    if (result.success) {
      success("Correo reenviado", "Revisa tu bandeja de entrada");
    } else {
      error("Error", result.message);
    }
  };

  const onSubmit = async (data: RegisterInput) => {
    const result = await registerAction(data);

    if (result.success) {
      // console.log(data);
      setRegisteredEmail(data.email);
      setRegistered(true);
      success("Registro exitoso", "Tu cuenta ha sido creada correctamente");

      return;
    }

    return error("Error al registrar", result.message);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {/* Username */}
      <div className="flex flex-col gap-1.5">
        <label className="tracking-widest">Username</label>
        <div className="relative">
          <IconUser size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-mid" />
          <input
            {...register("username")}
            type="text"
            placeholder="Tu nombre de usuario"
            className="w-full pl-9 pr-4 py-3 border border-gray-light rounded-lg bg-white placeholder:text-gray-mid focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all duration-150"
          />
        </div>
        {errors.username && <small className="text-error">{errors.username.message}</small>}
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label className="tracking-widest">Email</label>
        <div className="relative">
          <IconMail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-mid" />
          <input
            {...register("email")}
            type="email"
            placeholder="ejemplo@correo.com"
            className="w-full pl-9 pr-4 py-3 border border-gray-light rounded-lg bg-white placeholder:text-gray-mid focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all duration-150"
          />
        </div>
        {errors.email && <small className="text-error">{errors.email.message}</small>}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <label className="tracking-widest">Password</label>
        <div className="relative">
          <IconLock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-mid" />
          <input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="Mín. 8 caracteres"
            className="w-full pl-9 pr-11 py-3 border border-gray-light rounded-lg bg-white placeholder:text-gray-mid focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all duration-150"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-mid hover:text-gray-dark transition-colors duration-150 border-none bg-transparent cursor-pointer"
          >
            {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
          </button>
        </div>
        {errors.password && <small className="text-error">{errors.password.message}</small>}

        {/* Checklist de requisitos */}
        <div className="flex flex-col gap-2 p-4 bg-gray-ultra rounded-lg border border-gray-light mt-1">
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
      </div>

      {/* Info banner — aparece solo tras registro exitoso */}
      {registered && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex flex-col gap-3 p-3.5 bg-primary-light border border-accent rounded-lg"
        >
          <div className="flex items-start gap-3">
            <IconInfoCircle size={18} className="text-primary mt-0.5 shrink-0" />
            <p className="text-[13px] leading-relaxed text-gray-dark">
              <span className="font-bold text-black">Verificación necesaria:</span> Te enviamos un
              código de confirmación a tu correo electrónico para activar tu perfil.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResend}
            className="self-center text-[13px] font-bold span-primary hover:underline transition-colors duration-150 bg-transparent border-none cursor-pointer"
          >
            ¿No recibiste el correo? Reenviar
          </button>
        </motion.div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 py-3 px-5 bg-primary hover:bg-primary-hover disabled:opacity-60 rounded-lg transition-colors duration-150 btn-sans font-bold cursor-pointer border-none"
      >
        <span className="p-white font-bold tracking-widest text-sm">
          {isSubmitting ? "CREANDO CUENTA..." : "CREAR CUENTA"}
        </span>
      </button>
    </form>
  );
};
