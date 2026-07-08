"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { IconMail, IconLock, IconEye, IconEyeOff, IconArrowRight } from "@tabler/icons-react";
import { loginSchema, type LoginInput } from "@/modules/auth/schemas/auth.schema";
import { useToastStore } from "@/store/toast.store";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { loginAction } from "../../actions/login.action";

export const LoginFormFields = () => {
  const { success, error } = useToastStore();
  const { setSession } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/channels";
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema) as any,
  });

  const onSubmit = async (data: LoginInput) => {
    const result = await loginAction(data);

    // console.log({ result });

    if (result.success) {
      setSession(result.data?.userId);
      success("Bienvenido", result.message);
      router.push(redirectTo);
      return;
    }

    return error("Error al iniciar sesión", result.message);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label className=" tracking-widest">Email</label>
        <div className="relative">
          <IconMail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-mid" />
          <input
            {...register("email")}
            type="email"
            placeholder="nombre@empresa.com"
            className="w-full pl-9 pr-4 py-3 border border-gray-light rounded-lg bg-white placeholder:text-gray-mid focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all duration-150"
          />
        </div>
        {errors.email && <small className="text-error">{errors.email.message}</small>}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <label className=" tracking-widest">Contraseña</label>
        <div className="relative">
          <IconLock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-mid" />
          <input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="••••••"
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
      </div>

      {/* Recordar sesión */}
      <label className="flex items-center gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          {...register("rememberMe")}
          className="w-4 h-4 rounded border-gray-light accent-primary cursor-pointer"
        />
        <span className="small-muted">Recordar sesión</span>
      </label>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 py-3 px-5 bg-primary hover:bg-primary-hover disabled:opacity-60 rounded-lg transition-colors duration-150 btn-sans font-bold cursor-pointer border-none"
      >
        <span className="p-white font-bold">
          {isSubmitting ? "Iniciando..." : "Iniciar sesión"}
        </span>
        {!isSubmitting && <IconArrowRight size={16} color="#ffffff" />}
      </button>
    </form>
  );
};
