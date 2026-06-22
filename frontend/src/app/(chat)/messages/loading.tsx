import { MessagesSkeleton } from "@/modules/chat/components/skeletons/MessagesSkeleton";

export default function MessagesLoading() {
  return (
    <div className="flex flex-col h-full p-6 animate-pulse">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-6 h-6 bg-gray-light rounded" />
          <div className="h-7 w-36 bg-gray-light rounded-lg" />
        </div>
        <div className="h-4 w-56 bg-gray-light rounded" />
      </div>

      {/* List */}
      <MessagesSkeleton />
    </div>
  );
}
