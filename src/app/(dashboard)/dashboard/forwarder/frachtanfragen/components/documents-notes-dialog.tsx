"use client"

import { ResponsiveModal } from "@/components/responsive-modal"
import { useTRPC } from "@/trpc/client"
import { useQuery } from "@tanstack/react-query"
import { FileText, MessageSquare, Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatGermanDate } from "@/lib/date-utils"

interface DocumentsNotesDialogProps {
  inquiryId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  documentCount?: number
  noteCount?: number
}

export function DocumentsNotesDialog({
  inquiryId,
  open,
  onOpenChange,
  documentCount = 0,
  noteCount = 0,
}: DocumentsNotesDialogProps) {
  const trpcOptions = useTRPC()
  const { data: documents = [], isLoading: documentsLoading } = useQuery({
    ...trpcOptions.inquiry.forwarder.getInquiryDocuments.queryOptions({ inquiryId: inquiryId! }),
    enabled: open && !!inquiryId,
  })

  const { data: notes = [], isLoading: notesLoading } = useQuery({
    ...trpcOptions.inquiry.forwarder.getInquiryNotes.queryOptions({ inquiryId: inquiryId! }),
    enabled: open && !!inquiryId,
  })

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title="Dokumente & Notizen"
      contentClassName=""
      bodyClassName="min-h-0"
    >
      <p className="text-sm text-slate-500 mb-5">
        Chatverlauf und geteilte Dokumente zu dieser Anfrage.
      </p>

      <div className="space-y-6 max-h-[65vh] overflow-y-auto pr-1">
        <section className="space-y-2">
          <label className="text-xs font-semibold flex items-center gap-2 text-slate-500">
            <MessageSquare className="h-3 w-3" /> Notizen ({noteCount})
          </label>
          {notesLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : notes.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-200 bg-slate-50/40 p-4 text-xs text-slate-500">
              Noch keine Notizen vorhanden.
            </div>
          ) : (
            <div className="space-y-1.5 max-h-52 overflow-y-auto">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-md border bg-white/90 p-2.5 text-xs"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-[10px] text-slate-500 font-medium">
                      {note.createdBy.name}
                      {note.organization && ` von ${note.organization.name}`}
                    </p>
                    <p className="text-[10px] text-slate-400 shrink-0">
                      {formatGermanDate(note.createdAt) || "—"}
                    </p>
                  </div>
                  <p className="text-xs text-slate-700 whitespace-pre-wrap">
                    {note.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-2">
          <label className="text-xs font-semibold flex items-center gap-2 text-slate-500">
            <FileText className="h-3 w-3" /> Dokumente ({documentCount})
          </label>
          {documentsLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : documents.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-200 bg-slate-50/40 p-4 text-xs text-slate-500">
              Noch keine Dokumente vorhanden.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-2 pl-3 bg-white border rounded-lg hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-xs truncate font-medium text-slate-700">
                      {doc.fileName}
                    </span>
                  </div>
                  <Button
                    asChild
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 shrink-0"
                    title="Dokument öffnen"
                  >
                    <a href={doc.fileUrl} target="_blank" rel="noreferrer">
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </ResponsiveModal>
  )
}
