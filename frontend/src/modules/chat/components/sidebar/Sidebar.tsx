import { SidebarClient } from "./SidebarClient";

export function Sidebar() {
  return (
    <aside className="w-[260px] min-h-screen bg-gray-ultra flex flex-col shrink-0 border-r border-gray-light">
      <SidebarClient />
    </aside>
  );
}
