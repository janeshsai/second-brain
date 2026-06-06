import { useState, useCallback } from "react"

/**
 * Small helper to replicate Tailwind `hover:` styling with inline styles.
 * Returns the hover state plus the mouse event handlers to spread on an element.
 *
 * Usage:
 *   const hover = useHover()
 *   <div {...hover.props} style={{ ...base, ...(hover.isHovered ? hoverStyle : {}) }} />
 */
export function useHover() {
  const [isHovered, setIsHovered] = useState(false)

  const onMouseEnter = useCallback(() => setIsHovered(true), [])
  const onMouseLeave = useCallback(() => setIsHovered(false), [])

  return {
    isHovered,
    props: { onMouseEnter, onMouseLeave },
  }
}
