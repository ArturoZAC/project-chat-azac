/* eslint-disable @typescript-eslint/no-explicit-any */
import { invitationsApi } from "@/modules/chat/api/invitations.api";
import type { ApiResponse } from "@/shared/interfaces/api.interface";

interface CreateInvitationResponse {
  token: string;
  expiresAt: string;
  url: string;
}

export const createInvitationAction = async (channelId: string) => {
  try {
    const { data } = await invitationsApi.post<
      ApiResponse<CreateInvitationResponse>
    >(`/channels/${channelId}/invitations`);
    return data;
  } catch (error: any) {
    return (
      error.response?.data ?? { success: false, message: "Error al generar enlace" }
    );
  }
};
