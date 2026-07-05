import { Sidebar } from "@/modules/chat/components/sidebar/Sidebar";
import { TopBar } from "@/modules/chat/components/layout/TopBar";
import { SessionRestore } from "@/modules/auth/components/SessionRestore";
import { SocketProvider } from "@/modules/chat/providers/SocketProvider";

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionRestore>
      <SocketProvider>
        <div className="h-screen w-screen flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 bg-white">
          <TopBar />
          {children}
        </main>
      </div>
      </SocketProvider>
    </SessionRestore>
  );
}
