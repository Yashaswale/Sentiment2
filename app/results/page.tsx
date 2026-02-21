"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { GradientButton } from "@/components/ui/gradient-button"
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
} from "@/components/ui/glass-card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AnimatedPieChart, AnimatedBarChart } from "@/components/ui/animated-chart"
import { EnhancedSentimentIcon } from "@/components/ui/enhanced-sentiment-icons"
import { WordCloud } from "@/components/ui/word-cloud"
import { SearchFilter } from "@/components/ui/search-filter"
import { HistoryDropdown } from "@/components/ui/history-dropdown"
import { Confetti } from "@/components/ui/confetti"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { AnimatedBlob } from "@/components/ui/animated-blob"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import {
  Brain,
  ArrowLeft,
  RefreshCw,
  PieChart,
  BarChart3,
  MessageSquare,
  Upload,
  Youtube,
  ThumbsUp,
  Clock,
  Cloud,
} from "lucide-react"

interface AnalysisData {
  type: "text" | "bulk" | "youtube"
  data: string
}

interface SentimentResult {
  positive: number
  negative: number
  neutral: number
  total: number
}

interface Comment {
  id: string
  text: string
  sentiment: "positive" | "negative" | "neutral"
  confidence: number
  author?: string
  likes?: number
  timestamp?: string
}

const COLORS = {
  positive: "#22c55e",
  negative: "#ef4444",
  neutral: "#f59e0b",
}

// Mock data generator
const generateMockResults = (type: string, inputData: string): { sentiment: SentimentResult; comments: Comment[] } => {
  const mockComments: Comment[] = [
    {
      id: "1",
      text: "This is absolutely amazing! I love everything about it. Best purchase I've ever made!",
      sentiment: "positive",
      confidence: 0.95,
      author: "Sarah Johnson",
      likes: 24,
      timestamp: "2 hours ago",
    },
    {
      id: "2",
      text: "Terrible experience. Would not recommend to anyone. Complete waste of money.",
      sentiment: "negative",
      confidence: 0.92,
      author: "Mike Chen",
      likes: 3,
      timestamp: "4 hours ago",
    },
    {
      id: "3",
      text: "It's okay, nothing special but does the job. Average quality for the price.",
      sentiment: "neutral",
      confidence: 0.78,
      author: "Alex Rivera",
      likes: 8,
      timestamp: "6 hours ago",
    },
    {
      id: "4",
      text: "Outstanding quality and excellent customer service! Highly recommend!",
      sentiment: "positive",
      confidence: 0.89,
      author: "Emma Davis",
      likes: 31,
      timestamp: "8 hours ago",
    },
    {
      id: "5",
      text: "Not what I expected. Poor quality and overpriced. Very disappointed.",
      sentiment: "negative",
      confidence: 0.87,
      author: "John Smith",
      likes: 5,
      timestamp: "12 hours ago",
    },
    {
      id: "6",
      text: "Pretty good overall. Some minor issues but generally satisfied.",
      sentiment: "neutral",
      confidence: 0.72,
      author: "Lisa Wang",
      likes: 12,
      timestamp: "1 day ago",
    },
    {
      id: "7",
      text: "Exceeded my expectations! Fantastic product and fast shipping!",
      sentiment: "positive",
      confidence: 0.93,
      author: "David Brown",
      likes: 18,
      timestamp: "1 day ago",
    },
    {
      id: "8",
      text: "Horrible customer support. Took weeks to get a response. Avoid!",
      sentiment: "negative",
      confidence: 0.91,
      author: "Rachel Green",
      likes: 7,
      timestamp: "2 days ago",
    },
    {
      id: "9",
      text: "Decent product. Works as advertised. Nothing more, nothing less.",
      sentiment: "neutral",
      confidence: 0.69,
      author: "Tom Wilson",
      likes: 4,
      timestamp: "2 days ago",
    },
    {
      id: "10",
      text: "Love it! Great value for money and excellent build quality!",
      sentiment: "positive",
      confidence: 0.88,
      author: "Maria Garcia",
      likes: 22,
      timestamp: "3 days ago",
    },
  ]

  const positive = mockComments.filter((c) => c.sentiment === "positive").length
  const negative = mockComments.filter((c) => c.sentiment === "negative").length
  const neutral = mockComments.filter((c) => c.sentiment === "neutral").length

  return {
    sentiment: {
      positive: Math.round((positive / mockComments.length) * 100),
      negative: Math.round((negative / mockComments.length) * 100),
      neutral: Math.round((neutral / mockComments.length) * 100),
      total: mockComments.length,
    },
    comments: mockComments,
  }
}

export default function ResultsPage() {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [results, setResults] = useState<{ sentiment: SentimentResult; comments: Comment[] } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [sentimentFilter, setSentimentFilter] = useState<string | null>(null)
  const [filteredComments, setFilteredComments] = useState<Comment[]>([])
  const router = useRouter()

  const headerRef = useScrollAnimation()
  const chartsRef = useScrollAnimation()
  const commentsRef = useScrollAnimation()

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("user")
    document.cookie = "isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    window.dispatchEvent(new Event("storage"))
    router.push("/register")
  }

  useEffect(() => {
    // Get analysis identifiers from sessionStorage
    const requestId = sessionStorage.getItem("analysisRequestId")
    const type = sessionStorage.getItem("analysisType") as "text" | "bulk" | "youtube" | null
    const inputPreview = sessionStorage.getItem("analysisInputPreview") || ""

    if (!requestId || !type) {
      router.push("/analysis")
      return
    }

    setAnalysisData({ type, data: inputPreview })

    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/v1/analyze-sentiment/${requestId}`)
        if (!res.ok) {
          throw new Error("Failed to load results")
        }

        const data = await res.json()

        // Map backend response to UI state
        // Backend returns: { summary: {...}, comments: [...] }
        const sentimentResult: SentimentResult = {
          positive: data.summary.positive,
          negative: data.summary.negative,
          neutral: data.summary.neutral,
          total: data.summary.total
        }

        const comments: Comment[] = data.comments.map((c: any) => ({
          id: c.id,
          text: c.text,
          sentiment: c.sentiment,
          confidence: c.confidence,
          author: "User", // Placeholder as backend doesn't store author yet for manual comments
          likes: 0,
          timestamp: new Date().toLocaleTimeString()
        }))

        setResults({ sentiment: sentimentResult, comments })
        setIsLoading(false)

        // Show confetti after results load
        setTimeout(() => setShowConfetti(true), 500)

        // Save to history
        const historyItem = {
          id: requestId,
          type: type,
          timestamp: new Date().toISOString(),
          preview: inputPreview.substring(0, 100) + (inputPreview.length > 100 ? "..." : ""),
          sentiment: sentimentResult,
        }

        const existingHistory = JSON.parse(localStorage.getItem("sentimentHistory") || "[]")
        // Check if already exists to avoid dupes on refresh
        if (!existingHistory.some((h: any) => h.id === requestId)) {
          const updatedHistory = [historyItem, ...existingHistory].slice(0, 10)
          localStorage.setItem("sentimentHistory", JSON.stringify(updatedHistory))
        }

      } catch (error) {
        console.error(error)
        // Keep loading state or show error (optional: add error state UI)
      }
    }

    fetchData()

    // Cleanup function: Delete comments from backend when component unmounts or user navigates away
    return () => {
      const deleteComments = async () => {
        try {
          const currentRequestId = sessionStorage.getItem("analysisRequestId")
          if (currentRequestId) {
            const deleteRes = await fetch(`http://localhost:8000/api/v1/comments/${currentRequestId}`, {
              method: "DELETE",
            })
            if (deleteRes.ok) {
              console.log("Comments deleted successfully from backend")
            } else {
              console.warn("Failed to delete comments from backend:", deleteRes.statusText)
            }
          }
        } catch (error) {
          console.error("Error deleting comments from backend:", error)
        }
      }
      deleteComments()
    }
  }, [router])

  // Handle browser tab/window close - delete comments when user closes the tab
  useEffect(() => {
    const handleBeforeUnload = () => {
      const requestId = sessionStorage.getItem("analysisRequestId")
      if (requestId) {
        // Use fetch with keepalive for reliable deletion on page unload
        fetch(`http://localhost:8000/api/v1/comments/${requestId}`, {
          method: "DELETE",
          keepalive: true,
        }).catch((error) => {
          console.error("Error deleting comments on page unload:", error)
        })
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [])

  useEffect(() => {
    if (!results) return

    let filtered = results.comments

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (comment) =>
          comment.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          comment.author?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply sentiment filter
    if (sentimentFilter) {
      filtered = filtered.filter((comment) => comment.sentiment === sentimentFilter)
    }

    // Sort by confidence: prioritize confidence > 75%, then by confidence descending
    filtered = [...filtered].sort((a, b) => {
      const aHigh = a.confidence > 0.75
      const bHigh = b.confidence > 0.75
      if (aHigh && !bHigh) return -1
      if (!aHigh && bHigh) return 1
      return b.confidence - a.confidence
    })

    setFilteredComments(filtered)
  }, [results, searchQuery, sentimentFilter])

  if (isLoading || !results || !analysisData) {
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

  const pieData = [
    { name: "Positive", value: results.sentiment.positive, color: "#22c55e" },
    { name: "Negative", value: results.sentiment.negative, color: "#ef4444" },
    { name: "Neutral", value: results.sentiment.neutral, color: "#f59e0b" },
  ]

  const barData = [
    { name: "Positive", value: results.sentiment.positive, fill: "#22c55e" },
    { name: "Negative", value: results.sentiment.negative, fill: "#ef4444" },
    { name: "Neutral", value: results.sentiment.neutral, fill: "#f59e0b" },
  ]

  const getAnalysisIcon = (type: string) => {
    switch (type) {
      case "text":
        return <MessageSquare className="w-5 h-5 text-foreground" />
      case "bulk":
        return <Upload className="w-5 h-5 text-foreground" />
      case "youtube":
        return <Youtube className="w-5 h-5 text-foreground" />
      default:
        return <PieChart className="w-5 h-5 text-foreground" />
    }
  }

  const overallSentiment =
    results.sentiment.positive > results.sentiment.negative && results.sentiment.positive > results.sentiment.neutral
      ? "positive"
      : results.sentiment.negative > results.sentiment.positive &&
        results.sentiment.negative > results.sentiment.neutral
        ? "negative"
        : "neutral"

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Elements */}
      <AnimatedBlob className="top-10 right-10" size="xl" color="primary" />
      <AnimatedBlob className="bottom-20 left-20" size="lg" color="secondary" variant="blob-2" />
      <AnimatedBlob className="top-1/2 right-1/4" size="md" color="accent" />

      {/* Confetti Effect */}
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />

      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/analysis" className="flex items-center gap-2 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center glow">
                <Brain className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-gradient">SentimentAI</span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <HistoryDropdown />
            <Button variant="ghost" className="flex items-center gap-2" onClick={handleLogout}>
              Logout
            </Button>
            <GradientButton className="flex items-center gap-2 glow-hover" onClick={() => router.push("/analysis")}>
              <RefreshCw className="w-4 h-4" />
              New Analysis
            </GradientButton>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header with Reactive Sentiment */}
          <div ref={headerRef.ref} className={`mb-8 fade-in-up ${headerRef.isVisible ? "animate" : "opacity-100"}`}>
            <div className="flex items-center gap-3 mb-4">
              {getAnalysisIcon(analysisData.type)}
              <h1 className="text-3xl font-bold text-foreground">
                Sentiment Analysis Results
                <span className="text-gradient ml-2">
                  {analysisData.type === "text"
                    ? "Text Analysis"
                    : analysisData.type === "bulk"
                      ? "Bulk Comments"
                      : "YouTube Comments"}
                </span>
              </h1>
              <EnhancedSentimentIcon
                sentiment={overallSentiment}
                size="xl"
                reactive={true}
                overallSentiment={overallSentiment}
              />
            </div>
            <p className="text-muted-foreground text-lg">
              Analysis completed for {results.sentiment.total} {results.sentiment.total === 1 ? "item" : "items"} with
              comprehensive sentiment insights
            </p>
          </div>

          {/* Overview Cards with Enhanced Icons */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <GlassCard className="shadow-lg glow-hover">
              <GlassCardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Analyzed</p>
                    <p className="text-3xl font-bold text-foreground">{results.sentiment.total}</p>
                  </div>
                  <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center glow">
                    <BarChart3 className="w-6 h-6 text-primary-foreground" />
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>

            <GlassCard className="shadow-lg glow-hover">
              <GlassCardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Positive</p>
                    <p className="text-3xl font-bold text-green-600">{results.sentiment.positive}%</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                    <EnhancedSentimentIcon sentiment="positive" size="lg" animated />
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>

            <GlassCard className="shadow-lg glow-hover">
              <GlassCardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Negative</p>
                    <p className="text-3xl font-bold text-red-600">{results.sentiment.negative}%</p>
                  </div>
                  <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
                    <EnhancedSentimentIcon sentiment="negative" size="lg" animated />
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>

            <GlassCard className="shadow-lg glow-hover">
              <GlassCardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Neutral</p>
                    <p className="text-3xl font-bold text-yellow-600">{results.sentiment.neutral}%</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                    <EnhancedSentimentIcon sentiment="neutral" size="lg" animated />
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>
          </div>

          {/* Charts and Word Cloud */}
          <div
            ref={chartsRef.ref}
            className={`grid lg:grid-cols-3 gap-8 mb-8 fade-in-up ${chartsRef.isVisible ? "animate" : "opacity-100"}`}
          >
            {/* Animated Pie Chart */}
            <GlassCard className="shadow-lg glow-hover">
              <GlassCardHeader>
                <GlassCardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-foreground" />
                  Sentiment Distribution
                </GlassCardTitle>
                <GlassCardDescription>Overall sentiment breakdown of analyzed content</GlassCardDescription>
              </GlassCardHeader>
              <GlassCardContent>
                <AnimatedPieChart data={pieData} className="h-80" />
              </GlassCardContent>
            </GlassCard>

            {/* Animated Bar Chart */}
            <GlassCard className="shadow-lg glow-hover">
              <GlassCardHeader>
                <GlassCardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-foreground" />
                  Sentiment Comparison
                </GlassCardTitle>
                <GlassCardDescription>Comparative view of sentiment categories</GlassCardDescription>
              </GlassCardHeader>
              <GlassCardContent>
                <AnimatedBarChart data={barData} className="h-80" />
              </GlassCardContent>
            </GlassCard>

            <GlassCard className="shadow-lg glow-hover">
              <GlassCardHeader>
                <GlassCardTitle className="flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-foreground" />
                  Word Cloud
                </GlassCardTitle>
                <GlassCardDescription>Most frequently used words in comments</GlassCardDescription>
              </GlassCardHeader>
              <GlassCardContent>
                <WordCloud comments={results.comments} className="h-64" />
              </GlassCardContent>
            </GlassCard>
          </div>

          {/* Top Comments Section - Enhanced to show Top 10 clearly */}
          <div ref={commentsRef.ref} className={`fade-in-up ${commentsRef.isVisible ? "animate" : "opacity-100"} space-y-4`}>
            <GlassCard className="shadow-lg">
              <GlassCardHeader>
                <GlassCardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-foreground" />
                  Top 20 Comments Analysis ({Math.min(filteredComments.length, 20)})
                </GlassCardTitle>
                <GlassCardDescription>
                  Detailed breakdown of the most relevant comments with search and filtering capabilities
                </GlassCardDescription>
              </GlassCardHeader>
              <GlassCardContent>
                <SearchFilter onSearch={setSearchQuery} onFilter={setSentimentFilter} currentFilter={sentimentFilter} />

                <div className="space-y-4">
                  {filteredComments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No comments match your search criteria</div>
                  ) : (
                    filteredComments.slice(0, 20).map((comment, index) => (
                      <GlassCard
                        key={comment.id}
                        className="hover:shadow-md transition-all duration-300 hover:-translate-y-1 hover:glow"
                      >
                        <GlassCardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                {index + 1}
                              </div>
                              <Badge
                                className={`flex items-center gap-2 ${comment.sentiment === "positive"
                                  ? "bg-green-500/10 text-green-700 border-green-200 dark:text-green-400"
                                  : comment.sentiment === "negative"
                                    ? "bg-red-500/10 text-red-700 border-red-200 dark:text-red-400"
                                    : "bg-yellow-500/10 text-yellow-700 border-yellow-200 dark:text-yellow-400"
                                  }`}
                              >
                                <EnhancedSentimentIcon sentiment={comment.sentiment} size="sm" />
                                {comment.sentiment.charAt(0).toUpperCase() + comment.sentiment.slice(1)}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {Math.round(comment.confidence * 100)}% confidence
                              </span>
                            </div>
                            {comment.likes && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <ThumbsUp className="w-3 h-3" />
                                {comment.likes}
                              </div>
                            )}
                          </div>
                          <p className="text-foreground mb-3 leading-relaxed">{comment.text}</p>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span className="font-medium">{comment.author}</span>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{comment.timestamp}</span>
                            </div>
                          </div>
                        </GlassCardContent>
                      </GlassCard>
                    ))
                  )}
                </div>
              </GlassCardContent>
            </GlassCard>
          </div>

          {/* Final Summary Pie Chart - Below Results */}
          <div className="mt-4">
            <GlassCard className="shadow-xl glow-hover max-w-2xl mx-auto">
              <GlassCardHeader className="text-center">
                <GlassCardTitle className="flex items-center justify-center gap-2 text-2xl">
                  <PieChart className="w-6 h-6 text-primary" />
                  <span className="text-foreground">Final Sentiment Summary</span>
                </GlassCardTitle>
                <GlassCardDescription className="text-base">
                  Percentage distribution of all analyzed sentiments
                </GlassCardDescription>
              </GlassCardHeader>
              <GlassCardContent>
                <AnimatedPieChart data={pieData} className="h-80" />
              </GlassCardContent>
            </GlassCard>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-2">
            <Link href="/analysis">
              <GradientButton size="lg" className="group glow-hover">
                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                Run New Analysis
              </GradientButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
