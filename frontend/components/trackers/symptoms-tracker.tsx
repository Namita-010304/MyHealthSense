"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Heart, AlertCircle, Edit, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { symptomAPI } from "@/lib/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SymptomEntry {
  id: number
  symptom_name: string
  severity?: string
  notes?: string
  created_at: string
}

export function SymptomsTracker() {
  const [symptoms, setSymptoms] = useState<SymptomEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingEntry, setEditingEntry] = useState<SymptomEntry | null>(null)
  const [formData, setFormData] = useState({
    symptom_name: "",
    severity: "",
    notes: ""
  })

  useEffect(() => {
    fetchSymptoms()
  }, [])

  const fetchSymptoms = async () => {
    try {
      const data = await symptomAPI.getMySymptoms()
      setSymptoms(data)
    } catch (error) {
      console.error("Failed to fetch symptoms:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (entry: SymptomEntry) => {
    setEditingEntry(entry)
    setFormData({
      symptom_name: entry.symptom_name,
      severity: entry.severity || "",
      notes: entry.notes || ""
    })
    setIsEditMode(true)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this symptom entry?")) {
      try {
        await symptomAPI.deleteSymptom(id)
        fetchSymptoms()
      } catch (error) {
        console.error("Failed to delete symptom entry:", error)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (isEditMode && editingEntry) {
        await symptomAPI.updateSymptom(editingEntry.id, {
          symptom_name: formData.symptom_name,
          severity: formData.severity || undefined,
          notes: formData.notes || undefined
        })
      } else {
        await symptomAPI.createSymptom({
          symptom_name: formData.symptom_name,
          severity: formData.severity || undefined,
          notes: formData.notes || undefined
        })
      }
      setFormData({ symptom_name: "", severity: "", notes: "" })
      setIsDialogOpen(false)
      setIsEditMode(false)
      setEditingEntry(null)
      fetchSymptoms()
    } catch (error) {
      console.error("Failed to save symptom entry:", error)
    }
  }

  const getSeverityColor = (severity?: string) => {
    switch (severity?.toLowerCase()) {
      case "mild": return "bg-green-500"
      case "moderate": return "bg-yellow-500"
      case "severe": return "bg-red-500"
      default: return "bg-gray-500"
    }
  }

  if (loading) {
    return <div className="animate-pulse">Loading symptoms data...</div>
  }

  // Calculate symptoms in last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const recentSymptoms = symptoms.filter(entry =>
    new Date(entry.created_at) >= sevenDaysAgo
  ).length

  const groupedEntries = symptoms.reduce((acc, entry) => {
    const date = new Date(entry.created_at).toDateString()
    if (!acc[date]) acc[date] = []
    acc[date].push(entry)
    return acc
  }, {} as Record<string, SymptomEntry[]>)

  const sortedDates = Object.keys(groupedEntries).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Heart className="h-8 w-8 text-red-500" />
            Symptoms Tracker
          </h1>
          <p className="text-muted-foreground mt-1">Log and monitor your health symptoms</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            setIsEditMode(false)
            setEditingEntry(null)
            setFormData({ symptom_name: "", severity: "", notes: "" })
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Log Symptom
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditMode ? "Edit Symptom" : "Log Symptom"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="symptom_name">Symptom Name</Label>
                <Input
                  id="symptom_name"
                  value={formData.symptom_name}
                  onChange={(e) => setFormData({...formData, symptom_name: e.target.value})}
                  placeholder="e.g., Headache, Fatigue"
                  required
                />
              </div>
              <div>
                <Label htmlFor="severity">Severity (optional)</Label>
                <Select value={formData.severity} onValueChange={(value) => setFormData({...formData, severity: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mild">Mild</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="Severe">Severe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Any additional details"
                />
              </div>
              <Button type="submit" className="w-full">{isEditMode ? "Update Symptom" : "Log Symptom"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border/50 bg-muted/30">
        {/* <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-accent" />
            <CardTitle>AI Insight</CardTitle>
          </div>
        </CardHeader> */}
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Symptoms in last 7 days: <span className="text-accent font-bold">{recentSymptoms}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              {symptoms.length > 0
                ? "Track your symptoms regularly to identify patterns and triggers."
                : "Start logging your symptoms to get personalized health insights."
              }
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Recent Symptoms</h2>
        {symptoms.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="p-6 text-center text-muted-foreground">
              No symptoms logged yet. Start tracking your health!
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
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base">{entry.symptom_name}</CardTitle>
                            {entry.severity && (
                              <Badge variant="outline" className="gap-1">
                                <div className={`h-2 w-2 rounded-full ${getSeverityColor(entry.severity)}`} />
                                {entry.severity}
                              </Badge>
                            )}
                          </div>
                          <CardDescription>
                            {new Date(entry.created_at).toLocaleTimeString()}
                          </CardDescription>
                          {entry.notes && (
                            <p className="text-sm text-muted-foreground">{entry.notes}</p>
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
