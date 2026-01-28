"use client"

import { Badge } from "@/components/ui/badge"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Sparkles, Moon, Dumbbell, Droplets, Timer, Edit, Trash2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useEffect, useState } from "react"
import { lifestyleAPI } from "@/lib/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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

export function LifestyleTracker() {
  const [lifestyleEntries, setLifestyleEntries] = useState<LifestyleEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingEntry, setEditingEntry] = useState<LifestyleEntry | null>(null)
  const [formData, setFormData] = useState({
    sleep_hours: "",
    sleep_quality: "",
    exercise_minutes: "",
    exercise_type: "",
    stress_level: "",
    water_intake: "",
    notes: ""
  })

  useEffect(() => {
    fetchLifestyleEntries()
  }, [])

  const fetchLifestyleEntries = async () => {
    try {
      const data = await lifestyleAPI.getMyLifestyle()
      setLifestyleEntries(data)
    } catch (error) {
      console.error("Failed to fetch lifestyle entries:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (entry: LifestyleEntry) => {
    setEditingEntry(entry)
    setFormData({
      sleep_hours: entry.sleep_hours?.toString() || "",
      sleep_quality: entry.sleep_quality?.toString() || "",
      exercise_minutes: entry.exercise_minutes?.toString() || "",
      exercise_type: entry.exercise_type || "",
      stress_level: entry.stress_level?.toString() || "",
      water_intake: entry.water_intake?.toString() || "",
      notes: entry.notes || ""
    })
    setIsEditMode(true)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this lifestyle entry?")) {
      try {
        await lifestyleAPI.deleteLifestyle(id)
        fetchLifestyleEntries()
      } catch (error) {
        console.error("Failed to delete lifestyle entry:", error)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (isEditMode && editingEntry) {
        await lifestyleAPI.updateLifestyle(editingEntry.id, {
          sleep_hours: formData.sleep_hours ? parseFloat(formData.sleep_hours) : undefined,
          sleep_quality: formData.sleep_quality ? parseInt(formData.sleep_quality) : undefined,
          exercise_minutes: formData.exercise_minutes ? parseInt(formData.exercise_minutes) : undefined,
          exercise_type: formData.exercise_type || undefined,
          stress_level: formData.stress_level ? parseInt(formData.stress_level) : undefined,
          water_intake: formData.water_intake ? parseFloat(formData.water_intake) : undefined,
          notes: formData.notes || undefined
        })
      } else {
        await lifestyleAPI.createLifestyle({
          sleep_hours: formData.sleep_hours ? parseFloat(formData.sleep_hours) : undefined,
          sleep_quality: formData.sleep_quality ? parseInt(formData.sleep_quality) : undefined,
          exercise_minutes: formData.exercise_minutes ? parseInt(formData.exercise_minutes) : undefined,
          exercise_type: formData.exercise_type || undefined,
          stress_level: formData.stress_level ? parseInt(formData.stress_level) : undefined,
          water_intake: formData.water_intake ? parseFloat(formData.water_intake) : undefined,
          notes: formData.notes || undefined
        })
      }
      setFormData({
        sleep_hours: "",
        sleep_quality: "",
        exercise_minutes: "",
        exercise_type: "",
        stress_level: "",
        water_intake: "",
        notes: ""
      })
      setIsDialogOpen(false)
      setIsEditMode(false)
      setEditingEntry(null)
      fetchLifestyleEntries()
    } catch (error) {
      console.error("Failed to save lifestyle entry:", error)
    }
  }

  // Calculate averages from recent entries (last 7 days)
  const recentEntries = lifestyleEntries.filter(entry => {
    const entryDate = new Date(entry.created_at)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return entryDate >= weekAgo
  })

  const avgSleep = recentEntries.reduce((sum, entry) => sum + (entry.sleep_hours || 0), 0) / recentEntries.length || 0
  const avgExercise = recentEntries.reduce((sum, entry) => sum + (entry.exercise_minutes || 0), 0) / recentEntries.length || 0
  const avgWater = recentEntries.reduce((sum, entry) => sum + (entry.water_intake || 0), 0) / recentEntries.length || 0

  // Calculate last night's sleep (entries logged today)
  const today = new Date().toDateString()
  const lastNightSleep = lifestyleEntries
    .filter(entry => new Date(entry.created_at).toDateString() === today)
    .reduce((sum, entry) => sum + (entry.sleep_hours || 0), 0)

  const activities = [
    {
      name: "Sleep",
      icon: Moon,
      value: lastNightSleep.toFixed(1),
      target: "8",
      unit: "hours",
      percentage: Math.min((lastNightSleep / 8) * 100, 100),
      color: "text-purple-500",
    },
    {
      name: "Exercise",
      icon: Dumbbell,
      value: Math.round(avgExercise).toString(),
      target: "60",
      unit: "minutes",
      percentage: Math.min((avgExercise / 60) * 100, 100),
      color: "text-orange-500",
    },
    {
      name: "Water",
      icon: Droplets,
      value: avgWater.toFixed(1),
      target: "2",
      unit: "liters",
      percentage: Math.min((avgWater / 2) * 100, 100),
      color: "text-blue-500",
    },
    {
      name: "Entries",
      icon: Timer,
      value: recentEntries.length.toString(),
      target: "7",
      unit: "days",
      percentage: (recentEntries.length / 7) * 100,
      color: "text-green-500",
    },
  ]

  const groupedEntries = lifestyleEntries.reduce((acc, entry) => {
    const date = new Date(entry.created_at).toDateString()
    if (!acc[date]) acc[date] = []
    acc[date].push(entry)
    return acc
  }, {} as Record<string, LifestyleEntry[]>)

  const sortedDates = Object.keys(groupedEntries).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  if (loading) {
    return <div className="animate-pulse">Loading lifestyle data...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-accent" />
            Lifestyle Tracker
          </h1>
          <p className="text-muted-foreground mt-1">Track your daily wellness activities</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            setIsEditMode(false)
            setEditingEntry(null)
            setFormData({
              sleep_hours: "",
              sleep_quality: "",
              exercise_minutes: "",
              exercise_type: "",
              stress_level: "",
              water_intake: "",
              notes: ""
            })
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Log Activity
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{isEditMode ? "Edit Lifestyle Activity" : "Log Lifestyle Activity"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sleep_hours">Sleep Hours</Label>
                  <Input
                    id="sleep_hours"
                    type="number"
                    step="0.5"
                    value={formData.sleep_hours}
                    onChange={(e) => setFormData({...formData, sleep_hours: e.target.value})}
                    placeholder="7.5"
                  />
                </div>
                <div>
                  <Label htmlFor="sleep_quality">Sleep Quality (1-5)</Label>
                  <Select value={formData.sleep_quality} onValueChange={(value) => setFormData({...formData, sleep_quality: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Rate" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Poor</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3 - Average</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5 - Excellent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="exercise_minutes">Exercise Minutes</Label>
                  <Input
                    id="exercise_minutes"
                    type="number"
                    value={formData.exercise_minutes}
                    onChange={(e) => setFormData({...formData, exercise_minutes: e.target.value})}
                    placeholder="30"
                  />
                </div>
                <div>
                  <Label htmlFor="exercise_type">Exercise Type</Label>
                  <Input
                    id="exercise_type"
                    value={formData.exercise_type}
                    onChange={(e) => setFormData({...formData, exercise_type: e.target.value})}
                    placeholder="Running, Yoga"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="water_intake">Water Intake (L)</Label>
                  <Input
                    id="water_intake"
                    type="number"
                    step="0.1"
                    value={formData.water_intake}
                    onChange={(e) => setFormData({...formData, water_intake: e.target.value})}
                    placeholder="2.0"
                  />
                </div>
                <div>
                  <Label htmlFor="stress_level">Stress Level (1-5)</Label>
                  <Select value={formData.stress_level} onValueChange={(value) => setFormData({...formData, stress_level: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Rate" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Low</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3 - Moderate</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5 - High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Any additional notes"
                />
              </div>
              <Button type="submit" className="w-full">{isEditMode ? "Update Activity" : "Log Activity"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {activities.map((activity) => {
          const Icon = activity.icon
          return (
            <Card key={activity.name} className="border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Icon className={`h-5 w-5 ${activity.color}`} />
                  <span className="text-xs text-muted-foreground">
                    {activity.value}/{activity.target} {activity.unit}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <h3 className="font-semibold">{activity.name}</h3>
                <Progress value={activity.percentage} className="h-2" />
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Recent Entries</h2>
        {lifestyleEntries.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="p-6 text-center text-muted-foreground">
              No lifestyle entries yet. Start tracking your daily activities!
            </CardContent>
          </Card>
        ) : (
          <TooltipProvider>
            {sortedDates.map((date) => (
              <Card key={date} className="border-border/50 mb-4">
                <CardHeader>
                  <CardTitle className="text-lg">{new Date(date).toLocaleDateString()}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {groupedEntries[date].map((entry) => (
                    <div key={entry.id} className="border-l-2 border-primary/20 pl-4 py-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {entry.exercise_type && `${entry.exercise_type} • `}
                            {entry.exercise_minutes && `${entry.exercise_minutes}min exercise • `}
                            {entry.sleep_hours && `${entry.sleep_hours}h sleep • `}
                            {entry.water_intake && `${entry.water_intake}L water`}
                          </p>
                          <div className="flex gap-2 mt-1">
                            {entry.sleep_quality && (
                              <Badge variant="outline" className="text-xs">
                                Sleep: {entry.sleep_quality}/5
                              </Badge>
                            )}
                            {entry.stress_level && (
                              <Badge variant="outline" className="text-xs">
                                Stress: {entry.stress_level}/5
                              </Badge>
                            )}
                          </div>
                          {entry.notes && (
                            <p className="text-xs text-muted-foreground mt-1">{entry.notes}</p>
                          )}
                        </div>
                        <div className="flex gap-1 ml-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(entry)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(entry.id)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </TooltipProvider>
        )}
      </div>
    </div>
  )
}
