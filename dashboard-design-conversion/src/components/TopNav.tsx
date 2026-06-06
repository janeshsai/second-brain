import { Search, Bell, Plus, User } from "lucide-react"
import { useState } from "react"
import { colors } from "../theme"

export function TopNav() {
  const [searchFocused, setSearchFocused] = useState(false)
  const [bellHover, setBellHover] = useState(false)
  const [addHover, setAddHover] = useState(false)
  const [avatarHover, setAvatarHover] = useState(false)

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        display: "flex",
        height: 64,
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: `1px solid ${colors.border}`,
        background: "rgba(0,0,0,0.2)",
        padding: "0 24px",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div style={{ display: "flex", flex: 1, alignItems: "center", gap: 16 }}>
        <div style={{ position: "relative", width: "100%", maxWidth: 448 }}>
          <Search
            size={16}
            color={colors.mutedForeground}
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            type="text"
            placeholder="Search everything..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              height: 40,
              width: "100%",
              borderRadius: 12,
              border: `1px solid ${searchFocused ? colors.primary : colors.border}`,
              background: "oklch(1 0 0 / 0.05)",
              padding: "0 16px 0 40px",
              fontSize: 14,
              color: colors.foreground,
              outline: "none",
              boxShadow: searchFocused ? `0 0 0 1px ${colors.primary}` : "none",
              backdropFilter: "blur(4px)",
            }}
          />
          <kbd
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              borderRadius: 6,
              border: `1px solid ${colors.border}`,
              background: "oklch(1 0 0 / 0.05)",
              padding: "2px 6px",
              fontSize: 12,
              color: colors.mutedForeground,
              pointerEvents: "none",
            }}
          >
            ⌘K
          </kbd>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onMouseEnter={() => setBellHover(true)}
          onMouseLeave={() => setBellHover(false)}
          style={{
            position: "relative",
            display: "flex",
            height: 36,
            width: 36,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 8,
            border: `1px solid ${colors.border}`,
            background: bellHover ? "oklch(1 0 0 / 0.1)" : "oklch(1 0 0 / 0.05)",
            color: colors.foreground,
            transition: "background-color 0.2s ease",
          }}
        >
          <Bell size={16} />
          <span
            style={{
              position: "absolute",
              right: -4,
              top: -4,
              display: "flex",
              height: 16,
              width: 16,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 9999,
              background: "linear-gradient(to bottom right, oklch(0.7 0.2 260), oklch(0.7 0.2 260 / 0.6))",
              fontSize: 10,
              fontWeight: 500,
              color: colors.primaryForeground,
            }}
          >
            3
          </span>
        </button>

        <button
          onMouseEnter={() => setAddHover(true)}
          onMouseLeave={() => setAddHover(false)}
          style={{
            display: "flex",
            height: 36,
            alignItems: "center",
            gap: 8,
            borderRadius: 8,
            border: "none",
            padding: "0 12px",
            fontSize: 14,
            fontWeight: 500,
            color: colors.primaryForeground,
            background: addHover
              ? "linear-gradient(to right, oklch(0.7 0.2 260 / 0.9), oklch(0.7 0.2 260 / 0.7))"
              : "linear-gradient(to right, oklch(0.7 0.2 260), oklch(0.7 0.2 260 / 0.8))",
            transition: "background 0.2s ease",
          }}
        >
          <Plus size={16} />
          <span>Quick Add</span>
        </button>

        <button
          onMouseEnter={() => setAvatarHover(true)}
          onMouseLeave={() => setAvatarHover(false)}
          style={{
            display: "flex",
            height: 36,
            width: 36,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 9999,
            border: "none",
            fontSize: 14,
            fontWeight: 500,
            color: colors.primaryForeground,
            background: "linear-gradient(to bottom right, oklch(0.7 0.2 260), oklch(0.7 0.25 320))",
            boxShadow: "0 8px 20px rgba(124,95,255,0.2)",
            transform: avatarHover ? "scale(1.05)" : "scale(1)",
            transition: "transform 0.2s ease",
          }}
        >
          <User size={16} />
        </button>
      </div>
    </header>
  )
}
