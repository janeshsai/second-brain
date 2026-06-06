import { useState, type ReactNode } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { glowStyles, colors, type GlowColor } from "../theme"
import { useHover } from "../hooks/useHover"

interface CollapsibleCardProps {
  title: string
  icon: ReactNode
  badge?: ReactNode
  rightAction?: ReactNode
  children: ReactNode
  defaultExpanded?: boolean
  glowColor?: GlowColor
  style?: React.CSSProperties
}

export function CollapsibleCard({
  title,
  icon,
  badge,
  rightAction,
  children,
  defaultExpanded = true,
  glowColor = "cyan",
  style,
}: CollapsibleCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const cardHover = useHover()
  const headerHover = useHover()
  const glow = glowStyles[glowColor]

  return (
    <div
      {...cardHover.props}
      style={{
        borderRadius: 12,
        border: `1px solid ${cardHover.isHovered ? glow.borderHover : glow.border}`,
        background: "oklch(1 0 0 / 0.05)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        transition: "all 0.3s ease",
        boxShadow: cardHover.isHovered ? glow.shadowHover : "none",
        ...style,
      }}
    >
      <button
        {...headerHover.props}
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          alignItems: "center",
          justifyContent: "space-between",
          overflow: "hidden",
          borderRadius: "12px 12px 0 0",
          borderBottom: `1px solid ${colors.border}`,
          padding: 16,
          textAlign: "left",
          background: headerHover.isHovered ? "oklch(1 0 0 / 0.05)" : "transparent",
          border: "none",
          borderBottomWidth: 1,
          borderBottomStyle: "solid",
          borderBottomColor: colors.border,
          transition: "background-color 0.2s ease",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: glow.headerGradient,
            opacity: 0.5,
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ borderRadius: 8, padding: 8, background: glow.iconBg }}>{icon}</div>
          <h3 style={{ fontWeight: 600, color: colors.foreground, fontSize: 16 }}>{title}</h3>
          {badge}
        </div>
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 8 }}>
          {rightAction}
          {isExpanded ? (
            <ChevronUp size={16} color={colors.mutedForeground} />
          ) : (
            <ChevronDown size={16} color={colors.mutedForeground} />
          )}
        </div>
      </button>

      <div
        style={{
          display: "grid",
          gridTemplateRows: isExpanded ? "1fr" : "0fr",
          opacity: isExpanded ? 1 : 0,
          transition: "grid-template-rows 0.3s ease-in-out, opacity 0.3s ease-in-out",
        }}
      >
        <div style={{ overflow: "hidden" }}>{children}</div>
      </div>
    </div>
  )
}
