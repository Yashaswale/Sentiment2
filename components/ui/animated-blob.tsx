"use client"

import { cn } from "@/lib/utils"

interface AnimatedBlobProps {
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
  color?: "primary" | "secondary" | "accent"
  variant?: "blob" | "blob-2"
}

export function AnimatedBlob({ className, size = "md", color = "primary", variant = "blob" }: AnimatedBlobProps) {
  const sizeClasses = {
    sm: "w-32 h-32",
    md: "w-48 h-48",
    lg: "w-64 h-64",
    xl: "w-80 h-80",
  }

  const colorClasses = {
    primary: "gradient-primary",
    secondary: "gradient-secondary",
    accent: "gradient-accent",
  }

  return <div className={cn("absolute opacity-20 z-0 pointer-events-none", sizeClasses[size], colorClasses[color], variant, className)} />
}
