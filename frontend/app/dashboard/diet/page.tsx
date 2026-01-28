import { DashboardHeader } from "@/components/dashboard-header"
import { DietTracker } from "@/components/trackers/diet-tracker"

export default function DietTrackerPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <DietTracker />
      </main>
    </div>
  )
}
