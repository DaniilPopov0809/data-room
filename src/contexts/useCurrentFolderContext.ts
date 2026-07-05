import { createContext, useContext } from "react"
import type { useCurrentFolder } from "@/hooks/useCurrentFolder"

export type CurrentFolderValue = ReturnType<typeof useCurrentFolder>

export const CurrentFolderContext = createContext<CurrentFolderValue | null>(null)

export const useCurrentFolderContext = () => {
  const context = useContext(CurrentFolderContext)
  if (!context) {
    throw new Error("useCurrentFolderContext must be used within CurrentFolderProvider")
  }
  return context
}
