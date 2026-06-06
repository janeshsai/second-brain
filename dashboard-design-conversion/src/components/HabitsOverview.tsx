import { useState } from "react"
import { Target, Flame, Check } from "lucide-react"
import { CollapsibleCard } from "./CollapsibleCard"
import { colors } from "../theme"

interface Habit {
  id: number
  name: string
  streak: number
  completed: boolean
}

const initialHabits: Habit[] = [
  { id: 1, name: "Morning Meditation", streak: 14, completed: true },
  { id: 2, name: "Read 30 Minutes", streak: 7, completed: true },
  { id: 3, name: "Exercise", streak: 5, completed: false },
  { id: 4, name: "Journal Writing", streak: 21, completed: false },
  { id: 5, name: "Learn Spanish", streak: 3, completed: true },
]

function HabitRow({ habit, onToggle }: { habit: Habit; onToggle: (id: number) => void }) {
  const [rowHover, setRowHover] = useState(false)
  const [boxHover, setBoxHover] = useState(false)

  return (
    <div
      onMouseEnter={() => setRowHover(true)}
      onMouseLeave={() => setRowHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: 8,
        border: `1px solid ${colors.border}`,
        background: rowHover ? "oklch(1 0 0 / 0.1)" : "oklch(1 0 0 / 0.05)",
        padding: 12,
        transition: "all 0.2s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={() => onToggle(habit.id)}
          onMouseEnter={() => setBoxHover(true)}
          onMouseLeave={() => setBoxHover(false)}
          style={{
            display: "flex",
            height: 24,
            width: 24,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 6,
            border: `2px solid ${habit.completed ? "rgb(236,72,153)" : boxHover ? "rgb(236,72,153)" : "oklch(1 0 0 / 0.2)"}`,
            background: habit.completed ? "rgb(236,72,153)" : "transparent",
            color: colors.background,
            transform: habit.completed ? "scale(1.1)" : boxHover ? "scale(1.05)" : "scale(1)",
            transition: "all 0.2s ease",
          }}
        >
          {habit.completed && <Check size={16} />}
        </button>
        <span
          style={{
            fontSize: 14,
            color: habit.completed ? colors.mutedForeground : colors.foreground,
            textDecoration: habit.completed ? "line-through" : "none",
            transition: "all 0.2s ease",
          }}
        >
          {habit.name}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: colors.chart3 }}>
        <Flame size={12} />
        <span>{habit.streak} days</span>
      </div>
    </div>
  )
}

export function HabitsOverview() {
  const [habits, setHabits] = useState(initialHabits)

  const toggleHabit = (id: number) => {
    setHabits(
      habits.map((h) =>
        h.id === id
          ? { ...h, completed: !h.completed, streak: !h.completed ? h.streak + 1 : h.streak - 1 }
          : h,
      ),
    )
  }

  const completedCount = habits.filter((h) => h.completed).length
  const completionPercentage = Math.round((completedCount / habits.length) * 100)

  return (
    <CollapsibleCard
      title="Today's Habits"
      icon={<Target size={20} color="rgb(244,114,182)" />}
      glowColor="magenta"
      badge={
        <span
          style={{
            marginLeft: 8,
            borderRadius: 9999,
            background: "rgba(236,72,153,0.2)",
            padding: "4px 10px",
            fontSize: 12,
            fontWeight: 500,
            color: "rgb(244,114,182)",
          }}
        >
          {completionPercentage}%
        </span>
      }
    >
      <div style={{ padding: 16 }}>
        <div
          style={{
            marginBottom: 16,
            height: 8,
            width: "100%",
            overflow: "hidden",
            borderRadius: 9999,
            background: "oklch(1 0 0 / 0.1)",
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: 9999,
              background: "linear-gradient(to right, rgb(236,72,153), rgba(236,72,153,0.6))",
              width: `${completionPercentage}%`,
              transition: "width 0.5s ease",
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {habits.map((habit) => (
            <HabitRow key={habit.id} habit={habit} onToggle={toggleHabit} />
          ))}
        </div>
      </div>
    </CollapsibleCard>
  )
}
