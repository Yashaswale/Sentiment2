"use client"

import { useState, useEffect, useRef } from "react"
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
import { ProcessingAnimation } from "@/components/ui/processing-animation"
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

// ─── PDF EXPORT ──────────────────────────────────────────────────────────────

const drawRoundedRect = (
  doc: any,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  style: "F" | "S" | "FD" = "F"
) => {
  doc.roundedRect(x, y, w, h, r, r, style)
}

const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0]
}

const SENTIMENT_COLORS = {
  positive: { hex: "#22c55e", rgb: [34, 197, 94] as [number, number, number] },
  negative: { hex: "#ef4444", rgb: [239, 68, 68] as [number, number, number] },
  neutral:  { hex: "#f59e0b", rgb: [245, 158, 11] as [number, number, number] },
}

const drawPieChart = (
  doc: any,
  cx: number,
  cy: number,
  radius: number,
  data: { label: string; value: number; color: [number, number, number] }[]
) => {
  const total = data.reduce((s, d) => s + d.value, 0)
  if (total === 0) return

  let startAngle = -Math.PI / 2

  data.forEach((slice) => {
    if (slice.value === 0) return
    const angle = (slice.value / total) * 2 * Math.PI
    const endAngle = startAngle + angle
    const steps = Math.max(8, Math.floor(angle * 20))

    // Build arc path points
    const points: [number, number][] = [[cx, cy]]
    for (let i = 0; i <= steps; i++) {
      const a = startAngle + (angle * i) / steps
      points.push([cx + radius * Math.cos(a), cy + radius * Math.sin(a)])
    }
    points.push([cx, cy])

    doc.setFillColor(...slice.color)
    doc.triangle(
      points[0][0], points[0][1],
      points[1][0], points[1][1],
      points[2][0], points[2][1],
      "F"
    )

    // Fill in remaining triangles to approximate the sector
    for (let i = 2; i < points.length - 1; i++) {
      doc.triangle(
        cx, cy,
        points[i][0], points[i][1],
        points[i + 1]?.[0] ?? points[i][0], points[i + 1]?.[1] ?? points[i][1],
        "F"
      )
    }

    startAngle = endAngle
  })

  // White centre hole (donut)
  doc.setFillColor(255, 255, 255)
  doc.circle(cx, cy, radius * 0.45, "F")
}

const generatePDF = async (
  results: { sentiment: SentimentResult; comments: Comment[] },
  analysisData: AnalysisData,
  filteredComments: Comment[]
) => {
  const { default: jsPDF } = await import("jspdf")
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })

  const PW = doc.internal.pageSize.getWidth()   // 210
  const PH = doc.internal.pageSize.getHeight()  // 297
  const ML = 16
  const MR = PW - ML
  const CW = PW - ML * 2  // content width

  // ── Helpers ──────────────────────────────────────────────────────────────
  const newPage = () => {
    doc.addPage()
    // Subtle header stripe on continuation pages
    doc.setFillColor(249, 250, 251)
    doc.rect(0, 0, PW, 10, "F")
    doc.setFillColor(99, 102, 241)
    doc.rect(0, 0, PW, 1.5, "F")
    doc.setFontSize(7)
    doc.setTextColor(156, 163, 175)
    doc.text("SentimentAI  ·  Confidential Report", PW / 2, 7, { align: "center" })
    return 16
  }

  let y = 0

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 1 – COVER / HEADER
  // ══════════════════════════════════════════════════════════════════════════

  // Deep indigo header block
  doc.setFillColor(67, 56, 202)
  doc.rect(0, 0, PW, 58, "F")

  // Decorative accent circle (top-right)
  doc.setFillColor(99, 102, 241)
  doc.circle(PW - 8, 8, 22, "F")
  doc.setFillColor(129, 140, 248)
  doc.circle(PW + 2, 0, 14, "F")

  // Logo badge
  doc.setFillColor(236, 72, 153)
  drawRoundedRect(doc, ML, 12, 10, 10, 2, "F")
  doc.setFontSize(8)
  doc.setTextColor(255, 255, 255)
  doc.text("SA", ML + 5, 18.5, { align: "center" })

  // Title
  doc.setFontSize(22)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(255, 255, 255)
  doc.text("SentimentAI", ML + 14, 19)

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(199, 210, 254)
  doc.text("Analysis Report", ML + 14, 26)

  // Divider line
  doc.setDrawColor(129, 140, 248)
  doc.setLineWidth(0.4)
  doc.line(ML, 33, MR, 33)

  // Meta row
  const typeLabel =
    analysisData.type === "text" ? "Text Analysis"
    : analysisData.type === "bulk" ? "Bulk Comments"
    : "YouTube Comments"

  doc.setFontSize(9)
  doc.setTextColor(199, 210, 254)
  doc.text(`Type: ${typeLabel}`, ML, 41)
  doc.text(`Generated: ${new Date().toLocaleString()}`, ML, 48)
  doc.text(`Total Items Analyzed: ${results.sentiment.total}`, ML + 90, 41)

  // ── Summary Score Cards ─────────────────────────────────────────────────
  y = 68

  const cards = [
    { label: "Positive", pct: results.sentiment.positive, color: SENTIMENT_COLORS.positive.rgb, bg: [220, 252, 231] as [number,number,number] },
    { label: "Negative", pct: results.sentiment.negative, color: SENTIMENT_COLORS.negative.rgb, bg: [254, 226, 226] as [number,number,number] },
    { label: "Neutral",  pct: results.sentiment.neutral,  color: SENTIMENT_COLORS.neutral.rgb,  bg: [254, 243, 199] as [number,number,number] },
  ]

  const cardW = (CW - 8) / 3
  cards.forEach((card, i) => {
    const cx = ML + i * (cardW + 4)
    doc.setFillColor(...card.bg)
    drawRoundedRect(doc, cx, y, cardW, 26, 3, "F")

    doc.setFillColor(...card.color)
    drawRoundedRect(doc, cx, y, cardW, 6, 3, "F")
    doc.rect(cx, y + 3, cardW, 3, "F")

    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...card.color)
    doc.text(`${card.pct}%`, cx + cardW / 2, y + 19, { align: "center" })

    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(75, 85, 99)
    doc.text(card.label, cx + cardW / 2, y + 25, { align: "center" })
  })

  y += 36

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION HEADER helper
  // ══════════════════════════════════════════════════════════════════════════
  const sectionHeader = (title: string, subtitle?: string) => {
    doc.setFillColor(238, 242, 255)
    drawRoundedRect(doc, ML, y, CW, subtitle ? 14 : 10, 2, "F")
    doc.setFillColor(99, 102, 241)
    doc.rect(ML, y, 3, subtitle ? 14 : 10, "F")
    drawRoundedRect(doc, ML, y, 3, subtitle ? 14 : 10, 1, "F")

    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(55, 48, 163)
    doc.text(title, ML + 7, y + 7)

    if (subtitle) {
      doc.setFontSize(7.5)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(107, 114, 128)
      doc.text(subtitle, ML + 7, y + 12)
    }
    y += (subtitle ? 14 : 10) + 6
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PIE CHART  +  BAR CHART (side by side)
  // ══════════════════════════════════════════════════════════════════════════
  sectionHeader("Sentiment Distribution", "Visual breakdown of all analyzed content")

  const chartSectionY = y
  const halfW = (CW - 6) / 2

  // Pie chart box
  doc.setFillColor(250, 250, 255)
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.3)
  drawRoundedRect(doc, ML, y, halfW, 72, 3, "FD")

  doc.setFontSize(8.5)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(67, 56, 202)
  doc.text("Distribution", ML + halfW / 2, y + 8, { align: "center" })

  // Draw donut pie
  const pieData = [
    { label: "Positive", value: results.sentiment.positive, color: SENTIMENT_COLORS.positive.rgb },
    { label: "Negative", value: results.sentiment.negative, color: SENTIMENT_COLORS.negative.rgb },
    { label: "Neutral",  value: results.sentiment.neutral,  color: SENTIMENT_COLORS.neutral.rgb  },
  ]
  drawPieChart(doc, ML + halfW / 2, y + 37, 22, pieData)

  // Pie legend
  let legendY = y + 62
  pieData.forEach((d, i) => {
    const lx = ML + 6 + i * (halfW / 3)
    doc.setFillColor(...d.color)
    doc.rect(lx, legendY, 4, 3, "F")
    doc.setFontSize(6.5)
    doc.setTextColor(75, 85, 99)
    doc.text(`${d.label} ${d.value}%`, lx + 5.5, legendY + 2.5)
  })

  // Bar chart box
  const bx = ML + halfW + 6
  doc.setFillColor(250, 250, 255)
  doc.setDrawColor(226, 232, 240)
  drawRoundedRect(doc, bx, chartSectionY, halfW, 72, 3, "FD")

  doc.setFontSize(8.5)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(67, 56, 202)
  doc.text("Comparison", bx + halfW / 2, chartSectionY + 8, { align: "center" })

  // Draw horizontal bars
  const barData = [
    { label: "Positive", value: results.sentiment.positive, color: SENTIMENT_COLORS.positive.rgb },
    { label: "Negative", value: results.sentiment.negative, color: SENTIMENT_COLORS.negative.rgb },
    { label: "Neutral",  value: results.sentiment.neutral,  color: SENTIMENT_COLORS.neutral.rgb  },
  ]
  const maxBarW = halfW - 32
  let barY = chartSectionY + 18

  barData.forEach((bar) => {
    const barFill = (bar.value / 100) * maxBarW

    doc.setFontSize(7.5)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(75, 85, 99)
    doc.text(bar.label, bx + 6, barY + 3.5)

    // Track
    doc.setFillColor(229, 231, 235)
    drawRoundedRect(doc, bx + 26, barY, maxBarW, 7, 1.5, "F")

    // Fill
    if (barFill > 0) {
      doc.setFillColor(...bar.color)
      drawRoundedRect(doc, bx + 26, barY, barFill, 7, 1.5, "F")
    }

    // Percentage label
    doc.setFontSize(6.5)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(55, 65, 81)
    doc.text(`${bar.value}%`, bx + 26 + maxBarW + 2, barY + 5)

    barY += 14
  })

  y = chartSectionY + 72 + 10

  // ══════════════════════════════════════════════════════════════════════════
  // INPUT PREVIEW
  // ══════════════════════════════════════════════════════════════════════════
  if (analysisData.data) {
    if (y > PH - 50) y = newPage()
    sectionHeader("Input Preview")

    doc.setFillColor(249, 250, 251)
    doc.setDrawColor(229, 231, 235)
    drawRoundedRect(doc, ML, y, CW, 1, 2, "F") // placeholder height, redrawn after

    const previewText = analysisData.data.length > 300
      ? `${analysisData.data.slice(0, 300)}…`
      : analysisData.data

    const cleanText = previewText.replace(/[^\x20-\x7E\n]/g, "")
    doc.setFontSize(8.5)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(55, 65, 81)
    const lines = doc.splitTextToSize(cleanText, CW - 8)
    const boxH = lines.length * 5 + 8

    doc.setFillColor(249, 250, 251)
    doc.setDrawColor(229, 231, 235)
    doc.setLineWidth(0.3)
    drawRoundedRect(doc, ML, y, CW, boxH, 3, "FD")
    doc.text(lines, ML + 4, y + 7)
    y += boxH + 10
  }

  // ══════════════════════════════════════════════════════════════════════════
  // TOP COMMENTS
  // ══════════════════════════════════════════════════════════════════════════
  if (y > PH - 60) y = newPage()
  sectionHeader("Top 5 Comments Analysis", "Comments with ≥ 70% confidence, ranked by confidence score")

  const commentsToShow = (filteredComments.length ? filteredComments : results.comments)
    .filter((c) => c.confidence >= 0.7)
    .slice(0, 5)

  const cleanCommentText = (text: string) =>
    text
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
      .replace(/[^\x20-\x7E]/g, "")

  commentsToShow.forEach((comment, index) => {
    const commentText = cleanCommentText(comment.text)
    const lines = doc.splitTextToSize(commentText, CW - 30)
    const rowH = lines.length * 5 + 14

    if (y + rowH > PH - 16) y = newPage()

    const sentColor = SENTIMENT_COLORS[comment.sentiment]

    // Card background
    doc.setFillColor(250, 250, 255)
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.25)
    drawRoundedRect(doc, ML, y, CW, rowH, 3, "FD")

    // Left accent stripe
    doc.setFillColor(...sentColor.rgb)
    doc.rect(ML, y + 2, 3, rowH - 4, "F")
    drawRoundedRect(doc, ML, y + 2, 3, rowH - 4, 1.5, "F")

    // Index badge
    doc.setFillColor(67, 56, 202)
    doc.circle(ML + 11, y + 7, 4.5, "F")
    doc.setFontSize(7)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(255, 255, 255)
    doc.text(String(index + 1), ML + 11, y + 8.5, { align: "center" })

    // Sentiment badge pill
    const sentLabel = comment.sentiment.charAt(0).toUpperCase() + comment.sentiment.slice(1)
    const confPct = Math.round(comment.confidence * 100)
    doc.setFillColor(...sentColor.rgb)
    drawRoundedRect(doc, ML + 20, y + 3, 22, 7, 3.5, "F")
    doc.setFontSize(7)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(255, 255, 255)
    doc.text(sentLabel, ML + 31, y + 7.5, { align: "center" })

    // Confidence
    doc.setFontSize(7.5)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(107, 114, 128)
    doc.text(`${confPct}% confidence`, ML + 46, y + 7.5)

    // Comment text
    doc.setFontSize(8.5)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(31, 41, 55)
    doc.text(lines, ML + 6, y + 14)

    // Confidence mini-bar
    const barTrackW = 30
    const barFill = (comment.confidence) * barTrackW
    doc.setFillColor(229, 231, 235)
    drawRoundedRect(doc, MR - barTrackW - 2, y + 3.5, barTrackW, 4, 2, "F")
    doc.setFillColor(...sentColor.rgb)
    drawRoundedRect(doc, MR - barTrackW - 2, y + 3.5, barFill, 4, 2, "F")

    y += rowH + 4
  })

  // ══════════════════════════════════════════════════════════════════════════
  // FOOTER on last page
  // ══════════════════════════════════════════════════════════════════════════
  const totalPages = (doc as any).internal.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    doc.setFillColor(249, 250, 251)
    doc.rect(0, PH - 10, PW, 10, "F")
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.3)
    doc.line(ML, PH - 10, MR, PH - 10)
    doc.setFontSize(7)
    doc.setTextColor(156, 163, 175)
    doc.text("Generated by SentimentAI  ·  AI-powered sentiment insights", ML, PH - 4)
    doc.text(`Page ${p} of ${totalPages}`, MR, PH - 4, { align: "right" })
  }

  doc.save("sentiment-analysis-report.pdf")
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function ResultsPage() {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [results, setResults] = useState<{ sentiment: SentimentResult; comments: Comment[] } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExportingPdf, setIsExportingPdf] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [sentimentFilter, setSentimentFilter] = useState<string | null>(null)
  const [filteredComments, setFilteredComments] = useState<Comment[]>([])
  const router = useRouter()

  const headerRef = useScrollAnimation()
  const chartsRef = useScrollAnimation()
  const commentsRef = useScrollAnimation()

  const handleExportPDF = async () => {
    if (!results || !analysisData) return
    setIsExportingPdf(true)
    try {
      await generatePDF(results, analysisData, filteredComments)
    } finally {
      setIsExportingPdf(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("user")
    document.cookie = "isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    window.dispatchEvent(new Event("storage"))
    router.push("/register")
  }

  useEffect(() => {
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
        if (!res.ok) throw new Error("Failed to load results")

        const data = await res.json()

        const sentimentResult: SentimentResult = {
          positive: data.summary.positive,
          negative: data.summary.negative,
          neutral: data.summary.neutral,
          total: data.summary.total,
        }

        const comments: Comment[] = data.comments.map((c: any) => ({
          id: c.id,
          text: c.text,
          sentiment: c.sentiment,
          confidence: c.confidence,
          author: "User",
          likes: 0,
          timestamp: new Date().toLocaleTimeString(),
        }))

        setResults({ sentiment: sentimentResult, comments })
        setIsLoading(false)
        setTimeout(() => setShowConfetti(true), 500)

        const historyItem = {
          id: requestId,
          type,
          timestamp: new Date().toISOString(),
          preview: inputPreview.substring(0, 100) + (inputPreview.length > 100 ? "..." : ""),
          sentiment: sentimentResult,
        }
        const existingHistory = JSON.parse(localStorage.getItem("sentimentHistory") || "[]")
        if (!existingHistory.some((h: any) => h.id === requestId)) {
          localStorage.setItem(
            "sentimentHistory",
            JSON.stringify([historyItem, ...existingHistory].slice(0, 10))
          )
        }
      } catch (error) {
        console.error(error)
      }
    }

    fetchData()

    return () => {
      const deleteComments = async () => {
        const id = sessionStorage.getItem("analysisRequestId")
        if (id) {
          await fetch(`http://localhost:8000/api/v1/comments/${id}`, { method: "DELETE" }).catch(console.error)
        }
      }
      deleteComments()
    }
  }, [router])

  useEffect(() => {
    const handleBeforeUnload = () => {
      const requestId = sessionStorage.getItem("analysisRequestId")
      if (requestId) {
        fetch(`http://localhost:8000/api/v1/comments/${requestId}`, { method: "DELETE", keepalive: true }).catch(console.error)
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [])

  useEffect(() => {
    if (!results) return

    let filtered = results.comments.filter((c) => c.confidence >= 0.7)

    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          c.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.author?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (sentimentFilter) {
      filtered = filtered.filter((c) => c.sentiment === sentimentFilter)
    }

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
    const type =
      (analysisData?.type ||
        (typeof window !== "undefined"
          ? (sessionStorage.getItem("analysisType") as "text" | "bulk" | "youtube" | null)
          : "text")) || "text"
    return <ProcessingAnimation isActive={true} type={type} />
  }

  const pieData = [
    { name: "Positive", value: results.sentiment.positive, color: "#22c55e" },
    { name: "Negative", value: results.sentiment.negative, color: "#ef4444" },
    { name: "Neutral",  value: results.sentiment.neutral,  color: "#f59e0b" },
  ]

  const barData = [
    { name: "Positive", value: results.sentiment.positive, fill: "#22c55e" },
    { name: "Negative", value: results.sentiment.negative, fill: "#ef4444" },
    { name: "Neutral",  value: results.sentiment.neutral,  fill: "#f59e0b" },
  ]

  const getAnalysisIcon = (type: string) => {
    switch (type) {
      case "text":    return <MessageSquare className="w-5 h-5 text-foreground" />
      case "bulk":    return <Upload className="w-5 h-5 text-foreground" />
      case "youtube": return <Youtube className="w-5 h-5 text-foreground" />
      default:        return <PieChart className="w-5 h-5 text-foreground" />
    }
  }

  const overallSentiment =
    results.sentiment.positive > results.sentiment.negative &&
    results.sentiment.positive > results.sentiment.neutral
      ? "positive"
      : results.sentiment.negative > results.sentiment.positive &&
        results.sentiment.negative > results.sentiment.neutral
      ? "negative"
      : "neutral"

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <AnimatedBlob className="top-10 right-10" size="xl" color="primary" />
      <AnimatedBlob className="bottom-20 left-20" size="lg" color="secondary" variant="blob-2" />
      <AnimatedBlob className="top-1/2 right-1/4" size="md" color="accent" />

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
            <Button variant="ghost" onClick={handleLogout}>Logout</Button>
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

          {/* Header */}
          <div ref={headerRef.ref} className={`mb-8 fade-in-up ${headerRef.isVisible ? "animate" : "opacity-100"}`}>
            <div className="flex items-center gap-3 mb-4">
              {getAnalysisIcon(analysisData.type)}
              <h1 className="text-3xl font-bold text-foreground">
                Sentiment Analysis Results
                <span className="text-gradient ml-2">
                  {analysisData.type === "text" ? "Text Analysis"
                    : analysisData.type === "bulk" ? "Bulk Comments"
                    : "YouTube Comments"}
                </span>
              </h1>
              <EnhancedSentimentIcon sentiment={overallSentiment} size="xl" reactive overallSentiment={overallSentiment} />
            </div>
            <p className="text-muted-foreground text-lg">
              Analysis completed for {results.sentiment.total}{" "}
              {results.sentiment.total === 1 ? "item" : "items"} with comprehensive sentiment insights
            </p>
          </div>

          {/* Overview Cards */}
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

            {(["positive", "negative", "neutral"] as const).map((s) => (
              <GlassCard key={s} className="shadow-lg glow-hover">
                <GlassCardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground capitalize">{s}</p>
                      <p className={`text-3xl font-bold ${
                        s === "positive" ? "text-green-600" : s === "negative" ? "text-red-600" : "text-yellow-600"
                      }`}>
                        {results.sentiment[s]}%
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      s === "positive" ? "bg-green-500/10" : s === "negative" ? "bg-red-500/10" : "bg-yellow-500/10"
                    }`}>
                      <EnhancedSentimentIcon sentiment={s} size="lg" animated />
                    </div>
                  </div>
                </GlassCardContent>
              </GlassCard>
            ))}
          </div>

          {/* Charts */}
          <div ref={chartsRef.ref} className={`fade-in-up ${chartsRef.isVisible ? "animate" : "opacity-100"}`}>
            <div className="grid lg:grid-cols-3 gap-8 mb-8">
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
          </div>

          {/* Comments */}
          <div ref={commentsRef.ref} className={`fade-in-up ${commentsRef.isVisible ? "animate" : "opacity-100"} space-y-4`}>
            <GlassCard className="shadow-lg">
              <GlassCardHeader>
                <GlassCardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-foreground" />
                  Top 10 Comments Analysis ({Math.min(filteredComments.length, 10)})
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
                    filteredComments.slice(0, 10).map((comment, index) => (
                      <GlassCard key={comment.id} className="hover:shadow-md transition-all duration-300 hover:-translate-y-1 hover:glow">
                        <GlassCardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                {index + 1}
                              </div>
                              <Badge className={`flex items-center gap-2 ${
                                comment.sentiment === "positive"
                                  ? "bg-green-500/10 text-green-700 border-green-200 dark:text-green-400"
                                  : comment.sentiment === "negative"
                                  ? "bg-red-500/10 text-red-700 border-red-200 dark:text-red-400"
                                  : "bg-yellow-500/10 text-yellow-700 border-yellow-200 dark:text-yellow-400"
                              }`}>
                                <EnhancedSentimentIcon sentiment={comment.sentiment} size="sm" />
                                {comment.sentiment.charAt(0).toUpperCase() + comment.sentiment.slice(1)}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {Math.round(comment.confidence * 100)}% confidence
                              </span>
                            </div>
                            {comment.likes != null && comment.likes > 0 && (
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

          {/* Final Summary Chart */}
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button variant="outline" className="h-11 px-6" onClick={handleExportPDF} disabled={isExportingPdf}>
              {isExportingPdf ? "Generating PDF…" : "Export Analysis as PDF"}
            </Button>
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
