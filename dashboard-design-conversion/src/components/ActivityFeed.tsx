import { Activity, FileText, Target, GraduationCap, Bot, type LucideIcon } from "lucide-react"
import { useState } from "react"
import { CollapsibleCard } from "./CollapsibleCard"
import { colors, alpha } from "../theme"

interface ActivityItem {
  id: number
  icon: LucideIcon
  title: string
  description: string
  time: string
  color: string
}

const activities: ActivityItem[] = [
  { id: 1, icon: FileText, title: "Created note", description: "Project Planning Meeting Notes", time: "2 hours ago", color: colors.chart1 },
  { id: 2, icon: Target, title: "Completed habit", description: "Morning Meditation - 14 day streak!", time: "5 hours ago", color: colors.chart2 },
  { id: 3, icon: GraduationCap, title: "Finished lesson", description: "Neural Networks Basics - ML Fundamentals", time: "Yesterday", color: colors.chart4 },
  { id: 4, icon: Bot, title: "AI interaction", description: "Generated weekly summary report", time: "Yesterday", color: colors.primary },
  { id: 5, icon: Target, title: "Completed habit", description: "Read 30 Minutes - 7 day streak!", time: "2 days ago", color: colors.chart2 },
]

function ActivityRow({ activity }: { activity: ActivityItem }) {
  const [hovered, setHovered] = useState(false)
  const Icon = activity.icon

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: 16,
        background: hovered ? "oklch(1 0 0 / 0.05)" : "transparent",
        transition: "background-color 0.2s ease",
      }}
    >
      <div style={{ borderRadius: 8, background: alpha(activity.color, 0.2), padding: 8 }}>
        <Icon size={16} color={activity.color} />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 14, color: colors.foreground }}>
          <span style={{ fontWeight: 500 }}>{activity.title}</span>
        </p>
        <p style={{ fontSize: 14, color: colors.mutedForeground }}>{activity.description}</p>
      </div>
      <span style={{ fontSize: 12, color: colors.mutedForeground, whiteSpace: "nowrap" }}>
        {activity.time}
      </span>
    </div>
  )
}

function ViewAll() {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: "none",
        background: "transparent",
        fontSize: 12,
        color: colors.primary,
        textDecoration: hovered ? "underline" : "none",
      }}
    >
      View All
    </button>
  )
}

export function ActivityFeed() {
  return (
    <CollapsibleCard
      title="Recent Activity"
      icon={<Activity size={20} color={colors.chart5} />}
      glowColor="green"
      rightAction={<ViewAll />}
    >
      <div>
        {activities.map((activity, i) => (
          <div key={activity.id} style={{ borderTop: i === 0 ? "none" : `1px solid ${colors.border}` }}>
            <ActivityRow activity={activity} />
          </div>
        ))}
      </div>
    </CollapsibleCard>
  )
}
