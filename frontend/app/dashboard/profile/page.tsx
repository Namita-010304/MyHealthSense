"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Calendar, Activity, Shield, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { authAPI } from "@/lib/api"

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    wake_up_time: "",
    sleep_time: "",
    meals_per_day: "",
    exercise_frequency: "",
    water_intake: "",
    medical_conditions: "",
    health_goals: "",
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await authAPI.getProfile()
        setProfile(profileData)
        setFormData({
          full_name: profileData.full_name || "",
          age: profileData.age !== null && profileData.age !== undefined ? profileData.age.toString() : "",
          gender: profileData.gender || "",
          height: profileData.height !== null && profileData.height !== undefined ? profileData.height.toString() : "",
          weight: profileData.weight !== null && profileData.weight !== undefined ? profileData.weight.toString() : "",
          wake_up_time: profileData.wake_up_time || "",
          sleep_time: profileData.sleep_time || "",
          meals_per_day: profileData.meals_per_day !== null && profileData.meals_per_day !== undefined ? profileData.meals_per_day.toString() : "",
          exercise_frequency: profileData.exercise_frequency !== null && profileData.exercise_frequency !== undefined ? profileData.exercise_frequency.toString() : "",
          water_intake: profileData.water_intake !== null && profileData.water_intake !== undefined ? profileData.water_intake.toString() : "",
          medical_conditions: profileData.medical_conditions || "",
          health_goals: profileData.health_goals || "",
        })
      } catch (error) {
        console.error("Failed to fetch profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const updateData = {
        full_name: formData.full_name || null,
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender || null,
        height: formData.height ? parseInt(formData.height) : null,
        weight: formData.weight ? parseInt(formData.weight) : null,
        wake_up_time: formData.wake_up_time || null,
        sleep_time: formData.sleep_time || null,
        meals_per_day: formData.meals_per_day ? parseInt(formData.meals_per_day) : null,
        exercise_frequency: formData.exercise_frequency ? parseInt(formData.exercise_frequency) : null,
        water_intake: formData.water_intake ? parseInt(formData.water_intake) : null,
        medical_conditions: formData.medical_conditions || null,
        health_goals: formData.health_goals || null,
      }

      const updatedProfile = await authAPI.updateProfile(updateData)
      setProfile(updatedProfile)
      alert("Profile updated successfully!")
    } catch (error) {
      console.error("Failed to update profile:", error)
      alert("Failed to update profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    router.push("/")
  }

  const handleDeleteAccount = async () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        await authAPI.deleteProfile()
        localStorage.removeItem("access_token")
        router.push("/")
      } catch (error) {
        alert("Failed to delete account. Please try again.")
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="container mx-auto px-4 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-6 space-y-6 max-w-4xl">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Profile & Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences.</p>
        </div>

        <div className="grid gap-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your profile details and personal information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/placeholder.svg?height=80&width=80" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">JD</AvatarFallback>
                </Avatar>
                <Button variant="outline">Change Photo</Button>
              </div> */}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="John Doe"
                      className="pl-10"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange("full_name", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      className="pl-10"
                      value={profile?.email || ""}
                      disabled
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob">Age</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <input
                      id="dob"
                      type="text"
                      placeholder="25"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <div className="relative">
                    <Activity className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <input
                      id="weight"
                      type="text"
                      placeholder="70"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.weight}
                      onChange={(e) => handleInputChange("weight", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Input
                    id="gender"
                    placeholder="Male/Female/Other"
                    value={formData.gender}
                    onChange={(e) => handleInputChange("gender", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <input
                    id="height"
                    type="text"
                    placeholder="170"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.height}
                    onChange={(e) => handleInputChange("height", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Daily Routine</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* <div className="space-y-2">
                    <Label htmlFor="wakeUpTime">Wake Up Time</Label>
                    <Input
                      id="wakeUpTime"
                      type="time"
                      value={formData.wake_up_time}
                      onChange={(e) => handleInputChange("wake_up_time", e.target.value)}
                    />
                  </div> */}

                  {/* <div className="space-y-2">
                    <Label htmlFor="sleepTime">Sleep Time</Label>
                    <Input
                      id="sleepTime"
                      type="time"
                      value={formData.sleep_time}
                      onChange={(e) => handleInputChange("sleep_time", e.target.value)}
                    />
                  </div> */}

                  <div className="space-y-2">
                    <Label htmlFor="mealsPerDay">Meals Per Day</Label>
                    <input
                      id="mealsPerDay"
                      type="text"
                      placeholder="3"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.meals_per_day}
                      onChange={(e) => handleInputChange("meals_per_day", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="exerciseFrequency">Exercise Frequency (times/week)</Label>
                    <input
                      id="exerciseFrequency"
                      type="text"
                      placeholder="3"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.exercise_frequency}
                      onChange={(e) => handleInputChange("exercise_frequency", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="waterIntake">Daily Water Intake (glasses)</Label>
                    <input
                      id="waterIntake"
                      type="text"
                      placeholder="8"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.water_intake}
                      onChange={(e) => handleInputChange("water_intake", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Health Information</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="medicalConditions">Medical Conditions</Label>
                    <textarea
                      id="medicalConditions"
                      placeholder="List any existing medical conditions, allergies, or medications..."
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.medical_conditions}
                      onChange={(e) => handleInputChange("medical_conditions", e.target.value)}
                      rows={3}
                    ></textarea>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="healthGoals">Health Goals</Label>
                    <textarea
                      id="healthGoals"
                      placeholder="What are your health and wellness goals?"
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.health_goals}
                      onChange={(e) => handleInputChange("health_goals", e.target.value)}
                      rows={3}
                    ></textarea>
                  </div>
                </div>
              </div>

              <Button
                className="w-full sm:w-auto"
                onClick={handleSaveProfile}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          {/* <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Privacy & Security</CardTitle>
              <CardDescription>Manage your account security and data privacy.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                </div>
                <Switch />
              </div>

              <Separator />

              <Button variant="outline" className="w-full sm:w-auto bg-transparent">
                Change Password
              </Button>
            </CardContent>
          </Card> */}

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Account Management</CardTitle>
              <CardDescription>Manage your session and account access.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full sm:w-auto bg-transparent" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/50 border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions for your account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="destructive" className="w-full sm:w-auto" onClick={handleDeleteAccount}>
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
