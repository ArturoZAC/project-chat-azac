import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  sendConversationMessageApi,
  editConversationMessageApi,
  deleteConversationMessageApi,
  markConversationReadApi,
  createOrGetConversationApi,
} from "../api/conversation.api";

const CONVERSATIONS_KEY = ["conversations"];
export function useConversationMutations() {
  const qc = useQueryClient();

  const createOrGetConversationMutation = useMutation({
    mutationFn: async (participantId: string) => {
      const res = await createOrGetConversationApi(participantId);
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
      const res = await sendConversationMessageApi(convId, content);
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
      const res = await editConversationMessageApi(convId, messageId, content);
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
      await deleteConversationMessageApi(convId, messageId);
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
      await markConversationReadApi(convId);
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
