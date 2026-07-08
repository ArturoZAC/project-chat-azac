import { Sidebar } from "@/modules/chat/components/sidebar/Sidebar";
import { TopBar } from "@/modules/chat/components/layout/TopBar";
import { SessionRestore } from "@/modules/auth/components/SessionRestore";
import { SocketProvider } from "@/modules/chat/providers/SocketProvider";
import { MembershipsSyncClient } from "@/modules/chat/components/layout/MembershipsSyncClient";

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionRestore>
      <SocketProvider>
        <MembershipsSyncClient />
        <div className="h-screen w-screen flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 min-h-0 bg-white overflow-hidden">
          <TopBar />
          {children}
        </main>
      </div>
      </SocketProvider>
    </SessionRestore>
  );
}
