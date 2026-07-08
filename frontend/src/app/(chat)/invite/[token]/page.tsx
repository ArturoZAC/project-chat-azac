import { InviteAcceptanceClient } from "@/modules/chat/components/invite/InviteAcceptanceClient";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: Props) {
  const { token } = await params;
  return <InviteAcceptanceClient token={token} />;
}
