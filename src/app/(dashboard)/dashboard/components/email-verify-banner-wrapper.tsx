"use client"

import { EmailVerifyBanner } from "@/components/email-verify-banner"
import { useSession, sendVerificationEmail } from "@/lib/auth-client"
import { useState, useEffect, useRef } from "react"
import { toast } from "sonner"

const DISMISSAL_STORAGE_KEY = "email-verify-banner-dismissed"

export function EmailVerifyBannerWrapper() {
  const { data: session } = useSession()
  const [isDismissed, setIsDismissed] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const bannerRef = useRef<HTMLDivElement>(null)
  const previousUserIdRef = useRef<string | null>(null)

  // Check if banner was dismissed for this user on mount and when userId changes
  useEffect(() => {
    if (!session?.user?.id) {
      previousUserIdRef.current = null
      setIsDismissed(false)
      return
    }

    const currentUserId = session.user.id

    // Detect new login: userId changed or went from null to non-null
    if (previousUserIdRef.current !== currentUserId) {
      // Clear dismissal state on new login
      const dismissalKey = `${DISMISSAL_STORAGE_KEY}-${currentUserId}`
      localStorage.removeItem(dismissalKey)
      setIsDismissed(false)
      previousUserIdRef.current = currentUserId
      return
    }

    // Check if banner was dismissed for this user
    const dismissalKey = `${DISMISSAL_STORAGE_KEY}-${currentUserId}`
    const dismissed = localStorage.getItem(dismissalKey) === "true"
    setIsDismissed(dismissed)
  }, [session?.user?.id])

  const showBanner = session?.user && !session.user.emailVerified && !isDismissed

  useEffect(() => {
    if (showBanner && bannerRef.current) {
      const height = bannerRef.current.offsetHeight
      document.documentElement.style.setProperty('--banner-height', `${height}px`)
    } else {
      document.documentElement.style.setProperty('--banner-height', '0px')
    }
  }, [showBanner])

  if (!showBanner) {
    return null
  }

  const handleVerify = async () => {
    if (!session?.user?.email) return

    setIsSending(true)
    try {
      await sendVerificationEmail({
        email: session.user.email,
        callbackURL: "/dashboard"
      })
      toast.success("Verifizierungs-E-Mail wurde gesendet! Bitte überprüfen Sie Ihr Postfach.")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Fehler beim Senden der E-Mail. Bitte versuchen Sie es erneut."
      toast.error(errorMessage)
    } finally {
      setIsSending(false)
    }
  }

  const handleClose = () => {
    if (session?.user?.id) {
      const dismissalKey = `${DISMISSAL_STORAGE_KEY}-${session.user.id}`
      localStorage.setItem(dismissalKey, "true")
      setIsDismissed(true)
    }
  }

  return (
    <div ref={bannerRef}>
      <EmailVerifyBanner 
        onVerify={handleVerify}
        onClose={handleClose}
        isSending={isSending}
      />
    </div>
  )
}

