"use client"

import { Plane, Ship, Truck, Train } from "lucide-react"
import { cn } from "@/lib/utils"

interface ServiceIconProps {
  serviceType: string
  className?: string
}

const serviceIcons = {
  "air_freight": Plane,
  "sea_freight": Ship,
  "road_freight": Truck,
  "rail_freight": Train,
  "Luftfracht": Plane,
  "Seefracht": Ship,
  "Straßenfracht": Truck,
  "Bahnfracht": Train
} as const

export function ServiceIcon({ serviceType, className }: ServiceIconProps) {
  const IconComponent = serviceIcons[serviceType as keyof typeof serviceIcons] || Plane

  return (
    <IconComponent className={cn("h-4 w-4 text-primary", className)} />
  )
}
