"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Logo from "@/components/logo";
import { authClient } from "@/lib/auth-client";
import { getReturnToFromSearchParams } from "@/lib/redirect-utils";

const OTP_LENGTH = 6;

export default function TwoFactorForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = getReturnToFromSearchParams(searchParams);
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasAutoSubmitted = useRef(false);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canSubmit = useMemo(() => code.trim().length === OTP_LENGTH, [code]);

  useEffect(() => {
    void handleSendOtp();
  }, []);

  const handleSendOtp = async () => {
    setIsSending(true);
    setErrorMessage(null);
    const result = await authClient.twoFactor.sendOtp();
    if (result.error) {
      setErrorMessage(result.error.message || "Code konnte nicht gesendet werden.");
      if (result.error.status === 401 || result.error.status === 403) {
        router.push("/sign-in");
      }
      setIsSending(false);
      return;
    }
    setIsSending(false);
  };

  const handleVerify = async () => {
    if (!canSubmit) {
      setErrorMessage("Bitte geben Sie den 6-stelligen Code ein.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    const result = await authClient.twoFactor.verifyOtp({
      code: code.trim(),
    });
    if (result.error) {
      setErrorMessage(result.error.message || "Code konnte nicht verifiziert werden.");
      setIsSubmitting(false);
      return;
    }

    window.location.href = returnTo ?? "/dashboard";
    setIsSubmitting(false);
  };

  useEffect(() => {
    if (!canSubmit) {
      hasAutoSubmitted.current = false;
      return;
    }
    if (isSubmitting || hasAutoSubmitted.current) return;
    hasAutoSubmitted.current = true;
    void handleVerify();
  }, [canSubmit, isSubmitting]);

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12 px-4 sm:px-8 bg-background">
        <div className="mx-auto grid w-full max-w-[420px] gap-8">
          <div className="lg:hidden flex sm:justify-center mb-4">
            <Logo className="h-12 w-auto text-primary" />
          </div>

          <div className="flex flex-col gap-2 text-left">
            <h1 className="text-3xl font-black tracking-tighter text-slate-900">
              Zwei-Faktor-Code
            </h1>
          </div>

          {errorMessage && (
            <Alert variant="destructive">
              <AlertTitle>Fehler</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={(event) => event.preventDefault()} className="grid gap-5">
            <div className="flex flex-col gap-3">
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-500">
                Sicherheitscode
              </label>
              <InputOTP
                maxLength={OTP_LENGTH}
                value={code}
                onChange={setCode}
                containerClassName="justify-start"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <p className="text-slate-500 font-medium text-sm">
              Wir haben einen Sicherheitscode an Ihre E-Mail-Adresse gesendet.
            </p>

            <Button
              type="button"
              variant="outline"
              className="w-full h-11 font-bold tracking-tight"
              onClick={handleSendOtp}
              disabled={isSending || isSubmitting}
            >
              {isSending || isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Code erneut senden
            </Button>
          </form>
        </div>
      </div>

      <div className="hidden lg:flex flex-col justify-between bg-primary p-12 relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-primary/60" />
        <div className="pointer-events-none absolute inset-0 opacity-25 [background-size:32px_32px] [background-image:linear-gradient(to_right,rgba(255,255,255,0.25)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.25)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_0%,rgba(0,0,0,1)_25%,rgba(0,0,0,0.6)_55%,rgba(0,0,0,0)_100%)]" />
        <div className="absolute -right-20 -bottom-20 w-[600px] h-[600px] bg-indigo-500 rounded-full blur-[120px] opacity-40 mix-blend-overlay" />

        <div className="relative z-10 flex">
          <div className="w-fit rounded-full">
            <Logo className="h-12 w-auto text-white" />
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-black tracking-tighter mb-4 leading-tight uppercase">
            Mehr Sicherheit <br /> fuer Ihr Konto.
          </h2>
          <Separator className="my-4" />
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4" />
            <span>Einmal-Code per E-Mail</span>
          </div>
        </div>
      </div>
    </div>
  );
}
