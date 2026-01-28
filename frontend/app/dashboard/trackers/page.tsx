import { DashboardHeader } from "@/components/dashboard-header"
import { TrackerGrid } from "@/components/tracker-grid"

export default function TrackersPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Health Trackers</h1>
          <p className="text-muted-foreground">Monitor your diet, symptoms, medications, and lifestyle in one place.</p>
        </div>

        <TrackerGrid />
      </main>
    </div>
  )
}
