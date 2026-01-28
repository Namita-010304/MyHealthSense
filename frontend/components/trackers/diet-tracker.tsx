"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Apple, Edit, Trash2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useEffect, useState } from "react"
import { dietAPI } from "@/lib/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "../ui/badge"

interface DietEntry {
  id: number
  meal_type: string
  food_items: string
  calories?: number
  notes?: string
  created_at: string
}

export function DietTracker() {
  const [dietEntries, setDietEntries] = useState<DietEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingEntry, setEditingEntry] = useState<DietEntry | null>(null)
  const [formData, setFormData] = useState({
    meal_type: "",
    food_items: "",
    calories: "",
    notes: ""
  })

  useEffect(() => {
    fetchDietEntries()
  }, [])

  const fetchDietEntries = async () => {
    try {
      const data = await dietAPI.getMyDiets()
      setDietEntries(data)
    } catch (error) {
      console.error("Failed to fetch diet entries:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (entry: DietEntry) => {
    setEditingEntry(entry)
    setFormData({
      meal_type: entry.meal_type,
      food_items: entry.food_items,
      calories: entry.calories?.toString() || "",
      notes: entry.notes || ""
    })
    setIsEditMode(true)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this diet entry?")) {
      try {
        await dietAPI.deleteDiet(id)
        fetchDietEntries()
      } catch (error) {
        console.error("Failed to delete diet entry:", error)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (isEditMode && editingEntry) {
        await dietAPI.updateDiet(editingEntry.id, {
          meal_type: formData.meal_type,
          food_items: formData.food_items,
          calories: formData.calories ? parseInt(formData.calories) : undefined,
          notes: formData.notes || undefined
        })
      } else {
        await dietAPI.createDiet({
          meal_type: formData.meal_type,
          food_items: formData.food_items,
          calories: formData.calories ? parseInt(formData.calories) : undefined,
          notes: formData.notes || undefined
        })
      }
      setFormData({ meal_type: "", food_items: "", calories: "", notes: "" })
      setIsDialogOpen(false)
      setIsEditMode(false)
      setEditingEntry(null)
      fetchDietEntries()
    } catch (error) {
      console.error("Failed to save diet entry:", error)
    }
  }

  // Calculate today's calories
  const today = new Date().toDateString()
  const todaysCalories = dietEntries
    .filter(entry => new Date(entry.created_at).toDateString() === today)
    .reduce((sum, entry) => sum + (entry.calories || 0), 0)

  const targetCalories = 1800
  const percentage = Math.min((todaysCalories / targetCalories) * 100, 100)

  const groupedEntries = dietEntries.reduce((acc, entry) => {
    const date = new Date(entry.created_at).toDateString()
    if (!acc[date]) acc[date] = []
    acc[date].push(entry)
    return acc
  }, {} as Record<string, DietEntry[]>)

  const sortedDates = Object.keys(groupedEntries).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  if (loading) {
    return <div className="animate-pulse">Loading diet data...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Apple className="h-8 w-8 text-green-500" />
            Diet Tracker
          </h1>
          <p className="text-muted-foreground mt-1">Monitor your daily nutrition</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            setIsEditMode(false)
            setEditingEntry(null)
            setFormData({ meal_type: "", food_items: "", calories: "", notes: "" })
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Meal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditMode ? "Edit Diet Entry" : "Add Diet Entry"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="meal_type">Meal Type</Label>
                <Select value={formData.meal_type} onValueChange={(value) => setFormData({...formData, meal_type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select meal type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Breakfast">Breakfast</SelectItem>
                    <SelectItem value="Lunch">Lunch</SelectItem>
                    <SelectItem value="Dinner">Dinner</SelectItem>
                    <SelectItem value="Snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="food_items">Food Items</Label>
                <Textarea
                  id="food_items"
                  value={formData.food_items}
                  onChange={(e) => setFormData({...formData, food_items: e.target.value})}
                  placeholder="List the foods you ate"
                  required
                />
              </div>
              <div>
                <Label htmlFor="calories">Calories (optional)</Label>
                <Input
                  id="calories"
                  type="number"
                  value={formData.calories}
                  onChange={(e) => setFormData({...formData, calories: e.target.value})}
                  placeholder="Approximate calories"
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Any additional notes"
                />
              </div>
              <Button type="submit" className="w-full">{isEditMode ? "Update Entry" : "Add Entry"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Today's Calorie Goal</CardTitle>
          <CardDescription>
            {todaysCalories} / {targetCalories} calories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={percentage} className="h-3" />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Recent Meals</h2>
        {dietEntries.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="p-6 text-center text-muted-foreground">
              No diet entries yet. Add your first meal!
            </CardContent>
          </Card>
        ) : (
          <TooltipProvider>
            {sortedDates.map((date) => (
              <Card key={date} className="border-border/50 mb-4">
                <CardHeader>
                  <CardTitle className="text-lg">{new Date(date).toLocaleDateString()}</CardTitle>
                  <CardDescription>
                    Total: {groupedEntries[date].reduce((sum, entry) => sum + (entry.calories || 0), 0)} calories
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {groupedEntries[date].map((entry) => (
                    <div key={entry.id} className="border-l-2 border-primary/20 pl-4 py-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{entry.meal_type}</Badge>
                            {entry.calories && (
                              <span className="text-sm font-medium">{entry.calories} cal</span>
                            )}
                          </div>
                          <p className="text-sm">{entry.food_items}</p>
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
