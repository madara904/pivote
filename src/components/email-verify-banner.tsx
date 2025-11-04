"use client"

import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Spinner } from "./ui/spinner"

interface EmailVerifyBannerProps {
  onClose?: () => void
  onVerify?: () => void
  isSending?: boolean
}

export function EmailVerifyBanner({ onClose, onVerify, isSending  }: EmailVerifyBannerProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-rose-500 text-primary-foreground shadow-lg">
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Bitte verifizieren Sie Ihre Email.</p>
          <div className="flex items-center gap-3">
            <Button disabled={isSending} size="sm" variant="secondary" onClick={onVerify} className="text-xs">
              {isSending ? <Spinner className="size-4" /> : "Verifizieren"}
              {isSending && "Senden..."}
            </Button>
            <Button
              onClick={onClose}
              className="inline-flex items-center justify-center rounded p-1 transition-colors"
              aria-label="Close banner"
              variant="ghost"
              size="icon"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

