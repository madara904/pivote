"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, CircleAlert, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/logo";
import { useSession } from "@/lib/auth-client";
import { useSearchParams } from "next/navigation";
import { getReturnToFromSearchParams, isValidReturnTo } from "@/lib/redirect-utils";
import { Separator } from "@/components/ui/separator";

export function EmailVerificationSuccessForm() {
  const { data: session, isPending } = useSession();
  const searchParams = useSearchParams();
  
  const successParam = searchParams.get("success");
  const isVerified = session?.user?.emailVerified || successParam === "true";
  const returnTo = getReturnToFromSearchParams(searchParams);
  const targetHref = returnTo && isValidReturnTo(returnTo) ? returnTo : "/dashboard";

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      {/* LINKE SEITE: Content */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-8 bg-background">
        <div className="mx-auto grid w-full max-w-[400px] gap-8">
          <div className="lg:hidden flex justify-center mb-4">
            <Logo className="h-8 w-auto text-primary" />
          </div>

          {isPending ? (
            /* LOADING STATE */
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left gap-6">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <div className="space-y-2">
                <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">
                  Wird geprüft...
                </h1>
                <p className="text-slate-500 font-medium">
                  Einen Moment, wir validieren Ihren Zugang.
                </p>
              </div>
            </div>
          ) : !isVerified ? (
            /* ERROR STATE */
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-2 text-center lg:text-left">
                <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-2 mx-auto lg:mx-0">
                   <CircleAlert className="w-6 h-6 text-red-600" />
                </div>
                <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">
                  Fehlgeschlagen
                </h1>
                <p className="text-slate-500 font-medium">
                  Der Link ist leider abgelaufen oder ungültig.
                </p>
              </div>
              <Link href="/sign-up" className="w-full">
                <Button variant="outline" className="w-full h-11 font-bold tracking-tight border-slate-200">
                  Neuen Link anfordern
                </Button>
              </Link>
            </div>
          ) : (
            /* SUCCESS STATE */
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-2 text-center lg:text-left">
                <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center mb-2 mx-auto lg:mx-0 animate-in zoom-in duration-500">
                   <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase leading-none">
                  E-Mail <br /> bestätigt.
                </h1>
                <p className="text-slate-500 font-medium mt-2">
                  Ihr Account ist jetzt vollständig einsatzbereit.
                </p>
              </div>
              
              <Link href={targetHref} className="w-full group">
                <Button className="w-full h-11 bg-primary hover:opacity-90 text-white font-bold tracking-tight shadow-lg shadow-primary/20 transition-all">
                  Zum Dashboard starten
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          )}

          <div className="text-center text-xs text-muted-foreground mt-4">
            Brauchen Sie Hilfe? <Link href="#" className="underline hover:text-primary">Support kontaktieren</Link>
          </div>
        </div>
      </div>

      {/* RECHTE SEITE: Branding (Identisch zur Register-Page für Konsistenz) */}
      <div className="hidden lg:flex flex-col justify-between bg-primary p-12 relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-primary/60" />
        <div className="pointer-events-none absolute inset-0 opacity-25 [background-size:32px_32px] [background-image:linear-gradient(to_right,rgba(255,255,255,0.25)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.25)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_0%,rgba(0,0,0,1)_25%,rgba(0,0,0,0.6)_55%,rgba(0,0,0,0)_100%)]" />
        <div className="absolute -right-20 -bottom-20 w-[600px] h-[600px] bg-indigo-500 rounded-full blur-[120px] opacity-40 mix-blend-overlay" />

        <div className="relative z-10 flex">
          <Logo className="h-12 w-auto text-white" />
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-black tracking-tighter mb-4 leading-tight uppercase">
            Die Plattform für <br/> digitalen Transporteinkauf.
          </h2>
          <Separator className="my-4 opacity-20" />
        </div>
      </div>
    </div>
  );
}