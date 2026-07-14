import { ChannelsPageClient } from "@/modules/admin/components/channels/ChannelsPageClient";

export default function AdminChannelsPage() {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="h2">Canales</h2>
        <p className="lead2-muted mt-1">
          Gestiona los canales de la plataforma
        </p>
      </div>

      <ChannelsPageClient />
    </div>
  );
}
