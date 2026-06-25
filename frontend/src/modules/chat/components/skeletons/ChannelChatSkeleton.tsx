export function ChannelChatSkeleton() {
  const skeletonMessages = Array.from({ length: 5 });

  return (
    <div className="flex-1 flex h-full">
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-light">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 bg-gray-light rounded" />
            <div>
              <div className="h-4 w-28 bg-gray-light rounded mb-1" />
              <div className="h-3 w-48 bg-gray-light rounded" />
            </div>
          </div>
          <div className="h-8 w-16 bg-gray-light rounded-lg" />
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 space-y-4">
          {skeletonMessages.map((_placeholder, index) => {
            const isFromOther = index % 2 === 0;
            const bubbleWidth = 120 + ((index * 37) % 180);
            return (
              <div key={index} className={`flex gap-2.5 ${isFromOther ? "" : "flex-row-reverse"}`}>
                <div className="w-8 h-8 rounded-full bg-gray-light shrink-0" />
                <div className={`flex flex-col gap-1 ${isFromOther ? "items-start" : "items-end"}`}>
                  {!isFromOther && <div className="h-3 w-16 bg-gray-light rounded" />}
                  <div
                    className="h-10 bg-gray-light rounded-2xl"
                    style={{
                      width: `${bubbleWidth}px`,
                      borderRadius: isFromOther
                        ? "1rem 1rem 1rem 0.25rem"
                        : "1rem 1rem 0.25rem 1rem",
                    }}
                  />
                  <div className="h-2 w-12 bg-gray-light rounded" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <div className="px-4 pb-4 pt-2">
          <div className="h-12 w-full bg-gray-light rounded-xl" />
        </div>
      </div>
    </div>
  );
}
