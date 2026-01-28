"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { authAPI } from "@/lib/api"

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    wakeUpTime: "",
    sleepTime: "",
    mealsPerDay: "",
    exerciseFrequency: "",
    waterIntake: "",
    medicalConditions: "",
    healthGoals: "",
  })

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      try {
        // Save profile data to backend
        const profileData = {
          full_name: formData.fullName,
          age: formData.age ? parseInt(formData.age) : null,
          gender: formData.gender,
          height: formData.height ? parseInt(formData.height) : null,
          weight: formData.weight ? parseInt(formData.weight) : null,
          wake_up_time: formData.wakeUpTime,
          sleep_time: formData.sleepTime,
          meals_per_day: formData.mealsPerDay ? parseInt(formData.mealsPerDay) : null,
          exercise_frequency: formData.exerciseFrequency ? parseInt(formData.exerciseFrequency) : null,
          water_intake: formData.waterIntake ? parseInt(formData.waterIntake) : null,
          medical_conditions: formData.medicalConditions,
          health_goals: formData.healthGoals,
        }

        await authAPI.updateProfile(profileData)
        // Navigate to dashboard
        router.push("/dashboard")
      } catch (error) {
        console.error("Failed to save profile:", error)
        // Still navigate to dashboard even if profile save fails
        router.push("/dashboard")
      }
    }
  }

  const progress = (step / 3) * 100

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>Help us personalize your health companion experience</CardDescription>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="25"
                    value={formData.age}
                    onChange={(e) => updateField("age", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Gender</Label>
                  <RadioGroup value={formData.gender} onValueChange={(val) => updateField("gender", val)}>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male" className="font-normal cursor-pointer">
                          Male
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female" className="font-normal cursor-pointer">
                          Female
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other" className="font-normal cursor-pointer">
                          Other
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="170"
                    value={formData.height}
                    onChange={(e) => updateField("height", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="70"
                    value={formData.weight}
                    onChange={(e) => updateField("weight", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Daily Routine</h3>

              {/* <div className="grid gap-4 sm:grid-cols-2"> */}
                {/* <div className="space-y-2">
                  <Label htmlFor="wakeUpTime">Wake Up Time</Label>
                  <Input
                    id="wakeUpTime"
                    type="time"
                    value={formData.wakeUpTime}
                    onChange={(e) => updateField("wakeUpTime", e.target.value)}
                  />
                </div> */}

                {/* <div className="space-y-2">
                  <Label htmlFor="sleepTime">Sleep Time</Label>
                  <Input
                    id="sleepTime"
                    type="time"
                    value={formData.sleepTime}
                    onChange={(e) => updateField("sleepTime", e.target.value)}
                  />
                </div> */}
              {/* </div> */}

              <div className="space-y-2">
                <Label htmlFor="mealsPerDay">Meals Per Day</Label>
                <Input
                  id="mealsPerDay"
                  type="number"
                  placeholder="3"
                  value={formData.mealsPerDay}
                  onChange={(e) => updateField("mealsPerDay", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="exerciseFrequency">Exercise Frequency (times per week)</Label>
                <Input
                  id="exerciseFrequency"
                  type="number"
                  placeholder="3"
                  value={formData.exerciseFrequency}
                  onChange={(e) => updateField("exerciseFrequency", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="waterIntake">Daily Water Intake (glasses)</Label>
                <Input
                  id="waterIntake"
                  type="number"
                  placeholder="8"
                  value={formData.waterIntake}
                  onChange={(e) => updateField("waterIntake", e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Health Information</h3>

              <div className="space-y-2">
                <Label htmlFor="medicalConditions">Medical Conditions (if any)</Label>
                <Textarea
                  id="medicalConditions"
                  placeholder="List any existing medical conditions, allergies, or medications..."
                  value={formData.medicalConditions}
                  onChange={(e) => updateField("medicalConditions", e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="healthGoals">Health Goals</Label>
                <Textarea
                  id="healthGoals"
                  placeholder="What are your health and wellness goals? (e.g., weight loss, better sleep, manage stress...)"
                  value={formData.healthGoals}
                  onChange={(e) => updateField("healthGoals", e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
            <Button onClick={handleNext} className="ml-auto">
              {step === 3 ? "Complete Setup" : "Next"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
