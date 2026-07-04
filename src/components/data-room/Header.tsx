import { useDataRoomStore } from "@/store/dataRoomStore"
import { Cloud } from "lucide-react"
import { useState } from "react"
import { DataRoomSearch } from "./DataRoomSearch/DataRoomSearch"
import { cn } from "@/lib/utils"

export function Header() {
  const setCurrentFolderId = useDataRoomStore((state) => state.setCurrentFolderId)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 bg-background/95 px-4 backdrop-blur md:gap-3 md:pl-8 md:pr-10">
      <a
        href="/"
        onClick={(e) => {
          e.preventDefault()
          setCurrentFolderId(null)
        }}
        className={cn(
          "flex min-w-0 shrink-0 items-center gap-2.5 transition-all duration-200 md:w-60 md:gap-3",
          isMobileSearchOpen ? "w-0 overflow-hidden opacity-0" : "opacity-100",
        )}
        aria-hidden={isMobileSearchOpen}
        tabIndex={isMobileSearchOpen ? -1 : 0}
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-linear-to-br from-brand-from via-brand-via to-brand-to text-primary-foreground">
          <Cloud className="size-5" />
        </div>
        <span className="truncate text-lg font-medium md:text-xl">Data Room</span>
      </a>
      <DataRoomSearch
        isMobileOpen={isMobileSearchOpen}
        onMobileOpenChange={setIsMobileSearchOpen}
      />
    </header>
  )
}
