"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { UploadButton } from "@/lib/uploadthing/uploadthing-utils";
import { toast } from "sonner";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileUp, Info, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const DOC_TYPES = [
  { value: "commercial_invoice", label: "Handelsrechnung" },
  { value: "packing_list", label: "Packliste" },
  { value: "certificate_of_origin", label: "Ursprungszeugnis" },
  { value: "awb", label: "Air Waybill (AWB)" },
  { value: "other", label: "Sonstiges" },
] as const;

export function InquiryDocumentUploadDialog({
  open,
  onClose,
  inquiryId,
}: {
  open: boolean;
  onClose: () => void;
  inquiryId: string;
}) {
  const [docType, setDocType] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const trpcOptions = useTRPC();
  const queryClient = useQueryClient();

  const handleUploadError = (error: Error) => {
    setIsUploading(false);
    console.error("Upload error:", error);
    toast.error("Fehler beim Hochladen des Dokuments");
  };

  const handleUploadComplete = async () => {
    setIsUploading(false);
    toast.success("Dokument erfolgreich hochgeladen");
    // Cache refreshen
    await queryClient.invalidateQueries(trpcOptions.inquiry.shipper.getInquiryDetail.queryFilter({ inquiryId }));
    setDocType(""); 
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !isUploading && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileUp className="h-5 w-5 text-primary" />
            Dokument hinzufügen
          </DialogTitle>
          <DialogDescription>
            Wählen Sie zuerst den Dokumententyp aus, um den Upload freizuschalten.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Document Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Dokumententyp</label>
            <Select 
              value={docType} 
              onValueChange={setDocType} 
              disabled={isUploading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Typ auswählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {DOC_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Upload Area */}
          <div className={cn(
            "transition-all duration-300",
            (!docType || isUploading) ? "opacity-50 pointer-events-none grayscale" : "opacity-100"
          )}>
            <UploadButton
              endpoint="inquiryDocument"
              headers={{
                "x-inquiry-id": inquiryId,
                "x-document-type": docType,
              }}
              onUploadBegin={() => setIsUploading(true)}
              onClientUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
              content={{
                button: isUploading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Hochladen...
                  </div>
                ) : docType ? "Datei wählen" : "Bitte Typ wählen",
                allowedContent: "PDF, PNG, JPG bis 4MB"
              }}
              appearance={{
                button: cn(
                  "bg-primary ut-uploading:cursor-not-allowed rounded-md text-sm px-4 py-2 w-full transition-all",
                  isUploading && "opacity-80"
                ),
                container: "w-full",
                allowedContent: "text-muted-foreground text-[10px] mt-2"
              }}
            />
          </div>

          {!docType && !isUploading && (
            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-100">
              <Info className="h-4 w-4 shrink-0" />
              <span>Wählen Sie einen Dokumententyp aus, um fortzufahren.</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}