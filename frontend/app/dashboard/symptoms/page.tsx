import { DashboardHeader } from "@/components/dashboard-header"
import { SymptomsTracker } from "@/components/trackers/symptoms-tracker"

export default function SymptomsTrackerPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <SymptomsTracker />
      </main>
    </div>
  )
}
