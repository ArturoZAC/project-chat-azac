import { AuthBranding } from "@/modules/auth/components/AuthBranding";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2">
      <AuthBranding />
      <div className="flex flex-col min-h-screen bg-[#FAFAFA]">
        <div className="flex-1 flex items-center justify-center px-6 py-12">{children}</div>
        <div className="flex items-center justify-center gap-6 py-5 border-t border-[#E5E7EB]">
          <Link href="https://azacode.dev/" target="_blank" className="link-footer">
            Privacidad
          </Link>
          <Link href="https://azacode.dev/" target="_blank" className="link-footer">
            Términos
          </Link>
          <Link href="https://azacode.dev/" target="_blank" className="link-footer">
            Ayuda
          </Link>
        </div>
      </div>
    </div>
  );
}
