"use client"

import { Brain } from "lucide-react"
import { AnimatedBlob } from "@/components/ui/animated-blob"
import { Progress } from "@/components/ui/progress"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      <AnimatedBlob className="top-20 right-20" size="lg" color="primary" />
      <AnimatedBlob className="bottom-32 left-32" size="md" color="secondary" variant="blob-2" />

      <div className="text-center space-y-4 relative z-10">
        <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto animate-pulse glow">
          <Brain className="w-8 h-8 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold">Analyzing Sentiment...</h2>
        <p className="text-muted-foreground">Our AI is processing your data and generating insights</p>
        <div className="w-64 mx-auto">
          <Progress value={75} className="h-2" />
        </div>
      </div>
    </div>
  )
}
