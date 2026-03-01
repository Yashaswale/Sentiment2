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
import { ProcessingAnimation } from "@/components/ui/processing-animation"
import { AnimatedPieChart, AnimatedBarChart } from "@/components/ui/animated-chart"
import { EnhancedSentimentIcon } from "@/components/ui/enhanced-sentiment-icons"
import { WordCloud } from "@/components/ui/word-cloud"
import { SearchFilter } from "@/components/ui/search-filter"
import { Confetti } from "@/components/ui/confetti"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { AnimatedBlob } from "@/components/ui/animated-blob"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
  Sparkles,
  Check,
  Zap,
  Crown,
  Building2,
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

const SENTIMENT_COLORS = {
  positive: { hex: "#22c55e", rgb: [34, 197, 94] as [number, number, number] },
  negative: { hex: "#ef4444", rgb: [239, 68, 68] as [number, number, number] },
  neutral: { hex: "#f59e0b", rgb: [245, 158, 11] as [number, number, number] },
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
  const CW = PW - ML * 2

  const newPage = () => {
    doc.addPage()
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
  // PAGE 1 – PREMIUM COVER
  // ══════════════════════════════════════════════════════════════════════════

  // Deep gradient header block
  doc.setFillColor(30, 27, 75)
  doc.rect(0, 0, PW, 80, "F")

  // Gradient overlay strip
  doc.setFillColor(67, 56, 202)
  doc.rect(0, 0, PW, 50, "F")

  // Decorative accent circles
  doc.setFillColor(99, 102, 241)
  doc.circle(PW - 12, 12, 28, "F")
  doc.setFillColor(129, 140, 248)
  doc.circle(PW, 0, 18, "F")
  doc.setFillColor(79, 70, 229)
  doc.circle(20, 75, 15, "F")
  doc.setFillColor(109, 100, 239)
  doc.circle(0, 60, 10, "F")

  // Fetch logo image and convert to base64
  let logoDataUrl: string | null = null
  try {
    const logoResp = await fetch("https://res.cloudinary.com/drkhfntxp/image/upload/v1772340843/WhatsApp_Image_2026-03-01_at_10.02.29_AM_vrckdm.jpg")
    const logoBlob = await logoResp.blob()
    logoDataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.readAsDataURL(logoBlob)
    })
  } catch {
    // If fetch fails, we'll skip the logo
  }

  // Logo badge
  if (logoDataUrl) {
    // White background with padding around logo
    doc.setFillColor(255, 255, 255)
    drawRoundedRect(doc, ML, 8, 24, 24, 4, "F")
    doc.addImage(logoDataUrl, "JPEG", ML + 3, 11, 18, 18)
  } else {
    // Fallback pink badge
    doc.setFillColor(236, 72, 153)
    drawRoundedRect(doc, ML, 14, 12, 12, 2.5, "F")
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(255, 255, 255)
    doc.text("SA", ML + 6, 21.5, { align: "center" })
  }

  // Company name
  doc.setFontSize(24)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(255, 255, 255)
  doc.text("SentimentAI", ML + 28, 22)

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(199, 210, 254)
  doc.text("Advanced NLP Analysis Platform", ML + 28, 29)

  // Divider line
  doc.setDrawColor(129, 140, 248)
  doc.setLineWidth(0.5)
  doc.line(ML, 36, MR, 36)

  // Meta info row
  const typeLabel =
    analysisData.type === "text" ? "Text Analysis"
      : analysisData.type === "bulk" ? "Bulk Comments Analysis"
        : "YouTube Comments Analysis"

  doc.setFontSize(9.5)
  doc.setTextColor(199, 210, 254)
  doc.text(`Analysis Type: ${typeLabel}`, ML, 44)
  doc.text(`Generated: ${new Date().toLocaleString()}`, ML, 51)
  doc.text(`Total Items Analyzed: ${results.sentiment.total}`, ML, 58)

  // "CONFIDENTIAL" badge
  doc.setFillColor(236, 72, 153)
  drawRoundedRect(doc, MR - 40, 43, 38, 8, 4, "F")
  doc.setFontSize(7.5)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(255, 255, 255)
  doc.text("CONFIDENTIAL", MR - 21, 48.5, { align: "center" })

  // ── Summary Score Cards ─────────────────────────────────────────────────
  y = 92

  const cards = [
    { label: "Positive", pct: results.sentiment.positive, color: SENTIMENT_COLORS.positive.rgb, bg: [209, 250, 229] as [number, number, number], accent: [34, 197, 94] as [number, number, number] },
    { label: "Negative", pct: results.sentiment.negative, color: SENTIMENT_COLORS.negative.rgb, bg: [254, 226, 226] as [number, number, number], accent: [239, 68, 68] as [number, number, number] },
    { label: "Neutral", pct: results.sentiment.neutral, color: SENTIMENT_COLORS.neutral.rgb, bg: [254, 243, 199] as [number, number, number], accent: [245, 158, 11] as [number, number, number] },
  ]

  const cardW = (CW - 8) / 3
  cards.forEach((card, i) => {
    const cx = ML + i * (cardW + 4)

    // Card shadow (slight offset)
    doc.setFillColor(220, 220, 230)
    drawRoundedRect(doc, cx + 1.5, y + 1.5, cardW, 32, 4, "F")

    // Card BG
    doc.setFillColor(...card.bg)
    drawRoundedRect(doc, cx, y, cardW, 32, 4, "F")

    // Top accent bar
    doc.setFillColor(...card.accent)
    drawRoundedRect(doc, cx, y, cardW, 6, 4, "F")
    doc.rect(cx, y + 3, cardW, 3, "F")

    // Percentage value
    doc.setFontSize(22)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...card.color)
    doc.text(`${card.pct}%`, cx + cardW / 2, y + 23, { align: "center" })

    // Label
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(75, 85, 99)
    doc.text(card.label, cx + cardW / 2, y + 30, { align: "center" })
  })

  y += 44

  // ===== SECTION HEADER HELPER =====
  const sectionHeader = (title: string, subtitle?: string) => {
    doc.setFillColor(238, 242, 255)
    drawRoundedRect(doc, ML, y, CW, subtitle ? 16 : 12, 3, "F")
    doc.setFillColor(99, 102, 241)
    doc.rect(ML, y, 3.5, subtitle ? 16 : 12, "F")
    drawRoundedRect(doc, ML, y, 3.5, subtitle ? 16 : 12, 1.5, "F")

    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(55, 48, 163)
    doc.text(title, ML + 8, y + 8)

    if (subtitle) {
      doc.setFontSize(8)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(107, 114, 128)
      doc.text(subtitle, ML + 8, y + 14)
    }
    y += (subtitle ? 16 : 12) + 7
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SENTIMENT DISTRIBUTION CHARTS (Side by side)
  // ══════════════════════════════════════════════════════════════════════════
  sectionHeader("Sentiment Distribution", "Visual breakdown of all analyzed content")

  const chartSectionY = y
  const halfW = (CW - 6) / 2

  // Pie chart box
  doc.setFillColor(250, 250, 255)
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.3)
  drawRoundedRect(doc, ML, y, halfW, 78, 3, "FD")

  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(67, 56, 202)
  doc.text("Distribution (Donut)", ML + halfW / 2, y + 9, { align: "center" })

  const pieData = [
    { label: "Positive", value: results.sentiment.positive, color: SENTIMENT_COLORS.positive.rgb },
    { label: "Negative", value: results.sentiment.negative, color: SENTIMENT_COLORS.negative.rgb },
    { label: "Neutral", value: results.sentiment.neutral, color: SENTIMENT_COLORS.neutral.rgb },
  ]
  drawPieChart(doc, ML + halfW / 2, y + 42, 24, pieData)

  let legendY = y + 67
  pieData.forEach((d, i) => {
    const lx = ML + 6 + i * (halfW / 3)
    doc.setFillColor(...d.color)
    doc.rect(lx, legendY, 4.5, 3.5, "F")
    doc.setFontSize(6.5)
    doc.setTextColor(75, 85, 99)
    doc.text(`${d.label} ${d.value}%`, lx + 6, legendY + 3)
  })

  // Bar chart box
  const bx = ML + halfW + 6
  doc.setFillColor(250, 250, 255)
  doc.setDrawColor(226, 232, 240)
  drawRoundedRect(doc, bx, chartSectionY, halfW, 78, 3, "FD")

  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(67, 56, 202)
  doc.text("Comparison (Bar)", bx + halfW / 2, chartSectionY + 9, { align: "center" })

  const barData = [
    { label: "Positive", value: results.sentiment.positive, color: SENTIMENT_COLORS.positive.rgb },
    { label: "Negative", value: results.sentiment.negative, color: SENTIMENT_COLORS.negative.rgb },
    { label: "Neutral", value: results.sentiment.neutral, color: SENTIMENT_COLORS.neutral.rgb },
  ]
  const maxBarW = halfW - 34
  let barY = chartSectionY + 19

  barData.forEach((bar) => {
    const barFill = (bar.value / 100) * maxBarW

    doc.setFontSize(8)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(75, 85, 99)
    doc.text(bar.label, bx + 6, barY + 4)

    // Track
    doc.setFillColor(229, 231, 235)
    drawRoundedRect(doc, bx + 28, barY, maxBarW, 7.5, 2, "F")

    // Fill
    if (barFill > 0) {
      doc.setFillColor(...bar.color)
      drawRoundedRect(doc, bx + 28, barY, barFill, 7.5, 2, "F")
    }

    // Percentage label
    doc.setFontSize(7)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(55, 65, 81)
    doc.text(`${bar.value}%`, bx + 28 + maxBarW + 3, barY + 5)

    barY += 16
  })

  y = chartSectionY + 78 + 12

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 2 – SENTIMENT ANALYSIS THEORY
  // ══════════════════════════════════════════════════════════════════════════
  y = newPage()
  sectionHeader("About Sentiment Analysis", "Understanding the science behind this report")

  const theoryBlocks = [
    {
      title: "What is Sentiment Analysis?",
      body: "Sentiment Analysis (also known as Opinion Mining) is a Natural Language Processing (NLP) technique used to identify and extract subjective information from text. It determines whether the expressed opinion is positive, negative, or neutral. Modern sentiment analysis systems use transformer-based deep learning models (such as BERT, RoBERTa, and GPT variants) that are pre-trained on massive corpora and fine-tuned on domain-specific labeled datasets.",
    },
    {
      title: "How It Works",
      body: "The pipeline involves: (1) Text Preprocessing – tokenization, stop-word removal, stemming/lemmatization. (2) Feature Extraction – converting tokens into numerical embeddings using contextual word vectors. (3) Classification – a neural network head predicts sentiment polarity and assigns a confidence score (0–1) representing certainty. Scores above 0.60 are considered high-confidence predictions.",
    },
    {
      title: "Interpreting Confidence Scores",
      body: "Confidence score reflects the model's certainty in its prediction. A score of 0.90+ indicates very high certainty. Scores between 0.60–0.89 are considered reliable. Scores below 0.60 may indicate ambiguous language, sarcasm, domain-specific jargon, or mixed sentiment — these are excluded from the high-confidence report view to maintain quality.",
    },
    {
      title: "Applications & Industry Use Cases",
      body: "Sentiment analysis powers brand monitoring, customer feedback management, social media listening, product review analysis, market research, and political opinion tracking. Enterprises use it to measure Net Promoter Score (NPS) trends, detect PR crises early, and understand audience reactions to campaigns or product launches in real time.",
    },
    {
      title: "Limitations & Ethical Considerations",
      body: "No model achieves 100% accuracy. Sentiment analysis may struggle with sarcasm, cultural idioms, code-switching, and domain-specific language. Results should be interpreted in context and not used as the sole basis for major business decisions. Data privacy regulations (GDPR, CCPA) must be observed when processing user-generated content.",
    },
  ]

  for (const block of theoryBlocks) {
    const titleLines = doc.splitTextToSize(block.title, CW - 8)
    const bodyLines = doc.splitTextToSize(block.body, CW - 12)
    const blockH = titleLines.length * 6 + bodyLines.length * 5 + 16

    if (y + blockH > PH - 16) y = newPage()

    // Block card
    doc.setFillColor(250, 250, 255)
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.3)
    drawRoundedRect(doc, ML, y, CW, blockH, 3, "FD")

    // Left color accent
    doc.setFillColor(99, 102, 241)
    doc.rect(ML, y + 2, 3, blockH - 4, "F")
    drawRoundedRect(doc, ML, y + 2, 3, blockH - 4, 1.5, "F")

    // Title
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(55, 48, 163)
    doc.text(titleLines, ML + 8, y + 8)

    // Body
    doc.setFontSize(8.5)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(55, 65, 81)
    doc.text(bodyLines, ML + 8, y + 8 + titleLines.length * 6 + 2)

    y += blockH + 7
  }

  // ══════════════════════════════════════════════════════════════════════════
  // INPUT PREVIEW
  // ══════════════════════════════════════════════════════════════════════════
  if (analysisData.data) {
    if (y > PH - 50) y = newPage()
    sectionHeader("Input Preview")

    const previewText = analysisData.data.length > 300
      ? `${analysisData.data.slice(0, 300)}…`
      : analysisData.data

    const cleanText = previewText.replace(/[^\x20-\x7E\n]/g, "")
    doc.setFontSize(8.5)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(55, 65, 81)
    const previewLines = doc.splitTextToSize(cleanText, CW - 8)
    const boxH = previewLines.length * 5 + 10

    doc.setFillColor(249, 250, 251)
    doc.setDrawColor(229, 231, 235)
    doc.setLineWidth(0.3)
    drawRoundedRect(doc, ML, y, CW, boxH, 3, "FD")
    doc.text(previewLines, ML + 4, y + 8)
    y += boxH + 12
  }

  // ══════════════════════════════════════════════════════════════════════════
  // TOP COMMENTS
  // ══════════════════════════════════════════════════════════════════════════
  if (y > PH - 60) y = newPage()
  sectionHeader("Top High-Confidence Comments", "Comments with ≥ 60% confidence, ranked by score")

  const commentsToShow = (filteredComments.length ? filteredComments : results.comments)
    .filter((c) => c.confidence >= 0.6)
    .slice(0, 5)

  const cleanCommentText = (text: string) =>
    text
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
      .replace(/[^\x20-\x7E]/g, "")

  if (commentsToShow.length === 0) {
    doc.setFontSize(9)
    doc.setTextColor(107, 114, 128)
    doc.text("No high-confidence comments available.", ML, y + 4)
    y += 14
  }

  commentsToShow.forEach((comment, index) => {
    const commentText = cleanCommentText(comment.text)
    const lines = doc.splitTextToSize(commentText, CW - 30)
    const rowH = lines.length * 5 + 16

    if (y + rowH > PH - 16) y = newPage()

    const sentColor = SENTIMENT_COLORS[comment.sentiment]

    // Card shadow
    doc.setFillColor(230, 230, 245)
    drawRoundedRect(doc, ML + 1.5, y + 1.5, CW, rowH, 3, "F")

    // Card background
    doc.setFillColor(250, 250, 255)
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.25)
    drawRoundedRect(doc, ML, y, CW, rowH, 3, "FD")

    // Left accent stripe
    doc.setFillColor(...sentColor.rgb)
    doc.rect(ML, y + 2, 3.5, rowH - 4, "F")
    drawRoundedRect(doc, ML, y + 2, 3.5, rowH - 4, 1.5, "F")

    // Index badge
    doc.setFillColor(67, 56, 202)
    doc.circle(ML + 12, y + 8, 5, "F")
    doc.setFontSize(8)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(255, 255, 255)
    doc.text(String(index + 1), ML + 12, y + 9.5, { align: "center" })

    // Sentiment badge pill
    const sentLabel = comment.sentiment.charAt(0).toUpperCase() + comment.sentiment.slice(1)
    const confPct = Math.round(comment.confidence * 100)
    doc.setFillColor(...sentColor.rgb)
    drawRoundedRect(doc, ML + 22, y + 4, 24, 7.5, 3.75, "F")
    doc.setFontSize(7.5)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(255, 255, 255)
    doc.text(sentLabel, ML + 34, y + 8.5, { align: "center" })

    // Confidence text
    doc.setFontSize(7.5)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(107, 114, 128)
    doc.text(`${confPct}% confidence`, ML + 50, y + 8.5)

    // Comment text
    doc.setFontSize(8.5)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(31, 41, 55)
    doc.text(lines, ML + 6, y + 16)

    // Confidence mini-bar (top-right)
    const barTrackW = 32
    const barFill = comment.confidence * barTrackW
    doc.setFillColor(229, 231, 235)
    drawRoundedRect(doc, MR - barTrackW - 2, y + 4, barTrackW, 4.5, 2.25, "F")
    doc.setFillColor(...sentColor.rgb)
    drawRoundedRect(doc, MR - barTrackW - 2, y + 4, barFill, 4.5, 2.25, "F")

    y += rowH + 5
  })

  // ══════════════════════════════════════════════════════════════════════════
  // KEY INSIGHTS SUMMARY BOX
  // ══════════════════════════════════════════════════════════════════════════
  if (y > PH - 60) y = newPage()
  sectionHeader("Key Insights", "AI-generated summary of your analysis results")

  const dominant = results.sentiment.positive >= results.sentiment.negative && results.sentiment.positive >= results.sentiment.neutral
    ? "positive" : results.sentiment.negative >= results.sentiment.positive && results.sentiment.negative >= results.sentiment.neutral
      ? "negative" : "neutral"
  const dominantPct = results.sentiment[dominant]
  const insightLines = doc.splitTextToSize(
    `Overall sentiment is predominantly ${dominant.toUpperCase()} at ${dominantPct}%. ` +
    `Out of ${results.sentiment.total} analyzed items, ${Math.round(results.sentiment.total * results.sentiment.positive / 100)} were positive, ` +
    `${Math.round(results.sentiment.total * results.sentiment.negative / 100)} were negative, and ` +
    `${Math.round(results.sentiment.total * results.sentiment.neutral / 100)} were neutral. ` +
    (results.sentiment.positive > 60 ? "Strong positive sentiment indicates high satisfaction and approval." :
      results.sentiment.negative > 60 ? "High negative sentiment signals areas requiring immediate attention and improvement." :
        "Mixed sentiment distribution suggests diverse opinions — further segmentation recommended."),
    CW - 12
  )
  const insightH = insightLines.length * 5.5 + 14

  doc.setFillColor(238, 242, 255)
  doc.setDrawColor(199, 210, 254)
  doc.setLineWidth(0.4)
  drawRoundedRect(doc, ML, y, CW, insightH, 4, "FD")
  doc.setFillColor(99, 102, 241)
  drawRoundedRect(doc, ML, y, CW, 6, 4, "F")
  doc.rect(ML, y + 3, CW, 3, "F")

  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(55, 48, 163)
  doc.text(insightLines, ML + 6, y + 14)
  y += insightH + 10

  // ══════════════════════════════════════════════════════════════════════════
  // PREMIUM FOOTER on every page
  // ══════════════════════════════════════════════════════════════════════════
  const totalPages = (doc as any).internal.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    doc.setFillColor(249, 250, 251)
    doc.rect(0, PH - 13, PW, 13, "F")
    doc.setFillColor(67, 56, 202)
    doc.rect(0, PH - 13, PW, 1.5, "F")
    doc.setFontSize(7)
    doc.setTextColor(156, 163, 175)
    doc.text("Generated by SentimentAI  ·  AI-powered NLP Sentiment Analysis Platform", ML, PH - 5)
    doc.text(`Page ${p} of ${totalPages}`, MR, PH - 5, { align: "right" })
  }

  doc.save("sentimentai-analysis-report.pdf")
}

// ─── PREMIUM PLAN DIALOG ─────────────────────────────────────────────────────

function PremiumPlansDialog() {
  const plans = [
    {
      name: "Starter",
      icon: <Zap className="w-5 h-5" />,
      price: "$9",
      period: "/month",
      color: "from-blue-500 to-cyan-500",
      border: "border-blue-300 dark:border-blue-700",
      features: [
        "500 analyses / month",
        "Text & Bulk analysis",
        "Basic PDF reports",
        "Email support",
      ],
      cta: "Get Started",
    },
    {
      name: "Booster",
      icon: <Crown className="w-5 h-5" />,
      price: "$29",
      period: "/month",
      color: "from-violet-600 to-purple-600",
      border: "border-violet-400 dark:border-violet-500",
      popular: true,
      features: [
        "5,000 analyses / month",
        "Text, Bulk & YouTube",
        "Premium branded PDF reports",
        "Word Cloud & Advanced charts",
        "Priority support",
      ],
      cta: "Upgrade Now",
    },
    {
      name: "Enterprise",
      icon: <Building2 className="w-5 h-5" />,
      price: "$99",
      period: "/month",
      color: "from-amber-500 to-yellow-500",
      border: "border-amber-300 dark:border-amber-600",
      features: [
        "Unlimited analyses",
        "All analysis types",
        "White-label PDF reports",
        "API access & webhooks",
        "Dedicated account manager",
        "Custom integrations",
      ],
      cta: "Contact Sales",
    },
  ]

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 border-2 hover:scale-105 transition-transform"
          style={{
            borderColor: "#d4af37",
            color: "#d4af37",
            boxShadow: "0 0 8px rgba(212,175,55,0.3)",
          }}
        >
          <Sparkles className="w-4 h-4" />
          Premium Plan
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl w-full">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            Choose Your Plan
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Unlock the full power of AI-driven sentiment analysis
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl border-2 ${plan.border} p-6 flex flex-col gap-4 ${plan.popular ? "shadow-xl scale-[1.03]" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-white`}>
                {plan.icon}
              </div>

              <div>
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-extrabold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm mb-1">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-2 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full mt-2 py-2 rounded-lg text-sm font-bold text-white bg-gradient-to-r ${plan.color} hover:opacity-90 transition-opacity`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        <DialogFooter className="mt-2 text-center">
          <p className="text-xs text-muted-foreground w-full text-center">
            All plans include 14-day free trial. No credit card required.{" "}
            <a href="mailto:sentimentsupport@gmail.com" className="underline text-primary">
              Contact us
            </a>{" "}
            for custom pricing.
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
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

  // Threshold changed from 0.7 to 0.6
  useEffect(() => {
    if (!results) return

    let filtered = results.comments.filter((c) => c.confidence >= 0.6)

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
    { name: "Neutral", value: results.sentiment.neutral, color: "#f59e0b" },
  ]

  const barData = [
    { name: "Positive", value: results.sentiment.positive, fill: "#22c55e" },
    { name: "Negative", value: results.sentiment.negative, fill: "#ef4444" },
    { name: "Neutral", value: results.sentiment.neutral, fill: "#f59e0b" },
  ]

  const getAnalysisIcon = (type: string) => {
    switch (type) {
      case "text": return <MessageSquare className="w-5 h-5 text-foreground" />
      case "bulk": return <Upload className="w-5 h-5 text-foreground" />
      case "youtube": return <Youtube className="w-5 h-5 text-foreground" />
      default: return <PieChart className="w-5 h-5 text-foreground" />
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
            {/* Premium Plan button replaces History dropdown */}
            <PremiumPlansDialog />
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
                      <p className={`text-3xl font-bold ${s === "positive" ? "text-green-600" : s === "negative" ? "text-red-600" : "text-yellow-600"
                        }`}>
                        {results.sentiment[s]}%
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s === "positive" ? "bg-green-500/10" : s === "negative" ? "bg-red-500/10" : "bg-yellow-500/10"
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
              {/* Chart 1 — Pie/Bar/Radar (3 types) */}
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

              {/* Chart 2 — Bar/Pie (2 types) */}
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
                  Top Comments Analysis ({Math.min(filteredComments.length, 10)})
                </GlassCardTitle>
                <GlassCardDescription>
                  Showing comments with ≥ 60% confidence — detailed breakdown with search and filtering
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
                              <Badge className={`flex items-center gap-2 ${comment.sentiment === "positive"
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
