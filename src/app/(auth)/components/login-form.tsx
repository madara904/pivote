"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { CircleAlert } from "lucide-react";

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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getErrorMessage, signIn } from "@/lib/auth-client";
import { toast } from "sonner";

const formSchema = z.object({
  email: z.string().email({ message: "Email ist erforderlich!" }),
  password: z.string().min(1, { message: "Passwort ist erforderlich!" }),
});

export const LoginForm = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    setError(null);
    setLoading(true);

    signIn.email(
      {
        email: data.email,
        password: data.password,
      },
      {
        onSuccess: () => {
          router.push("/dashboard");
          setLoading(false);
          toast.success("Anmeldung erfolgreich! Sie werden in Kürze weitergeleitet...")
        },
        onError: ({ error }) => {
          toast.error(error.code ? getErrorMessage(error.code) : error.message)
          setError(error.code ? getErrorMessage(error.code) : error.message);
          setLoading(false);
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center space-y-2">
                  <h1 className="text-2xl font-bold tracking-tight">
                    Willkommen zurück
                  </h1>
                  <p className="text-muted-foreground text-wrap text-sm">
                    Melden Sie sich bei Ihrem Konto an
                  </p>
                </div>
                <div className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="max@mustermann.de"
                            className="h-10"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Passwort
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="********"
                            className="h-10"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
                {!!error && (
                  <Alert className="bg-destructive/10 border-none animate-in fade-in slide-in-from-top-2 duration-300">
                    <CircleAlert className="!text-destructive" />
                    <AlertTitle className="text-sm">{error}</AlertTitle>
                  </Alert>
                )}
                <div className="items-center">
                  <a
                    href="#"
                    className="ml-auto text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Passwort vergessen?
                  </a>
                </div>
                <Button
                  type="submit"
                  className="w-full h-10 font-medium"
                  disabled={loading}
                >
                  {loading ? "Wird angemeldet..." : "Anmelden"}
                </Button>
                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                  <span className="bg-card text-muted-foreground relative z-10 px-2 text-xs">
                    Oder fortfahren mit
                  </span>
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    form.clearErrors();
                    signIn.social({ provider: "github", callbackURL: "/dashboard"});
                  }}
                  variant="outline"
                  className={cn("w-full h-10 gap-2")}
                  disabled={loading}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1em"
                    height="1em"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"
                    ></path>
                  </svg>
                  Github
                </Button>
                <div className="text-center text-sm">
                  Noch kein Konto?{" "}
                  <Link
                    href="/sign-up"
                    className="underline underline-offset-4"
                  >
                    Registrieren
                  </Link>
                </div>
              </div>
            </form>
          </Form>
          <div className="bg-radial from-primary/40 via-primary/90 to-primary relative hidden md:flex flex-col gap-y-4 items-center justify-center">
            <img
              src="/logo.svg"
              alt="Logo"
              className="w-32 h-32 brightness-0 invert drop-shadow-xl"
            />
            <p className="text-3xl text-white text-center font-bold drop-shadow-xl">
              Pivote
            </p>
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        Durch die Anmeldung stimmen Sie unseren{" "}
        <a href="#">Nutzungsbedingungen</a> und{" "}
        <a href="#">Datenschutzrichtlinien</a> zu.
      </div>
    </div>
  );
};
