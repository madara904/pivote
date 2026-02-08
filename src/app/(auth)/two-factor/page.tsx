import { Suspense } from "react";
import { LogoLoader } from "@/components/ui/loader";
import TwoFactorForm from "../components/two-factor-form";

export default function TwoFactorPage() {
  return (
    <Suspense fallback={<LogoLoader size={64} color="var(--primary)" />}>
      <TwoFactorForm />
    </Suspense>
  );
}
