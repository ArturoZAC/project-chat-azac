"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconMail, IconArrowRight } from "@tabler/icons-react";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/modules/auth/schemas/auth.schema";
import { forgotPasswordAction } from "../../actions/forgot-password.action";
import { useToastStore } from "@/store/toast.store";

export const ForgotPasswordFormFields = () => {
  const {
    reset,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const { success, error } = useToastStore();

  const onSubmit = async (data: ForgotPasswordInput) => {
    console.log(data);
    const result = await forgotPasswordAction(data);

    if (result.success) {
      success("Correo enviado", "Revisa tu bandeja de entrada para restablecer tu contraseña");
      reset();
      return;
    }

    return error("Error", result.message);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
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

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 py-3 px-5 bg-primary hover:bg-primary-hover disabled:opacity-60 rounded-lg transition-colors duration-150 btn-sans font-bold cursor-pointer border-none"
      >
        <span className="p-white font-bold">
          {isSubmitting ? "Enviando..." : "Enviar instrucciones"}
        </span>
        {!isSubmitting && <IconArrowRight size={16} color="#ffffff" />}
      </button>
    </form>
  );
};
