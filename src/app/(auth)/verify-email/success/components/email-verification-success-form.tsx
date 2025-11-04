"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, CircleAlert } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/logo";
import { useSession } from "@/lib/auth-client";
import { useSearchParams } from "next/navigation";

export function EmailVerificationSuccessForm() {
  const { data: session, isPending } = useSession();
  const searchParams = useSearchParams();
  
  const successParam = searchParams.get("success");
  const isVerified = session?.user?.emailVerified || successParam === "true";

  // Show loading state while checking
  if (isPending) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-center flex-col">
          <div className="flex items-center justify-center">
            <Logo className="h-16" />
          </div>
        </div>
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2 h-[620px]">
            <div className="p-6 md:p-8 flex flex-col items-center justify-center text-center">
              <div className="flex flex-col gap-6 w-full max-w-sm">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Überprüfung...</h2>
                  <p className="text-muted-foreground">
                    Bitte warten Sie, während wir Ihre E-Mail-Verifizierung überprüfen.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If not verified, show error state
  if (!isVerified) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-center flex-col">
          <div className="flex items-center justify-center">
            <Logo className="h-16" />
          </div>
        </div>
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2 h-[620px]">
            <div className="p-6 md:p-8 flex flex-col items-center justify-center text-center">
              <div className="flex flex-col gap-6 w-full max-w-sm">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 mx-auto">
                  <CircleAlert className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Verifizierung fehlgeschlagen</h2>
                  <p className="text-muted-foreground">
                    Der Verifizierungs-Link ist ungültig oder abgelaufen. Bitte fordern Sie eine neue Verifizierungs-E-Mail an.
                  </p>
                </div>
                <div className="space-y-4">
                  <Link href="/dashboard">
                    <Button variant="outline" className="w-full h-10">
                      Zum Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            <div className="hidden md:flex flex-col gap-y-6 items-center justify-center bg-gradient-to-r from-primary/70 to-primary/95 p-8 text-primary-foreground">
              <div className="flex flex-col items-center text-center space-y-2">
                <h1 className="text-3xl font-bold">Link ungültig ⏰</h1>
                <p className="text-wrap text-sm">
                  Der Verifizierungs-Link ist ungültig oder abgelaufen. Fordern Sie eine neue Verifizierungs-E-Mail an.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state - email is verified
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-center">
        <div className="flex items-center justify-center">
          <Logo className="h-16" />
        </div>
      </div>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 h-[620px]">
          <div className="p-6 md:p-8 flex flex-col items-center justify-center text-center">
            <div className="flex flex-col gap-6 w-full max-w-sm">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 mx-auto animate-in fade-in zoom-in duration-500">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">E-Mail erfolgreich verifiziert!</h2>
                <p className="text-muted-foreground">
                  Ihre E-Mail-Adresse wurde erfolgreich bestätigt. Sie können jetzt alle Funktionen der Plattform nutzen.
                </p>
              </div>
              <div className="space-y-4">
                <Link href="/dashboard">
                  <Button className="w-full h-10">
                    Zum Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

