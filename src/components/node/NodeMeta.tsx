import { formatDate, formatFileSize } from "@/lib/formatHelpers"
import type { DataRoomNode } from "@/types/dataRoom"

interface NodeMetaProps {
  node: DataRoomNode
}

export function NodeMeta({ node }: NodeMetaProps) {
  return (
    <>
      <span>{formatDate(node.updatedAt)}</span>
      <span>
        {node.type === "file"
          ? formatFileSize(node.size)
          : "Folder"}
      </span>
    </>
  )
}