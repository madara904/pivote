"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Organisation bearbeiten</DialogTitle>
          <DialogDescription>
            Sie können Name, Kontakt, Adresse, Beschreibung, Registrierungsdaten und Typ anpassen.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input placeholder="Beispiel Industrie AG" {...form.register("name")} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input placeholder="beispiel@industrie.com" {...form.register("email")} />
          </div>
          <div className="space-y-2">
            <Label>Beschreibung</Label>
            <Textarea placeholder="Kurzbeschreibung der Organisation" rows={3} {...form.register("description")} />
          </div>
          <div className="space-y-2">
            <Label>Telefon</Label>
            <Input placeholder="01234567899" {...form.register("phone")} />
          </div>
          <div className="space-y-2">
            <Label>Website</Label>
            <Input placeholder="https://musterweb.com" {...form.register("website")} />
          </div>
          <div className="space-y-2">
            <Label>Adresse</Label>
            <Input placeholder="Musterstraße 12" {...form.register("address")} />
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Stadt</Label>
              <Input placeholder="Nürnberg" {...form.register("city")} />
            </div>
            <div className="space-y-2">
              <Label>PLZ</Label>
              <Input placeholder="90400" {...form.register("postalCode")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Land</Label>
            <Input placeholder="Deutschland" {...form.register("country")} />
          </div>
          <div className="space-y-2">
            <Label>USt-IdNr.</Label>
            <Input placeholder="DE545454545" {...form.register("vatNumber")} />
          </div>
          <div className="space-y-2">
            <Label>Handelsregisternummer</Label>
            <Input placeholder="5000000000" {...form.register("registrationNumber")} />
          </div>
          <div className="space-y-2">
            <Label>Typ</Label>
            <select
              {...form.register("type")}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="shipper">Shipper</option>
              <option value="forwarder">Forwarder</option>
            </select>
          </div>
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
