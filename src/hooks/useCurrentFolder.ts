import { useMemo } from "react"
import { useDataRoomStore } from "@/store/dataRoomStore"
import { getChildren, getPath, SUPPORTED_IMAGE_MIME_TYPES } from "@/lib/nodeHelpers"
import { sortNodes } from "@/lib/sortHelpers"
import type { DataRoomNode, FileNode } from "@/types/dataRoom"

export const useCurrentFolder = (): {
  currentFolder: DataRoomNode | null
  children: DataRoomNode[]
  path: DataRoomNode[]
} => {
  const nodes = useDataRoomStore((state) => state.nodes)
  const currentFolderId = useDataRoomStore((state) => state.currentFolderId)
  const sortOption = useDataRoomStore((state) => state.sortOption)
  const foldersPosition = useDataRoomStore((state) => state.foldersPosition)
  const typeFilter = useDataRoomStore((state) => state.typeFilter)

  return useMemo(() => {
    const currentFolder: DataRoomNode | null = currentFolderId ? nodes[currentFolderId] : null

    let rawChildren: DataRoomNode[] = getChildren(nodes, currentFolderId)
    if (typeFilter === "folder") {
      rawChildren = rawChildren.filter((n) => n.type === "folder")
    } else if (typeFilter === "file") {
      rawChildren = rawChildren.filter((n) => n.type === "file")
    } else if (typeFilter === "image") {
      rawChildren = rawChildren.filter(
        (n) => n.type === "file" && SUPPORTED_IMAGE_MIME_TYPES.has((n as FileNode).mimeType),
      )
    }

    const children: DataRoomNode[] = sortNodes(rawChildren, sortOption, foldersPosition)
    const path: DataRoomNode[] = getPath(nodes, currentFolderId)

    return {
      currentFolder,
      children,
      path,
    }
  }, [currentFolderId, nodes, sortOption, foldersPosition, typeFilter])
}
