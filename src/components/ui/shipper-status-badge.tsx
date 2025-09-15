"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { 
  getShipperStatusLabel, 
  getShipperStatusVariant, 
  ShipperInquiryStatus 
} from "@/lib/shipper-status-utils"

interface ShipperStatusBadgeProps {
  status: ShipperInquiryStatus
  className?: string
}

export function ShipperStatusBadge({ status, className }: ShipperStatusBadgeProps) {
  const label = getShipperStatusLabel(status)
  const variant = getShipperStatusVariant(status)

  return (
    <Badge 
      variant={variant} 
      className={cn(className)}
    >
      {label}
    </Badge>
  )
}
