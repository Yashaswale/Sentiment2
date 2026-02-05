"use client"

import { useEffect, useState } from "react"

interface EnhancedSentimentIconProps {
  sentiment: "positive" | "negative" | "neutral"
  size?: "sm" | "md" | "lg" | "xl"
  animated?: boolean
  reactive?: boolean
  overallSentiment?: "positive" | "negative" | "neutral"
}

export function EnhancedSentimentIcon({
  sentiment,
  size = "md",
  animated = false,
  reactive = false,
  overallSentiment,
}: EnhancedSentimentIconProps) {
  const [currentEmoji, setCurrentEmoji] = useState("")
  const [isAnimating, setIsAnimating] = useState(false)

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
    xl: "text-3xl",
  }

  const emojis = {
    positive: ["😊", "😄", "🥰", "😍", "🤩", "😁"],
    negative: ["😞", "😢", "😡", "😠", "😤", "😰"],
    neutral: ["😐", "😑", "🤔", "😶", "🙂", "😌"],
  }

  useEffect(() => {
    if (reactive && overallSentiment) {
      setIsAnimating(true)
      const reactions = {
        positive: ["🎉", "✨", "🌟", "💫", "🎊"],
        negative: ["💔", "😰", "😱", "😵", "🤯"],
        neutral: ["🤷", "😐", "🤔", "😶", "🙂"],
      }

      let reactionIndex = 0
      const reactionInterval = setInterval(() => {
        setCurrentEmoji(reactions[overallSentiment][reactionIndex])
        reactionIndex = (reactionIndex + 1) % reactions[overallSentiment].length
      }, 300)

      setTimeout(() => {
        clearInterval(reactionInterval)
        setCurrentEmoji(emojis[sentiment][0])
        setIsAnimating(false)
      }, 2000)

      return () => clearInterval(reactionInterval)
    } else if (animated) {
      let emojiIndex = 0
      const interval = setInterval(() => {
        setCurrentEmoji(emojis[sentiment][emojiIndex])
        emojiIndex = (emojiIndex + 1) % emojis[sentiment].length
      }, 1000)

      return () => clearInterval(interval)
    } else {
      setCurrentEmoji(emojis[sentiment][0])
    }
  }, [sentiment, animated, reactive, overallSentiment])

  return (
    <span
      className={`
        ${sizeClasses[size]} 
        ${isAnimating ? "animate-bounce" : animated ? "animate-pulse" : ""}
        transition-all duration-300
      `}
    >
      {currentEmoji}
    </span>
  )
}
