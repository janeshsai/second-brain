import {
  FileText,
  Target,
  Calendar,
  GraduationCap,
  Bookmark,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  type LucideIcon,
} from "lucide-react"
import { useState } from "react"
import { colors, alpha } from "../theme"

interface Stat {
  label: string
  value: string
  change: string
  trend: "up" | "down"
  icon: LucideIcon
  color: string
}

const stats: Stat[] = [
  { label: "Total Notes", value: "247", change: "+12", trend: "up", icon: FileText, color: colors.chart1 },
  { label: "Active Habits", value: "8", change: "+2", trend: "up", icon: Target, color: colors.chart2 },
  { label: "Upcoming Tasks", value: "15", change: "-3", trend: "down", icon: Calendar, color: colors.chart3 },
  { label: "Learning Progress", value: "68%", change: "+5%", trend: "up", icon: GraduationCap, color: colors.chart4 },
  { label: "Bookmarks Saved", value: "156", change: "+8", trend: "up", icon: Bookmark, color: colors.chart5 },
  { label: "AI Conversations", value: "34", change: "+4", trend: "up", icon: MessageSquare, color: colors.primary },
]

function StatCard({ stat }: { stat: Stat }) {
  const [hovered, setHovered] = useState(false)
  const Icon = stat.icon
  const Trend = stat.trend === "up" ? TrendingUp : TrendingDown
  const trendColor = stat.trend === "up" ? colors.chart5 : colors.destructive

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 12,
        border: `1px solid ${hovered ? "oklch(1 0 0 / 0.2)" : colors.border}`,
        background: "oklch(1 0 0 / 0.05)",
        padding: 16,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        transition: "all 0.3s ease",
        transform: hovered ? "scale(1.05)" : "scale(1)",
        boxShadow: hovered ? "0 8px 24px rgba(0,0,0,0.3)" : "none",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(to bottom right, ${alpha(stat.color, 0.2)}, ${alpha(stat.color, 0.05)})`,
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.3s ease",
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              borderRadius: 8,
              background: alpha(stat.color, 0.2),
              padding: 8,
              transform: hovered ? "scale(1.1)" : "scale(1)",
              transition: "transform 0.3s ease",
            }}
          >
            <Icon size={16} color={stat.color} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
            <Trend size={12} color={trendColor} />
            <span style={{ color: trendColor }}>{stat.change}</span>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <p style={{ fontSize: 24, fontWeight: 600, color: colors.foreground }}>{stat.value}</p>
          <p style={{ fontSize: 12, color: colors.mutedForeground }}>{stat.label}</p>
        </div>
      </div>
    </div>
  )
}

export function StatsOverview() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: 16,
      }}
    >
      {stats.map((stat) => (
        <StatCard key={stat.label} stat={stat} />
      ))}
    </div>
  )
}
