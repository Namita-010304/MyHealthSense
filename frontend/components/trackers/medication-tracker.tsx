"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Pill, CheckCircle2, Clock, Edit, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { medicationAPI } from "@/lib/api"
import { insightsAPI } from "@/lib/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface MedicationEntry {
  id: number
  medicine_name: string
  dosage?: string
  frequency?: string
  notes?: string
  created_at: string
}

export function MedicationTracker() {
  const [medications, setMedications] = useState<MedicationEntry[]>([])
  const [insights, setInsights] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingEntry, setEditingEntry] = useState<MedicationEntry | null>(null)
  const [formData, setFormData] = useState({
    medicine_name: "",
    dosage: "",
    frequency: "",
    notes: ""
  })

  useEffect(() => {
    fetchMedications()
  }, [])

  const fetchMedications = async () => {
    try {
      const [medData, insightsData] = await Promise.all([
        medicationAPI.getMyMedications(),
        insightsAPI.getWeeklyInsights()
      ])
      setMedications(medData)
      setInsights(insightsData)
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (entry: MedicationEntry) => {
    setEditingEntry(entry)
    setFormData({
      medicine_name: entry.medicine_name,
      dosage: entry.dosage || "",
      frequency: entry.frequency || "",
      notes: entry.notes || ""
    })
    setIsEditMode(true)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this medication entry?")) {
      try {
        await medicationAPI.deleteMedication(id)
        fetchMedications()
      } catch (error) {
        console.error("Failed to delete medication entry:", error)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (isEditMode && editingEntry) {
        await medicationAPI.updateMedication(editingEntry.id, {
          medicine_name: formData.medicine_name,
          dosage: formData.dosage || undefined,
          frequency: formData.frequency || undefined,
          notes: formData.notes || undefined
        })
      } else {
        await medicationAPI.createMedication({
          medicine_name: formData.medicine_name,
          dosage: formData.dosage || undefined,
          frequency: formData.frequency || undefined,
          notes: formData.notes || undefined
        })
      }
      setFormData({ medicine_name: "", dosage: "", frequency: "", notes: "" })
      setIsDialogOpen(false)
      setIsEditMode(false)
      setEditingEntry(null)
      fetchMedications()
    } catch (error) {
      console.error("Failed to save medication entry:", error)
    }
  }

  if (loading) {
    return <div className="animate-pulse">Loading medication data...</div>
  }

  const groupedEntries = medications.reduce((acc, entry) => {
    const date = new Date(entry.created_at).toDateString()
    if (!acc[date]) acc[date] = []
    acc[date].push(entry)
    return acc
  }, {} as Record<string, MedicationEntry[]>)

  const sortedDates = Object.keys(groupedEntries).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Pill className="h-8 w-8 text-blue-500" />
            Medication Tracker
          </h1>
          <p className="text-muted-foreground mt-1">Stay on top of your medication schedule</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            setIsEditMode(false)
            setEditingEntry(null)
            setFormData({ medicine_name: "", dosage: "", frequency: "", notes: "" })
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Medication
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditMode ? "Edit Medication" : "Add Medication"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="medicine_name">Medicine Name</Label>
                <Input
                  id="medicine_name"
                  value={formData.medicine_name}
                  onChange={(e) => setFormData({...formData, medicine_name: e.target.value})}
                  placeholder="e.g., Vitamin D, Aspirin"
                  required
                />
              </div>
              <div>
                <Label htmlFor="dosage">Dosage (optional)</Label>
                <Input
                  id="dosage"
                  value={formData.dosage}
                  onChange={(e) => setFormData({...formData, dosage: e.target.value})}
                  placeholder="e.g., 1000 IU, 1 tablet"
                />
              </div>
              <div>
                <Label htmlFor="frequency">Frequency (optional)</Label>
                <Input
                  id="frequency"
                  value={formData.frequency}
                  onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                  placeholder="e.g., Once daily, Twice daily"
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Any additional information"
                />
              </div>
              <Button type="submit" className="w-full">{isEditMode ? "Update Medication" : "Add Medication"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Medication Overview</CardTitle>
          <CardDescription>
            {medications.length} medication{medications.length !== 1 ? 's' : ''} in your regimen
          </CardDescription>
        </CardHeader>
        {/* <CardContent>
          <p className="text-sm text-muted-foreground">
            Track your medication adherence and set reminders.
          </p>
        </CardContent> */}
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Your Medications</h2>
        {medications.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="p-6 text-center text-muted-foreground">
              No medications added yet. Start tracking your medication regimen!
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
                  {groupedEntries[date].map((med) => (
                    <div key={med.id} className="border-l-2 border-primary/20 pl-4 py-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base">{med.medicine_name}</CardTitle>
                            <Badge variant="outline" className="bg-blue-500/20 text-blue-600">
                              <Pill className="mr-1 h-3 w-3" />
                              Active
                            </Badge>
                          </div>
                          <CardDescription>
                            {med.dosage && `${med.dosage}`}
                            {med.frequency && ` • ${med.frequency}`}
                          </CardDescription>
                          {med.notes && (
                            <p className="text-sm text-muted-foreground">{med.notes}</p>
                          )}
                        </div>
                        <div className="flex gap-1 ml-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(med)}
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
                                onClick={() => handleDelete(med.id)}
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
