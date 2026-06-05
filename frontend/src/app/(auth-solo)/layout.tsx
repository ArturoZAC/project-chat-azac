export default function AuthSoloLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#FAFAFA]">
      <div className="w-full flex-1 flex items-center justify-center px-6 py-12">{children}</div>
      <div className="flex items-center justify-center gap-6 py-5 border-t border-gray-light w-full">
        <span className="link-footer">
          © {new Date().getFullYear()} 4Z4C Chat. Todos los derechos reservados.
        </span>
      </div>
    </div>
  );
}
