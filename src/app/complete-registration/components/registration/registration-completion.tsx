"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { OrganizationTypeStep } from "./steps/organization-type-step"
import { OrganizationDetailsStep } from "./steps/organization-details-step"
import { RegistrationSummaryStep } from "./steps/registration-summary-step"
import { RegistrationSuccessStep } from "./steps/registration-success-step"
import { ProgressStepper } from "./progress-stepper"
import type { OrganizationType, OrganizationDetails } from "@/lib/schemas/organization"

const steps = [
  { id: 1, title: "Unternehmenstyp" },
  { id: 2, title: "Unternehmensdetails" },
  { id: 3, title: "Überprüfung & Bestätigung" },
  { id: 4, title: "Abgeschlossen" },
]

export function RegistrationCompletion() {
  const [currentStep, setCurrentStep] = useState(1)
  const [organizationType, setOrganizationType] = useState<OrganizationType | null>(null)
  const [organizationDetails, setOrganizationDetails] = useState<Partial<OrganizationDetails>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleTypeSelection = (type: OrganizationType) => {
    setOrganizationType(type)
    setOrganizationDetails((prev) => ({ ...prev, organizationType: type }))
    setCurrentStep(2)
  }

  const handleDetailsSubmit = (details: OrganizationDetails) => {
    setOrganizationDetails(details)
    setCurrentStep(3)
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleEdit = (step: number) => {
    setCurrentStep(step)
  }

  const handleFinalSubmit = async () => {
    setIsSubmitting(true)
    try {
      setCurrentStep(4)
    } catch (error) {
      console.error("Registrierungsfehler:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <ProgressStepper steps={steps} currentStep={currentStep} />

      <Card className="border border-slate-200 shadow-lg bg-white">
        <CardContent className="p-10">
          {currentStep === 1 && <OrganizationTypeStep onTypeSelect={handleTypeSelection} />}

          {currentStep === 2 && organizationType && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-slate-900">Unternehmensdetails</h2>
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Zurück
                </Button>
              </div>
              <OrganizationDetailsStep
                organizationType={organizationType}
                initialData={organizationDetails}
                onSubmit={handleDetailsSubmit}
              />
            </div>
          )}

          {currentStep === 3 && organizationDetails && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-slate-900">Überprüfung & Bestätigung</h2>
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Zurück
                </Button>
              </div>
              <RegistrationSummaryStep
                organizationDetails={organizationDetails as OrganizationDetails}
                onEdit={handleEdit}
                onSubmit={handleFinalSubmit}
                isSubmitting={isSubmitting}
              />
            </div>
          )}

          {currentStep === 4 && <RegistrationSuccessStep />}
        </CardContent>
      </Card>
    </div>
  )
}
