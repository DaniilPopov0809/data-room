import { useEffect, useState } from "react"

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query)
    
    const timer = window.setTimeout(() => {
      setMatches(mediaQueryList.matches)
    }, 0)

    const listener = (event: MediaQueryListEvent) => setMatches(event.matches)
    mediaQueryList.addEventListener("change", listener)
    
    return () => {
      window.clearTimeout(timer)
      mediaQueryList.removeEventListener("change", listener)
    }
  }, [query])

  return matches
}
