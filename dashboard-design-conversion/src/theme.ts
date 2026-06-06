// Central design tokens converted from the original shadcn/Tailwind theme.
// All colors use oklch() which is supported in modern browsers.

export const colors = {
  background: "oklch(0.06 0.015 270)",
  foreground: "oklch(0.98 0 0)",
  card: "oklch(0.12 0.015 270 / 0.6)",
  cardForeground: "oklch(0.98 0 0)",
  primary: "oklch(0.7 0.2 260)",
  primaryForeground: "oklch(0.98 0 0)",
  muted: "oklch(0.15 0.02 270 / 0.5)",
  mutedForeground: "oklch(0.6 0 0)",
  destructive: "oklch(0.65 0.2 25)",
  border: "oklch(1 0 0 / 0.1)",
  ring: "oklch(0.7 0.2 260)",
  chart1: "oklch(0.75 0.2 195)",
  chart2: "oklch(0.7 0.25 320)",
  chart3: "oklch(0.65 0.22 280)",
  chart4: "oklch(0.7 0.18 165)",
  chart5: "oklch(0.75 0.15 140)",
} as const

// Helper to produce an oklch color with a custom alpha for the chart colors.
// e.g. alpha(colors.chart1, 0.2)
export function alpha(oklchColor: string, a: number): string {
  // strip any existing alpha, then append the new one
  const base = oklchColor.replace(/\s*\/\s*[\d.]+\s*\)$/, ")")
  return base.replace(/\)$/, ` / ${a})`)
}

// Common reusable style fragments.
export const glassPanel: React.CSSProperties = {
  borderRadius: 12,
  border: `1px solid ${colors.border}`,
  background: "oklch(1 0 0 / 0.05)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
}

export type GlowColor = "cyan" | "magenta" | "purple" | "blue" | "green"

export const glowStyles: Record<
  GlowColor,
  {
    border: string
    borderHover: string
    shadowHover: string
    iconBg: string
    headerGradient: string
  }
> = {
  cyan: {
    border: "rgba(34, 211, 238, 0.3)",
    borderHover: "rgba(34, 211, 238, 0.5)",
    shadowHover: "0 0 30px rgba(0,212,255,0.15)",
    iconBg: "rgba(34, 211, 238, 0.2)",
    headerGradient: "linear-gradient(to right, rgba(34,211,238,0.1), transparent)",
  },
  magenta: {
    border: "rgba(236, 72, 153, 0.3)",
    borderHover: "rgba(236, 72, 153, 0.5)",
    shadowHover: "0 0 30px rgba(255,0,255,0.15)",
    iconBg: "rgba(236, 72, 153, 0.2)",
    headerGradient: "linear-gradient(to right, rgba(236,72,153,0.1), transparent)",
  },
  purple: {
    border: "rgba(139, 92, 246, 0.3)",
    borderHover: "rgba(139, 92, 246, 0.5)",
    shadowHover: "0 0 30px rgba(139,92,246,0.15)",
    iconBg: "rgba(139, 92, 246, 0.2)",
    headerGradient: "linear-gradient(to right, rgba(139,92,246,0.1), transparent)",
  },
  blue: {
    border: "rgba(59, 130, 246, 0.3)",
    borderHover: "rgba(59, 130, 246, 0.5)",
    shadowHover: "0 0 30px rgba(59,130,246,0.15)",
    iconBg: "rgba(59, 130, 246, 0.2)",
    headerGradient: "linear-gradient(to right, rgba(59,130,246,0.1), transparent)",
  },
  green: {
    border: "rgba(16, 185, 129, 0.3)",
    borderHover: "rgba(16, 185, 129, 0.5)",
    shadowHover: "0 0 30px rgba(16,185,129,0.15)",
    iconBg: "rgba(16, 185, 129, 0.2)",
    headerGradient: "linear-gradient(to right, rgba(16,185,129,0.1), transparent)",
  },
}
