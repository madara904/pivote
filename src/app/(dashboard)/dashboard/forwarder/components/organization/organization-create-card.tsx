"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { UseFormReturn } from "react-hook-form";
import type { OrgForm } from "../organization-create-form";

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

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>Organisation erstellen</CardTitle>
        <CardDescription>Lege eine neue Organisation an.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <Input placeholder="Name" {...form.register("name")} />
          <Input placeholder="Email" {...form.register("email")} />
          <Input placeholder="USt-IdNr." {...form.register("vatNumber")} />
          <select
            {...form.register("type")}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="shipper">Shipper</option>
            <option value="forwarder">Forwarder</option>
          </select>
          <CardFooter className="px-0">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Erstellen..." : "Organisation erstellen"}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
