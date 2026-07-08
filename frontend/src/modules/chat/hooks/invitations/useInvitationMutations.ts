import { useMutation } from "@tanstack/react-query";
import { createInvitationAction } from "@/modules/chat/actions/invitations/create-invitation.action";
import { acceptInvitationAction } from "@/modules/chat/actions/invitations/accept-invitation.action";

export function useInvitationMutations() {
  const createInvitationMutation = useMutation({
    mutationFn: async (channelId: string) => {
      const res = await createInvitationAction(channelId);
      if (!res.success)
        throw new Error(res.message ?? "Error al generar enlace");
      return res.data;
    },
  });

  const acceptInvitationMutation = useMutation({
    mutationFn: async (token: string) => {
      const res = await acceptInvitationAction(token);
      if (!res.success)
        throw new Error(res.message ?? "Error al aceptar invitación");
      return res.data;
    },
  });

  return {
    createInvitationMutation,
    acceptInvitationMutation,
  };
}
