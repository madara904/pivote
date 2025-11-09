import { Suspense } from "react";
import { RegisterForm } from "../components/register-form";
import { LogoLoader } from "@/components/ui/loader";

export default function RegisterPage() {
  return (
    <Suspense fallback={<LogoLoader size={64} color="var(--primary)" />}>
      <RegisterForm />
    </Suspense>
  );
}
  