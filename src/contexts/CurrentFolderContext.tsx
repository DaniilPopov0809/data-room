import { type ReactNode } from "react"
import { useCurrentFolder } from "@/hooks/useCurrentFolder"
import { CurrentFolderContext } from "./useCurrentFolderContext"

export function CurrentFolderProvider({ children }: { children: ReactNode }) {
  const value = useCurrentFolder()
  return <CurrentFolderContext.Provider value={value}>{children}</CurrentFolderContext.Provider>
}
