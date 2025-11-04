import { Suspense } from "react";
import { EmailVerificationSuccessForm } from "./components/email-verification-success-form";
import { LogoLoader } from "@/components/ui/loader";

export default async function EmailVerificationSuccessPage() {

    
  return (
    <Suspense fallback={<LogoLoader size={64} color="var(--primary)" />}>
      <EmailVerificationSuccessForm />
    </Suspense>
  );
}

