"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Apple, Heart, Pill, Sparkles, ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"
import { dietAPI, symptomAPI, medicationAPI, lifestyleAPI } from "@/lib/api"

interface TrackerStats {
  value: string
  label: string
}

interface Tracker {
  title: string
  description: string
  icon: any
  href: string
  stats: TrackerStats
  color: string
}

const baseTrackers = [
  {
    title: "Diet Tracker",
    description: "Monitor your nutrition and calorie intake",
    icon: Apple,
    href: "/dashboard/diet",
    color: "text-green-500",
  },
  {
    title: "Symptoms Tracker",
    description: "Log and track your health symptoms",
    icon: Heart,
    href: "/dashboard/symptoms",
    color: "text-red-500",
  },
  {
    title: "Medication Tracker",
    description: "Never miss your medication schedule",
    icon: Pill,
    href: "/dashboard/medication",
    color: "text-blue-500",
  },
  {
    title: "Lifestyle Tracker",
    description: "Track sleep, exercise, and activities",
    icon: Sparkles,
    href: "/dashboard/lifestyle",
    color: "text-accent",
  },
]

export function TrackerGrid() {
  const [trackers, setTrackers] = useState<Tracker[]>(baseTrackers.map(t => ({ ...t, stats: { value: "Loading...", label: "" } })))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrackerStats()
  }, [])

  const fetchTrackerStats = async () => {
    try {
      const [dietData, symptomData, medicationData, lifestyleData] = await Promise.all([
        dietAPI.getMyDiets(),
        symptomAPI.getMySymptoms(),
        medicationAPI.getMyMedications(),
        lifestyleAPI.getMyLifestyle()
      ])

      // Calculate today's calories
      const today = new Date().toISOString().split('T')[0]
      const todayDiets = dietData.filter((d: any) => d.created_at.startsWith(today))
      const totalCalories = todayDiets.reduce((sum: number, entry: any) => sum + (entry.calories || 0), 0)

      // Calculate this week's symptoms
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const weekSymptoms = symptomData.filter((s: any) => new Date(s.created_at) >= weekAgo)

      // Calculate today's medications (assuming medications are daily)
      const todayMedications = medicationData.length // This is a simplification

      // Calculate today's sleep hours
      const todayLifestyle = lifestyleData.filter((l: any) => l.created_at.startsWith(today))
      const avgSleep = todayLifestyle.length > 0
        ? (todayLifestyle.reduce((sum: number, entry: any) => sum + (entry.sleep_hours || 0), 0) / todayLifestyle.length).toFixed(1)
        : "0"

      const updatedTrackers = [
        {
          ...baseTrackers[0],
          stats: { value: totalCalories.toString(), label: "calories today" }
        },
        {
          ...baseTrackers[1],
          stats: { value: weekSymptoms.length.toString(), label: "logged this week" }
        },
        {
          ...baseTrackers[2],
          stats: { value: `${todayMedications}/${todayMedications}`, label: "taken today" }
        },
        {
          ...baseTrackers[3],
          stats: { value: avgSleep, label: "hours sleep" }
        },
      ]

      setTrackers(updatedTrackers)
    } catch (error) {
      console.error("Failed to fetch tracker stats:", error)
      // Keep default loading state or set error state
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {trackers.map((tracker) => {
          const Icon = tracker.icon
          return (
            <Card key={tracker.title} className="border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${tracker.color}`} />
                      {tracker.title}
                    </CardTitle>
                    <CardDescription>{tracker.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold">{tracker.stats.value}</p>
                    <p className="text-xs text-muted-foreground">{tracker.stats.label}</p>
                  </div>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={tracker.href}>
                      Log & View
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
