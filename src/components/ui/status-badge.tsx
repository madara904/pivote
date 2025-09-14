"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  className?: string
}

const statusConfig = {
  "draft": {
    variant: "secondary" as const,
    className: "bg-blue-100 text-blue-700 hover:bg-blue-100",
    label: "Entwurf"
  },
  "open": {
    variant: "default" as const,
    className: "bg-green-100 text-green-700 hover:bg-green-100",
    label: "Offen"
  },
  "sent": {
    variant: "secondary" as const,
    className: "bg-blue-100 text-blue-700 hover:bg-blue-100",
    label: "Gesendet"
  },
  "quoted": {
    variant: "default" as const,
    className: "bg-green-100 text-green-700 hover:bg-green-100",
    label: "Angebot erhalten"
  },
  "awarded": {
    variant: "default" as const,
    className: "bg-orange-100 text-orange-700 hover:bg-orange-100",
    label: "Beauftragt"
  },
  "closed": {
    variant: "secondary" as const,
    className: "bg-gray-100 text-gray-700 hover:bg-gray-100",
    label: "Abgeschlossen"
  },
  "cancelled": {
    variant: "destructive" as const,
    className: "bg-red-100 text-red-700 hover:bg-red-100",
    label: "Storniert"
  },
  "rejected": {
    variant: "destructive" as const,
    className: "bg-red-100 text-red-700 hover:bg-red-100",
    label: "Abgelehnt"
  }
} as const

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status as keyof typeof statusConfig] || {
    variant: "secondary" as const,
    className: "bg-gray-100 text-gray-700 hover:bg-gray-100",
    label: status
  }

  return (
    <Badge 
      variant={config.variant} 
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  )
}
