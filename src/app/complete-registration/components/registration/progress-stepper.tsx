"use client"

import { Check } from "lucide-react"

interface Step {
  id: number
  title: string
}

interface ProgressStepperProps {
  steps: Step[]
  currentStep: number
}

export function ProgressStepper({ steps, currentStep }: ProgressStepperProps) {
  return (
    <div className="flex items-center justify-center">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center w-32">
            <div
              className={`
                w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium shadow-sm transition-all duration-300
                ${
                  currentStep > step.id
                    ? "bg-green-500 text-white shadow-green-200 scale-110"
                    : currentStep === step.id
                      ? "bg-blue-500 text-white shadow-blue-200 scale-110"
                      : "bg-white text-slate-500 border-2 border-slate-200"
                }
              `}
            >
              {currentStep > step.id ? <Check className="w-6 h-6" /> : step.id}
            </div>
            <div className="mt-3 text-center">
              <p
                className={`text-sm font-medium transition-colors duration-300 ${
                  currentStep >= step.id ? "text-slate-700" : "text-slate-500"
                }`}
              >
                {step.title}
              </p>
            </div>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`
                w-16 h-0.5 mx-4 mt-[-1.5rem] flex-shrink-0 transition-all duration-500
                ${currentStep > step.id ? "bg-green-400" : "bg-slate-300"}
              `}
            />
          )}
        </div>
      ))}
    </div>
  )
}
