"use client"

import { Package } from "lucide-react"
import { cn } from "@/lib/utils"

interface FreightDetailsProps {
  weight: string | number
  unit?: string
  pieces?: number
  shipperName: string
  className?: string
}

export function FreightDetails({ weight, unit = "kg", pieces = 1, shipperName, className }: FreightDetailsProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wide">Fracht Details</h4>
      <div className="flex items-center gap-2">
        <Package className="h-4 w-4 text-muted-foreground" />
        <div>
          <div className="font-semibold text-base">
            {typeof weight === "number" ? weight.toFixed(2) : weight} {unit}
          </div>
          <div className="text-xs text-muted-foreground">{pieces} PKG</div>
        </div>
      </div>
      <div>
        <div className="font-medium text-sm">{shipperName}</div>
        <div className="text-xs text-muted-foreground">Shipper</div>
      </div>
    </div>
  )
}
