import { useEffect } from "react"

import { DataRoomContainer } from "@/components/data-room/DataRoomContainer"
import { ConflictDialog } from "@/components/file/ConflictDialog"
import { AppLayout } from "@/components/layout/AppLayout"
import ErrorBoundary from "@/components/layout/ErrorBoundary"
import { useStorageInit } from "@/hooks/useStorageInit"
import { useTabSync } from "@/hooks/useTabSync"
import { useDataRoomStore } from "@/store/dataRoomStore"

function App() {
  const runGarbageCollector = useDataRoomStore((state) => state.runGarbageCollector)
  const isHydrated = useDataRoomStore((state) => state.isHydrated)

  useStorageInit()
  useTabSync()

  useEffect(() => {
    if (isHydrated) {
      runGarbageCollector()
    }
  }, [isHydrated, runGarbageCollector])

  return (
    <ErrorBoundary>
      <AppLayout>
        <DataRoomContainer />
      </AppLayout>
      <ConflictDialog />
    </ErrorBoundary>
  )
}

export default App
