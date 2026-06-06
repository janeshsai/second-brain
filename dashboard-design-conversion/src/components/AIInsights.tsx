import { Sparkles, TrendingUp, Brain, Lightbulb, Zap, type LucideIcon } from "lucide-react"
import { useState } from "react"
import { CollapsibleCard } from "./CollapsibleCard"
import { colors, alpha } from "../theme"

interface Insight {
  id: number
  icon: LucideIcon
  title: string
  description: string
  color: string
}

const insights: Insight[] = [
  { id: 1, icon: TrendingUp, title: "Productivity Peak", description: "You're most productive between 9-11 AM. Consider scheduling deep work during this time.", color: colors.chart2 },
  { id: 2, icon: Brain, title: "Habit Consistency", description: "Your meditation streak is at 14 days! You're building a strong routine.", color: colors.chart4 },
  { id: 3, icon: Lightbulb, title: "Learning Suggestion", description: "Based on your notes, you might enjoy 'Deep Learning Specialization'.", color: colors.chart3 },
  { id: 4, icon: Zap, title: "Quick Win", description: "Complete 2 more habits today to achieve your weekly goal.", color: colors.chart1 },
]

function InsightRow({ insight }: { insight: Insight }) {
  const [hovered, setHovered] = useState(false)
  const Icon = insight.icon

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
        cursor: "pointer",
      }}
    >
      <div style={{ borderRadius: 8, background: alpha(insight.color, 0.2), padding: 8 }}>
        <Icon size={16} color={insight.color} />
      </div>
      <div>
        <h4 style={{ fontSize: 14, fontWeight: 500, color: colors.foreground }}>{insight.title}</h4>
        <p style={{ marginTop: 2, fontSize: 14, color: colors.mutedForeground }}>
          {insight.description}
        </p>
      </div>
    </div>
  )
}

export function AIInsights() {
  return (
    <CollapsibleCard
      title="AI Insights"
      icon={<Sparkles size={20} color={colors.primary} />}
      glowColor="purple"
      badge={
        <span
          style={{
            marginLeft: 8,
            borderRadius: 9999,
            background: alpha(colors.primary, 0.2),
            padding: "2px 8px",
            fontSize: 12,
            fontWeight: 500,
            color: colors.primary,
          }}
        >
          4 new
        </span>
      }
    >
      <div>
        {insights.map((insight, i) => (
          <div key={insight.id} style={{ borderTop: i === 0 ? "none" : `1px solid ${colors.border}` }}>
            <InsightRow insight={insight} />
          </div>
        ))}
      </div>
    </CollapsibleCard>
  )
}
