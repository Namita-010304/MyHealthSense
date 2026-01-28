"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Target, CheckCircle2, Clock, TrendingUp, Apple, Moon, Activity, Heart } from "lucide-react"
import { useEffect, useState } from "react"
import { healthAPI, insightsAPI, dietAPI, lifestyleAPI } from "@/lib/api"

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

export function HealthGoals() {
  const [insights, setInsights] = useState<Insights | null>(null)
  const [summary, setSummary] = useState<WeeklySummary | null>(null)
  const [dietEntries, setDietEntries] = useState<DietEntry[]>([])
  const [lifestyleEntries, setLifestyleEntries] = useState<LifestyleEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [insightsData, summaryData, dietData, lifestyleData] = await Promise.all([
          insightsAPI.getWeeklyInsights(),
          healthAPI.getWeeklySummary(),
          dietAPI.getMyDiets(),
          lifestyleAPI.getMyLifestyle()
        ])
        setInsights(insightsData)
        setSummary(summaryData)
        setDietEntries(dietData)
        setLifestyleEntries(lifestyleData)
      } catch (error) {
        console.error("Failed to fetch goals data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calculate current progress
  const today = new Date().toDateString()
  const todaysCalories = dietEntries
    .filter(entry => new Date(entry.created_at).toDateString() === today)
    .reduce((sum, entry) => sum + (entry.calories || 0), 0)

  const lastNightSleep = lifestyleEntries
    .filter(entry => new Date(entry.created_at).toDateString() === today)
    .reduce((sum, entry) => sum + (entry.sleep_hours || 0), 0)

  const weeklyActivity = summary?.counts.lifestyle || 0
  const healthScore = (() => {
    // Check if user has any data
    const hasData = summary && (
      (summary.counts.diet || 0) > 0 ||
      (summary.counts.symptoms || 0) > 0 ||
      (summary.counts.medications || 0) > 0 ||
      (summary.counts.lifestyle || 0) > 0
    )
    return hasData && insights ? Math.max(0, 100 - insights.risk_points * 10) : 0
  })()

  const goals = [
    {
      title: "Daily Calorie Goal",
      description: "Maintain healthy eating habits",
      current: todaysCalories,
      target: 1800,
      unit: "kcal",
      progress: Math.min((todaysCalories / 1800) * 100, 100),
      status: todaysCalories >= 1800 ? "completed" : todaysCalories >= 1350 ? "on-track" : "behind",
      icon: Apple,
      color: "text-orange-500",
      action: "Log a meal"
    },
    {
      title: "Sleep Target",
      description: "Get quality rest every night",
      current: lastNightSleep,
      target: 8,
      unit: "hours",
      progress: Math.min((lastNightSleep / 8) * 100, 100),
      status: lastNightSleep >= 8 ? "completed" : lastNightSleep >= 6 ? "on-track" : "behind",
      icon: Moon,
      color: "text-indigo-500",
      action: "Log sleep"
    },
    {
      title: "Weekly Activity",
      description: "Stay active throughout the week",
      current: weeklyActivity,
      target: 7,
      unit: "days",
      progress: Math.min((weeklyActivity / 7) * 100, 100),
      status: weeklyActivity >= 7 ? "completed" : weeklyActivity >= 5 ? "on-track" : "behind",
      icon: Activity,
      color: "text-green-500",
      action: "Add activity"
    },
    {
      title: "Health Score",
      description: "Overall wellness improvement",
      current: healthScore,
      target: 80,
      unit: "/100",
      progress: Math.min((healthScore / 80) * 100, 100),
      status: healthScore >= 80 ? "completed" : healthScore >= 60 ? "on-track" : "behind",
      icon: Heart,
      color: "text-red-500",
      action: "View insights"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600 bg-green-100 dark:bg-green-900/20"
      case "on-track": return "text-blue-600 bg-blue-100 dark:bg-blue-900/20"
      case "behind": return "text-orange-600 bg-orange-100 dark:bg-orange-900/20"
      default: return "text-muted-foreground bg-muted"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="h-4 w-4" />
      case "on-track": return <TrendingUp className="h-4 w-4" />
      case "behind": return <Clock className="h-4 w-4" />
      default: return <Target className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Health Goals
          </CardTitle>
          <CardDescription>Track your progress toward better health</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-2 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50 bg-gradient-to-br from-card to-card/50">
      <CardHeader className="bg-gradient-to-r from-accent/5 to-primary/5 rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Health Goals
        </CardTitle>
        <CardDescription>Track your progress toward better health and wellness</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-4 md:grid-cols-2">
          {goals.map((goal) => {
            const Icon = goal.icon
            return (
              <div key={goal.title} className="space-y-3 p-4 rounded-lg border bg-card/50 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${goal.color}`} />
                    <h3 className="font-semibold text-sm">{goal.title}</h3>
                  </div>
                  <Badge className={`text-xs ${getStatusColor(goal.status)} border-0`}>
                    {getStatusIcon(goal.status)}
                    <span className="ml-1 capitalize">{goal.status.replace("-", " ")}</span>
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground">{goal.description}</p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {goal.current} {goal.unit === "/100" ? "" : goal.unit}
                      {goal.unit === "/100" && ` ${goal.unit}`}
                    </span>
                    <span className="text-muted-foreground">Target: {goal.target}{goal.unit === "/100" ? "" : ` ${goal.unit}`}</span>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{goal.progress.toFixed(0)}% complete</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => window.location.href = "/dashboard/trackers"}
                    >
                      {goal.action}
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-accent" />
            Goal Achievement Tips
          </h4>
          <div className="grid gap-1 text-sm text-muted-foreground">
            <p>• Set specific, achievable goals and track your progress regularly</p>
            <p>• Focus on consistency rather than perfection</p>
            <p>• Celebrate small wins and adjust goals as needed</p>
            <p>• Use the trackers to log activities and monitor your health journey</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}