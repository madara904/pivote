"use client"

import React, { useState } from "react"
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const utils = trpc.useUtils()

  // Get existing quotation if it exists
  const { data: quotationCheck, isLoading } = trpc.quotation.forwarder.checkQuotationExists.useQuery({ inquiryId })
  
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
    onSuccess: (data) => {
      toast.success(data.isUpdate ? "Entwurf erfolgreich gespeichert!" : "Entwurf erfolgreich erstellt!")
      // Invalidate relevant caches
      utils.quotation.forwarder.checkQuotationExists.invalidate({ inquiryId })
      utils.inquiry.forwarder.getInquiryDetail.invalidate({ inquiryId })
      utils.inquiry.forwarder.getMyInquiriesFast.invalidate()
      utils.quotation.forwarder.listQuotations.invalidate()
      if (data.quotationId) {
        utils.quotation.forwarder.getQuotation.invalidate({ quotationId: data.quotationId })
      }
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`)
    },
  })

  const createMutation = trpc.quotation.forwarder.createQuotation.useMutation({
    onSuccess: (data) => {
      toast.success(data.isUpdate ? "Angebot erfolgreich eingereicht!" : "Angebot erfolgreich erstellt und eingereicht!")
      // Invalidate relevant caches
      utils.quotation.forwarder.checkQuotationExists.invalidate({ inquiryId })
      utils.inquiry.forwarder.getInquiryDetail.invalidate({ inquiryId })
      utils.inquiry.forwarder.getMyInquiriesFast.invalidate()
      utils.quotation.forwarder.listQuotations.invalidate()
      if (data.quotationId) {
        utils.quotation.forwarder.getQuotation.invalidate({ quotationId: data.quotationId })
      }
      onSuccess?.()
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`)
    },
  })


  const onSaveDraft = async (data: QuotationFormData) => {
    setIsSubmitting(true)
    try {
      // Calculate total price
      const totalPrice = data.preCarriage + data.mainCarriage + data.onCarriage + data.additionalCharges
      
      await saveDraftMutation.mutateAsync({
        inquiryId,
        totalPrice,
        ...data,
      })
    } catch (error) {
      console.error("Save draft error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const onSubmit = async (data: QuotationFormData) => {
    setIsSubmitting(true)
    try {
      // Calculate total price
      const totalPrice = data.preCarriage + data.mainCarriage + data.onCarriage + data.additionalCharges
      
      await createMutation.mutateAsync({
        inquiryId,
        totalPrice,
        ...data,
      })
    } catch (error) {
      console.error("Submission error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate current total for display
  const preCarriage = form.watch("preCarriage") || 0
  const mainCarriage = form.watch("mainCarriage") || 0
  const onCarriage = form.watch("onCarriage") || 0
  const additionalCharges = form.watch("additionalCharges") || 0
  const currentTotal = preCarriage + mainCarriage + onCarriage + additionalCharges

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-6">
        <Clock className="h-5 w-5 animate-spin" />
        Lade Angebotsdaten...
      </div>
    )
  }

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

          {/* Save Draft Button */}
          <Button 
            type="button" 
            variant="outline" 
            disabled={currentTotal === 0 || isSubmitting}
            onClick={form.handleSubmit(onSaveDraft)}
          >
            {isSubmitting ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Speichere...
              </>
            ) : (
              'Entwurf speichern'
            )}
          </Button>

          {/* Create/Submit Button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" disabled={currentTotal === 0 || isSubmitting}>
                {isEditMode ? 'Angebot einreichen' : 'Angebot erstellen & einreichen'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Bestätigung
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {isEditMode 
                    ? 'Möchten Sie das Angebot wirklich einreichen? Es wird dann an den Versender gesendet.'
                    : 'Möchten Sie das Angebot wirklich erstellen und einreichen? Es wird dann an den Versender gesendet.'
                  }
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                <AlertDialogAction
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      {isEditMode ? 'Reiche ein...' : 'Erstelle & reiche ein...'}
                    </>
                  ) : (
                    isEditMode ? 'Einreichen' : 'Erstellen & einreichen'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </form>
    </div>
  )
}