"use client";

import { Button } from "@/components/ui/button";
import { IconInput } from "@/components/ui/icon-input";
import { Separator } from "@/components/ui/separator";
import { CircleAlert, Mail, ArrowLeft, CheckCircle } from "lucide-react";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useState } from "react";
import { requestPasswordReset } from "@/lib/auth-client";
import { toast } from "sonner";
import Logo from "@/components/logo";
import { useSearchParams } from "next/navigation";
import { buildSignInUrl, getReturnToFromSearchParams } from "@/lib/redirect-utils";

const formSchema = z.object({
  email: z.string().email({ message: "Email ist erforderlich!" }),
});

export const ForgotPasswordForm = () => {
  const searchParams = useSearchParams();
  const returnTo = getReturnToFromSearchParams(searchParams);
  const resetError = searchParams?.get("error");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    setError(null);
    setLoading(true);

    requestPasswordReset(
      {
        email: data.email,
        redirectTo: "/reset",
      },
      {
        onSuccess: () => {
          setSuccess(true);
          setLoading(false);
          toast.success("Passwort-Reset E-Mail wurde gesendet!");
        },
        onError: ({ error }: { error: Error }) => {
          const errorMessage = error.message || "Unbekannter Fehler";
          toast.error(errorMessage);
          setError(errorMessage);
          setLoading(false);
        },
      }
    );
  };

  const sidePanel = (
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
            Die Plattform für <br/> digitalen Transporteinkauf.
          </h2>
          <Separator className="my-4" />
          <div className="p-4">
          </div>
        </div>
      </div>
  );

  if (success) {
    return (
      <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
        <div className="flex items-center justify-center py-12 px-4 sm:px-8 bg-background">
          <div className="mx-auto grid w-full max-w-[400px] gap-8 text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-4">
              <Logo className="h-8 w-auto text-primary" />
            </div>

            <div className="flex flex-col items-center lg:items-start gap-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100">
                <CheckCircle className="w-7 h-7 text-emerald-600" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-black tracking-tighter text-slate-900">
                  E-Mail gesendet
                </h1>
                <p className="text-slate-500 font-medium text-sm">
                  Wir haben Ihnen eine E-Mail mit einem Link zum Zurücksetzen Ihres
                  Passworts gesendet.
                </p>
              </div>
            </div>

            <div className="grid gap-3">
              <Link href={buildSignInUrl(returnTo)}>
                <Button className="w-full h-11 bg-primary hover:opacity-90 text-white font-bold tracking-tight shadow-lg shadow-primary/20 transition-all">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Zurück zur Anmeldung
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => {
                  setSuccess(false);
                  form.reset();
                }}
                className="w-full h-11"
              >
                Erneut senden
              </Button>
            </div>
          </div>
        </div>

        {sidePanel}
      </div>
    );
  }

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12 px-4 sm:px-8 bg-background">
        <div className="mx-auto grid w-full max-w-[380px] gap-8">
          <div className="lg:hidden flex sm:justify-center mb-4">
            <Logo className="h-12 w-auto text-primary" />
          </div>

          <div className="flex flex-col gap-2 text-center lg:text-left">
            <h1 className="text-3xl font-black tracking-tighter text-slate-900">
              Passwort vergessen?
            </h1>
            <p className="text-slate-500 font-medium text-sm">
              Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum
              Zurücksetzen Ihres Passworts.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] uppercase font-black tracking-widest text-slate-500">
                      Email Adresse
                    </FormLabel>
                    <FormControl>
                      <IconInput
                        icon={<Mail className="h-4 w-4" />}
                        type="email"
                        placeholder="max@mustermann.de"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {resetError && (
                <Alert className="bg-destructive/10 border-none animate-in fade-in slide-in-from-top-2 duration-300">
                  <CircleAlert className="!text-destructive" />
                  <AlertTitle className="text-sm">
                    Der Reset-Link ist ungültig oder abgelaufen. Bitte fordern Sie einen
                    neuen Link an.
                  </AlertTitle>
                </Alert>
              )}
              {!!error && (
                <Alert className="bg-destructive/10 border-none animate-in fade-in slide-in-from-top-2 duration-300">
                  <CircleAlert className="!text-destructive" />
                  <AlertTitle className="text-sm">{error}</AlertTitle>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-primary hover:opacity-90 text-white font-bold tracking-tight shadow-lg shadow-primary/20 transition-all"
                disabled={loading}
              >
                {loading ? "Wird gesendet..." : "Reset-Link senden"}
              </Button>
            </form>
          </Form>

          <div className="text-center text-sm">
            <Link
              href={buildSignInUrl(returnTo)}
              className="font-bold text-primary hover:text-primary/90 inline-flex items-center group"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Zurück zur Anmeldung
            </Link>
          </div>
        </div>
      </div>

      {sidePanel}
    </div>
  );
};
