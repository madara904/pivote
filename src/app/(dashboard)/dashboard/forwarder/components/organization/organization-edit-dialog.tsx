"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { UseFormReturn } from "react-hook-form";
import type { OrgForm } from "../organization-create-form";

interface OrganizationEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<OrgForm>;
  onSubmit: (data: OrgForm) => void;
  isSubmitting: boolean;
  canEdit: boolean;
}

export default function OrganizationEditDialog({
  open,
  onOpenChange,
  form,
  onSubmit,
  isSubmitting,
  canEdit,
}: OrganizationEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Organisation bearbeiten</DialogTitle>
          <DialogDescription>Ändern Sie die Organisationsdetails.</DialogDescription>
        </DialogHeader>
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
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting || !canEdit}>
              {isSubmitting ? "Bearbeite..." : "Speichern"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
