import {
  LayoutDashboard,
  FileText,
  Bookmark,
  Target,
  Calendar,
  GraduationCap,
  Sparkles,
  type LucideIcon,
} from "lucide-react"
import { useState } from "react"
import { colors } from "../theme"

const navItems: { icon: LucideIcon; label: string; active?: boolean }[] = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: FileText, label: "Notes" },
  { icon: Bookmark, label: "Bookmarks" },
  { icon: Target, label: "Habits" },
  { icon: Calendar, label: "Calendar" },
  { icon: GraduationCap, label: "Learning Paths" },
]

function NavLink({ item }: { item: (typeof navItems)[number] }) {
  const [hovered, setHovered] = useState(false)
  const Icon = item.icon
  const active = item.active

  return (
    <a
      href="#"
      title={item.label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        height: 40,
        width: 40,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12,
        transition: "all 0.2s ease",
        background: active
          ? "rgba(124, 95, 255, 0.2)"
          : hovered
            ? "oklch(1 0 0 / 0.1)"
            : "transparent",
        color: active ? colors.primary : hovered ? colors.foreground : colors.mutedForeground,
        boxShadow: active ? "0 8px 20px rgba(124,95,255,0.2)" : "none",
      }}
    >
      <Icon size={20} />
    </a>
  )
}

export function Sidebar() {
  return (
    <aside
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 40,
        display: "flex",
        height: "100vh",
        width: 64,
        flexDirection: "column",
        borderRight: `1px solid ${colors.border}`,
        background: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div
        style={{
          display: "flex",
          height: 64,
          alignItems: "center",
          justifyContent: "center",
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <div
          style={{
            display: "flex",
            height: 40,
            width: 40,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 12,
            background: "linear-gradient(to bottom right, oklch(0.7 0.2 260), oklch(0.7 0.2 260 / 0.6))",
          }}
        >
          <Sparkles size={20} color={colors.primaryForeground} />
        </div>
      </div>

      <nav
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          padding: 12,
        }}
      >
        {navItems.map((item) => (
          <NavLink key={item.label} item={item} />
        ))}
      </nav>
    </aside>
  )
}
