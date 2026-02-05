"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface AnimatedTextProps {
  phrases: string[]
  className?: string
  interval?: number
}

export function AnimatedText({ phrases, className, interval = 3000 }: AnimatedTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setIsVisible(false)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % phrases.length)
        setIsVisible(true)
      }, 300)
    }, interval)

    return () => clearInterval(timer)
  }, [phrases.length, interval])

  return (
    <span
      className={cn(
        "transition-all duration-300 text-gradient font-bold",
        isVisible ? "opacity-100 transform translate-y-0" : "opacity-0 transform -translate-y-2",
        className,
      )}
    >
      {phrases[currentIndex]}
    </span>
  )
}
