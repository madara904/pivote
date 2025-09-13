"use client"

import { cn } from "@/lib/utils"

interface DotLoadingProps {
  className?: string
  size?: "sm" | "md" | "lg"
  color?: string
  text?: string
}

export function DotLoading({ className, size = "md", color = "bg-primary" }: DotLoadingProps) {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  }

  const gapClasses = {
    sm: "gap-1",
    md: "gap-2",
    lg: "gap-3",
  }

  return (
    <div className={cn("flex items-center justify-center", gapClasses[size], className)}>
      {[0, 1, 2, 3].map((index) => (
        <div
          key={index}
          className={cn("rounded-full animate-bounce", sizeClasses[size], color)}
          style={{
            animationDelay: `${index * 0.2}s`,
            animationDuration: "1.2s",
            transform: "scale(1)",
            animation: `dotScale 1.2s ease-in-out infinite ${index * 0.2}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes dotScale {
          0%, 80%, 100% {
            transform: scale(1);
          }
          40% {
            transform: scale(1.5);
          }
        }
      `}</style>
    </div>
  )
}
