"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Clock, MessageSquare, Upload, Youtube, Trash2, ChevronDown } from "lucide-react"

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

export function HistoryDropdown() {
  const [history, setHistory] = useState<HistoryItem[]>([])

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

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 bg-transparent">
          <Clock className="w-4 h-4" />
          History ({history.length})
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto" align="end">
        <DropdownMenuLabel>Analysis History</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {history.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">No analysis history yet</div>
        ) : (
          history.map((item) => (
            <DropdownMenuItem
              key={item.id}
              className="p-3 cursor-pointer focus:bg-muted/50"
              onClick={() => loadAnalysis(item)}
            >
              <div className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(item.type)}
                    <span className="text-sm font-medium">{getTypeLabel(item.type)}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => deleteHistoryItem(item.id, e)}
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
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
