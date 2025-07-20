"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, ArrowRight, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"

export function RegistrationSuccessStep() {
  const [isAnimating, setIsAnimating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Animation nach dem Laden der Komponente auslösen
    const timer = setTimeout(() => {
      setIsAnimating(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  const handleGoToDashboard = () => {
    router.push("/dashboard")
  }

  return (
    <div className="text-center space-y-8">
      {/* Animiertes Erfolgs-Icon */}
      <div className="relative">
        <div
          className={`
            mx-auto w-32 h-32 bg-green-50 rounded-full flex items-center justify-center border border-green-100 
            transition-all duration-1000 ease-out
            ${isAnimating ? "scale-100 opacity-100" : "scale-50 opacity-0"}
          `}
        >
          <div
            className={`
              w-24 h-24 bg-green-100 rounded-full flex items-center justify-center
              transition-all duration-700 delay-300 ease-out
              ${isAnimating ? "scale-100 opacity-100" : "scale-50 opacity-0"}
            `}
          >
            <Check
              className={`
                w-12 h-12 text-green-600 
                transition-all duration-500 delay-600 ease-out
                ${isAnimating ? "scale-100 opacity-100" : "scale-0 opacity-0"}
              `}
            />
          </div>
        </div>

        {/* Glitzer-Animation */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <Sparkles
              key={i}
              className={`
                absolute w-4 h-4 text-yellow-400
                transition-all duration-1000 delay-700 ease-out
                ${isAnimating ? "opacity-100" : "opacity-0"}
              `}
              style={{
                top: `${20 + Math.sin((i * 60 * Math.PI) / 180) * 40}%`,
                left: `${50 + Math.cos((i * 60 * Math.PI) / 180) * 40}%`,
                animationDelay: `${700 + i * 100}ms`,
                animation: isAnimating ? "pulse 2s infinite" : "none",
              }}
            />
          ))}
        </div>
      </div>

      {/* Erfolgsmeldung */}
      <div
        className={`
          space-y-4 transition-all duration-700 delay-500 ease-out
          ${isAnimating ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}
        `}
      >
        <h2 className="text-3xl font-bold text-slate-900">Willkommen an Bord! 🎉</h2>
        <p className="text-lg text-slate-600 max-w-md mx-auto">
          Ihr Unternehmen wurde erfolgreich erstellt. Sie sind bereit, Ihre Logistikabläufe zu verwalten.
        </p>
      </div>

      {/* Aktions-Button */}
      <div
        className={`
          transition-all duration-700 delay-700 ease-out
          ${isAnimating ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}
        `}
      >
        <Button size="lg" onClick={handleGoToDashboard} className="px-8 py-3 text-lg font-medium">
          Zum Dashboard
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>

      {/* Zusätzliche Informationen */}
      <div
        className={`
          text-sm text-slate-500 transition-all duration-700 delay-900 ease-out
          ${isAnimating ? "opacity-100" : "opacity-0"}
        `}
      >
        <p>Sie können Ihre Unternehmensdetails jederzeit in den Einstellungen aktualisieren.</p>
      </div>
    </div>
  )
}
