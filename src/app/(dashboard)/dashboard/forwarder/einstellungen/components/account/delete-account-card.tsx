"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

export default function DeleteAccountCard() {
  const router = useRouter();
  const { isPending } = useSession();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!password.trim()) {
      setErrorMessage("Bitte Passwort eingeben, um das Konto zu löschen.");
      return;
    }

    setIsDeleting(true);
    setErrorMessage(null);
    const result = await authClient.deleteUser({
      password: password.trim(),
      callbackURL: "/",
    });

    if (result.error) {
      const message = result.error.message || "Konto konnte nicht gelöscht werden.";
      toast.error(message);
      setErrorMessage(message);
      setIsDeleting(false);
      return;
    }

    const message = result.data?.message;
    if (message === "Verification email sent") {
      toast.success("Bestätigungs-E-Mail wurde gesendet.");
      setDialogOpen(false);
    } else {
      toast.success("Konto wurde gelöscht.");
      router.push("/");
    }
    setIsDeleting(false);
  };

  return (
    <Card className="shadow-none border-destructive/30">
      <CardHeader>
        <CardTitle className="text-destructive">Konto löschen</CardTitle>
        <CardDescription>
          Löscht Ihr Konto dauerhaft. Diese Aktion kann nicht rückgängig gemacht werden.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2" />
      <CardFooter>
        <AlertDialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setPassword("");
              setErrorMessage(null);
              setIsDeleting(false);
            }
          }}
        >
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isDeleting || isPending}>
              Konto löschen
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Konto löschen</AlertDialogTitle>
              <AlertDialogDescription>
                Möchten Sie Ihr Konto wirklich löschen? Dieser Vorgang ist endgültig.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2">
              <Input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Passwort bestätigen"
                type="password"
                disabled={isDeleting || isPending}
              />
              {errorMessage && (
                <p className="text-sm text-destructive">{errorMessage}</p>
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting || isPending}>
                Abbrechen
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeleting || isPending || !password.trim()}
                onClick={async (event) => {
                  event.preventDefault();
                  await handleDelete();
                }}
              >
                {isDeleting ? "Wird gelöscht..." : "Konto löschen"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
