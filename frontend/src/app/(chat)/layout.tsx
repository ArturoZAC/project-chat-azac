import { Sidebar } from "@/modules/chat/components/sidebar/Sidebar";
import { TopBar } from "@/modules/chat/components/layout/TopBar";
import { SessionRestore } from "@/modules/auth/components/SessionRestore";

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionRestore>
      <div className="h-screen w-screen flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 bg-white">
          <TopBar />
          {children}
        </main>
      </div>
    </SessionRestore>
  );
}
