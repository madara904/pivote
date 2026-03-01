"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { UseFormReturn } from "react-hook-form";
import type { OrgForm } from "./organization-create-form";
import { Plus } from "lucide-react";
import { SettingsCard } from "../../components/settings-card";

interface OrganizationCreateCardProps {
  form: UseFormReturn<OrgForm>;
  onSubmit: (data: OrgForm) => void;
  isSubmitting: boolean;
  hidden?: boolean;
}

export default function OrganizationCreateCard({
  form,
  onSubmit,
  isSubmitting,
  hidden,
}: OrganizationCreateCardProps) {
  if (hidden) return null;
  const vatNumberValue = form.watch("vatNumber") ?? "";
  const vatDigits = vatNumberValue.replace(/^DE/i, "").replace(/\D/g, "").slice(0, 9);

  return (
    <SettingsCard
      title="Organisation erstellen"
      description="Legen Sie eine neue Organisation an."
      icon={Plus}
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Input
          className="h-10 text-[13px]"
          placeholder="Name"
          {...form.register("name")}
        />
        <Input
          className="h-10 text-[13px]"
          placeholder="Email"
          {...form.register("email")}
        />
        <div className="relative">
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[12px] text-muted-foreground">
            DE
          </span>
          <Input
            className="h-10 pl-10 text-[13px]"
            placeholder="123456789"
            inputMode="numeric"
            maxLength={9}
            value={vatDigits}
            onChange={(event) => {
              const digitsOnly = String(event.target.value ?? "")
                .replace(/\D/g, "")
                .slice(0, 9);
              form.setValue("vatNumber", digitsOnly ? `DE${digitsOnly}` : "", {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
          />
        </div>
        {form.formState.errors.vatNumber?.message && (
          <p className="text-[11px] text-destructive">
            {String(form.formState.errors.vatNumber.message)}
          </p>
        )}
        <select
          {...form.register("type")}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-[13px]"
        >
          <option value="forwarder">Forwarder (Spedition)</option>
          <option value="shipper">Shipper (Versender)</option>
        </select>
        <Button type="submit" size="sm" disabled={isSubmitting} className="font-bold text-[11px]">
          {isSubmitting ? "Erstellen..." : "Organisation erstellen"}
        </Button>
      </form>
    </SettingsCard>
  );
}
