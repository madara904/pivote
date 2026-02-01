"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { authClient, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function UpdateNameCard() {
  const { data, refetch, isPending } = useSession();
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const hasLoaded = useRef(false);
  const initialName = useRef("");
  const [hasTouched, setHasTouched] = useState(false);

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
    }
    setIsSaving(false);
  };

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>Benutzername</CardTitle>
        <CardDescription>Aktualisieren Sie Ihren Anzeigenamen.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Input
          value={name}
          onChange={(event) => {
            if (!hasTouched) setHasTouched(true);
            setName(event.target.value);
          }}
          placeholder="Ihr Name"
          disabled={isPending}
        />
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={isSaving || isPending || !hasTouched || !isDirty}>
          {isSaving ? "Speichern..." : "Speichern"}
        </Button>
      </CardFooter>
    </Card>
  );
}
