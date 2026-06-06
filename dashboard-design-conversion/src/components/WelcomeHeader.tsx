import { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"
import { colors } from "../theme"

export function WelcomeHeader() {
  const [greeting, setGreeting] = useState("Good morning")
  const [currentTime, setCurrentTime] = useState("")
  const [currentDate, setCurrentDate] = useState("")

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const hour = now.getHours()

      if (hour < 12) setGreeting("Good morning")
      else if (hour < 17) setGreeting("Good afternoon")
      else setGreeting("Good evening")

      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
      )
      setCurrentDate(
        now.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
      )
    }

    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ marginBottom: 32 }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 30,
              fontWeight: 600,
              letterSpacing: "-0.025em",
              color: colors.foreground,
            }}
          >
            {greeting},{" "}
            <span
              style={{
                background: "linear-gradient(to right, oklch(0.7 0.2 260), oklch(0.7 0.25 320))",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "transparent",
              }}
            >
              Alex
            </span>
          </h1>
          <p style={{ marginTop: 4, color: colors.mutedForeground }}>
            {currentDate} · {currentTime}
          </p>
        </div>
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              borderRadius: 12,
              border: `1px solid ${colors.border}`,
              background: "oklch(1 0 0 / 0.05)",
              padding: "10px 16px",
              backdropFilter: "blur(4px)",
            }}
          >
            <Sparkles size={16} color={colors.chart2} />
            <p style={{ fontSize: 14, color: colors.mutedForeground }}>
              You&apos;ve completed{" "}
              <span style={{ fontWeight: 600, color: colors.chart2 }}>73%</span> of your weekly
              goals
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
