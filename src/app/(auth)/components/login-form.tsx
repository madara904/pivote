"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { IconInput } from "@/components/ui/icon-input";
import {
  Loader2,
  Mail,
  Lock,
  ArrowRight,
} from "lucide-react";
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
import { useForm } from "react-hook-form";
import Link from "next/link";
import { authClient, signIn } from "@/lib/auth-client";
import { toast } from "sonner";
import Logo from "@/components/logo";
import { Separator } from "@/components/ui/separator";
import { useRouter, useSearchParams } from "next/navigation";
import { getReturnToFromSearchParams } from "@/lib/redirect-utils";
import { SelectSeparator } from "@/components/ui/select";

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
        const target = params.toString()
          ? `/two-factor?${params.toString()}`
          : "/two-factor";
        router.push(target);
        return;
      }

      router.push(returnTo ?? "/dashboard");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unbekannter Fehler";
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
              Loggen Sie sich ein um aufs Dashboard zuzugreifen.
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
                      <Link
                        href="/forgot"
                        className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest"
                      >
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
              <Button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-bold tracking-tight shadow-lg shadow-primary/20 transition-all"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Anmelden
              </Button>

              <SelectSeparator />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={loading}
                onClick={() => signIn.social({
                  provider: "github",
                })}
              >
                <svg
                  width="98"
                  height="96"
                  viewBox="0 0 98 96"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#github-icon-clip)">
                    <path
                      d="M41.4395 69.3848C28.8066 67.8535 19.9062 58.7617 19.9062 46.9902C19.9062 42.2051 21.6289 37.0371 24.5 33.5918C23.2559 30.4336 23.4473 23.7344 24.8828 20.959C28.7109 20.4805 33.8789 22.4902 36.9414 25.2656C40.5781 24.1172 44.4062 23.543 49.0957 23.543C53.7852 23.543 57.6133 24.1172 61.0586 25.1699C64.0254 22.4902 69.2891 20.4805 73.1172 20.959C74.457 23.543 74.6484 30.2422 73.4043 33.4961C76.4668 37.1328 78.0937 42.0137 78.0937 46.9902C78.0937 58.7617 69.1934 67.6621 56.3691 69.2891C59.623 71.3945 61.8242 75.9883 61.8242 81.252L61.8242 91.2051C61.8242 94.0762 64.2168 95.7031 67.0879 94.5547C84.4102 87.9512 98 70.6289 98 49.1914C98 22.1074 75.9883 6.69539e-07 48.9043 4.309e-07C21.8203 1.92261e-07 -1.9479e-07 22.1074 -4.3343e-07 49.1914C-6.20631e-07 70.4375 13.4941 88.0469 31.6777 94.6504C34.2617 95.6074 36.75 93.8848 36.75 91.3008L36.75 83.6445C35.4102 84.2188 33.6875 84.6016 32.1562 84.6016C25.8398 84.6016 22.1074 81.1563 19.4277 74.7441C18.375 72.1602 17.2266 70.6289 15.0254 70.3418C13.877 70.2461 13.4941 69.7676 13.4941 69.1934C13.4941 68.0449 15.4082 67.1836 17.3223 67.1836C20.0977 67.1836 22.4902 68.9063 24.9785 72.4473C26.8926 75.2227 28.9023 76.4668 31.2949 76.4668C33.6875 76.4668 35.2187 75.6055 37.4199 73.4043C39.0469 71.7773 40.291 70.3418 41.4395 69.3848Z"
                      fill="black"
                    />
                  </g>
                  <defs>
                    <clipPath id="github-icon-clip">
                      <rect width="98" height="96" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                Mit GitHub anmelden
              </Button>
            </form>
          </Form>

          <div className="text-center text-sm mt-4">
            Noch keinen Account?{" "}
            <Link
              href="/sign-up"
              className="font-bold text-primary hover:text-primary/90 inline-flex items-center group"
            >
              Jetzt registrieren{" "}
              <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
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
            Die Plattform für <br /> digitalen Transporteinkauf.
          </h2>
          <Separator className="my-4" />
          <div className="p-4"></div>
        </div>
      </div>
    </div>
  );
}
