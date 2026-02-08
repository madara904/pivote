import { Suspense } from "react";
import { ResetPasswordForm } from "../components/reset-password-form";
import { LogoLoader } from "@/components/ui/loader";
import { redirect } from "next/navigation";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { verification } from "@/db/schema";

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

  const verificationEntry = await db
    .select({ id: verification.id })
    .from(verification)
    .where(
      and(
        eq(verification.identifier, `reset-password:${token}`),
        gt(verification.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!verificationEntry.length) {
    redirect("/forgot?error=invalid_token");
  }

  return (
    <Suspense fallback={<LogoLoader size={64} color="var(--primary)" />}>
      <ResetPasswordForm token={token} />
    </Suspense>
  );
}
