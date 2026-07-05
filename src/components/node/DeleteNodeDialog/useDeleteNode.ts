import { useDataRoomStore } from "@/store/dataRoomStore"
import type { DataRoomNode } from "@/types/dataRoom"
import { useMemo } from "react"
import { countDescendants } from "@/lib/nodeHelpers"
import { deleteBlobs } from "@/db/blobStore"
import { toast } from "sonner"

interface useDeleteNodeReturn {
  counts: { folders: number; files: number } | null
  confirmDelete: () => void
}

export const useDeleteNode = (
  node: DataRoomNode,
): useDeleteNodeReturn => {
  const nodes = useDataRoomStore((state) => state.nodes)
  const deleteNode = useDataRoomStore((state) => state.deleteNode)
  const counts: { folders: number; files: number } | null = useMemo(
    () => (node.type === "folder" ? countDescendants(nodes, node.id) : null),
    [node.id, node.type, nodes],
  )

  const confirmDelete = (): void => {
    const deletedNodes: DataRoomNode[] = deleteNode(node.id)

    if (deletedNodes.length === 0) {
      toast.error(`Failed to delete ${node.name}`)
      return
    }

    const blobIds: string[] = deletedNodes
      .filter((deletedNode) => deletedNode.type === "file")
      .map((deletedNode) => deletedNode.blobId)

    if (blobIds.length > 0) {
      deleteBlobs(blobIds).catch((error) => {
        console.error("Failed to delete some blobs from IndexedDB:", error)
      })
    }

    toast.success(`${node.name} deleted`)
  }

  return { counts, confirmDelete }
}
