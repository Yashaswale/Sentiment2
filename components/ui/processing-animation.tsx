"use client"

import { useEffect, useState } from "react"

interface ProcessingAnimationProps {
  isActive: boolean
  type: "text" | "bulk" | "youtube"
}

export function ProcessingAnimation({ isActive, type }: ProcessingAnimationProps) {
  const [currentEmoji, setCurrentEmoji] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  const emojis = ["😊", "😐", "😢", "😍", "😡", "🤔", "😎", "🥳"]
  const steps = {
    text: ["Input", "Processing", "Analyzing", "Results"],
    bulk: ["Input", "Processing", "Analyzing", "Results"],
    youtube: ["Input", "Fetching", "Processing", "Analyzing", "Results"],
  }

  const currentSteps = steps[type]

  useEffect(() => {
    if (!isActive) {
      setCurrentStep(0)
      setProgress(0)
      return
    }

    // Emoji cycles indefinitely
    const emojiInterval = setInterval(() => {
      setCurrentEmoji((prev) => (prev + 1) % emojis.length)
    }, 180)

    // Steps cycle — loops back so it NEVER appears stuck
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % currentSteps.length)
    }, 1200)

    // Progress bar: smoothly advances to ~90% then resets — gives the feel of ongoing work
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 10
        return prev + 2
      })
    }, 80)

    return () => {
      clearInterval(emojiInterval)
      clearInterval(stepInterval)
      clearInterval(progressInterval)
    }
  }, [isActive, type])

  if (!isActive) return null

  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-50 flex items-center justify-center">
      <div className="bg-card rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4 text-center border border-border/50">
        {/* Animated emoji */}
        <div className="text-6xl mb-6 animate-bounce">
          {emojis[currentEmoji]}
        </div>

        <h3 className="text-2xl font-bold mb-2">Analyzing Sentiment…</h3>
        <p className="text-muted-foreground mb-6 text-sm">
          Our AI is processing your{" "}
          {type === "youtube" ? "YouTube comments" : type === "bulk" ? "comments" : "text"}{" "}
          to extract emotional insights.
        </p>

        {/* Step indicators */}
        <div className="flex justify-center items-center gap-2 mb-5 flex-wrap">
          {currentSteps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all duration-500 ${index === currentStep
                    ? "gradient-primary text-primary-foreground scale-110 shadow-lg"
                    : index < currentStep
                      ? "bg-primary/30 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
              >
                {index + 1}
              </div>
              {index < currentSteps.length - 1 && (
                <div
                  className={`w-6 h-0.5 mx-1 transition-colors duration-500 ${index < currentStep ? "bg-primary" : "bg-muted"
                    }`}
                />
              )}
            </div>
          ))}
        </div>
        <p className="text-sm font-medium text-primary mb-5">{currentSteps[currentStep]}</p>

        {/* Indeterminate-style progress bar */}
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className="gradient-primary h-2 rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">Please wait while we process your data…</p>
      </div>
    </div>
  )
}
