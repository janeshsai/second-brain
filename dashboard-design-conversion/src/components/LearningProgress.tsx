import { GraduationCap, Play, BookOpen } from "lucide-react"
import { useState } from "react"
import { CollapsibleCard } from "./CollapsibleCard"
import { colors } from "../theme"

interface Path {
  id: number
  title: string
  progress: number
  totalLessons: number
  completedLessons: number
  lastStudied: string
  color: string
}

const initialPaths: Path[] = [
  { id: 1, title: "Machine Learning Fundamentals", progress: 68, totalLessons: 24, completedLessons: 16, lastStudied: "2 hours ago", color: colors.chart1 },
  { id: 2, title: "Advanced TypeScript", progress: 45, totalLessons: 18, completedLessons: 8, lastStudied: "Yesterday", color: colors.chart2 },
  { id: 3, title: "System Design Interview Prep", progress: 32, totalLessons: 15, completedLessons: 5, lastStudied: "3 days ago", color: colors.chart4 },
]

function PathRow({ path, onContinue }: { path: Path; onContinue: (id: number) => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: 16,
        background: hovered ? "oklch(1 0 0 / 0.05)" : "transparent",
        transition: "background-color 0.2s ease",
      }}
    >
      <div style={{ marginBottom: 8, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <h4 style={{ fontSize: 14, fontWeight: 500, color: colors.foreground }}>{path.title}</h4>
        <button
          onClick={() => onContinue(path.id)}
          style={{
            display: "flex",
            height: 28,
            width: 28,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 9999,
            border: "none",
            background: "linear-gradient(to bottom right, oklch(0.7 0.2 260), oklch(0.7 0.2 260 / 0.6))",
            color: colors.primaryForeground,
            transform: hovered ? "scale(1.1)" : "scale(1)",
            boxShadow: hovered ? "0 8px 20px rgba(124,95,255,0.3)" : "none",
            transition: "all 0.2s ease",
            flexShrink: 0,
          }}
        >
          <Play size={12} />
        </button>
      </div>

      <div
        style={{
          marginBottom: 8,
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 12,
          color: colors.mutedForeground,
        }}
      >
        <BookOpen size={12} />
        <span>
          {path.completedLessons}/{path.totalLessons} lessons
        </span>
        <span>-</span>
        <span>Last studied {path.lastStudied}</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            height: 8,
            flex: 1,
            overflow: "hidden",
            borderRadius: 9999,
            background: "oklch(1 0 0 / 0.1)",
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: 9999,
              background: `linear-gradient(to right, ${path.color}, ${path.color})`,
              width: `${path.progress}%`,
              transition: "width 0.5s ease",
            }}
          />
        </div>
        <span style={{ fontSize: 12, fontWeight: 500, color: colors.mutedForeground }}>
          {path.progress}%
        </span>
      </div>
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

export function LearningProgress() {
  const [paths, setPaths] = useState(initialPaths)

  const continueLesson = (id: number) => {
    setPaths(
      paths.map((p) =>
        p.id === id
          ? {
              ...p,
              completedLessons: Math.min(p.completedLessons + 1, p.totalLessons),
              progress: Math.min(Math.round(((p.completedLessons + 1) / p.totalLessons) * 100), 100),
              lastStudied: "Just now",
            }
          : p,
      ),
    )
  }

  return (
    <CollapsibleCard
      title="Learning Progress"
      icon={<GraduationCap size={20} color={colors.chart4} />}
      glowColor="green"
      rightAction={<ViewAll />}
    >
      <div>
        {paths.map((path, i) => (
          <div key={path.id} style={{ borderTop: i === 0 ? "none" : `1px solid ${colors.border}` }}>
            <PathRow path={path} onContinue={continueLesson} />
          </div>
        ))}
      </div>
    </CollapsibleCard>
  )
}
