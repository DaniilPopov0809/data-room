import type { StorageAvailability } from "@/lib/storageHelpers"
import type { DataRoomNode, FileNode, FolderNode, FoldersPosition, SortOption, TypeFilter, ViewMode } from "./dataRoom"

export interface PersistedSlice {
  nodes: Record<string, DataRoomNode>
  currentFolderId: string | null
  sortOption: SortOption
  viewMode: ViewMode
  foldersPosition: FoldersPosition
  typeFilter: TypeFilter
}

export interface DataRoomState extends PersistedSlice {
  isHydrated: boolean
  isUploading: boolean
  storageMode: StorageAvailability["mode"]
  storageWarning: string | null
  canUseIndexedDb: boolean
  setCurrentFolderId: (folderId: string | null) => void
  setSortOption: (sortOption: SortOption) => void
  setViewMode: (viewMode: ViewMode) => void
  setFoldersPosition: (foldersPosition: FoldersPosition) => void
  setTypeFilter: (typeFilter: TypeFilter) => void
  setHydrated: (isHydrated: boolean) => void
  setIsUploading: (isUploading: boolean) => void
  setStorageAvailability: (availability: StorageAvailability) => void
  rehydrateFromStorage: () => Promise<boolean>
  createFolder: (name: string, parentId?: string | null) => FolderNode
  addFile: (file: {
    name: string
    parentId?: string | null
    mimeType: string
    size: number
    blobId: string
  }) => FileNode
  renameNode: (nodeId: string, name: string) => DataRoomNode | undefined
  deleteNode: (nodeId: string) => DataRoomNode[]
  runGarbageCollector: () => Promise<void>
  overwriteFile: (
    nodeId: string,
    updates: {
      mimeType: string
      size: number
      blobId: string
    },
  ) => FileNode | undefined
  renameOverwriteNode: (
    sourceId: string,
    targetId: string,
    name: string,
  ) => DataRoomNode | undefined
}