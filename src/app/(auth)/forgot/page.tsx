import { Suspense } from "react";
import { ForgotPasswordForm } from "../components/forgot-password-form";
import { LogoLoader } from "@/components/ui/loader";

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<LogoLoader size={64} color="var(--primary)" />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
