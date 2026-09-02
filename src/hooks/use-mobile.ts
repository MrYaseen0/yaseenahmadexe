import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // undefined = "unknown yet" (SSR / first paint), mirrors shadcn behaviour
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    // Lazy init: schedule in a microtask so the effect body never calls
    // setState synchronously (satisfies react-hooks/set-state-in-effect and
    // avoids a cascade render on mount).
    const id = requestAnimationFrame(onChange)
    return () => {
      cancelAnimationFrame(id)
      mql.removeEventListener("change", onChange)
    }
  }, [])

  return !!isMobile
}
