"use client"

import { useEffect, useState } from "react"

interface ProcessingAnimationProps {
  isActive: boolean
  type: "text" | "bulk" | "youtube"
}

export function ProcessingAnimation({ isActive, type }: ProcessingAnimationProps) {
  const [currentEmoji, setCurrentEmoji] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const emojis = ["😊", "😐", "😢", "😍", "😡", "🤔", "😎", "🥳"]
  const steps = {
    text: ["Input", "Processing", "Results"],
    bulk: ["Input", "Processing", "Results"],
    youtube: ["Input", "Fetching", "Processing", "Results"],
  }

  useEffect(() => {
    if (!isActive) {
      setCurrentStep(0)
      return
    }

    const emojiInterval = setInterval(() => {
      setCurrentEmoji((prev) => (prev + 1) % emojis.length)
    }, 200)

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        const maxSteps = steps[type].length - 1
        return prev < maxSteps ? prev + 1 : prev
      })
    }, 1000)

    return () => {
      clearInterval(emojiInterval)
      clearInterval(stepInterval)
    }
  }, [isActive, type])

  if (!isActive) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4 text-center">
        <div className="text-6xl mb-6 animate-bounce">{emojis[currentEmoji]}</div>
        <h3 className="text-2xl font-bold mb-4">Analyzing Sentiment...</h3>
        <p className="text-muted-foreground mb-6">
          Our AI is processing your {type === "youtube" ? "YouTube comments" : type === "bulk" ? "comments" : "text"} to
          extract emotional insights.
        </p>
        <div className="mb-6">
          <div className="flex justify-center mb-4">
            {steps[type].map((step, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                    index <= currentStep ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </div>
                {index < steps[type].length - 1 && (
                  <div
                    className={`w-8 h-0.5 mx-2 transition-colors duration-300 ${
                      index < currentStep ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">{steps[type][currentStep]}</p>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="gradient-primary h-2 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${((currentStep + 1) / steps[type].length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
