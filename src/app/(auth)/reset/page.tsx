import { Suspense } from "react";
import { ResetPasswordForm } from "../components/reset-password-form";
import { LogoLoader } from "@/components/ui/loader";


export default function ResetPasswordPage() {
  return (
    <Suspense fallback={ <LogoLoader size={64} color="var(--primary)" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
