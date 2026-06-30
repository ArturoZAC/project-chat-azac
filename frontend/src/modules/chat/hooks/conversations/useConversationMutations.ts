import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendConversationMessageAction } from "@/modules/chat/actions/conversations/send-conversation-message.action";
import { editConversationMessageAction } from "@/modules/chat/actions/conversations/edit-conversation-message.action";
import { deleteConversationMessageAction } from "@/modules/chat/actions/conversations/delete-conversation-message.action";
import { markConversationReadAction } from "@/modules/chat/actions/conversations/mark-conversation-read.action";
import { createOrGetConversationAction } from "@/modules/chat/actions/conversations/create-or-get-conversation.action";

const CONVERSATIONS_KEY = ["conversations"];
export function useConversationMutations() {
  const qc = useQueryClient();

  const createOrGetConversationMutation = useMutation({
    mutationFn: async (participantId: string) => {
      const res = await createOrGetConversationAction(participantId);
      if (!res.success) throw new Error(res.message ?? "Error al crear conversación");
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({
      conversationId: convId,
      content,
    }: {
      conversationId: string;
      content: string;
    }) => {
      const res = await sendConversationMessageAction(convId, content);
      if (!res.success) throw new Error(res.message ?? "Error al enviar mensaje");
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["conversation-messages"],
      });
      qc.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
    },
  });

  const editMessageMutation = useMutation({
    mutationFn: async ({
      conversationId: convId,
      messageId,
      content,
    }: {
      conversationId: string;
      messageId: string;
      content: string;
    }) => {
      const res = await editConversationMessageAction(convId, messageId, content);
      if (!res.success) throw new Error(res.message ?? "Error al editar mensaje");
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["conversation-messages"],
      });
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async ({
      conversationId: convId,
      messageId,
    }: {
      conversationId: string;
      messageId: string;
    }) => {
      const res = await deleteConversationMessageAction(convId, messageId);
      if (!res.success) throw new Error(res.message ?? "Error al eliminar mensaje");
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["conversation-messages"],
      });
      qc.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (convId: string) => {
      const res = await markConversationReadAction(convId);
      if (!res.success) throw new Error(res.message ?? "Error al marcar como leído");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
    },
  });

  return {
    createOrGetConversationMutation,
    sendMessageMutation,
    editMessageMutation,
    deleteMessageMutation,
    markReadMutation,
  };
}
