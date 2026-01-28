"use client"

import { Activity, Sparkles, LayoutDashboard, ListChecks, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function DashboardHeader() {
  const pathname = usePathname()

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/trackers", label: "Trackers", icon: ListChecks },
  ]

  const profileItem = { href: "/dashboard/profile", label: "Profile", icon: User }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 grid grid-cols-3 h-14 items-center max-w-7xl">
        {/* Logo - Left */}
        <div className="flex items-center">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="relative">
              <Activity className="h-6 w-6 text-primary" strokeWidth={2.5} />
              <Sparkles className="h-3 w-3 text-accent absolute -top-0.5 -right-0.5" />
            </div>
            <span className="font-bold text-lg">EMBRACE</span>
          </Link>
        </div>

        {/* Navigation - Center */}
        <nav className="hidden md:flex items-center justify-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "gap-2 px-4 py-2 transition-all duration-200 hover:scale-105",
                    isActive
                      ? "bg-primary/8 text-primary/90 hover:bg-primary/12 shadow-sm ring-1 ring-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* Actions - Right */}
        <div className="flex items-center justify-end">
          <Link href={profileItem.href}>
            <Button
              variant={pathname === profileItem.href ? "secondary" : "ghost"}
              className={cn(
                "gap-2 px-4 py-2 transition-all duration-200 hover:scale-105",
                pathname === profileItem.href
                  ? "bg-primary/8 text-primary/90 hover:bg-primary/12 shadow-sm ring-1 ring-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              <profileItem.icon className="h-4 w-4" />
              {profileItem.label}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
