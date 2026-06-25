import { ChatView } from "@/modules/chat/components/chat/ChatView";

interface Props {
  params: Promise<{ channelId: string }>;
}

export default async function ChannelChatPage({ params }: Props) {
  const { channelId } = await params;
  return <ChatView channelId={channelId} />;
}
