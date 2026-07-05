import { create } from "zustand"
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware"
import { del, get, set } from "idb-keyval"

import { getAllBlobIds, deleteBlobs } from "@/db/blobStore"
import { getChildren, getDescendantIds } from "@/lib/nodeHelpers"
import {
  normalizeName,
  resolveDuplicateName,
  splitExtension,
  validateName,
} from "@/lib/nameHelpers"
import { getPersistedSnapshot, hasPersistedSliceChanged, isQuotaExceededError, isValidFolderId, readPersistedSlice } from "@/lib/storageHelpers"
import type { DataRoomNode, FileNode, FolderNode } from "@/types/dataRoom"
import type { DataRoomState } from "@/types/store"

export const PERSIST_KEY = "data-room-metadata"
  
let persistDisabled = false
let memoryPersistValue: string | null = null

export const configureMetadataStorage = (options: { disablePersist: boolean }): void => {
  persistDisabled = options.disablePersist
}

const metadataStorage: StateStorage = {
  getItem: async (name) => {
    if (memoryPersistValue !== null) {
      return memoryPersistValue
    }

    try {
      return (await get<string>(name)) ?? null
    } catch (error) {
      console.error("[Storage] Failed to read metadata:", error)
      return null
    }
  },
  setItem: async (name, value) => {
    if (persistDisabled) {
      memoryPersistValue = value
      return
    }

    try {
      await set(name, value)
    } catch (error) {
      if (isQuotaExceededError(error)) {
        console.error("[Storage] Metadata quota exceeded:", error)
        throw error
      }

      console.error("[Storage] Falling back to in-memory metadata:", error)
      persistDisabled = true
      memoryPersistValue = value
    }
  },
  removeItem: async (name) => {
    memoryPersistValue = null

    try {
      await del(name)
    } catch (error) {
      console.error("[Storage] Failed to remove metadata:", error)
    }
  },
}

export const useDataRoomStore = create<DataRoomState>()(
  persist(
    (setState, getState) => ({
      nodes: {},
      currentFolderId: null,
      sortOption: "name-asc",
      viewMode: "list",
      foldersPosition: "top",
      typeFilter: "all",
      isHydrated: false,
      isUploading: false,
      storageMode: "persistent",
      storageWarning: null,
      canUseIndexedDb: true,
      setCurrentFolderId: (folderId) => setState({ currentFolderId: folderId }),
      setSortOption: (sortOption) => setState({ sortOption }),
      setViewMode: (viewMode) => setState({ viewMode }),
      setFoldersPosition: (foldersPosition) => setState({ foldersPosition }),
      setTypeFilter: (typeFilter) => setState({ typeFilter }),
      setHydrated: (isHydrated) => setState({ isHydrated }),
      setIsUploading: (isUploading) => setState({ isUploading }),
      setStorageAvailability: (availability) =>
        setState({
          storageMode: availability.mode,
          storageWarning: availability.warning,
          canUseIndexedDb: availability.canUseIndexedDb,
        }),
      rehydrateFromStorage: async () => {
        const current = getState()
        const currentSnapshot = getPersistedSnapshot(current)

        let raw: string | null = memoryPersistValue

        if (raw === null) {
          try {
            raw = (await get<string>(PERSIST_KEY)) ?? null
          } catch (error) {
            console.error("[Storage] Failed to rehydrate metadata:", error)
            return false
          }
        }

        if (!raw) {
          return false
        }

        const incoming = readPersistedSlice(raw)

        if (!incoming) {
          return false
        }

        if (!hasPersistedSliceChanged(currentSnapshot, incoming)) {
          return false
        }

        if (!isValidFolderId(incoming.nodes, incoming.currentFolderId)) {
          incoming.currentFolderId = null
        }

        setState({
          nodes: incoming.nodes,
          currentFolderId: incoming.currentFolderId,
          sortOption: incoming.sortOption,
          viewMode: incoming.viewMode,
          foldersPosition: incoming.foldersPosition,
          typeFilter: incoming.typeFilter,
        })

        return true
      },
      createFolder: (name, parentId) => {
        const validation = validateName(name)
        if (validation.ok === false) {
          throw new Error(validation.error)
        }

        const state: DataRoomState = getState()
        const resolvedParentId: string | null = parentId ?? state.currentFolderId
        const now: number = Date.now()
        const siblings: DataRoomNode[] = getChildren(state.nodes, resolvedParentId)
        const resolvedName: string = resolveDuplicateName(validation.value, siblings)
        const folder: FolderNode = {
          id: crypto.randomUUID(),
          name: resolvedName,
          normalizedName: normalizeName(resolvedName),
          parentId: resolvedParentId,
          type: "folder",
          createdAt: now,
          updatedAt: now,
        }

        setState({ nodes: { ...state.nodes, [folder.id]: folder } })
        return folder
      },
      addFile: (file) => {
        const validation = validateName(file.name)
        if (validation.ok === false) {
          throw new Error(validation.error)
        }

        const state: DataRoomState = getState()
        const resolvedParentId: string | null = file.parentId ?? state.currentFolderId
        const now: number = Date.now()
        const siblings: DataRoomNode[] = getChildren(state.nodes, resolvedParentId)
        const resolvedName: string = resolveDuplicateName(validation.value, siblings)
        const { extension } = splitExtension(resolvedName)
        const fileNode: FileNode = {
          id: crypto.randomUUID(),
          name: resolvedName,
          normalizedName: normalizeName(resolvedName),
          parentId: resolvedParentId,
          type: "file",
          mimeType: file.mimeType,
          size: file.size,
          extension,
          blobId: file.blobId,
          createdAt: now,
          updatedAt: now,
        }

        setState({ nodes: { ...state.nodes, [fileNode.id]: fileNode } })
        return fileNode
      },
      renameNode: (nodeId, name) => {
        const validation = validateName(name)
        if (validation.ok === false) {
          throw new Error(validation.error)
        }

        const state: DataRoomState = getState()
        const node: DataRoomNode | undefined = state.nodes[nodeId]

        if (!node) {
          return undefined
        }

        const siblings: DataRoomNode[] = getChildren(state.nodes, node.parentId)
        const resolvedName: string = resolveDuplicateName(validation.value, siblings, nodeId)
        const updatedNode: DataRoomNode = {
          ...node,
          name: resolvedName,
          normalizedName: normalizeName(resolvedName),
          updatedAt: Date.now(),
        }

        setState({ nodes: { ...state.nodes, [nodeId]: updatedNode } })
        return updatedNode
      },
      deleteNode: (nodeId) => {
        const state: DataRoomState = getState()
        const node: DataRoomNode | undefined = state.nodes[nodeId]

        if (!node) {
          return []
        }

        const idsToDelete: string[] = [
          nodeId,
          ...(node.type === "folder" ? getDescendantIds(state.nodes, nodeId) : []),
        ]
        const deletedNodes: DataRoomNode[] = idsToDelete
          .map((id) => state.nodes[id])
          .filter((deletedNode): deletedNode is DataRoomNode => Boolean(deletedNode))
        const nextNodes: Record<string, DataRoomNode> = { ...state.nodes }

        for (const id of idsToDelete) {
          delete nextNodes[id]
        }

        setState({
          nodes: nextNodes,
          currentFolderId: idsToDelete.includes(state.currentFolderId ?? "")
            ? node.parentId
            : state.currentFolderId,
        })

        return deletedNodes
      },
      runGarbageCollector: async () => {
        const state: DataRoomState = getState()
        const activeBlobIds: Set<string> = new Set(
          Object.values(state.nodes)
            .filter((node): node is FileNode => node.type === "file")
            .map((node) => node.blobId),
        )

        try {
          const storedBlobIds = await getAllBlobIds()
          const orphanedBlobIds = storedBlobIds.filter((id) => !activeBlobIds.has(id))

          if (orphanedBlobIds.length > 0) {
            await deleteBlobs(orphanedBlobIds)
            console.log(`[GC] Cleaned up ${orphanedBlobIds.length} orphaned blobs.`)
          }
        } catch (error) {
          console.error("[GC] Failed to run garbage collection:", error)
        }
      },
      overwriteFile: (nodeId, updates) => {
        const state: DataRoomState = getState()
        const node: DataRoomNode | undefined = state.nodes[nodeId]

        if (!node || node.type !== "file") {
          return undefined
        }

        const updatedNode: FileNode = {
          ...node,
          mimeType: updates.mimeType,
          size: updates.size,
          blobId: updates.blobId,
          updatedAt: Date.now(),
        }

        setState({ nodes: { ...state.nodes, [nodeId]: updatedNode } })
        return updatedNode
      },
      renameOverwriteNode: (sourceId, targetId, name) => {
        const validation = validateName(name)
        if (validation.ok === false) {
          throw new Error(validation.error)
        }

        const state: DataRoomState = getState()
        const sourceNode: DataRoomNode | undefined = state.nodes[sourceId]
        const targetNode: DataRoomNode | undefined = state.nodes[targetId]

        if (!sourceNode || !targetNode) {
          return undefined
        }

        const nextNodes: Record<string, DataRoomNode> = { ...state.nodes }
        delete nextNodes[targetId]

        const newName = validation.value
        nextNodes[sourceId] = {
          ...sourceNode,
          name: newName,
          normalizedName: normalizeName(newName),
          ...(sourceNode.type === "file" && { extension: splitExtension(newName).extension }),
          updatedAt: Date.now(),
        }

        setState({ nodes: nextNodes })
        return nextNodes[sourceId]
      },
    }),
    {
      name: PERSIST_KEY,
      storage: createJSONStorage(() => metadataStorage),
      partialize: (state) => ({
        nodes: state.nodes,
        currentFolderId: state.currentFolderId,
        sortOption: state.sortOption,
        viewMode: state.viewMode,
        foldersPosition: state.foldersPosition,
        typeFilter: state.typeFilter,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) {
          return
        }

        if (!isValidFolderId(state.nodes, state.currentFolderId)) {
          state.setCurrentFolderId(null)
        }

        state.setHydrated(true)
      },
    },
  ),
)
