import { memo, useState } from "react"
import { dataRoomListGridClass } from "@/components/node/NodeList"
import { NodeContextMenu } from "@/components/node/NodeContextMenu"
import { NodeName } from "@/components/node/NodeName"
import { formatDate, formatFileSize } from "@/lib/formatHelpers"
import { cn } from "@/lib/utils"
import { useDataRoomStore } from "@/store/dataRoomStore"
import type { DataRoomNode, FileNode } from "@/types/dataRoom"
import { NodeMore } from "./NodeMore"
import { NodeIcon } from "./NodeIcon"
import { NodeMeta } from "./NodeMeta"
import { PdfPreviewDialog } from "@/components/file/PdfPreviewDialog/PdfPreviewDialog"

interface NodeItemProps {
  node: DataRoomNode
  viewMode: "grid" | "list"
}

export const NodeItem = memo(function NodeItem({ node, viewMode }: NodeItemProps) {
  const setCurrentFolderId = useDataRoomStore((state) => state.setCurrentFolderId)
  const [previewOpen, setPreviewOpen] = useState<boolean>(false)

  const openNode = (): void => {
    if (node.type === "folder") {
      setCurrentFolderId(node.id)
    } else {
      setPreviewOpen(true)
    }
  }

  if (viewMode === "grid") {
    return (
      <>
        <NodeContextMenu node={node}>
          <div
            className="group min-w-0 rounded-xl border bg-background p-3 transition hover:bg-muted"
            onDoubleClick={openNode}
          >
            <div className="flex items-start justify-between gap-3">
              <button
                className="flex min-w-0 flex-1 items-center gap-3 text-left cursor-pointer"
                onClick={openNode}
                type="button"
              >
                <NodeIcon type={node.type} size="size-8" />
                <NodeName name={node.name} />
              </button>

              <NodeMore node={node} />
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <NodeMeta node={node} />
            </div>
          </div>
        </NodeContextMenu>
        {node.type === "file" && (
          <PdfPreviewDialog
            key={node.id}
            node={node as FileNode}
            open={previewOpen}
            onOpenChange={setPreviewOpen}
          />
        )}
      </>
    )
  }

  return (
    <>
      <NodeContextMenu node={node}>
        <div
          className={cn(
            "grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 transition hover:bg-muted md:grid",
            dataRoomListGridClass,
          )}
          onDoubleClick={openNode}
        >
          <button
            className="flex min-w-0 items-center gap-4 text-left cursor-pointer"
            onClick={openNode}
            type="button"
          >
            <NodeIcon type={node.type} size="size-6" />
            <NodeName name={node.name} />
          </button>

          <div className="hidden text-sm text-muted-foreground md:block">
            {formatDate(node.updatedAt)}
          </div>
          <div className="hidden text-sm text-muted-foreground md:block">
            {node.type === "file" ? formatFileSize(node.size) : "-"}
          </div>

          <NodeMore node={node} />

          <div className="col-span-2 flex items-center gap-2 text-xs text-muted-foreground md:hidden">
            <NodeMeta node={node} />
          </div>
        </div>
      </NodeContextMenu>
      {node.type === "file" && (
        <PdfPreviewDialog
          key={node.id}
          node={node as FileNode}
          open={previewOpen}
          onOpenChange={setPreviewOpen}
        />
      )}
    </>
  )
})
