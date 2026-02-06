"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { toast } from "sonner"
import { useTRPC } from "@/trpc/client"
import { useSuspenseQuery, useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { CheckCircle, Upload, FileText, Loader2, Search, Trash, MessageSquare, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState } from "react"
import { InquiryDocumentUploadDialog } from "../components/inquiry-document-upload";
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { PageLayout, PageHeaderWithBorder, PageContainer } from "@/components/ui/page-layout"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"

export default function InquiryDetailsView({ inquiryId }: { inquiryId: string }) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [noteText, setNoteText] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);

  const trpcOptions = useTRPC();
  const queryClient = useQueryClient();

  const { data: detail } = useSuspenseQuery(trpcOptions.inquiry.shipper.getInquiryDetail.queryOptions({
    inquiryId,
  }))

  const { data: inquiryQuotations = [] } = useQuery(trpcOptions.quotation.shipper.getQuotationsForInquiry.queryOptions(
    { inquiryId },
    { enabled: Boolean(inquiryId) }
  ))

  const { data: notes = [], isLoading: notesLoading } = useQuery(trpcOptions.inquiry.shipper.getInquiryNotes.queryOptions(
    { inquiryId },
    { enabled: Boolean(inquiryId) }
  ))

  const acceptQuotation = useMutation(trpcOptions.quotation.shipper.acceptQuotation.mutationOptions({
    onSuccess: async () => {
      toast.success("Spediteur nominiert")
      await queryClient.invalidateQueries();
    },
    onError: (e: unknown) => {
      if (e && typeof e === "object" && "message" in e) {
        toast.error((e as { message?: string }).message || "Fehler aufgetreten");
      } else {
        toast.error("Fehler aufgetreten");
      }
    }
  }));

  const addNote = useMutation(trpcOptions.quotation.shipper.addNote.mutationOptions({
    onSuccess: async () => {
      toast.success("Notiz gespeichert");
      setNoteText("");
      await queryClient.invalidateQueries(
        trpcOptions.inquiry.shipper.getInquiryNotes.queryFilter({ inquiryId })
      );
    },
    onError: (e: unknown) => {
      if (e && typeof e === "object" && "message" in e) {
        toast.error((e as { message?: string }).message || "Fehler aufgetreten");
      } else {
        toast.error("Fehler aufgetreten");
      }
    },
  }));

  const deleteFile = useMutation(trpcOptions.inquiry.shipper.deleteInquiryDocuments.mutationOptions({
    onSuccess: async () => {
      toast.success("Dokument gelöscht")
      await queryClient.invalidateQueries(
        trpcOptions.inquiry.shipper.getInquiryDetail.queryFilter({ inquiryId })
      );
    },
    onError: (e: unknown) => {
      if (e && typeof e === "object" && "message" in e) {
        toast.error((e as { message?: string }).message || "Fehler aufgetreten");
      } else {
        toast.error("Fehler aufgetreten");
      }
    }
  }))

  const acceptedQuotation = inquiryQuotations.find((q: { status: string }) => q.status === "accepted")
  
  const bestPriceQuotationId = [...inquiryQuotations].sort(
    (a, b) => Number(a.totalPrice) - Number(b.totalPrice)
  )[0]?.id;

  const formatDate = (value?: Date | null) => {
    if (!value) return "—"
    return new Date(value).toLocaleDateString("de-DE")
  }

  // Build back link
  const backHref = tabParam 
    ? `/dashboard/shipper/frachtanfragen?tab=${tabParam}`
    : "/dashboard/shipper/frachtanfragen";

  return (
    <PageLayout>
      <PageHeaderWithBorder>
        <div className="max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href={backHref}>
              <Button variant="ghost" size="icon" className="shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-semibold text-foreground break-words">
                Anfrage: {detail.referenceNumber}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Details und Angebote für Ihre Frachtanfrage
              </p>
            </div>
          </div>
        </div>
      </PageHeaderWithBorder>

      <PageContainer>
        <div className="max-w-4xl mx-auto w-full">
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 mt-3 bg-muted/30 text-sm">
              <div>
                <p className="text-muted-foreground text-xs uppercase">Route</p>
                <p className="font-semibold">{detail.originCity} → {detail.destinationCity}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase">Service</p>
                <p className="font-semibold">{detail.serviceType === 'air_freight' ? 'Luftfracht' : 'Seefracht'}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase">Gewicht</p>
                <p className="font-semibold">{detail.packages.reduce((s, p) => s + Number(p.grossWeight), 0)} kg</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase">Erstellt am</p>
                <p className="font-semibold">{formatDate(detail.createdAt)}</p>
              </div>
            </div>

            {acceptedQuotation && (
              <div className="bg-accent/40 border border-accent rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                      <AvatarImage src={acceptedQuotation.forwarderOrganization.logo ?? ""} />
                      <AvatarFallback>{acceptedQuotation.forwarderOrganization.name.slice(0,2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Zugeordneter Spediteur</p>
                      <p className="font-bold text-base">{acceptedQuotation.forwarderOrganization.name}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setUploadOpen(true)} className="bg-white shadow-sm">
                    <Upload className="mr-2 h-4 w-4" /> Dokument hochladen
                  </Button>
                </div>

                {notesLoading ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                ) : notes.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold flex items-center gap-2 text-muted-foreground">
                      <MessageSquare className="h-3 w-3" /> Notizen ({notes.length})
                    </label>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {notes.map((note: { id: string; createdBy: { name: string }; createdAt: Date; content: string }) => (
                        <div
                          key={note.id}
                          className="rounded-md border bg-white/80 p-2 text-xs"
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-[10px] text-muted-foreground font-medium">
                              {note.createdBy.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground shrink-0">
                              {new Intl.DateTimeFormat("de-DE", {
                                day: "2-digit",
                                month: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              }).format(note.createdAt)}
                            </p>
                          </div>
                          <p className="text-xs text-foreground line-clamp-2">{note.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-semibold flex items-center gap-2">
                    <MessageSquare className="h-3 w-3" /> Nachricht an Spediteur
                  </label>
                  <div className="flex gap-2">
                    <Textarea 
                      placeholder="Anweisungen oder Rückfragen..." 
                      className="resize-none bg-white text-sm"
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                    />
                    <Button 
                      className="self-end" 
                      disabled={!noteText.trim() || addNote.isPending}
                      onClick={() => addNote.mutate({ inquiryId: inquiryId!, content: noteText })}
                    >
                      {addNote.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Senden"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {detail.documents && detail.documents.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold px-1">Dokumente</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {detail.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-2 pl-3 bg-white border rounded-lg hover:border-primary/50 transition-colors">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-xs truncate font-medium">{doc.fileName}</span>
                      </div>
                      <div className="flex shrink-0">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => window.open(doc.fileUrl, "_blank")}>
                          <Search className="h-4 w-4" />
                        </Button>
                        <ConfirmationDialog
                          title="Dokument löschen"
                          description={`Möchten Sie das Dokument "${doc.fileName}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`}
                          confirmText="Löschen"
                          cancelText="Abbrechen"
                          variant="destructive"
                          onConfirm={() => {
                            setDeletingDocId(doc.id);
                            deleteFile.mutate({ inquiryId: doc.id });
                          }}
                          loading={deleteFile.isPending && deletingDocId === doc.id}
                          loadingText="Wird gelöscht..."
                          disabled={deleteFile.isPending}
                        >
                          <Button 
                            size="icon" variant="ghost" 
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            disabled={deleteFile.isPending}
                          >
                            {deletingDocId === doc.id && deleteFile.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" />}
                          </Button>
                        </ConfirmationDialog>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Tabs defaultValue="offers" className="w-full">
              <div className="mb-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="offers">Angebote ({inquiryQuotations.length})</TabsTrigger>
                  <TabsTrigger value="details">Anfragedetails</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="offers" className="mt-0">
                <div className="space-y-3">
                  {detail.sentToForwarders.map((f) => {
                    const q = inquiryQuotations.find((quote: { forwarderOrganization: { id: string } }) => quote.forwarderOrganization.id === f.forwarderOrganizationId);
                    const isBest = q?.id === bestPriceQuotationId;
                    
                    return (
                      <Accordion key={f.id} type="single" collapsible>
                        <AccordionItem value={f.id} className="border rounded-xl px-4 bg-white shadow-sm">
                          <AccordionTrigger className="hover:no-underline py-4">
                            <div className="flex flex-1 items-center justify-between pr-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={q?.forwarderOrganization.logo ?? f.forwarderOrganization.logo ?? ""} />
                                  <AvatarFallback>{(q?.forwarderOrganization.name ?? f.forwarderOrganization.name).slice(0,2)}</AvatarFallback>
                                </Avatar>
                                <div className="text-left">
                                  <p className="text-sm font-bold">{q?.forwarderOrganization.name ?? f.forwarderOrganization.name}</p>
                                  {isBest && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded uppercase font-bold tracking-tight">Bestpreis</span>}
                                </div>
                              </div>
                              <div className="text-right font-bold">
                                {q ? `${Number(q.totalPrice).toFixed(2)} ${q.currency}` : <span className="text-muted-foreground text-xs font-normal">{f.responseStatus}</span>}
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="border-t">
                            {q ? (
                              <div className="space-y-4">
                                 <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-muted/30 p-2 rounded">
                                      <p className="text-[10px] uppercase text-muted-foreground">Transitzeit</p>
                                      <p className="font-semibold text-sm">{q.transitTime} Tage</p>
                                    </div>
                                    <div className="bg-muted/30 p-2 rounded">
                                      <p className="text-[10px] uppercase text-muted-foreground">Gültig bis</p>
                                      <p className="font-semibold text-sm">{formatDate(q.validUntil)}</p>
                                    </div>
                                 </div>
                                 <div className="space-y-1.5 border rounded-lg p-3 text-sm">
                                    <div className="flex justify-between"><span>Pre-carriage</span><span className="font-medium">{Number(q.preCarriage).toFixed(2)} {q.currency}</span></div>
                                    <div className="flex justify-between"><span>Main-carriage</span><span className="font-medium">{Number(q.mainCarriage).toFixed(2)} {q.currency}</span></div>
                                    <div className="flex justify-between"><span>On-carriage</span><span className="font-medium">{Number(q.onCarriage).toFixed(2)} {q.currency}</span></div>
                                    <div className="flex justify-between border-t pt-1.5 font-bold"><span>Gesamt</span><span className="text-primary">{Number(q.totalPrice).toFixed(2)} {q.currency}</span></div>
                                 </div>
                                 {q.status === "submitted" && (
                                   <ConfirmationDialog
                                     title="Spediteur nominieren"
                                     description={`Möchten Sie ${q.forwarderOrganization.name} für diese Anfrage nominieren? Diese Aktion kann nicht rückgängig gemacht werden.`}
                                     confirmText="Nominieren"
                                     cancelText="Abbrechen"
                                     onConfirm={() => acceptQuotation.mutate({ quotationId: q.id })}
                                     loading={acceptQuotation.isPending}
                                     loadingText="Wird nominiert..."
                                     disabled={acceptQuotation.isPending}
                                   >
                                     <Button className="w-full" disabled={acceptQuotation.isPending}>
                                       {acceptQuotation.isPending ? (
                                         <>
                                           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                           Wird nominiert...
                                         </>
                                       ) : (
                                         "Diesen Spediteur nominieren"
                                       )}
                                     </Button>
                                   </ConfirmationDialog>
                                 )}
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground text-center py-4 italic">Noch kein Angebot eingereicht.</p>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="details" className="mt-0">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm">Allgemeine Informationen</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Referenznummer</p>
                        <p className="font-medium">{detail.referenceNumber}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Status</p>
                        <p className="font-medium capitalize">{detail.status}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm">Route</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Abholort</p>
                        <p className="font-medium">{detail.originCity}, {detail.originCountry}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Zielort</p>
                        <p className="font-medium">{detail.destinationCity}, {detail.destinationCountry}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm">Frachtdetails</h3>
                    <div className="space-y-4">
                      {detail.packages.map((pkg, index) => (
                        <div key={index} className="border rounded-lg p-4 bg-white">
                          <h4 className="font-medium mb-3 text-sm">Paket {index + 1}</h4>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Gewicht</p>
                              <p className="font-medium text-sm">{pkg.grossWeight} kg</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Volumen</p>
                              <p className="font-medium text-sm">{pkg.volume} m³</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Anzahl</p>
                              <p className="font-medium text-sm">{pkg.pieces} Stk</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </PageContainer>

      {uploadOpen && (
        <InquiryDocumentUploadDialog
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          inquiryId={inquiryId}
        />
      )}
    </PageLayout>
  )
}
