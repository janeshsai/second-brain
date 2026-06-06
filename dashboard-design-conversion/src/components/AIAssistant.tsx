import { Sparkles, ArrowRight } from "lucide-react"
import { useState } from "react"
import { CollapsibleCard } from "./CollapsibleCard"
import { colors } from "../theme"

const suggestions = [
  "What tasks should I focus on today?",
  "Summarize my notes from this week",
  "Create a study plan for my current courses",
  "Show me my habit trends",
]

function SuggestionChip({ text }: { text: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 9999,
        border: `1px solid ${hovered ? "rgba(34,211,238,0.5)" : "rgba(34,211,238,0.3)"}`,
        background: hovered ? "rgba(34,211,238,0.2)" : "rgba(34,211,238,0.1)",
        padding: "6px 12px",
        fontSize: 12,
        color: hovered ? "rgb(165,243,252)" : "rgb(103,232,249)",
        transition: "all 0.2s ease",
      }}
    >
      {text}
    </button>
  )
}

export function AIAssistant({ style }: { style?: React.CSSProperties }) {
  const [inputFocused, setInputFocused] = useState(false)
  const [btnHover, setBtnHover] = useState(false)

  return (
    <CollapsibleCard
      title="AI Assistant"
      icon={<Sparkles size={20} color="rgb(34,211,238)" />}
      glowColor="cyan"
      style={style}
    >
      <div style={{ padding: 16 }}>
        <p style={{ marginBottom: 16, fontSize: 12, color: colors.mutedForeground }}>
          Ask anything in your Second Brain
        </p>

        <div style={{ position: "relative", marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Ask me anything about your notes, habits, or goals..."
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            style={{
              height: 48,
              width: "100%",
              borderRadius: 8,
              border: `1px solid ${inputFocused ? colors.primary : colors.border}`,
              background: "oklch(1 0 0 / 0.05)",
              padding: "0 48px 0 16px",
              fontSize: 14,
              color: colors.foreground,
              outline: "none",
              boxShadow: inputFocused ? `0 0 0 1px ${colors.primary}` : "none",
            }}
          />
          <button
            onMouseEnter={() => setBtnHover(true)}
            onMouseLeave={() => setBtnHover(false)}
            style={{
              position: "absolute",
              right: 6,
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              height: 36,
              width: 36,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 8,
              border: "none",
              background: btnHover ? "oklch(0.7 0.2 260 / 0.8)" : colors.primary,
              color: colors.primaryForeground,
              transition: "background 0.2s ease",
            }}
          >
            <ArrowRight size={16} />
          </button>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {suggestions.map((s) => (
            <SuggestionChip key={s} text={s} />
          ))}
        </div>
      </div>
    </CollapsibleCard>
  )
}
