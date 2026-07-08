"use client";

import { useMembershipsSync } from "@/modules/chat/hooks/channels/useMembershipsSync";

/**
 * Client component that syncs the user's channel memberships from the API
 * into the Zustand store on app load.
 */
export function MembershipsSyncClient() {
  useMembershipsSync();
  return null;
}
