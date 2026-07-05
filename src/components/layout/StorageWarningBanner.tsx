import { AlertTriangle } from "lucide-react"

import { useDataRoomStore } from "@/store/dataRoomStore"

export function StorageWarningBanner() {
  const storageWarning = useDataRoomStore((state) => state.storageWarning)

  if (!storageWarning) {
    return null
  }

  return (
    <div
      role="status"
      className="flex items-start gap-2 border-b border-border bg-muted px-4 py-2.5 text-sm text-foreground"
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
      <p>{storageWarning}</p>
    </div>
  )
}
