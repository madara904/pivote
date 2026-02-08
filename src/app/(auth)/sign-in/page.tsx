import { Suspense } from "react";
import { LogoLoader } from "@/components/ui/loader";
import LoginForm from "../components/login-form";

export default function LoginPage() {
  return (
    <Suspense fallback={<LogoLoader size={64} color="var(--primary)" />}>
      <LoginForm />
    </Suspense>
  );
}
