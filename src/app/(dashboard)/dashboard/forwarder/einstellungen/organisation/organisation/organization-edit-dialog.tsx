"use client";

import { useEffect, useMemo, useState } from "react";
import { IconInput } from "@/components/ui/icon-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/responsive-modal";
import type { UseFormReturn } from "react-hook-form";
import type { OrgForm } from "./organization-create-form";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [showDiscardPrompt, setShowDiscardPrompt] = useState(false);
  const vatNumberValue = form.watch("vatNumber");
  const vatDigits = vatNumberValue.replace(/^DE/i, "").replace(/\D/g, "").slice(0, 9);
  const registrationNumberValue = form.watch("registrationNumber") ?? "";
  const registrationDigits = registrationNumberValue
    .replace(/^HRB/i, "")
    .replace(/\D/g, "")
    .slice(0, 12);
  const vatHint =
    vatNumberValue && !/^DE[0-9]{9}$/.test(vatNumberValue)
      ? "Format: DE + 9 Ziffern (z. B. DE123456789)"
      : null;

  const websiteValue = form.watch("website") ?? "";
  const websiteDisplayValue = websiteValue.replace(/^https?:\/\//, "");

  const hasUnsavedChanges = useMemo(
    () => form.formState.isDirty && !isSubmitting,
    [form.formState.isDirty, isSubmitting]
  );

  useEffect(() => {
    if (!open) {
      setShowDiscardPrompt(false);
    }
  }, [open]);

  const handleRequestedClose = () => {
    if (hasUnsavedChanges) {
      setShowDiscardPrompt(true);
      return;
    }
    onOpenChange(false);
  };

  const handleDiscard = () => {
    setShowDiscardPrompt(false);
    form.reset(form.getValues());
    onOpenChange(false);
  };

  return (
    <>
      <ResponsiveModal
        open={open}
        onOpenChange={(next) => {
          if (!next) {
            handleRequestedClose();
            return;
          }
          onOpenChange(next);
        }}
        title="Organisation bearbeiten"
        contentClassName="sm:max-w-[700px]"
      >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <p className="text-muted-foreground text-xs">
            Passen Sie die Stammdaten und Kontaktinformationen Ihrer Organisation an.
          </p>
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Wichtige Stammdaten</h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs" htmlFor="name">Unternehmensname</Label>
                <IconInput 
                  id="name"
                  placeholder="Beispiel Industrie AG" 
                  className="h-10 text-sm"
                  {...form.register("name")} 
                />
                {form.formState.errors.name?.message && (
                  <p className="text-xs text-destructive">{String(form.formState.errors.name.message)}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs" htmlFor="email">Geschäfts-E-Mail</Label>
                <IconInput 
                  id="email"
                  type="email"
                  placeholder="beispiel@industrie.com" 
                  className="h-10 text-sm"
                  {...form.register("email")} 
                />
                {form.formState.errors.email?.message && (
                  <p className="text-xs text-destructive">{String(form.formState.errors.email.message)}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs" htmlFor="type">Organisationstyp</Label>
              <select
                id="type"
                {...form.register("type")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="shipper">Shipper (Versender)</option>
                <option value="forwarder">Forwarder (Spedition)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs" htmlFor="description">Beschreibung</Label>
              <Textarea 
                id="description"
                placeholder="Kurzbeschreibung der Organisation" 
                rows={2} 
                className="resize-none text-sm"
                {...form.register("description")} 
              />
            </div>
          </div>

          <div className="h-px bg-border/50" />

          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Kontaktinformationen</h4>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs" htmlFor="phone">Telefon</Label>
                <IconInput className="h-10 text-sm" id="phone" placeholder="+49 123 456789" {...form.register("phone")} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs" htmlFor="website">Website</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs text-muted-foreground">
                    https://
                  </span>
                  <IconInput
                    id="website"
                    placeholder="musterweb.com"
                    className="h-10 pl-16 text-sm"
                    value={websiteDisplayValue}
                    onChange={(event) => {
                      const rawValue = String(event.target.value ?? "").replace(/^https?:\/\//, "");
                      form.setValue("website", rawValue ? `https://${rawValue}` : "", {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs" htmlFor="address">Straße & Hausnummer</Label>
                <IconInput className="h-10 text-sm" id="address" placeholder="Musterstraße 12" {...form.register("address")} />
              </div>
              
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                <div className="space-y-2 md:col-span-1">
                  <Label className="text-xs" htmlFor="postalCode">PLZ</Label>
                  <IconInput className="h-10 text-sm" id="postalCode" placeholder="90400" {...form.register("postalCode")} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-xs" htmlFor="city">Stadt</Label>
                  <IconInput className="h-10 text-sm" id="city" placeholder="Nürnberg" {...form.register("city")} />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs" htmlFor="country">Land</Label>
                <IconInput className="h-10 text-sm" id="country" placeholder="Deutschland" {...form.register("country")} />
              </div>
            </div>
          </div>

          <div className="h-px bg-border/50" />

          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rechtliche Angaben</h4>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs" htmlFor="vatNumber">USt-IdNr.</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs text-muted-foreground">
                    DE
                  </span>
                  <IconInput
                    id="vatNumber"
                    placeholder="123456789"
                    inputMode="numeric"
                    maxLength={9}
                    className="h-10 pl-10 text-sm"
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
                {vatHint && <p className="text-[11px] text-muted-foreground">{vatHint}</p>}
                {form.formState.errors.vatNumber?.message && (
                  <p className="text-xs text-destructive">{String(form.formState.errors.vatNumber.message)}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs" htmlFor="registrationNumber">Handelsregisternummer</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs text-muted-foreground">
                    HRB
                  </span>
                  <IconInput
                    className="h-10 pl-12 text-sm"
                    id="registrationNumber"
                    placeholder="12345"
                    inputMode="numeric"
                    maxLength={12}
                    value={registrationDigits}
                    onChange={(event) => {
                      const digitsOnly = String(event.target.value ?? "")
                        .replace(/\D/g, "")
                        .slice(0, 12);
                      form.setValue("registrationNumber", digitsOnly ? `HRB${digitsOnly}` : "", {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                  />
                </div>
                {form.formState.errors.registrationNumber?.message && (
                  <p className="text-xs text-destructive">
                    {String(form.formState.errors.registrationNumber.message)}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-muted/30 rounded-md p-4 border mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={handleRequestedClose}
              disabled={isSubmitting}
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !canEdit || !form.formState.isDirty || !form.formState.isValid}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Speichere...
                </>
              ) : (
                "Änderungen speichern"
              )}
            </Button>
          </div>
      </form>
      </ResponsiveModal>

      <Dialog open={showDiscardPrompt} onOpenChange={setShowDiscardPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ungespeicherte Änderungen verwerfen?</DialogTitle>
            <DialogDescription>
              Sie haben Felder geändert. Möchten Sie den Dialog wirklich ohne Speichern schließen?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDiscardPrompt(false)}>
              Zurück
            </Button>
            <Button variant="destructive" onClick={handleDiscard}>
              Verwerfen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}