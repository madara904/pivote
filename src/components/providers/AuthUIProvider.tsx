"use client";
import { authClient } from "@/lib/auth-client";
import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

export function AuthUIProviders({ children }: { children: ReactNode }) {
  const router = useRouter();
  return (
    <AuthUIProvider
      authClient={authClient}
      deleteUser
      changeEmail
      avatar
      organization={{logo:true}}
      navigate={router.push}
      replace={router.replace}
      onSessionChange={() => router.refresh()}
      settings={{
        basePath: "/dashboard/",
        url: "/dashboard/einstellungen",
      }}
      Link={Link}
      social={{ providers: ["github"] }}
      basePath="/"
      viewPaths={{
        SIGN_IN: "sign-in",
        SIGN_OUT: "/",
        SIGN_UP: "sign-up",
        FORGOT_PASSWORD: "forgot",
        RESET_PASSWORD: "reset",
        MAGIC_LINK: "magic",
        SETTINGS: "einstellungen",
        CALLBACK: "dashboard",
        ORGANIZATION: "einstellungen",
      }}
    >
      {children}
    </AuthUIProvider>
  );
}
