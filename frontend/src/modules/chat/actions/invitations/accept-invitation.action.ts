/* eslint-disable @typescript-eslint/no-explicit-any */
import { invitationsApi } from "@/modules/chat/api/invitations.api";
import type { ApiResponse } from "@/shared/interfaces/api.interface";

interface AcceptInvitationResponse {
  channelId: string;
  systemMessageId: string;
}

export const acceptInvitationAction = async (token: string) => {
  try {
    const { data } = await invitationsApi.post<
      ApiResponse<AcceptInvitationResponse>
    >(`/invitations/${token}/accept`);
    return data;
  } catch (error: any) {
    return (
      error.response?.data ?? {
        success: false,
        message: "Error al aceptar invitación",
      }
    );
  }
};
