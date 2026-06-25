import { DMView } from "@/modules/chat/components/dm/DMView";

interface Props {
  params: Promise<{ userId: string }>;
}

export default async function DMPage({ params }: Props) {
  const { userId } = await params;
  return <DMView userId={userId} />;
}
