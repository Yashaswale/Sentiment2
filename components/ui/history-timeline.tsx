"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, MessageSquare, Upload, Youtube, Trash2, X } from "lucide-react"

interface HistoryItem {
  id: string
  type: "text" | "bulk" | "youtube"
  timestamp: string
  preview: string
  sentiment: {
    positive: number
    negative: number
    neutral: number
  }
}

export function HistoryTimeline() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Load history from localStorage
    const savedHistory = localStorage.getItem("sentimentHistory")
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }
  }, [])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "text":
        return <MessageSquare className="w-4 h-4" />
      case "bulk":
        return <Upload className="w-4 h-4" />
      case "youtube":
        return <Youtube className="w-4 h-4" />
      default:
        return <MessageSquare className="w-4 h-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "text":
        return "Text Analysis"
      case "bulk":
        return "Bulk Comments"
      case "youtube":
        return "YouTube Analysis"
      default:
        return "Analysis"
    }
  }

  const deleteHistoryItem = (id: string) => {
    const updatedHistory = history.filter((item) => item.id !== id)
    setHistory(updatedHistory)
    localStorage.setItem("sentimentHistory", JSON.stringify(updatedHistory))
  }

  const loadAnalysis = (item: HistoryItem) => {
    // Store the analysis data and navigate to results
    sessionStorage.setItem(
      "analysisData",
      JSON.stringify({
        type: item.type,
        data: item.preview,
        timestamp: item.timestamp,
      }),
    )
    window.location.href = "/results"
  }

  if (!isOpen) {
    return (
      <Button variant="outline" onClick={() => setIsOpen(true)} className="flex items-center gap-2">
        <Clock className="w-4 h-4" />
        History ({history.length})
      </Button>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg">Analysis History</CardTitle>
          <CardDescription>Your recent sentiment analyses</CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 max-h-96 overflow-y-auto">
        {history.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No analysis history yet</p>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => loadAnalysis(item)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getTypeIcon(item.type)}
                  <span className="text-sm font-medium">{getTypeLabel(item.type)}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteHistoryItem(item.id)
                  }}
                  className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{item.preview}</p>
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  <Badge variant="outline" className="text-xs bg-green-500/10 text-green-700">
                    {item.sentiment.positive}%
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-red-500/10 text-red-700">
                    {item.sentiment.negative}%
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-700">
                    {item.sentiment.neutral}%
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">{new Date(item.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
