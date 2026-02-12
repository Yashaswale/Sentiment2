"use client"

import { useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Stepper } from "@/components/ui/stepper"
import { ProcessingAnimation } from "@/components/ui/processing-animation"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AnimatedBlob } from "@/components/ui/animated-blob"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import {
  Brain,
  ArrowLeft,
  MessageSquare,
  Upload,
  Youtube,
  Sparkles,
  FileText,
  LinkIcon,
  Zap,
  BarChart3,
  History,
} from "lucide-react"

type AnalysisType = "text" | "bulk" | "youtube"

export default function AnalysisPage() {
  const [activeTab, setActiveTab] = useState<AnalysisType>("text")
  const [textInput, setTextInput] = useState("")
  const [bulkComments, setBulkComments] = useState("")
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const router = useRouter()
  const headerRef = useScrollAnimation()
  const tabsRef = useScrollAnimation()

  const steps = ["Input", "Processing", "Results"]
  const youtubeSteps = ["Input", "Fetching", "Processing", "Results"]

  const handleAnalysis = async (type: AnalysisType) => {
    setIsAnalyzing(true)
    setCurrentStep(1)

    try {
      const BASE_URL = "http://localhost:8000/api/v1"
      let requestId = ""

      if (type === "text" || type === "bulk") {
        const comments =
          type === "text" ? [textInput] : bulkComments.split("\n").filter((line) => line.trim().length > 0)

        // Sending to backend
        const res = await fetch(`${BASE_URL}/manual-comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ comments }),
        })

        if (!res.ok) {
          throw new Error("Failed to submit comments for analysis")
        }

        const data = await res.json()
        requestId = data.requestId
        setCurrentStep(2) // Results ready state (conceptually)

      } else if (type === "youtube") {
        // transitioning to Fetching
        const res = await fetch(`${BASE_URL}/fetch-comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ video_url: youtubeUrl }),
        })

        if (!res.ok) {
          throw new Error("Failed to fetch YouTube comments")
        }

        const data = await res.json()
        requestId = data.requestId
        setCurrentStep(3) // Results ready
      }

      // Store analysis session data
      sessionStorage.setItem("analysisRequestId", requestId)
      sessionStorage.setItem("analysisType", type)

      // Store input data for history/context if needed, though backend has it. 
      // Results page uses it for "preview" in history.
      const inputData = type === "text" ? textInput : type === "bulk" ? bulkComments : youtubeUrl
      sessionStorage.setItem("analysisInputPreview", inputData)

      router.push("/results")
    } catch (error) {
      console.error("Analysis failed:", error)
      alert("Analysis failed. Please ensure the backend is running.")
    } finally {
      setIsAnalyzing(false)
      setCurrentStep(0)
    }
  }

  const isFormValid = (type: AnalysisType) => {
    switch (type) {
      case "text":
        return textInput.trim().length > 0
      case "bulk":
        return bulkComments.trim().length > 0
      case "youtube":
        return youtubeUrl.trim().length > 0 && (youtubeUrl.includes("youtube.com") || youtubeUrl.includes("youtu.be"))
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Elements */}
      <AnimatedBlob className="top-20 right-10" size="md" color="primary" />
      <AnimatedBlob className="bottom-32 left-20" size="lg" color="secondary" variant="blob-2" />

      {/* Processing Animation Overlay */}
      <ProcessingAnimation isActive={isAnalyzing} type={activeTab} />

      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
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
            <Button
              variant="ghost"
              className="flex items-center gap-2"
              onClick={() => {
                localStorage.removeItem("isLoggedIn")
                localStorage.removeItem("user")
                document.cookie = "isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
                window.dispatchEvent(new Event("storage"))
                router.push("/register")
              }}
            >
              Logout
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Premium
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Enterprise Premium Access</DialogTitle>
                  <DialogDescription>
                    Unlock advanced features, higher limits, dedicated support, and custom integrations for your team.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 text-sm">
                  <p>
                    Share your requirements and we&apos;ll get back to you with a tailored enterprise solution, pricing,
                    and onboarding plan.
                  </p>
                  <p className="font-medium">
                    Email:{" "}
                    <a href="mailto:enterprise@sentimentai.com" className="text-primary underline">
                      enterprise@sentimentai.com
                    </a>
                  </p>
                  <p className="font-medium">
                    Phone: <span className="text-foreground">+1 (000) 000-0000</span>
                  </p>
                </div>
                <DialogFooter>
                  <a href="mailto:enterprise@sentimentai.com">
                    <Button className="w-full sm:w-auto">Contact Enterprise Team</Button>
                  </a>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline">Save Analysis</Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div ref={headerRef.ref} className={`text-center mb-12 fade-in-up ${headerRef.isVisible ? "animate" : ""}`}>
            <h1 className="text-4xl font-bold mb-4 text-balance">
              Choose Your <span className="text-gradient">Analysis Method</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Select the type of sentiment analysis you'd like to perform. Our AI will provide detailed insights and
              visualizations.
            </p>

            {/* Stepper */}
            <div className="mt-8">
              <Stepper
                steps={activeTab === "youtube" ? youtubeSteps : steps}
                currentStep={currentStep}
                className="mb-4"
              />
            </div>
          </div>

          {/* Analysis Options */}
          <div ref={tabsRef.ref} className={`fade-in-up ${tabsRef.isVisible ? "animate" : ""}`}>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as AnalysisType)} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8 h-14 bg-muted/50 glass">
                <TabsTrigger value="text" className="flex items-center gap-2 h-12 text-base">
                  <MessageSquare className="w-4 h-4" />
                  Text Analysis
                </TabsTrigger>
                <TabsTrigger value="bulk" className="flex items-center gap-2 h-12 text-base">
                  <Upload className="w-4 h-4" />
                  Bulk Comments
                </TabsTrigger>
                <TabsTrigger value="youtube" className="flex items-center gap-2 h-12 text-base">
                  <Youtube className="w-4 h-4" />
                  YouTube Analysis
                </TabsTrigger>
              </TabsList>

              {/* Text Analysis Tab */}
              <TabsContent value="text" className="space-y-6">
                <GlassCard className="shadow-lg glow-hover">
                  <GlassCardHeader className="text-center pb-6">
                    <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 glow">
                      <MessageSquare className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <GlassCardTitle className="text-2xl">Text Sentiment Analysis</GlassCardTitle>
                    <GlassCardDescription className="text-base">
                      Analyze any text for emotional tone, sentiment polarity, and contextual insights
                    </GlassCardDescription>
                  </GlassCardHeader>

                  <GlassCardContent className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="text-input" className="text-base font-medium">
                        Enter your text to analyze
                      </Label>
                      <Textarea
                        id="text-input"
                        placeholder="Paste your text here... (reviews, comments, feedback, social media posts, etc.)"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        className="min-h-[200px] text-base leading-relaxed resize-none glass"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Characters: {textInput.length}</span>
                        <span>Words: {textInput.trim().split(/\s+/).filter(Boolean).length}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <GradientButton
                        onClick={() => handleAnalysis("text")}
                        disabled={!isFormValid("text") || isAnalyzing}
                        className="flex-1 h-12 text-base group glow-hover"
                      >
                        <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        Analyze Sentiment
                      </GradientButton>
                      <Button
                        variant="outline"
                        onClick={() => setTextInput("")}
                        className="h-12 px-6 glass"
                        disabled={!textInput}
                      >
                        Clear Text
                      </Button>
                    </div>

                    {/* Sample Texts */}
                    <div className="border-t pt-6">
                      <h4 className="font-medium mb-3">Try these sample texts:</h4>
                      <div className="grid gap-2">
                        {[
                          "I absolutely love this product! It exceeded all my expectations and the customer service was amazing.",
                          "The service was okay, nothing special but not terrible either. Average experience overall.",
                          "Very disappointed with my purchase. Poor quality and terrible customer support. Would not recommend.",
                        ].map((sample, index) => (
                          <button
                            key={index}
                            onClick={() => setTextInput(sample)}
                            className="text-left p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-sm"
                          >
                            {sample}
                          </button>
                        ))}
                      </div>
                    </div>
                  </GlassCardContent>
                </GlassCard>
              </TabsContent>

              {/* Bulk Comments Tab */}
              <TabsContent value="bulk" className="space-y-6">
                <GlassCard className="shadow-lg glow-hover">
                  <GlassCardHeader className="text-center pb-6">
                    <div className="w-16 h-16 gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 glow">
                      <BarChart3 className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <GlassCardTitle className="text-2xl">Bulk Comments Analysis</GlassCardTitle>
                    <GlassCardDescription className="text-base">
                      Analyze multiple comments at once for comprehensive sentiment insights
                    </GlassCardDescription>
                  </GlassCardHeader>

                  <GlassCardContent className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="bulk-input" className="text-base font-medium">
                        Paste multiple comments (one per line)
                      </Label>
                      <Textarea
                        id="bulk-input"
                        placeholder={`Enter multiple comments, one per line:\n\nGreat product, highly recommend!\nNot what I expected, disappointed.\nAverage quality, nothing special.\nExcellent customer service!\nToo expensive for what you get.`}
                        value={bulkComments}
                        onChange={(e) => setBulkComments(e.target.value)}
                        className="min-h-[250px] text-base leading-relaxed resize-none font-mono glass"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>
                          Comments:{" "}
                          {
                            bulkComments
                              .trim()
                              .split("\n")
                              .filter((line) => line.trim().length > 0).length
                          }
                        </span>
                        <span>Total characters: {bulkComments.length}</span>
                      </div>
                    </div>

                    <div className="glass rounded-lg p-4">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Supported Formats
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• One comment per line</li>
                        <li>• CSV format (comma-separated)</li>
                        <li>• Tab-separated values</li>
                        <li>• JSON array format</li>
                      </ul>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <GradientButton
                        onClick={() => handleAnalysis("bulk")}
                        disabled={!isFormValid("bulk") || isAnalyzing}
                        className="flex-1 h-12 text-base group glow-hover"
                      >
                        <BarChart3 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        Analyze Comments
                      </GradientButton>
                      <Button
                        variant="outline"
                        onClick={() => setBulkComments("")}
                        className="h-12 px-6 glass"
                        disabled={!bulkComments}
                      >
                        Clear Comments
                      </Button>
                    </div>
                  </GlassCardContent>
                </GlassCard>
              </TabsContent>

              {/* YouTube Analysis Tab */}
              <TabsContent value="youtube" className="space-y-6">
                <GlassCard className="shadow-lg glow-hover">
                  <GlassCardHeader className="text-center pb-6">
                    <div className="w-16 h-16 gradient-accent rounded-2xl flex items-center justify-center mx-auto mb-4 glow">
                      <Youtube className="w-8 h-8 text-accent-foreground" />
                    </div>
                    <GlassCardTitle className="text-2xl">YouTube Comments Analysis</GlassCardTitle>
                    <GlassCardDescription className="text-base">
                      Fetch and analyze comments from any YouTube video for audience sentiment insights
                    </GlassCardDescription>
                  </GlassCardHeader>

                  <GlassCardContent className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="youtube-url" className="text-base font-medium">
                        YouTube Video URL
                      </Label>
                      <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="youtube-url"
                          type="url"
                          placeholder="https://www.youtube.com/watch?v=..."
                          value={youtubeUrl}
                          onChange={(e) => setYoutubeUrl(e.target.value)}
                          className="pl-10 h-12 text-base glass"
                        />
                      </div>
                      {youtubeUrl && !youtubeUrl.includes("youtube.com") && !youtubeUrl.includes("youtu.be") && (
                        <p className="text-sm text-red-500">Please enter a valid YouTube URL</p>
                      )}
                    </div>

                    <div className="glass rounded-lg p-4">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Youtube className="w-4 h-4" />
                        What we'll analyze
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Top comments and replies</li>
                        <li>• Overall sentiment distribution</li>
                        <li>• Most positive/negative comments</li>
                        <li>• Engagement patterns and trends</li>
                      </ul>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <GradientButton
                        onClick={() => handleAnalysis("youtube")}
                        disabled={!isFormValid("youtube") || isAnalyzing}
                        className="flex-1 h-12 text-base group glow-hover"
                      >
                        <Youtube className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        Analyze Video Comments
                      </GradientButton>
                      <Button
                        variant="outline"
                        onClick={() => setYoutubeUrl("")}
                        className="h-12 px-6 glass"
                        disabled={!youtubeUrl}
                      >
                        Clear URL
                      </Button>
                    </div>

                    {/* Sample YouTube URLs */}
                    <div className="border-t pt-6">
                      <h4 className="font-medium mb-3">Try these sample videos:</h4>
                      <div className="grid gap-2">
                        {[
                          "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                          "https://www.youtube.com/watch?v=jNQXAC9IVRw",
                          "https://www.youtube.com/watch?v=9bZkp7q19f0",
                        ].map((sample, index) => (
                          <button
                            key={index}
                            onClick={() => setYoutubeUrl(sample)}
                            className="text-left p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-sm font-mono"
                          >
                            {sample}
                          </button>
                        ))}
                      </div>
                    </div>
                  </GlassCardContent>
                </GlassCard>
              </TabsContent>
            </Tabs>
          </div>

          {/* Features Section */}
          <div className="mt-16 grid md:grid-cols-3 gap-6">
            <GlassCard className="text-center p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4 glow">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">AI-Powered Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Advanced machine learning models for accurate sentiment detection
              </p>
            </GlassCard>

            <GlassCard className="text-center p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 gradient-secondary rounded-xl flex items-center justify-center mx-auto mb-4 glow">
                <BarChart3 className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Detailed Insights</h3>
              <p className="text-sm text-muted-foreground">Comprehensive breakdowns with charts and visualizations</p>
            </GlassCard>

            <GlassCard className="text-center p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 gradient-accent rounded-xl flex items-center justify-center mx-auto mb-4 glow">
                <Zap className="w-6 h-6 text-accent-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Real-time Results</h3>
              <p className="text-sm text-muted-foreground">Get instant analysis results with interactive displays</p>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  )
}
