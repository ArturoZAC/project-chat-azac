"use client";

import { useEffect } from "react";
import { useChannelQueries } from "@/modules/chat/hooks/channels/useChannelQueries";
import { useChatStore } from "@/modules/chat/store/chat.store";

export function useMembershipsSync() {
  const { data: memberships } = useChannelQueries().getMemberships;
  const initializeMemberships = useChatStore(
    (store) => store.initializeMemberships
  );

  useEffect(() => {
    if (memberships) {
      initializeMemberships(memberships);
    }
  }, [memberships, initializeMemberships]);
}
