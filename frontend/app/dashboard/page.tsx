import { DashboardHeader } from "@/components/dashboard-header"
import { WeeklyReport } from "@/components/weekly-report"
import { QuickStats } from "@/components/quick-stats"
import { WelcomeSection } from "@/components/welcome-section"
import { HealthGoals } from "@/components/health-goals"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-6 space-y-8 max-w-7xl">
        <WelcomeSection />

        <QuickStats />

        <div className="grid gap-8 lg:grid-cols-2">
          <WeeklyReport />
          <HealthGoals />
        </div>
      </main>
    </div>
  )
}
