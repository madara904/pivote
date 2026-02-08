"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { IconInput } from "@/components/ui/icon-input";
import { Loader2, Mail, Lock, ArrowRight } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { authClient, signIn } from "@/lib/auth-client";
import { toast } from "sonner";
import Logo from "@/components/logo";
import { Separator } from "@/components/ui/separator";
import { useRouter, useSearchParams } from "next/navigation";
import { getReturnToFromSearchParams } from "@/lib/redirect-utils";

const formSchema = z.object({
  email: z.string().email({ message: "Email ist erforderlich" }),
  password: z.string().min(1, { message: "Passwort ist erforderlich" }),
});

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = getReturnToFromSearchParams(searchParams);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const result = await authClient.signIn.email({
        email: values.email,
        password: values.password,
        fetchOptions: { redirect: "manual" },
      });

      if (result.error) {
        toast.error(result.error.message);
        return;
      }

      const data = result.data as { twoFactorRedirect?: boolean } | null;
      if (data?.twoFactorRedirect) {
        const params = new URLSearchParams();
        if (returnTo) params.set("returnTo", returnTo);
        const target = params.toString() ? `/two-factor?${params.toString()}` : "/two-factor";
        router.push(target);
        return;
      }

      router.push(returnTo ?? "/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unbekannter Fehler";
      toast.error(message);
    } finally {
      setLoading(false);
    }
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
              Willkommen zurück
            </h1>
            <p className="text-slate-500 font-medium text-sm">
              Loggen Sie sich ein, um Ihre Fracht zu verwalten.
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
                        placeholder="name@firma.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-[10px] uppercase font-black tracking-widest text-slate-500">
                        Passwort
                      </FormLabel>
                      <Link href="/forgot" className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">
                        Vergessen?
                      </Link>
                    </div>
                    <FormControl>
                      <IconInput
                        icon={<Lock className="h-4 w-4" />}
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-bold tracking-tight shadow-lg shadow-primary/20 transition-all" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Anmelden
              </Button>
            </form>
          </Form>

          <div className="text-center text-sm mt-4">
            Noch keinen Account?{" "}
            <Link href="/sign-up" className="font-bold text-primary hover:text-primary/90 inline-flex items-center group">
              Jetzt registrieren <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* RECHTE SEITE: Knalliges Blau (Vibrant) */}
      <div className="hidden lg:flex flex-col justify-between bg-primary p-12 relative overflow-hidden text-white">
        
        {/* Knalliger Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-primary/60" />
        
        {/* Kachel-Overlay: oben sichtbar, nach unten ausblenden */}
        <div className="pointer-events-none absolute inset-0 opacity-25 [background-size:32px_32px] [background-image:linear-gradient(to_right,rgba(255,255,255,0.25)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.25)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_0%,rgba(0,0,0,1)_25%,rgba(0,0,0,0.6)_55%,rgba(0,0,0,0)_100%)]" />
        
          
        
        {/* Großer Glow Effekt */}
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

    </div>
  );
}