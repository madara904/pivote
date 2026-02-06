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
import type { OrgForm } from "./organization-create-form";
import { Loader2 } from "lucide-react";

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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl">Organisation bearbeiten</DialogTitle>
          <DialogDescription>
            Passen Sie die Stammdaten und Kontaktinformationen Ihrer Organisation an.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6">
          {/* Basis Informationen */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Unternehmensname</Label>
                <Input 
                  id="name"
                  placeholder="Beispiel Industrie AG" 
                  {...form.register("name")} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Geschäfts-E-Mail</Label>
                <Input 
                  id="email"
                  type="email"
                  placeholder="beispiel@industrie.com" 
                  {...form.register("email")} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea 
                id="description"
                placeholder="Kurzbeschreibung der Organisation" 
                rows={2} 
                className="resize-none"
                {...form.register("description")} 
              />
            </div>
          </div>

          <div className="h-px bg-border/50" />

          {/* Kontakt & Web */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input id="phone" placeholder="+49 123 456789" {...form.register("phone")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" placeholder="https://musterweb.com" {...form.register("website")} />
            </div>
          </div>

          <div className="h-px bg-border/50" />

          {/* Adresse */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Straße & Hausnummer</Label>
              <Input id="address" placeholder="Musterstraße 12" {...form.register("address")} />
            </div>
            
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="postalCode">PLZ</Label>
                <Input id="postalCode" placeholder="90400" {...form.register("postalCode")} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="city">Stadt</Label>
                <Input id="city" placeholder="Nürnberg" {...form.register("city")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Land</Label>
              <Input id="country" placeholder="Deutschland" {...form.register("country")} />
            </div>
          </div>

          <div className="h-px bg-border/50" />

          {/* Rechtliches */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="vatNumber">USt-IdNr.</Label>
              <Input id="vatNumber" placeholder="DE123456789" {...form.register("vatNumber")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registrationNumber">Handelsregisternummer</Label>
              <Input id="registrationNumber" placeholder="HRB 12345" {...form.register("registrationNumber")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Organisationstyp</Label>
            <select
              id="type"
              {...form.register("type")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="shipper">Shipper (Versender)</option>
              <option value="forwarder">Forwarder (Spedition)</option>
            </select>
          </div>

          <DialogFooter className="bg-muted/30 -mx-6 -mb-6 p-6 border-t mt-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={isSubmitting || !canEdit} className="min-w-[120px]">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Speichere...
                </>
              ) : (
                "Änderungen speichern"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}