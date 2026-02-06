"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Loader2, AlertTriangle } from "lucide-react";

export default function DeleteAccountCard() {
  const router = useRouter();
  const { isPending: sessionPending } = useSession();
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDelete = async () => {
    if (!password.trim()) {
      toast.error("Bitte geben Sie Ihr Passwort zur Bestätigung ein.");
      return;
    }

    setIsDeleting(true);
    
    const result = await authClient.deleteUser({
      password: password.trim(),
    });

    if (result.error) {
      toast.error(result.error.message || "Fehler beim Löschen des Kontos.");
      setIsDeleting(false);
    } else {
      toast.success("Konto wurde erfolgreich gelöscht.");
      // Weiterleitung zur Startseite oder Login nach dem Löschen
      router.push("/");
    }
  };

  if (!mounted) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-10">
      <div>
        <h3 className="text-sm font-semibold text-destructive flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Konto löschen
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Dies wird Ihr Konto und alle damit verbundenen Daten dauerhaft entfernen. 
          Dieser Vorgang kann nicht rückgängig gemacht werden.
        </p>
      </div>

      <div className="md:col-span-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" disabled={sessionPending}>
              Meinen Account löschen
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sind Sie absolut sicher?</AlertDialogTitle>
              <AlertDialogDescription>
                Diese Aktion ist endgültig. Um fortzufahren, geben Sie bitte Ihr aktuelles Passwort ein.
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <div className="py-4">
              <Input
                type="password"
                placeholder="Passwort bestätigen"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isDeleting}
                className="focus-visible:ring-destructive"
              />
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Abbrechen</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault(); // Verhindert das automatische Schließen, damit wir den Call abwarten können
                  handleDelete();
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeleting || !password.trim()}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Wird gelöscht...
                  </>
                ) : (
                  "Konto permanent löschen"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}