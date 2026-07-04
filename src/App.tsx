import { useEffect } from "react"
import { DataRoomContainer } from "@/components/data-room/DataRoomContainer"
import { AppLayout } from "@/components/layout/AppLayout"
import ErrorBoundary from "@/components/layout/ErrorBoundary"
import { ConflictDialog } from "@/components/file/ConflictDialog"
import { useDataRoomStore } from "@/store/dataRoomStore"

function App() {
  const runGarbageCollector = useDataRoomStore((state) => state.runGarbageCollector)
  const isHydrated = useDataRoomStore((state) => state.isHydrated)

  useEffect(() => {
    if (isHydrated) {
      void runGarbageCollector()
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
