import { DashboardHeader } from "@/components/dashboard-header"
import { MedicationTracker } from "@/components/trackers/medication-tracker"

export default function MedicationTrackerPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <MedicationTracker />
      </main>
    </div>
  )
}
