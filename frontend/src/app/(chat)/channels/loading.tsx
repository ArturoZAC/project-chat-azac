import { ChannelGridSkeleton } from "@/modules/chat/components/skeletons/ChannelGridSkeleton";

export default function ChannelsLoading() {
  return (
    <div className="flex flex-col h-full p-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-7 w-56 bg-gray-light rounded-lg mb-1" />
          <div className="h-4 w-72 bg-gray-light rounded" />
        </div>
        <div className="h-10 w-36 bg-gray-light rounded-lg" />
      </div>

      {/* Search */}
      <div className="h-11 w-full max-w-md bg-gray-light rounded-lg mb-6" />

      {/* Grid */}
      <ChannelGridSkeleton />
    </div>
  );
}
