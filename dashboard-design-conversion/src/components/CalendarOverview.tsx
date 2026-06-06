import { Calendar as CalendarIcon, Clock, MapPin, Plus } from "lucide-react"
import { useState } from "react"
import { CollapsibleCard } from "./CollapsibleCard"
import { colors } from "../theme"

interface EventItem {
  id: number
  title: string
  time: string
  duration: string
  location: string
  color: string
}

const initialEvents: EventItem[] = [
  { id: 1, title: "Team Standup", time: "9:00 AM", duration: "30 min", location: "Zoom", color: colors.chart1 },
  { id: 2, title: "Design Review", time: "11:00 AM", duration: "1 hour", location: "Conference Room A", color: colors.chart2 },
  { id: 3, title: "Lunch with Sarah", time: "12:30 PM", duration: "1 hour", location: "Cafe Central", color: colors.chart3 },
  { id: 4, title: "Product Planning", time: "3:00 PM", duration: "2 hours", location: "Room 204", color: colors.chart4 },
]

const days = ["S", "M", "T", "W", "T", "F", "S"]
const currentDay = new Date().getDay()

function DayButton({
  day,
  selected,
  onClick,
}: {
  day: string
  selected: boolean
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        height: 32,
        width: 32,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        border: "none",
        fontSize: 12,
        fontWeight: 500,
        background: selected
          ? "linear-gradient(to bottom right, oklch(0.7 0.2 260), oklch(0.7 0.2 260 / 0.6))"
          : hovered
            ? "oklch(1 0 0 / 0.1)"
            : "transparent",
        color: selected ? colors.primaryForeground : hovered ? colors.foreground : colors.mutedForeground,
        boxShadow: selected ? "0 8px 20px rgba(124,95,255,0.2)" : "none",
        transition: "all 0.2s ease",
      }}
    >
      {day}
    </button>
  )
}

function EventRow({ event }: { event: EventItem }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        gap: 12,
        borderRadius: 8,
        border: `1px solid ${colors.border}`,
        background: hovered ? "oklch(1 0 0 / 0.1)" : "oklch(1 0 0 / 0.05)",
        padding: 12,
        transform: hovered ? "scale(1.02)" : "scale(1)",
        transition: "all 0.2s ease",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          width: 4,
          borderRadius: 9999,
          background: `linear-gradient(to bottom, ${event.color}, ${event.color})`,
          alignSelf: "stretch",
        }}
      />
      <div style={{ flex: 1 }}>
        <h4 style={{ fontSize: 14, fontWeight: 500, color: colors.foreground }}>{event.title}</h4>
        <div
          style={{
            marginTop: 4,
            display: "flex",
            flexWrap: "wrap",
            columnGap: 12,
            rowGap: 4,
            fontSize: 12,
            color: colors.mutedForeground,
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Clock size={12} />
            {event.time} - {event.duration}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <MapPin size={12} />
            {event.location}
          </span>
        </div>
      </div>
    </div>
  )
}

function PlusAction() {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 8,
        border: "none",
        padding: 6,
        background: hovered ? "oklch(1 0 0 / 0.1)" : "transparent",
        color: hovered ? colors.foreground : colors.mutedForeground,
        transition: "all 0.2s ease",
        display: "flex",
      }}
    >
      <Plus size={16} />
    </button>
  )
}

export function CalendarOverview() {
  const [selectedDay, setSelectedDay] = useState(currentDay)
  const events = initialEvents

  return (
    <CollapsibleCard
      title="Today's Schedule"
      icon={<CalendarIcon size={20} color="rgb(167,139,250)" />}
      glowColor="purple"
      badge={
        <span style={{ marginLeft: 8, fontSize: 12, color: colors.mutedForeground }}>
          {events.length} events
        </span>
      }
      rightAction={<PlusAction />}
    >
      <div style={{ padding: 16 }}>
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
            borderRadius: 8,
            background: "oklch(1 0 0 / 0.05)",
            padding: 8,
          }}
        >
          {days.map((day, index) => (
            <DayButton
              key={index}
              day={day}
              selected={index === selectedDay}
              onClick={() => setSelectedDay(index)}
            />
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {events.map((event) => (
            <EventRow key={event.id} event={event} />
          ))}
        </div>
      </div>
    </CollapsibleCard>
  )
}
