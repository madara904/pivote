"use client"

import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Truck } from "lucide-react"
import type { OrganizationType } from "@/lib/schemas/organization"

interface OrganizationTypeStepProps {
  onTypeSelect: (type: OrganizationType) => void
}

export function OrganizationTypeStep({ onTypeSelect }: OrganizationTypeStepProps) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Bitte geben Sie an ob Sie ein Unternehmen oder Spediteur sind!</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <Card
          className="cursor-pointer hover:border-1 hover:border-accent-foreground bg-accent/10 shadow-none"
          onClick={() => onTypeSelect("shipper")}
        >
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-28 h-28 rounded-full flex items-center justify-center mb-6">
              <Building2 className="text-accent-foreground" size={85} />
            </div>
            <CardTitle className="text-2xl text-shadow-primary-foreground mb-3">Unternehmen</CardTitle>
          </CardHeader>
        </Card>

        <Card
          className="cursor-pointer hover:border-1 hover:border-accent-foreground bg-accent/10 shadow-none"
          onClick={() => onTypeSelect("forwarder")}
        >
          <CardHeader className="text-center">
            <div className="mx-auto w-28 h-28 rounded-full flex items-center justify-center mb-6">
              <Truck className="text-accent-foreground" size={85} />
            </div>
            <CardTitle className="text-2xl text-shadow-primary-foreground mb-3">Spediteur</CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
