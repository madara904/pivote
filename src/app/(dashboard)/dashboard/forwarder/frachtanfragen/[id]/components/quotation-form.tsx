"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { trpc } from "@/trpc/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Clock, Plane, Euro } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"

const quotationFormSchema = z.object({
  currency: z.string().min(1, "Währung ist erforderlich"),
  airlineFlight: z.string().min(1, "Flugnummer ist erforderlich"),
  transitTime: z.number().min(1, "Transitzeit muss mindestens 1 Tag sein"),
  validUntil: z.date({
    required_error: "Gültigkeitsdatum ist erforderlich",
  }),
  notes: z.string().optional(),
  terms: z.string().optional(),
  preCarriage: z.number().min(0),
  mainCarriage: z.number().min(0),
  onCarriage: z.number().min(0),
  additionalCharges: z.number().min(0),
}).refine((data) => {
  return data.preCarriage > 0 || data.mainCarriage > 0 || data.onCarriage > 0 || data.additionalCharges > 0
}, {
  message: "Mindestens eine Gebühr muss größer als 0 sein",
  path: ["preCarriage"]
})

type QuotationFormData = z.infer<typeof quotationFormSchema>

interface QuotationFormProps {
  inquiryId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export default function QuotationForm({ inquiryId, onSuccess, onCancel }: QuotationFormProps) {
  const utils = trpc.useUtils()

  // Get existing quotation if it exists
  const [ quotationCheck ] = trpc.quotation.forwarder.checkQuotationExists.useSuspenseQuery({ inquiryId })
  
  const existingQuotation = quotationCheck?.quotation
  const isEditMode = Boolean(quotationCheck?.exists && existingQuotation)

  // Simple form with static default values
  const form = useForm<QuotationFormData>({
    resolver: zodResolver(quotationFormSchema),
    defaultValues: {
      currency: "EUR",
      airlineFlight: "",
      transitTime: 1,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      notes: "",
      terms: "",
      preCarriage: 0,
      mainCarriage: 0,
      onCarriage: 0,
      additionalCharges: 0,
    }
  })

  // If we have existing data and haven't initialized yet, do it once
  if (existingQuotation && form.watch('airlineFlight') === '') {
    form.reset({
      currency: existingQuotation.currency || "EUR",
      airlineFlight: existingQuotation.airlineFlight || "",
      transitTime: existingQuotation.transitTime || 1,
      validUntil: existingQuotation.validUntil ? new Date(existingQuotation.validUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      notes: existingQuotation.notes || "",
      terms: existingQuotation.terms || "",
      preCarriage: Number(existingQuotation.preCarriage) || 0,
      mainCarriage: Number(existingQuotation.mainCarriage) || 0,
      onCarriage: Number(existingQuotation.onCarriage) || 0,
      additionalCharges: Number(existingQuotation.additionalCharges) || 0,
    })
  }

  const saveDraftMutation = trpc.quotation.forwarder.saveDraftQuotation.useMutation({
    onMutate: async (newDraftData) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await utils.quotation.forwarder.checkQuotationExists.cancel({ inquiryId })
      
      // Snapshot the previous value
      const previousQuotationCheck = utils.quotation.forwarder.checkQuotationExists.getData({ inquiryId })
      
      // Optimistically update to show draft exists
      utils.quotation.forwarder.checkQuotationExists.setData({ inquiryId }, (old) => {
        if (!old) return old
        
        const optimisticQuotation = {
          id: existingQuotation?.id || `temp-${Date.now()}`,
          quotationNumber: existingQuotation?.quotationNumber || `QUO-${Date.now()}`,
          totalPrice: newDraftData.totalPrice.toString(),
          currency: newDraftData.currency || "EUR",
          airlineFlight: newDraftData.airlineFlight || null,
          transitTime: newDraftData.transitTime || null,
          validUntil: newDraftData.validUntil,
          notes: newDraftData.notes || null,
          terms: newDraftData.terms || null,
          preCarriage: (newDraftData.preCarriage || 0).toString(),
          mainCarriage: (newDraftData.mainCarriage || 0).toString(),
          onCarriage: (newDraftData.onCarriage || 0).toString(),
          additionalCharges: (newDraftData.additionalCharges || 0).toString(),
          status: 'draft' as const,
          submittedAt: null,
          respondedAt: null,
          withdrawnAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        
        return {
          ...old,
          exists: true,
          quotation: optimisticQuotation
        }
      })
      
      // Return context for potential rollback
      return { previousQuotationCheck }
    },
    onError: (error, newDraftData, context) => {
      // Rollback on error
      if (context?.previousQuotationCheck) {
        utils.quotation.forwarder.checkQuotationExists.setData({ inquiryId }, context.previousQuotationCheck)
      }
      toast.error(`Fehler: ${error.message}`)
    },
    onSuccess: (data) => {
      toast.success(data.isUpdate ? "Entwurf erfolgreich gespeichert!" : "Entwurf erfolgreich erstellt!")
      // Invalidate relevant caches to ensure consistency
      utils.quotation.forwarder.checkQuotationExists.invalidate({ inquiryId })
      utils.inquiry.forwarder.getInquiryDetail.invalidate({ inquiryId })
      utils.inquiry.forwarder.getMyInquiriesFast.invalidate()
      utils.quotation.forwarder.listQuotations.invalidate()
      if (data.quotationId) {
        utils.quotation.forwarder.getQuotation.invalidate({ quotationId: data.quotationId })
      }
      onSuccess?.()
    },
  })

  const deleteDraftMutation = trpc.quotation.forwarder.deleteDraftQuotation.useMutation({
    onMutate: async () => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await utils.quotation.forwarder.checkQuotationExists.cancel({ inquiryId })
      
      // Snapshot the previous value
      const previousQuotationCheck = utils.quotation.forwarder.checkQuotationExists.getData({ inquiryId })
      
      // Optimistically update to show no draft exists
      utils.quotation.forwarder.checkQuotationExists.setData({ inquiryId }, (old) => {
        if (!old) return old
        
        return {
          ...old,
          exists: false,
          quotation: null as unknown as typeof old.quotation
        }
      })
      
      // Return context for potential rollback
      return { previousQuotationCheck }
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousQuotationCheck) {
        utils.quotation.forwarder.checkQuotationExists.setData({ inquiryId }, context.previousQuotationCheck)
      }
      toast.error(`Fehler: ${error.message}`)
    },
    onSuccess: () => {
      toast.success("Entwurf erfolgreich gelöscht!")
      // Invalidate relevant caches to ensure consistency
      utils.quotation.forwarder.checkQuotationExists.invalidate({ inquiryId })
      utils.inquiry.forwarder.getInquiryDetail.invalidate({ inquiryId })
      utils.inquiry.forwarder.getMyInquiriesFast.invalidate()
      utils.quotation.forwarder.listQuotations.invalidate()
      onSuccess?.()
    },
  })

  const createMutation = trpc.quotation.forwarder.createQuotation.useMutation({
    onMutate: async (newQuotationData) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await utils.quotation.forwarder.checkQuotationExists.cancel({ inquiryId })
      
      // Snapshot the previous value
      const previousQuotationCheck = utils.quotation.forwarder.checkQuotationExists.getData({ inquiryId })
      
      // Optimistically update to show quotation is submitted
      utils.quotation.forwarder.checkQuotationExists.setData({ inquiryId }, (old) => {
        if (!old) return old
        
        const optimisticQuotation = {
          id: existingQuotation?.id || `temp-${Date.now()}`,
          quotationNumber: existingQuotation?.quotationNumber || `QUO-${Date.now()}`,
          totalPrice: newQuotationData.totalPrice.toString(),
          currency: newQuotationData.currency || "EUR",
          airlineFlight: newQuotationData.airlineFlight || null,
          transitTime: newQuotationData.transitTime || null,
          validUntil: newQuotationData.validUntil,
          notes: newQuotationData.notes || null,
          terms: newQuotationData.terms || null,
          preCarriage: (newQuotationData.preCarriage || 0).toString(),
          mainCarriage: (newQuotationData.mainCarriage || 0).toString(),
          onCarriage: (newQuotationData.onCarriage || 0).toString(),
          additionalCharges: (newQuotationData.additionalCharges || 0).toString(),
          status: 'submitted' as const,
          submittedAt: new Date(),
          respondedAt: null,
          withdrawnAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        
        return {
          ...old,
          exists: true,
          quotation: optimisticQuotation
        }
      })
      
      // Return context for potential rollback
      return { previousQuotationCheck }
    },
    onError: (error, newQuotationData, context) => {
      // Rollback on error
      if (context?.previousQuotationCheck) {
        utils.quotation.forwarder.checkQuotationExists.setData({ inquiryId }, context.previousQuotationCheck)
      }
      toast.error(`Fehler: ${error.message}`)
    },
    onSuccess: (data) => {
      toast.success(data.isUpdate ? "Angebot erfolgreich eingereicht!" : "Angebot erfolgreich erstellt und eingereicht!")
      // Invalidate relevant caches to ensure consistency
      utils.quotation.forwarder.checkQuotationExists.invalidate({ inquiryId })
      utils.inquiry.forwarder.getInquiryDetail.invalidate({ inquiryId })
      utils.inquiry.forwarder.getMyInquiriesFast.invalidate()
      utils.quotation.forwarder.listQuotations.invalidate()
      if (data.quotationId) {
        utils.quotation.forwarder.getQuotation.invalidate({ quotationId: data.quotationId })
      }
      onSuccess?.()
    },
  })


  const onSaveDraft = async (data: QuotationFormData) => {
    // Calculate total price
    const totalPrice = data.preCarriage + data.mainCarriage + data.onCarriage + data.additionalCharges
    
    saveDraftMutation.mutate({
      inquiryId,
      totalPrice,
      ...data,
    })
  }

  const onDeleteDraft = async () => {
    deleteDraftMutation.mutate({ inquiryId })
  }

  const onSubmit = async (data: QuotationFormData) => {
    // Calculate total price
    const totalPrice = data.preCarriage + data.mainCarriage + data.onCarriage + data.additionalCharges
    
    createMutation.mutate({
      inquiryId,
      totalPrice,
      ...data,
    })
  }

  // Calculate current total for display
  const preCarriage = form.watch("preCarriage") || 0
  const mainCarriage = form.watch("mainCarriage") || 0
  const onCarriage = form.watch("onCarriage") || 0
  const additionalCharges = form.watch("additionalCharges") || 0
  const currentTotal = preCarriage + mainCarriage + onCarriage + additionalCharges

  // Get loading states from mutations
  const isSavingDraft = saveDraftMutation.isPending
  const isDeletingDraft = deleteDraftMutation.isPending
  const isSubmittingQuotation = createMutation.isPending

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Plane className="h-5 w-5" />
          {isEditMode ? 'Angebot bearbeiten' : 'Neues Angebot erstellen'}
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Gesamtpreis</div>
          <div className="text-2xl font-bold text-green-600">
            {currentTotal.toFixed(2)} €
          </div>
          {isEditMode && existingQuotation && (
            <div className="text-xs text-muted-foreground">
              Angebot #{existingQuotation.quotationNumber}
            </div>
          )}
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Grundinformationen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Währung *</Label>
                <Select
                  value={form.watch("currency") || "EUR"}
                  onValueChange={(value) => form.setValue("currency", value, { shouldValidate: true })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR (Euro)</SelectItem>
                    <SelectItem value="USD">USD (US Dollar)</SelectItem>
                    <SelectItem value="GBP">GBP (British Pound)</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.currency && (
                  <p className="text-sm text-red-500">{form.formState.errors.currency.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Flugnummer *</Label>
                <Input
                  placeholder="z.B. LH456"
                  {...form.register("airlineFlight")}
                />
                {form.formState.errors.airlineFlight && (
                  <p className="text-sm text-red-500">{form.formState.errors.airlineFlight.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Transitzeit (Tage) *</Label>
                <Input
                  type="number"
                  min="1"
                  {...form.register("transitTime", { valueAsNumber: true })}
                />
                {form.formState.errors.transitTime && (
                  <p className="text-sm text-red-500">{form.formState.errors.transitTime.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Gültig bis *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !form.watch("validUntil") && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.watch("validUntil") ? format(form.watch("validUntil"), "dd.MM.yyyy") : "Datum wählen"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={form.watch("validUntil")}
                      onSelect={(date) => date && form.setValue("validUntil", date, { shouldValidate: true })}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {form.formState.errors.validUntil && (
                  <p className="text-sm text-red-500">{form.formState.errors.validUntil.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transport Costs */}
        <Card>
          <CardHeader>
            <CardTitle>Transportkosten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Pre-carriage</Label>
                <div className="relative">
                  <Euro className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="pl-10"
                    {...form.register("preCarriage", { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Main carriage</Label>
                <div className="relative">
                  <Euro className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="pl-10"
                    {...form.register("mainCarriage", { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>On-carriage</Label>
                <div className="relative">
                  <Euro className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="pl-10"
                    {...form.register("onCarriage", { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Zusätzliche Gebühren</Label>
                <div className="relative">
                  <Euro className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="pl-10"
                    {...form.register("additionalCharges", { valueAsNumber: true })}
                  />
                </div>
              </div>
            </div>
            
            {form.formState.errors.preCarriage && (
              <p className="text-sm text-red-500">
                Mindestens eine der Transportkosten muss größer als 0 sein
              </p>
            )}
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Zusätzliche Informationen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Notizen</Label>
              <Textarea
                placeholder="Zusätzliche Informationen..."
                {...form.register("notes")}
              />
            </div>

            <div className="space-y-2">
              <Label>Geschäftsbedingungen</Label>
              <Textarea
                placeholder="Geschäftsbedingungen..."
                {...form.register("terms")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Abbrechen
          </Button>

          {/* Save Draft / Delete Draft Button */}
          {isEditMode && existingQuotation ? (
            <ConfirmationDialog
              title="Entwurf löschen"
              description="Möchten Sie den Entwurf wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden."
              confirmText="Löschen"
              variant="destructive"
              onConfirm={onDeleteDraft}
              disabled={isDeletingDraft}
              loading={isDeletingDraft}
              loadingText="Lösche..."
            >
              <Button 
                type="button" 
                variant="destructive" 
                disabled={isDeletingDraft}
              >
                {isDeletingDraft ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Lösche...
                  </>
                ) : (
                  'Entwurf löschen'
                )}
              </Button>
            </ConfirmationDialog>
          ) : (
            <Button 
              type="button" 
              variant="outline" 
              disabled={currentTotal === 0 || isSavingDraft}
              onClick={form.handleSubmit(onSaveDraft)}
            >
              {isSavingDraft ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Speichere...
                </>
              ) : (
                'Entwurf speichern'
              )}
            </Button>
          )}

          {/* Create/Submit Button */}
          <ConfirmationDialog
            title="Bestätigung"
            description={isEditMode 
              ? 'Möchten Sie das Angebot wirklich einreichen? Es wird dann an den Versender gesendet.'
              : 'Möchten Sie das Angebot wirklich erstellen und einreichen? Es wird dann an den Versender gesendet.'
            }
            confirmText={isEditMode ? 'Einreichen' : 'Erstellen & einreichen'}
            onConfirm={form.handleSubmit(onSubmit)}
            disabled={currentTotal === 0 || isSubmittingQuotation}
            loading={isSubmittingQuotation}
            loadingText={isEditMode ? 'Reiche ein...' : 'Erstelle & reiche ein...'}
          >
            <Button type="button" disabled={currentTotal === 0 || isSubmittingQuotation}>
              {isEditMode ? 'Angebot einreichen' : 'Angebot erstellen & einreichen'}
            </Button>
          </ConfirmationDialog>
        </div>
      </form>
    </div>
  )
}