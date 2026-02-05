"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface StepperProps {
  steps: string[]
  currentStep: number
  className?: string
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                index < currentStep
                  ? "bg-green-500 text-white"
                  : index === currentStep
                    ? "gradient-primary text-primary-foreground animate-pulse"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {index < currentStep ? <Check className="w-5 h-5" /> : index + 1}
            </div>
            <span
              className={cn(
                "mt-2 text-xs font-medium transition-colors",
                index <= currentStep ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {step}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "w-16 h-0.5 mx-4 transition-colors duration-300",
                index < currentStep ? "bg-green-500" : "bg-muted",
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}
