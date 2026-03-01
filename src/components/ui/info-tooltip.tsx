"use client"

import * as React from "react"
import { CircleHelp } from "lucide-react"

import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

type InfoTooltipProps = {
  content: React.ReactNode
  ariaLabel?: string
  className?: string
  iconClassName?: string
  side?: React.ComponentProps<typeof TooltipContent>["side"]
  sideOffset?: number
  mode?: "hover" | "click"
}

function InfoTooltip({
  content,
  ariaLabel = "Mehr Informationen",
  className,
  iconClassName,
  side = "top",
  sideOffset = 8,
  mode = "hover",
}: InfoTooltipProps) {
  const triggerButton = (
    <button
      type="button"
      aria-label={ariaLabel}
      className={cn(
        "text-muted-foreground hover:text-foreground focus-visible:ring-primary/20 inline-flex size-4 shrink-0 items-center justify-center rounded-sm transition-colors outline-none focus-visible:ring-[3px]",
        className
      )}
    >
      <CircleHelp className={cn("size-4", iconClassName)} />
    </button>
  )

  if (mode === "click") {
    return (
      <Popover>
        <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
        <PopoverContent
          side={side}
          sideOffset={sideOffset}
          className="w-fit max-w-[220px] px-3 py-1.5 text-left text-xs leading-relaxed"
        >
          {content}
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{triggerButton}</TooltipTrigger>
      <TooltipContent
        side={side}
        sideOffset={sideOffset}
        variant="neutral"
        className="max-w-[220px] text-left leading-relaxed"
      >
        {content}
      </TooltipContent>
    </Tooltip>
  )
}

export { InfoTooltip }
