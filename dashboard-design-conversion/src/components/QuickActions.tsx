import { FileText, Target, Bookmark, Calendar, Bot, type LucideIcon } from "lucide-react"
import { useState } from "react"
import { colors, alpha } from "../theme"

const actions: { icon: LucideIcon; label: string; color: string }[] = [
  { icon: FileText, label: "New Note", color: colors.chart1 },
  { icon: Target, label: "New Habit", color: colors.chart2 },
  { icon: Bookmark, label: "Add Bookmark", color: colors.chart3 },
  { icon: Calendar, label: "Create Event", color: colors.chart4 },
  { icon: Bot, label: "Ask AI", color: colors.primary },
]

function ActionButton({
  action,
  isActive,
  onClick,
}: {
  action: (typeof actions)[number]
  isActive: boolean
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const Icon = action.icon

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        borderRadius: 12,
        border: `1px solid ${isActive ? "transparent" : hovered ? "oklch(1 0 0 / 0.2)" : colors.border}`,
        padding: "10px 16px",
        fontSize: 14,
        fontWeight: 500,
        background: isActive
          ? alpha(action.color, 0.2)
          : hovered
            ? alpha(action.color, 0.3)
            : "oklch(1 0 0 / 0.05)",
        transform: isActive ? "scale(1.05)" : hovered ? "scale(1.02)" : "scale(1)",
        boxShadow: isActive ? "0 8px 20px rgba(0,0,0,0.3)" : "none",
        transition: "all 0.2s ease",
        backdropFilter: "blur(4px)",
      }}
    >
      <Icon size={16} color={action.color} />
      <span style={{ color: colors.foreground }}>{action.label}</span>
    </button>
  )
}

export function QuickActions() {
  const [activeAction, setActiveAction] = useState<string | null>(null)

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {actions.map((action) => (
          <ActionButton
            key={action.label}
            action={action}
            isActive={activeAction === action.label}
            onClick={() => setActiveAction(activeAction === action.label ? null : action.label)}
          />
        ))}
      </div>
    </div>
  )
}
