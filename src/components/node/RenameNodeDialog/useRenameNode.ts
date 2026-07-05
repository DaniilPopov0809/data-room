import { useState } from "react"
import type { DataRoomNode, FileNode } from "@/types/dataRoom"
import { useDataRoomStore } from "@/store/dataRoomStore"
import { useConflictStore } from "@/store/conflictStore"
import { validateName, normalizeName } from "@/lib/nameHelpers"
import { getChildren } from "@/lib/nodeHelpers"
import { deleteBlob } from "@/db/blobStore"
import { toast } from "sonner"
import { getBaseName } from "./helpers"

interface UseRenameNodeReturn {
  isOpen: boolean
  nodeName: string
  setNodeName: (nodeName: string) => void
  validation: ReturnType<typeof validateName>
  handleOpenChange: (isOpen: boolean) => void
  confirmRenameNode: () => Promise<void>
}

export const useRenameNode = (node: DataRoomNode): UseRenameNodeReturn => {
  const renameNode = useDataRoomStore((state) => state.renameNode)
  const renameOverwriteNode = useDataRoomStore((state) => state.renameOverwriteNode)
  const promptConflict = useConflictStore((state) => state.promptConflict)

  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [nodeName, setNodeName] = useState<string>(getBaseName(node))

  const validation = validateName(nodeName)

  const handleOpenChange = (nextOpen: boolean): void => {
    setIsOpen(nextOpen)
    if (nextOpen) {
      setNodeName(getBaseName(node))
    }
  }

  const confirmRenameNode = async (): Promise<void> => {
    if (!validation.ok) {
      return
    }

    let finalName = validation.value
    if (node.type === "file") {
      const suffix = `.${node.extension}`
      const base = finalName.toLowerCase().endsWith(suffix.toLowerCase())
        ? finalName.slice(0, -suffix.length)
        : finalName
      finalName = `${base}${suffix}`
    }

    if (node.type === "file") {
      const state = useDataRoomStore.getState()
      const siblings = getChildren(state.nodes, node.parentId)
      const duplicate = siblings.find(
        (s) =>
          s.id !== node.id && s.type === "file" && normalizeName(s.name) === normalizeName(finalName),
      )

      if (duplicate) {
        const decision = await promptConflict(finalName)
        if (decision === "cancel") {
          return
        }

        if (decision === "overwrite") {
          const oldBlobId = (duplicate as FileNode).blobId
          try {
            renameOverwriteNode(node.id, duplicate.id, finalName)
            if (oldBlobId) {
              await deleteBlob(oldBlobId)
            }
            toast.success("File renamed and replaced existing file")
            handleOpenChange(false)
          } catch {
            toast.error("Failed to replace existing file")
          }
          return
        }

        const updatedNode = renameNode(node.id, finalName)
        handleOpenChange(false)
        if (updatedNode) {
          toast.success(`File renamed to ${updatedNode.name}`)
        }
        return
      }
    }

    const updatedNode = renameNode(node.id, finalName)
    handleOpenChange(false)

    if (updatedNode) {
      if (updatedNode.name !== finalName) {
        toast.info(
          `A ${node.type} with that name already exists. Renamed to "${updatedNode.name}"`,
        )
      } else {
        toast.success(`${node.type === "folder" ? "Folder" : "File"} renamed`)
      }
    }
  }

  return {
    isOpen,
    nodeName,
    setNodeName,
    validation,
    handleOpenChange,
    confirmRenameNode,
  }
}
