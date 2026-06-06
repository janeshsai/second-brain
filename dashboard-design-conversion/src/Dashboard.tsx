import { Sidebar } from "./components/Sidebar"
import { TopNav } from "./components/TopNav"
import { WelcomeHeader } from "./components/WelcomeHeader"
import { QuickActions } from "./components/QuickActions"
import { StatsOverview } from "./components/StatsOverview"
import { AIAssistant } from "./components/AIAssistant"
import { RecentNotes } from "./components/RecentNotes"
import { HabitsOverview } from "./components/HabitsOverview"
import { CalendarOverview } from "./components/CalendarOverview"
import { LearningProgress } from "./components/LearningProgress"
import { ActivityFeed } from "./components/ActivityFeed"
import { AIInsights } from "./components/AIInsights"
import { useMediaQuery } from "./hooks/useMediaQuery"
import { colors } from "./theme"

export function Dashboard() {
  const isLg = useMediaQuery("(min-width: 1024px)")

  const threeCol = isLg ? "repeat(3, minmax(0, 1fr))" : "1fr"
  const twoCol = isLg ? "repeat(2, minmax(0, 1fr))" : "1fr"

  return (
    <div style={{ position: "relative", minHeight: "100vh", background: colors.background }}>
      {/* Neural Network Background */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: "url('/neural-brain-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "linear-gradient(to bottom right, rgba(0,0,0,0.6), rgba(0,0,0,0.4), rgba(0,0,0,0.5))",
        }}
      />

      <div style={{ position: "relative", zIndex: 10 }}>
        <Sidebar />

        <div style={{ paddingLeft: 64, transition: "all 0.3s ease" }}>
          <TopNav />

          <main style={{ padding: 24 }}>
            <WelcomeHeader />
            <QuickActions />

            {/* AI Assistant and Habits */}
            <div style={{ display: "grid", gap: 24, gridTemplateColumns: threeCol }}>
              <AIAssistant style={{ gridColumn: isLg ? "span 2" : "1 / -1" }} />
              <div style={{ gridColumn: isLg ? "auto" : "1 / -1" }}>
                <HabitsOverview />
              </div>
            </div>

            {/* Notes and Calendar */}
            <div style={{ marginTop: 24, display: "grid", gap: 24, gridTemplateColumns: twoCol }}>
              <RecentNotes />
              <CalendarOverview />
            </div>

            {/* Learning, Activity, Insights */}
            <div style={{ marginTop: 24, display: "grid", gap: 24, gridTemplateColumns: threeCol }}>
              <LearningProgress />
              <ActivityFeed />
              <AIInsights />
            </div>

            {/* Stats */}
            <div style={{ marginTop: 24 }}>
              <StatsOverview />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
