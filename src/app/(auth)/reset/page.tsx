import { Suspense } from "react";
import { ResetPasswordForm } from "../components/reset-password-form";
import { LogoLoader } from "@/components/ui/loader";
import { redirect } from "next/navigation";

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string; error?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;
  const token = params.token;
  const error = params.error;

  if (error === "INVALID_TOKEN") {
    redirect("/forgot?error=invalid_token");
  }

  if (!token) {
    redirect("/forgot?error=missing_token");
  }

  return (
    <Suspense fallback={<LogoLoader size={64} color="var(--primary)" />}>
      <ResetPasswordForm token={token} />
    </Suspense>
  );
}
