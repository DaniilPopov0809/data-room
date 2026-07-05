const CHANNEL_NAME = "data-room-sync"
const TAB_ID: string = crypto.randomUUID()

export interface TabSyncMessage {
  type: "metadata-changed"
  tabId: string
}

export const createTabSyncChannel = (): BroadcastChannel | null => {
  if (typeof BroadcastChannel === "undefined") {
    return null
  }

  return new BroadcastChannel(CHANNEL_NAME)
}

export const broadcastMetadataChanged = (channel: BroadcastChannel): void => {
  const message: TabSyncMessage = {
    type: "metadata-changed",
    tabId: TAB_ID,
  }
  channel.postMessage(message)
}

export const isOwnTabMessage = (tabId: string): boolean => {
  return tabId === TAB_ID
}
