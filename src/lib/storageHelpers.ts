import { del, get, set } from "idb-keyval"

import { formatFileSize } from "@/lib/formatHelpers"
import type { DataRoomState, PersistedSlice } from "@/types/store"
import type { DataRoomNode } from "@/types/dataRoom"

const STORAGE_TEST_KEY = "__data-room-storage-test__"

/** Reserve space for metadata JSON and headroom before QuotaExceededError */
const STORAGE_HEADROOM_BYTES = 512 * 1024

export interface StorageEstimate {
  usage: number
  quota: number
  available: number
}

export type StorageMode = "persistent" | "session"

export interface StorageAvailability {
  mode: StorageMode
  canUseIndexedDb: boolean
  warning: string | null
}

export const isQuotaExceededError = (error: unknown): boolean => {
  if (error instanceof DOMException) {
    return error.name === "QuotaExceededError" || error.code === 22
  }

  if (error instanceof Error) {
    return error.name === "QuotaExceededError" || error.message.toLowerCase().includes("quota")
  }

  return false
}

export const getStorageEstimate = async (): Promise<StorageEstimate | null> => {
  if (!navigator.storage?.estimate) {
    return null
  }

  const { usage = 0, quota = 0 } = await navigator.storage.estimate()

  return {
    usage,
    quota,
    available: Math.max(0, quota - usage),
  }
}

export const canStoreBytes = async (
  requiredBytes: number,
): Promise<{ ok: true } | { ok: false; error: string }> => {
  const estimate = await getStorageEstimate()

  if (!estimate) {
    return { ok: true }
  }

  if (estimate.quota === 0) {
    return {
      ok: false,
      error: "browser storage is unavailable",
    }
  }

  const needed = requiredBytes + STORAGE_HEADROOM_BYTES

  if (estimate.available < needed) {
    return {
      ok: false,
      error: `not enough storage space (need ${formatFileSize(requiredBytes)}, ${formatFileSize(estimate.available)} available of ${formatFileSize(estimate.quota)})`,
    }
  }

  return { ok: true }
}

export const getQuotaExceededMessage = (): string => {
  return "storage quota exceeded — free up space by deleting files"
}

const testMetadataStorage = async (): Promise<boolean> => {
  try {
    await set(STORAGE_TEST_KEY, "ok")
    const value = await get<string>(STORAGE_TEST_KEY)
    await del(STORAGE_TEST_KEY)
    return value === "ok"
  } catch {
    return false
  }
}

export const checkStorageAvailability = async (
  testBlobDbAccess: () => Promise<void>,
): Promise<StorageAvailability> => {
  const metadataOk = await testMetadataStorage()

  if (!metadataOk) {
    return {
      mode: "session",
      canUseIndexedDb: false,
      warning: "Browser storage is unavailable. Changes will be lost when you close this tab.",
    }
  }

  try {
    await testBlobDbAccess()
  } catch (error) {
    console.error("[Storage] Blob DB test failed:", error)
    return {
      mode: "session",
      canUseIndexedDb: false,
      warning:
        "File storage is unavailable. You can manage folders, but uploads will not be saved.",
    }
  }

  return {
    mode: "persistent",
    canUseIndexedDb: true,
    warning: null,
  }
}

export const readPersistedSlice = (raw: string): PersistedSlice | null => {
  try {
    const parsed = JSON.parse(raw) as { state?: PersistedSlice }
    return parsed.state ?? null
  } catch {
    return null
  }
}

export const getPersistedSnapshot = (state: DataRoomState): PersistedSlice => ({
  nodes: state.nodes,
  currentFolderId: state.currentFolderId,
  sortOption: state.sortOption,
  viewMode: state.viewMode,
  foldersPosition: state.foldersPosition,
  typeFilter: state.typeFilter,
})

export const hasPersistedSliceChanged = (
  current: PersistedSlice,
  incoming: PersistedSlice,
): boolean => {
  return JSON.stringify(current) !== JSON.stringify(incoming)
}

export const isValidFolderId = (nodes: Record<string, DataRoomNode>, folderId: string | null) => {
  if (!folderId) {
    return true
  }

  const node = nodes[folderId]
  return Boolean(node && node.type === "folder")
}
