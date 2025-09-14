"use client"

import { MapPin, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface RouteDisplayProps {
  origin: {
    code: string
    city?: string
    country: string
  }
  destination: {
    code: string
    city?: string
    country: string
  }
  className?: string
}

export function RouteDisplay({ origin, destination, className }: RouteDisplayProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wide">
        Route
      </h4>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex items-center justify-center w-6 h-6 bg-cyan-100 rounded-full">
            <MapPin className="h-3 w-3 text-cyan-500" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-sm truncate">{origin.code}</div>
            <div className="text-xs text-muted-foreground truncate">{origin.country}</div>
          </div>
        </div>
        <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex items-center justify-center w-6 h-6 bg-red-100 rounded-full">
            <MapPin className="h-3 w-3 text-rose-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-sm truncate">{destination.code}</div>
            <div className="text-xs text-muted-foreground truncate">{destination.country}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
