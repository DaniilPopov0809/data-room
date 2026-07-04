import { createContext, useContext, type ReactNode } from "react"
import { useCurrentFolder } from "@/hooks/useCurrentFolder"

type CurrentFolderValue = ReturnType<typeof useCurrentFolder>

const CurrentFolderContext = createContext<CurrentFolderValue | null>(null)

export function CurrentFolderProvider({ children }: { children: ReactNode }) {
  const value = useCurrentFolder()
  return <CurrentFolderContext.Provider value={value}>{children}</CurrentFolderContext.Provider>
}

export const useCurrentFolderContext = (): CurrentFolderValue => {
  const context = useContext(CurrentFolderContext)
  if (!context) {
    throw new Error("useCurrentFolderContext must be used within CurrentFolderProvider")
  }
  return context
}
