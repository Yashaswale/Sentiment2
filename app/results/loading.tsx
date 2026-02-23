"use client"

import { useEffect, useState } from "react"
import { ProcessingAnimation } from "@/components/ui/processing-animation"

type AnalysisType = "text" | "bulk" | "youtube"

export default function Loading() {
  const [type, setType] = useState<AnalysisType>("text")

  useEffect(() => {
    if (typeof window === "undefined") return
    const storedType = sessionStorage.getItem("analysisType") as AnalysisType | null
    if (storedType === "text" || storedType === "bulk" || storedType === "youtube") {
      setType(storedType)
    }
  }, [])

  // Show the older emoji-style processing loader while the results route is loading
  return <ProcessingAnimation isActive={true} type={type} />
}
