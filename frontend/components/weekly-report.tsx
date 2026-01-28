"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"
import { useEffect, useState } from "react"
import { healthAPI } from "@/lib/api"
import { TrendingUp, Target, Activity, Sparkles } from "lucide-react"

interface WeeklyData {
  day: string
  score: number
}

export function WeeklyReport() {
  const [data, setData] = useState<WeeklyData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWeeklyData = async () => {
      try {
        const summary = await healthAPI.getWeeklySummary()
        
        // Calculate health scores for the past 7 days
        const weeklyData: WeeklyData[] = []
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          const dayName = days[date.getDay()]
          
          // Calculate a health score based on the data
          // This is a simple calculation - you can make it more sophisticated
          const dietCount = summary.diet_entries?.filter(entry => {
            const entryDate = new Date(entry.created_at)
            return entryDate.toDateString() === date.toDateString()
          }).length || 0
          
          const symptomCount = summary.symptoms?.filter(entry => {
            const entryDate = new Date(entry.created_at)
            return entryDate.toDateString() === date.toDateString()
          }).length || 0
          
          const medicationCount = summary.medications?.filter(entry => {
            const entryDate = new Date(entry.created_at)
            return entryDate.toDateString() === date.toDateString()
          }).length || 0
          
          const lifestyleCount = summary.lifestyle?.filter(entry => {
            const entryDate = new Date(entry.created_at)
            return entryDate.toDateString() === date.toDateString()
          }).length || 0
          
          // Calculate score based on activity (more activity = higher score)
          const activityScore = Math.min(100, (dietCount + lifestyleCount) * 15 + (medicationCount * 10) - (symptomCount * 5))
          const score = Math.max(0, activityScore)
          
          weeklyData.push({
            day: dayName,
            score: Math.round(score)
          })
        }
        
        setData(weeklyData)
      } catch (error) {
        console.error("Failed to fetch weekly data:", error)
        // Fallback to sample data if API fails
        setData([
          { day: "Mon", score: 75 },
          { day: "Tue", score: 82 },
          { day: "Wed", score: 78 },
          { day: "Thu", score: 85 },
          { day: "Fri", score: 88 },
          { day: "Sat", score: 90 },
          { day: "Sun", score: 87 },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchWeeklyData()
  }, [])

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Weekly Health Report</CardTitle>
          <CardDescription>Loading your health data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading chart...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Weekly Health Report
        </CardTitle>
        <CardDescription>Your health score trend over the past week with personalized insights</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="day"
              className="text-xs"
              stroke="hsl(var(--foreground))"
              tick={{ fill: "#ffffff" }}
            />
            <YAxis
              className="text-xs"
              stroke="hsl(var(--foreground))"
              domain={[0, 100]}
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--foreground))",
              }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{
                fill: "#ffffff",
                stroke: "#000000",
                strokeWidth: 2,
                r: 6
              }}
              activeDot={{
                r: 8,
                fill: "#ffffff",
                stroke: "#000000",
                strokeWidth: 3
              }}
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Target className="h-4 w-4" />
              Average Score
            </p>
            <p className="text-2xl font-bold text-foreground">
              {data.length > 0 ? (data.reduce((sum, item) => sum + item.score, 0) / data.length).toFixed(1) : "0.0"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Best Day
            </p>
            <p className="text-2xl font-bold text-foreground">
              {data.length > 0 ? data.reduce((best, item) => item.score > best.score ? item : best).day : "N/A"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Activity className="h-4 w-4" />
              Weekly Change
            </p>
            <p className={`text-2xl font-bold ${
              data.length >= 2 && ((data[data.length - 1].score - data[0].score) / data[0].score * 100) > 0
                ? "text-green-500"
                : "text-muted-foreground"
            }`}>
              {data.length >= 2
                ? `${((data[data.length - 1].score - data[0].score) / data[0].score * 100).toFixed(0)}%`
                : "0%"
              }
            </p>
          </div>
        </div>

        {/* Health Insights */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            Weekly Insights
          </h4>
          <div className="grid gap-2 text-sm text-muted-foreground">
            {data.length > 0 && (
              <>
                <p>• Your most active day was <strong>{data.reduce((best, item) => item.score > best.score ? item : best).day}</strong> with a score of <strong>{data.reduce((best, item) => item.score > best.score ? item : best).score}</strong></p>
                {data.length >= 2 && (
                  <p>• {
                    ((data[data.length - 1].score - data[0].score) / data[0].score * 100) > 0
                      ? `Great progress! Your health score improved by ${((data[data.length - 1].score - data[0].score) / data[0].score * 100).toFixed(0)}% this week.`
                      : `Keep working on your health goals. Consistency is key to improvement.`
                  }</p>
                )}
                <p>• Aim to maintain or increase your daily activity to boost your overall health score.</p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
