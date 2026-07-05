import { useEffect } from "react"
import { toast } from "sonner"

import {
  broadcastMetadataChanged,
  createTabSyncChannel,
  isOwnTabMessage,
  type TabSyncMessage,
} from "@/lib/tabSyncHelpers"
import { useDataRoomStore } from "@/store/dataRoomStore"

const SYNC_DEBOUNCE_MS = 200
const SYNC_READ_DELAY_MS = 50

const isPersistedFieldChanged = (
  state: ReturnType<typeof useDataRoomStore.getState>,
  prev: ReturnType<typeof useDataRoomStore.getState>,
): boolean => {
  return (
    state.nodes !== prev.nodes ||
    state.currentFolderId !== prev.currentFolderId ||
    state.sortOption !== prev.sortOption ||
    state.viewMode !== prev.viewMode ||
    state.foldersPosition !== prev.foldersPosition ||
    state.typeFilter !== prev.typeFilter
  )
}

export const useTabSync = (): void => {
  const isHydrated = useDataRoomStore((state) => state.isHydrated)
  const rehydrateFromStorage = useDataRoomStore((state) => state.rehydrateFromStorage)

  useEffect(() => {
    if (!isHydrated) {
      return
    }

    const channel = createTabSyncChannel()
    let applyingRemote = false
    let broadcastTimeoutId: ReturnType<typeof setTimeout> | undefined

    const syncFromStorage = async (showToast: boolean): Promise<void> => {
      applyingRemote = true

      try {
        await new Promise<void>((resolve) => {
          window.setTimeout(resolve, SYNC_READ_DELAY_MS)
        })

        const changed = await rehydrateFromStorage()

        if (changed && showToast) {
          toast.info("Data was updated in another tab", { id: "tab-sync" })
        }
      } finally {
        applyingRemote = false
      }
    }

    const handleChannelMessage = (event: MessageEvent<TabSyncMessage>): void => {
      if (event.data?.type !== "metadata-changed") {
        return
      }

      if (isOwnTabMessage(event.data.tabId)) {
        return
      }

      void syncFromStorage(true)
    }

    const handleVisibilityChange = (): void => {
      if (document.visibilityState === "visible") {
        void syncFromStorage(false)
      }
    }

    channel?.addEventListener("message", handleChannelMessage)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    const unsubscribe = useDataRoomStore.subscribe((state, prev) => {
      if (applyingRemote || !state.isHydrated || !channel) {
        return
      }

      if (!isPersistedFieldChanged(state, prev)) {
        return
      }

      if (broadcastTimeoutId) {
        clearTimeout(broadcastTimeoutId)
      }

      broadcastTimeoutId = window.setTimeout(() => {
        broadcastMetadataChanged(channel)
      }, SYNC_DEBOUNCE_MS)
    })

    return () => {
      if (broadcastTimeoutId) {
        clearTimeout(broadcastTimeoutId)
      }

      channel?.removeEventListener("message", handleChannelMessage)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      unsubscribe()
      channel?.close()
    }
  }, [isHydrated, rehydrateFromStorage])
}
