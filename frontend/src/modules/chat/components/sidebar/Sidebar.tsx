import { SidebarClient } from "./SidebarClient";

export function Sidebar() {
  return (
    <aside className="h-screen bg-gray-ultra border-r border-gray-light overflow-hidden shrink-0">
      <SidebarClient />
    </aside>
  );
}
