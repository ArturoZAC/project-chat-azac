import { verifyEmailAction } from "@/modules/auth/actions/verify-email.action";
import { VerifyEmailSkeleton } from "@/modules/auth/components/verify-email/VerifyEmailSkeleton";
import { VerifyEmailView } from "@/modules/auth/components/verify-email/VerifyEmailView";
import { Suspense } from "react";

interface Props {
  searchParams: Promise<{ token?: string }>;
}

async function VerifyEmailResult({ token }: { token: string }) {
  const result = await verifyEmailAction(token);
  return <VerifyEmailView success={result.success} />;
}

export default async function VerifyEmailPage({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) return <VerifyEmailView success={false} />;

  return (
    <Suspense fallback={<VerifyEmailSkeleton />}>
      <VerifyEmailResult token={token} />
    </Suspense>
  );
}
