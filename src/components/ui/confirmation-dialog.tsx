"use client"

import React, { useState, cloneElement, isValidElement, ReactElement } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ResponsiveModal } from "@/components/responsive-modal"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"

interface ConfirmationDialogProps {
  children: React.ReactNode
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
  onConfirm: () => void
  onCancel?: () => void
  disabled?: boolean
  loading?: boolean
  loadingText?: string
}

export function ConfirmationDialog({
  children,
  title,
  description,
  confirmText = "Bestätigen",
  cancelText = "Abbrechen",
  variant = "default",
  onConfirm,
  onCancel,
  disabled = false,
  loading = false,
  loadingText = "Lädt...",
}: ConfirmationDialogProps) {
  const [open, setOpen] = useState(false)
  const isMobile = useIsMobile()

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) onCancel?.()
  }

  const handleConfirm = () => {
    onConfirm()
    setOpen(false)
  }

  const trigger = isValidElement(children) ? (children as ReactElement) : <span>{children}</span>
  const mergedOnClick = (e: React.MouseEvent) => {
    if ("onClick" in trigger.props && typeof trigger.props.onClick === "function") {
      ;(trigger.props as { onClick: (e: React.MouseEvent) => void }).onClick(e)
    }
    if (!disabled && !loading) setOpen(true)
  }
  const triggerElement = cloneElement(trigger, { onClick: mergedOnClick })

  const confirmClassName = variant === "destructive" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""

  if (isMobile) {
    return (
      <>
        {triggerElement}
        <ResponsiveModal open={open} onOpenChange={handleOpenChange} title={title}>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{description}</p>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={disabled || loading}
              >
                {cancelText}
              </Button>
              <Button
                className={confirmClassName}
                onClick={handleConfirm}
                disabled={disabled || loading}
              >
                {loading ? loadingText : confirmText}
              </Button>
            </div>
          </div>
        </ResponsiveModal>
      </>
    )
  }

  return (
    <>
      {triggerElement}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={disabled || loading}
            >
              {cancelText}
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={disabled || loading}
              className={confirmClassName}
            >
              {loading ? loadingText : confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
