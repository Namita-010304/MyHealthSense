"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Heart } from "lucide-react"
import { useEffect, useState } from "react"
import { insightsAPI, healthAPI } from "@/lib/api"

interface Insights {
  risk_level: string
  risk_points: number
  confidence: number
}

interface WeeklySummary {
  counts: {
    diet: number
    symptoms: number
    medications: number
    lifestyle: number
  }
}

export function WelcomeSection() {
  const [insights, setInsights] = useState<Insights | null>(null)
  const [summary, setSummary] = useState<WeeklySummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [insightsData, summaryData] = await Promise.all([
          insightsAPI.getWeeklyInsights(),
          healthAPI.getWeeklySummary()
        ])
        setInsights(insightsData)
        setSummary(summaryData)
      } catch (error) {
        console.error("Failed to fetch welcome data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 16) return "Good afternoon"
    return "Good evening"
  }

  const getHealthStatus = () => {
    if (!insights) return { status: "Loading...", color: "text-muted-foreground", bg: "bg-muted" }

    // Check if user has any data
    const hasData = summary && (
      (summary.counts.diet || 0) > 0 ||
      (summary.counts.symptoms || 0) > 0 ||
      (summary.counts.medications || 0) > 0 ||
      (summary.counts.lifestyle || 0) > 0
    )

    if (!hasData) {
      return { status: "Getting Started", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/20" }
    }

    const score = Math.max(0, 100 - insights.risk_points * 10)
    if (score >= 80) return { status: "Excellent", color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/20" }
    if (score >= 60) return { status: "Good", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/20" }
    if (score >= 40) return { status: "Fair", color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-900/20" }
    return { status: "Needs Attention", color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/20" }
  }

  const getMotivationalMessage = () => {
    const messages = [
      "Keep up the great work on your health journey!",
      "Every healthy choice you make counts!",
      "You're taking charge of your wellness - amazing!",
      "Small steps lead to big health improvements!",
      "Your commitment to health is inspiring!",
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  if (loading) {
    return (
      <Card className="border-border/50 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const healthStatus = getHealthStatus()

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <Card className="border-border/50 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-accent" />
                {getGreeting()}!
              </h2>
              <p className="text-muted-foreground">{getMotivationalMessage()}</p>
              <div className="flex items-center gap-2">
                <Badge className={`${healthStatus.bg} ${healthStatus.color} border-0`}>
                  <Heart className="h-3 w-3 mr-1" />
                  Health Status: {healthStatus.status}
                </Badge>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="text-right space-y-1">
                <p className="text-sm text-muted-foreground">This Week</p>
                <div className="flex gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-bold text-lg">{summary?.counts.diet || 0}</p>
                    <p className="text-muted-foreground">Meals</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-lg">{summary?.counts.lifestyle || 0}</p>
                    <p className="text-muted-foreground">Activities</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-lg">{summary?.counts.medications || 0}</p>
                    <p className="text-muted-foreground">Meds</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}