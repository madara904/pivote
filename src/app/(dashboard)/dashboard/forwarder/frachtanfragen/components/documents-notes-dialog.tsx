"use client"

import { useIsMobile } from "@/hooks/use-mobile"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTRPC } from "@/trpc/client"
import { useQuery } from "@tanstack/react-query"
import { FileText, MessageSquare, Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { cn } from "@/lib/utils"

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
  const isMobile = useIsMobile()
  const trpcOptions = useTRPC()
  const { data: documents = [], isLoading: documentsLoading } = useQuery({
    ...trpcOptions.inquiry.forwarder.getInquiryDocuments.queryOptions({ inquiryId: inquiryId! }),
    enabled: open && !!inquiryId,
  })

  const { data: notes = [], isLoading: notesLoading } = useQuery({
    ...trpcOptions.inquiry.forwarder.getInquiryNotes.queryOptions({ inquiryId: inquiryId! }),
    enabled: open && !!inquiryId,
  })

  const tabsContent = (
    <Tabs defaultValue="documents" className="flex-1 flex flex-col min-h-0">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="documents" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Dokumente {documentCount > 0 && `(${documentCount})`}
        </TabsTrigger>
        <TabsTrigger value="notes" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Notizen {noteCount > 0 && `(${noteCount})`}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="documents" className="flex-1 overflow-y-auto mt-4 space-y-3">
        {documentsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : documents.length === 0 ? (
          <Empty className="border border-dashed rounded-lg py-12">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FileText className="h-12 w-12 text-muted-foreground" />
              </EmptyMedia>
              <EmptyTitle>Keine Dokumente</EmptyTitle>
              <EmptyDescription>
                Es wurden noch keine Dokumente für diese Anfrage hochgeladen.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-lg border p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{doc.fileName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {doc.documentType.replace(/_/g, " ")} • {doc.uploadedByOrganization?.name || "Unbekannt"}
                    </p>
                    {doc.fileSize && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {(doc.fileSize / 1024).toFixed(2)} KB
                      </p>
                    )}
                  </div>
                </div>
                <Button asChild size="sm" variant="outline" className="shrink-0 ml-3">
                  <a href={doc.fileUrl} target="_blank" rel="noreferrer">
                    <Download className="h-4 w-4 mr-2" />
                    Öffnen
                  </a>
                </Button>
              </div>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="notes" className="flex-1 overflow-y-auto mt-4 space-y-3">
        {notesLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : notes.length === 0 ? (
          <Empty className="border border-dashed rounded-lg py-12">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MessageSquare className="h-12 w-12 text-muted-foreground" />
              </EmptyMedia>
              <EmptyTitle>Keine Notizen</EmptyTitle>
              <EmptyDescription>
                Es wurden noch keine Notizen für diese Anfrage erstellt.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className="rounded-lg border p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-xs text-muted-foreground">
                    {note.createdBy.name} {note.organization && `• ${note.organization.name}`} • {new Intl.DateTimeFormat("de-DE", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(note.createdAt)}
                  </p>
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap">{note.content}</p>
              </div>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
        <DrawerContent className="max-h-[90vh] flex flex-col">
          <DrawerHeader className="flex-shrink-0">
            <DrawerTitle>Dokumente & Notizen</DrawerTitle>
            <DrawerDescription>
              Übersicht aller Dokumente und Notizen für diese Anfrage
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto px-4 pb-4 min-h-0">
            {tabsContent}
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-w-2xl max-h-[80vh] overflow-hidden flex flex-col")}>
        <DialogHeader>
          <DialogTitle>Dokumente & Notizen</DialogTitle>
          <DialogDescription>
            Übersicht aller Dokumente und Notizen für diese Anfrage
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto min-h-0">
          {tabsContent}
        </div>
      </DialogContent>
    </Dialog>
  )
}
