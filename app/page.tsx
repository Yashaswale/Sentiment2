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
import { AnimatedText } from "@/components/ui/animated-text"
import { AnimatedBlob } from "@/components/ui/animated-blob"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import {
  Brain,
  MessageSquare,
  Youtube,
  BarChart3,
  Heart,
  Frown,
  Meh,
  ArrowRight,
  Sparkles,
  Star,
  Quote,
} from "lucide-react"

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const heroRef = useScrollAnimation()
  const featuresRef = useScrollAnimation()
  const ctaRef = useScrollAnimation()
  const testimonialsRef = useScrollAnimation()
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("user")
    document.cookie = "isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    setIsLoggedIn(false)
    window.dispatchEvent(new Event("storage"))
    router.push("/register")
  }

  useEffect(() => {
    const checkLogin = () => {
      setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true")
    }

    checkLogin()
    window.addEventListener("storage", checkLogin)
    return () => window.removeEventListener("storage", checkLogin)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center glow">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-gradient">SentimentAI</span>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {!isLoggedIn ? (
              <>
                <Link href="/login">
                  <Button variant="ghost">Log in</Button>
                </Link>
                <Link href="/register">
                  <GradientButton className="glow-hover">Sign up</GradientButton>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/analysis">
                  <GradientButton className="glow-hover">Analysis</GradientButton>
                </Link>
                <Button variant="ghost" onClick={handleLogout}>Log out</Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section with Animated Background */}
      <section className="py-20 px-4 text-center relative overflow-hidden particles">
        <AnimatedBlob className="top-10 left-10" size="lg" color="primary" />
        <AnimatedBlob className="top-32 right-20" size="md" color="secondary" variant="blob-2" />
        <AnimatedBlob className="bottom-20 left-1/4" size="xl" color="accent" />

        <div className="absolute inset-0 gradient-primary opacity-5"></div>
        <div
          ref={heroRef.ref}
          className={`container mx-auto relative z-10 fade-in-up ${heroRef.isVisible ? "animate" : ""}`}
        >
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance">
              <AnimatedText
                phrases={["Understand Emotions", "Analyze Texts", "Decode Comments"]}
                className="block text-gradient"
              />
              <span className="block mt-2 text-foreground">with AI Power</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
              Harness the power of advanced AI to analyze sentiment in text, comments, and social media content. Get
              insights that matter for your business and research.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/analysis">
                <GradientButton size="lg" className="group glow-hover">
                  Try It Yourself
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </GradientButton>
              </Link>
              <Button size="lg" variant="outline" className="hover:bg-muted/50 bg-transparent">
                Learn More
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Illustration with Glassmorphism */}
        <div className="mt-16 relative">
          <div className="w-full max-w-2xl mx-auto float">
            <GlassCard className="relative p-8 shadow-2xl">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-background/80 rounded-lg p-4 text-center hover:scale-105 transition-transform">
                  <Heart className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-sm font-medium">Positive</div>
                  <div className="text-2xl font-bold text-green-500">67%</div>
                </div>
                <div className="bg-background/80 rounded-lg p-4 text-center hover:scale-105 transition-transform">
                  <Meh className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <div className="text-sm font-medium">Neutral</div>
                  <div className="text-2xl font-bold text-yellow-500">23%</div>
                </div>
                <div className="bg-background/80 rounded-lg p-4 text-center hover:scale-105 transition-transform">
                  <Frown className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <div className="text-sm font-medium">Negative</div>
                  <div className="text-2xl font-bold text-red-500">10%</div>
                </div>
              </div>
              <div className="bg-background/60 rounded-lg p-4">
                <div className="text-sm text-muted-foreground mb-2">Sample Analysis</div>
                <div className="text-left space-y-2">
                  <div className="flex items-center gap-2 hover:bg-background/20 p-2 rounded transition-colors">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">"This product is amazing! Love it!"</span>
                  </div>
                  <div className="flex items-center gap-2 hover:bg-background/20 p-2 rounded transition-colors">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">"It's okay, nothing special."</span>
                  </div>
                  <div className="flex items-center gap-2 hover:bg-background/20 p-2 rounded transition-colors">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm">"Not what I expected."</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* What We Offer Section with Glassmorphism */}
      <section className="py-20 px-4 bg-muted/30 relative">
        <div className="container mx-auto">
          <div
            ref={featuresRef.ref}
            className={`text-center mb-16 fade-in-up ${featuresRef.isVisible ? "animate" : ""}`}
          >
            <h2 className="text-4xl font-bold mb-4 text-gradient">What We Offer</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive sentiment analysis tools for all your text analysis needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <GlassCard className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 glow-hover">
              <GlassCardHeader className="text-center pb-4">
                <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform glow">
                  <MessageSquare className="w-8 h-8 text-primary-foreground" />
                </div>
                <GlassCardTitle className="text-xl">Text Sentiment Analysis</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <GlassCardDescription className="text-center text-base leading-relaxed">
                  Analyze any text input for emotional tone, sentiment polarity, and contextual insights with our
                  advanced AI models.
                </GlassCardDescription>
              </GlassCardContent>
            </GlassCard>

            <GlassCard className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 glow-hover">
              <GlassCardHeader className="text-center pb-4">
                <div className="w-16 h-16 gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform glow">
                  <BarChart3 className="w-8 h-8 text-primary-foreground" />
                </div>
                <GlassCardTitle className="text-xl">Bulk Comments Analysis</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <GlassCardDescription className="text-center text-base leading-relaxed">
                  Upload and analyze multiple comments at once. Perfect for social media monitoring and customer
                  feedback analysis.
                </GlassCardDescription>
              </GlassCardContent>
            </GlassCard>

            <GlassCard className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 glow-hover">
              <GlassCardHeader className="text-center pb-4">
                <div className="w-16 h-16 gradient-accent rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform glow">
                  <Youtube className="w-8 h-8 text-accent-foreground" />
                </div>
                <GlassCardTitle className="text-xl">YouTube Comments</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <GlassCardDescription className="text-center text-base leading-relaxed">
                  Fetch and analyze YouTube video comments directly. Get insights into audience reactions and engagement
                  patterns.
                </GlassCardDescription>
              </GlassCardContent>
            </GlassCard>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 relative">
        <div className="container mx-auto">
          <div
            ref={testimonialsRef.ref}
            className={`text-center mb-16 fade-in-up ${testimonialsRef.isVisible ? "animate" : ""}`}
          >
            <h2 className="text-4xl font-bold mb-4 text-gradient">Trusted by Professionals</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">See what our users say about SentimentAI</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <GlassCard className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <GlassCardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <Quote className="w-8 h-8 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  "SentimentAI has revolutionized how we analyze customer feedback. The accuracy is incredible!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary-foreground">SM</span>
                  </div>
                  <div>
                    <p className="font-semibold">Sarah Mitchell</p>
                    <p className="text-sm text-muted-foreground">Marketing Director</p>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>

            <GlassCard className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <GlassCardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <Quote className="w-8 h-8 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  "The YouTube analysis feature saved us hours of manual work. Highly recommended for content creators!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-secondary rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary-foreground">JD</span>
                  </div>
                  <div>
                    <p className="font-semibold">James Davis</p>
                    <p className="text-sm text-muted-foreground">Content Creator</p>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>

            <GlassCard className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <GlassCardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <Quote className="w-8 h-8 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  "Perfect for research projects. The bulk analysis feature is a game-changer for academic work."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-accent rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-accent-foreground">AL</span>
                  </div>
                  <div>
                    <p className="font-semibold">Dr. Anna Lee</p>
                    <p className="text-sm text-muted-foreground">Research Scientist</p>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Try It Yourself Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 gradient-accent opacity-5"></div>
        <div
          ref={ctaRef.ref}
          className={`container mx-auto text-center relative z-10 fade-in-up ${ctaRef.isVisible ? "animate" : ""}`}
        >
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles className="w-6 h-6 text-accent" />
              <h2 className="text-4xl font-bold text-gradient">Ready to Get Started?</h2>
              <Sparkles className="w-6 h-6 text-accent" />
            </div>
            <p className="text-xl text-muted-foreground mb-8 text-pretty">
              Experience the power of AI-driven sentiment analysis. Start analyzing your text, comments, or YouTube
              content in seconds.
            </p>
            <Link href="/analysis">
              <GradientButton size="lg" className="group glow-hover">
                Start Analyzing Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </GradientButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-4 bg-muted/20">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center glow">
                <Brain className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-gradient">SentimentAI</span>
            </div>
            <div className="text-sm text-muted-foreground">© 2025 SentimentAI. Powered by advanced AI technology.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
