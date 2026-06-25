import { TopBarClient } from "./TopBarClient";

export function TopBar() {
  return (
    <div className="h-14 border-b border-gray-light flex items-center px-6 shrink-0 relative">
      <TopBarClient />
    </div>
  );
}
