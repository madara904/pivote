"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { CircleAlert, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { CheckCircle, BadgeCheck, Clock, Users } from "lucide-react";
import * as React from "react";
import { useState } from "react";

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
import { signUp, signIn } from "@/lib/auth-client";
import Logo from "@/components/logo";
import { useRouter } from "next/navigation";

const formSchema = z
  .object({
    name: z.string().min(1, { message: "Name ist erforderlich" }),
    email: z.string().email({ message: "Email ist erforderlich!" }),
    password: z.string().min(1, { message: "Passwort ist erforderlich!" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Passwort ist erforderlich!" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwörter stimmen nicht überein!",
    path: ["confirmPassword"],
  });

export const RegisterForm = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const router = useRouter();


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    setError(null);
    setLoading(true);

    signUp.email(
      {
        name: data.name,
        email: data.email,
        password: data.password,
      },
      {
        onSuccess: () => {
          setLoading(false);
          router.push("/onboarding");
        },
        onError: ({ error }) => {
          const errorMessage = error.message;
          setError(errorMessage);
          setLoading(false);
        },
      }
    );
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <>
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-center flex-col">
        <div className="flex items-center justify-center rounded-full bg-primary w-14 h-14">
          <Logo className="h-8 mt-2 text-primary-foreground" />
        </div>
        <h1 className="text-3xl pt-2">Pivote</h1>
      </div>
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            {/* Logo only for mobile (above form) */}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="p-6 md:p-8"
              >
                <div className="flex flex-col gap-6">
                  <div className="grid gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            Name
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute left-0 top-1 bottom-1 flex items-center pl-3 pr-3 border-r border-border">
                                <User className="text-muted-foreground h-4 w-4" />
                              </div>
                              <Input
                                type="text"
                                placeholder="Max Mustermann"
                                className="h-10 pl-12"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            Email
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute left-0 top-1 bottom-1 flex items-center pl-3 pr-3 border-r border-border">
                                <Mail className="text-muted-foreground h-4 w-4" />
                              </div>
                              <Input
                                type="email"
                                placeholder="max@mustermann.de"
                                className="h-10 pl-12"
                                {...field}
                              />
                            </div>
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
                            <div className="relative">
                              <div className="absolute left-0 top-1 bottom-1 flex items-center pl-3 pr-3 border-r border-border">
                                <Lock className="text-muted-foreground h-4 w-4" />
                              </div>
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="********"
                                className="h-10 pl-12 pr-10"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                tabIndex={-1}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4 cursor-pointer" />
                                ) : (
                                  <Eye className="h-4 w-4 cursor-pointer" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            Passwort wiederholen
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute left-0 top-1 bottom-1 flex items-center pl-3 pr-3 border-r border-border">
                                <Lock className="text-muted-foreground h-4 w-4" />
                              </div>
                              <Input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="********"
                                className="h-10 pl-12 pr-10"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={toggleConfirmPasswordVisibility}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                tabIndex={-1}
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-4 w-4 cursor-pointer" />
                                ) : (
                                  <Eye className="h-4 w-4 cursor-pointer" />
                                )}
                              </button>
                            </div>
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
                  <Button
                    type="submit"
                    className="w-full h-10 font-medium"
                    disabled={loading}
                  >
                    {loading ? "Wird registriert..." : "Registrieren"}
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
                      signIn.social({ provider: "github" });
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
                    Sie sind bereits registriert?{" "}
                    <Link
                      href="/sign-in"
                      className="text-primary hover:text-primary/90 transition-colors font-medium"
                    >
                      Anmelden
                    </Link>
                  </div>
                </div>
              </form>
            </Form>
            <div className="relative hidden md:flex flex-col gap-y-6 items-center bg-gradient-to-r from-primary/70 to-primary/95 py-24 text-primary-foreground">
              <h1 className="text-3xl font-bold text-center mb-2">
                Ihre Vorteile mit Pivote
              </h1>
              <ul className="space-y-4 w-full max-w-xs font-bold">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-secondary" />
                  <span>Schneller Zugang zu Top-Transporteuren</span>
                </li>
                <li className="flex items-center gap-3">
                  <BadgeCheck className="w-6 h-6 text-secondary" />
                  <span>Transparente Preise & einfache Buchung</span>
                </li>
                <li className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-secondary" />
                  <span>24/7 Support für Ihre Anliegen</span>
                </li>
                <li className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-secondary" />
                  <span>Vertrauen von führenden Logistikern</span>
                </li>
              </ul>
              <div className="absolute bottom-0 left-5 h-24 w-24 rounded-full bg-white bg-gradient-to-l from-white to-primary blur-xl opacity-45"></div>
              <div className="absolute -top-10 left-1/2 h-24 w-24 rounded-full bg-white bg-gradient-to-b from-white to-primary blur-lg opacity-45"></div>
            </div>
          </CardContent>
        </Card>
        <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
          Durch die Anmeldung stimmen Sie unseren{" "}
          <a href="#">Nutzungsbedingungen</a> und{" "}
          <a href="#">Datenschutzrichtlinien</a> zu.
        </div>
      </div>
    </>
  );
};
