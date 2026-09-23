import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Subscribe to the viewport width as an external store instead of
  // syncing it into state inside an effect.
  return React.useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
      mql.addEventListener("change", onChange)
      return () => mql.removeEventListener("change", onChange)
    },
    () => window.innerWidth < MOBILE_BREAKPOINT,
    () => false
  )
}
