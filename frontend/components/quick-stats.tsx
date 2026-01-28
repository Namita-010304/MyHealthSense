"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus, Target, Activity, Heart, Moon, Apple } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useEffect, useState } from "react"
import { healthAPI, insightsAPI, dietAPI, lifestyleAPI, symptomAPI } from "@/lib/api"

interface WeeklySummary {
  counts: {
    diet: number
    symptoms: number
    medications: number
    lifestyle: number
  }
}

interface Insights {
  risk_level: string
  risk_points: number
  confidence: number
}

interface DietEntry {
  id: number
  meal_type: string
  food_items: string
  calories?: number
  notes?: string
  created_at: string
}

interface LifestyleEntry {
  id: number
  sleep_hours?: number
  sleep_quality?: number
  exercise_minutes?: number
  exercise_type?: string
  stress_level?: number
  water_intake?: number
  notes?: string
  created_at: string
}

interface SymptomEntry {
  id: number
  symptom_name: string
  severity?: string
  notes?: string
  created_at: string
}

export function QuickStats() {
  const [summary, setSummary] = useState<WeeklySummary | null>(null)
  const [insights, setInsights] = useState<Insights | null>(null)
  const [dietEntries, setDietEntries] = useState<DietEntry[]>([])
  const [lifestyleEntries, setLifestyleEntries] = useState<LifestyleEntry[]>([])
  const [symptomEntries, setSymptomEntries] = useState<SymptomEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryData, insightsData, dietData, lifestyleData, symptomData] = await Promise.all([
          healthAPI.getWeeklySummary(),
          insightsAPI.getWeeklyInsights(),
          dietAPI.getMyDiets(),
          lifestyleAPI.getMyLifestyle(),
          symptomAPI.getMySymptoms()
        ])
        setSummary(summaryData)
        setInsights(insightsData)
        setDietEntries(dietData)
        setLifestyleEntries(lifestyleData)
        setSymptomEntries(symptomData)
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calculate today's calories
  const today = new Date().toDateString()
  const todaysCalories = dietEntries
    .filter(entry => new Date(entry.created_at).toDateString() === today)
    .reduce((sum, entry) => sum + (entry.calories || 0), 0)

  // Calculate last night's sleep (entries logged today)
  const lastNightSleep = lifestyleEntries
    .filter(entry => new Date(entry.created_at).toDateString() === today)
    .reduce((sum, entry) => sum + (entry.sleep_hours || 0), 0)

  // Calculate symptoms in last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const recentSymptoms = symptomEntries.filter(entry =>
    new Date(entry.created_at) >= sevenDaysAgo
  ).length

  const targetCalories = 1800
  const calorieProgress = Math.min((todaysCalories / targetCalories) * 100, 100)

  const stats = [
    {
      label: "Today's Calories",
      value: todaysCalories.toString(),
      context: ` / ${targetCalories} kcal`,
      progress: calorieProgress,
      trend: todaysCalories > targetCalories * 0.8 ? "up" : todaysCalories > targetCalories * 0.5 ? "neutral" : "down",
      unit: "",
      showProgress: true,
      icon: Apple,
      color: "text-orange-500",
    },
    {
      label: "Sleep Last Night",
      value: lastNightSleep.toFixed(1),
      context: " hrs",
      progress: Math.min((lastNightSleep / 8) * 100, 100),
      trend: lastNightSleep >= 7 ? "up" : lastNightSleep >= 5 ? "neutral" : "down",
      unit: "",
      showProgress: true,
      icon: Moon,
      color: "text-indigo-500",
    },
    {
      label: "Weekly Activity",
      value: summary ? summary.counts.lifestyle.toString() : "0",
      context: " entries",
      progress: summary ? Math.min((summary.counts.lifestyle / 7) * 100, 100) : 0,
      trend: "neutral" as const,
      unit: "",
      showProgress: true,
      icon: Activity,
      color: "text-green-500",
    },
    {
      label: "Health Score",
      value: (() => {
        // Check if user has any data
        const hasData = summary && (
          (summary.counts.diet || 0) > 0 ||
          (summary.counts.symptoms || 0) > 0 ||
          (summary.counts.medications || 0) > 0 ||
          (summary.counts.lifestyle || 0) > 0
        )
        return hasData && insights ? Math.max(0, 100 - insights.risk_points * 10).toString() : "0"
      })(),
      context: "/100",
      progress: (() => {
        // Check if user has any data
        const hasData = summary && (
          (summary.counts.diet || 0) > 0 ||
          (summary.counts.symptoms || 0) > 0 ||
          (summary.counts.medications || 0) > 0 ||
          (summary.counts.lifestyle || 0) > 0
        )
        return hasData && insights ? Math.max(0, 100 - insights.risk_points * 10) : 0
      })(),
      trend: "neutral" as const,
      unit: "",
      showProgress: true,
      icon: Heart,
      color: "text-red-500",
    },
  ]

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-border/50 bg-gradient-to-br from-card to-card/50">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-8 bg-muted rounded mb-1"></div>
                <div className="h-3 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label} className="border-border/50 bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                </div>
                {stat.trend === "up" && <TrendingUp className="h-4 w-4 text-green-500" />}
                {stat.trend === "down" && <TrendingDown className="h-4 w-4 text-destructive" />}
                {stat.trend === "neutral" && <Minus className="h-4 w-4 text-muted-foreground" />}
              </div>
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-3xl font-bold">{stat.value}</span>
                <span className="text-sm text-muted-foreground">{stat.context}</span>
              </div>
              {stat.showProgress && (
                <div className="space-y-2">
                  <Progress value={stat.progress} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{stat.progress.toFixed(0)}%</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
