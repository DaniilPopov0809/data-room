import { Skeleton } from "@/components/ui/skeleton"
import { CurrentFolderProvider } from "@/contexts/CurrentFolderContext"
import { useDataRoomStore } from "@/store/dataRoomStore"
import { useUrlSync } from "@/hooks/useUrlSync"
import { DataRoomContent } from "./DataRoomContent"

export function DataRoomContainer() {
  useUrlSync()
  const isHydrated = useDataRoomStore((state) => state.isHydrated)

  if (!isHydrated) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-12 w-full rounded-full" />
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton className="h-12 w-full" key={index} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <CurrentFolderProvider>
      <DataRoomContent />
    </CurrentFolderProvider>
  )
}
