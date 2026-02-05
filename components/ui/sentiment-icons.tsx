"use client"

import { useEffect } from "react"

import { useState } from "react"

interface SentimentIconProps {
  sentiment: "positive" | "negative" | "neutral"
  size?: "sm" | "md" | "lg"
  animated?: boolean
}

export function SentimentIcon({ sentiment, size = "md", animated = false }: SentimentIconProps) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
  }

  const getEmoji = () => {
    switch (sentiment) {
      case "positive":
        return "😊"
      case "negative":
        return "😢"
      case "neutral":
        return "😐"
      default:
        return "🤔"
    }
  }

  return <span className={`${sizeClasses[size]} ${animated ? "animate-bounce" : ""}`}>{getEmoji()}</span>
}

export function SentimentIconAnimated({ sentiment }: { sentiment: "positive" | "negative" | "neutral" }) {
  const emojis = {
    positive: ["😊", "😍", "🥳", "😎", "🤩"],
    negative: ["😢", "😡", "😤", "😞", "😠"],
    neutral: ["😐", "🤔", "😑", "😶", "🙄"],
  }

  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % emojis[sentiment].length)
    }, 2000)

    return () => clearInterval(interval)
  }, [sentiment])

  return (
    <span className="text-lg transition-all duration-300 transform hover:scale-110">
      {emojis[sentiment][currentIndex]}
    </span>
  )
}
