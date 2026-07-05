import { useMemo } from "react"

import { useDataRoomStore } from "@/store/dataRoomStore"
import { getChildren, getPath, SUPPORTED_IMAGE_MIME_TYPES } from "@/lib/nodeHelpers"
import { sortNodes } from "@/lib/sortHelpers"
import type { DataRoomNode, FileNode, TypeFilter } from "@/types/dataRoom"

export const useCurrentFolder = (): {
  currentFolder: DataRoomNode | null
  children: DataRoomNode[]
  path: DataRoomNode[]
  isFolderEmpty: boolean
  isFilterEmpty: boolean
  typeFilter: TypeFilter
} => {
  const nodes = useDataRoomStore((state) => state.nodes)
  const currentFolderId = useDataRoomStore((state) => state.currentFolderId)
  const sortOption = useDataRoomStore((state) => state.sortOption)
  const foldersPosition = useDataRoomStore((state) => state.foldersPosition)
  const typeFilter = useDataRoomStore((state) => state.typeFilter)

  return useMemo(() => {
    const currentFolder: DataRoomNode | null = currentFolderId ? nodes[currentFolderId] : null

    const allChildren: DataRoomNode[] = getChildren(nodes, currentFolderId)
    let filteredChildren: DataRoomNode[] = allChildren

    if (typeFilter === "folder") {
      filteredChildren = filteredChildren.filter((n) => n.type === "folder")
    } else if (typeFilter === "file") {
      filteredChildren = filteredChildren.filter((n) => n.type === "file")
    } else if (typeFilter === "image") {
      filteredChildren = filteredChildren.filter(
        (n) => n.type === "file" && SUPPORTED_IMAGE_MIME_TYPES.has((n as FileNode).mimeType),
      )
    }

    const children: DataRoomNode[] = sortNodes(filteredChildren, sortOption, foldersPosition)
    const path: DataRoomNode[] = getPath(nodes, currentFolderId)

    return {
      currentFolder,
      children,
      path,
      isFolderEmpty: allChildren.length === 0,
      isFilterEmpty: allChildren.length > 0 && filteredChildren.length === 0,
      typeFilter,
    }
  }, [currentFolderId, nodes, sortOption, foldersPosition, typeFilter])
}
