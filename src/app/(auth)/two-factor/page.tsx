import { Suspense } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LogoLoader } from "@/components/ui/loader";
import TwoFactorForm from "../components/two-factor-form";

function hasTwoFactorChallengeCookie(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
) {
  return Boolean(
    cookieStore.get("better-auth.two_factor")?.value ||
      cookieStore.get("__Secure-better-auth.two_factor")?.value,
  );
}

export default async function TwoFactorPage() {
  const [cookieStore, requestHeaders] = await Promise.all([cookies(), headers()]);
  const session = await auth.api.getSession({ headers: requestHeaders });

  if (session?.session) {
    redirect("/dashboard");
  }

  if (!hasTwoFactorChallengeCookie(cookieStore)) {
    redirect("/sign-in");
  }

  return (
    <Suspense fallback={<LogoLoader size={64} color="var(--primary)" />}>
      <TwoFactorForm />
    </Suspense>
  );
}
