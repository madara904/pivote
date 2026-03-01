"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { authClient, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, User } from "lucide-react";
import { SettingsCard } from "../settings-card";

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
    <SettingsCard
      title="Anzeigename"
      description="Ihr Name, wie er innerhalb der Plattform für Kollegen angezeigt wird."
      icon={User}
    >
      <div className="space-y-4">
        <Input
          className="text-[13px] h-10"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ihr Name"
          disabled={isPending || isSaving}
        />
        <Button
          onClick={handleSave}
          disabled={!isDirty || isSaving || isPending}
          size="sm"
          className="font-bold text-[11px]"
        >
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Änderungen speichern
        </Button>
      </div>
    </SettingsCard>
  );
}
