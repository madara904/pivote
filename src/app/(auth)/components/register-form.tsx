"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { IconInput } from "@/components/ui/icon-input";
import { Separator } from "@/components/ui/separator";
import { Loader2, Mail, Lock, User, CheckCircle2, ArrowRight } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/auth-client";
import { toast } from "sonner";
import Logo from "@/components/logo";

const formSchema = z.object({
  name: z.string().min(1, { message: "Name erforderlich" }),
  email: z.string().email({ message: "Email erforderlich" }),
  password: z.string().min(8, { message: "Min. 8 Zeichen" }),
});

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const result = await signUp.email({
      email: values.email,
      password: values.password,
      name: values.name,
      callbackURL: "/dashboard",
      fetchOptions: {
        onResponse: () => setLoading(false),
        onRequest: () => setLoading(true),
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
      },
    });
    if (!result?.error) {
      router.push("/dashboard");
    }
  }

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12 px-4 sm:px-8 bg-background">
        <div className="mx-auto grid w-full max-w-[380px] gap-8">
          <div className="lg:hidden flex sm:justify-center mb-4">
            <Logo className="h-12 w-auto text-primary" />
          </div>

          <div className="flex flex-col gap-2  lg:text-left">
            <h1 className="text-3xl font-black tracking-tighter text-slate-900">
              Account erstellen
            </h1>
            <p className="text-slate-500 font-medium text-sm">
              Erstellen Sie Ihren Account in wenigen Sekunden.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] uppercase font-black tracking-widest text-slate-500">
                      Name
                    </FormLabel>
                    <FormControl>
                      <IconInput
                        icon={<User className="h-4 w-4" />}
                        placeholder="Max Mustermann"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                    <FormLabel className="text-[10px] uppercase font-black tracking-widest text-slate-500">
                      Passwort
                    </FormLabel>
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
                className="w-full h-11 bg-primary hover:opacity-90 text-white font-bold tracking-tight shadow-lg shadow-primary/20 transition-all"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Account erstellen
              </Button>
            </form>
          </Form>

          <div className="text-center text-xs text-muted-foreground mt-2">
            Mit der Anmeldung akzeptieren Sie unsere{" "}
            <Link href="#" className="underline hover:text-primary">
              AGBs
            </Link>{" "}
            und{" "}
            <Link href="#" className="underline hover:text-primary">
              Datenschutzrichtlinien
            </Link>
            .
          </div>

          <div className="text-center text-sm mt-4">
            <Link
              href="/sign-in"
              className="font-bold text-primary hover:text-primary/90 inline-flex items-center group"
            >
              Bereits registriert? Anmelden{" "}
              <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
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
  <h2 className="text-4xl font-black tracking-tighter mb-8 leading-[1.1] uppercase">
    Einfach Pivote.
  </h2>
  
  <div className="space-y-6">
    {[
      { title: "Frachtanfragen verwalten", desc: "Zentral und in Echtzeit steuern." },
      { title: "Transportnetzwerk aufbauen", desc: "Verbinden Sie sich mit Partnern weltweit." },
      { title: "Automatisierte Prozesse", desc: "Sparen Sie Zeit durch intelligente Workflows." },
    ].map((item, i) => (
      <div key={i} className="flex items-start gap-4 group">
        <div className="mt-1 h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
          <CheckCircle2 className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-white leading-none mb-1">{item.title}</h3>
          <p className="text-white/60 text-sm font-medium">{item.desc}</p>
        </div>
      </div>
    ))}
  </div>
</div>
      </div>
    </div>
  );
}