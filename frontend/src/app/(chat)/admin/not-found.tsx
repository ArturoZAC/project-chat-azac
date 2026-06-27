"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconArrowLeft, IconMoodSad } from "@tabler/icons-react";

export default function AdminNotFound() {
  const router = useRouter();

  return (
    <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
      <div className="flex flex-col items-center text-center max-w-sm">
        <div className="w-20 h-20 rounded-2xl bg-silver-light flex items-center justify-center mb-6">
          <IconMoodSad size={40} className="text-silver-dark" />
        </div>
        <h1 className="h1 font-bold">404</h1>
        <p className="lead2-muted mt-2 mb-8">
          El recurso que buscas no existe o ha sido eliminado.
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-light text-sm font-medium hover:bg-silver-light transition-colors"
          >
            <IconArrowLeft size={16} />
            Volver atrás
          </button>
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
