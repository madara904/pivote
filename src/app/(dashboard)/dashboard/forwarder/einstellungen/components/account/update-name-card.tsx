"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { authClient, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export default function UpdateNameCard() {
  const { data, refetch, isPending } = useSession();
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const hasLoaded = useRef(false);
  const initialName = useRef("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!hasLoaded.current && data?.user?.name !== undefined) {
      const nextName = data.user.name ?? "";
      setName(nextName);
      initialName.current = nextName;
      hasLoaded.current = true;
    }
  }, [data?.user?.name]);

  const isDirty = name.trim() !== initialName.current.trim();

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Bitte geben Sie einen Namen ein.");
      return;
    }

    setIsSaving(true);
    const result = await authClient.updateUser({ name: name.trim() });
    if (result.error) {
      toast.error(result.error.message || "Name konnte nicht aktualisiert werden.");
    } else {
      toast.success("Name aktualisiert.");
      await refetch();
      initialName.current = name.trim();
    }
    setIsSaving(false);
  };

  if (!mounted) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Anzeigename</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Ihr Name, wie er innerhalb der Plattform für Kollegen angezeigt wird.
        </p>
      </div>
      <div className="md:col-span-2 max-w-md space-y-4">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ihr Name"
          disabled={isPending || isSaving}
        />
        <Button 
          onClick={handleSave} 
          disabled={!isDirty || isSaving || isPending}
          size="sm"
        >
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Änderungen speichern
        </Button>
      </div>
    </div>
  );
}