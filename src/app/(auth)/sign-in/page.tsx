import { Suspense } from "react";
import { LoginForm } from "../components/login-form";
import { LogoLoader } from "@/components/ui/loader";

export default function LoginPage() {
  return (
    <Suspense fallback={<LogoLoader size={64} color="var(--primary)" />}>
      <LoginForm />
    </Suspense>
  );
}
