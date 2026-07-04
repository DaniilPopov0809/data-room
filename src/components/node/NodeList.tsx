import { cn } from "@/lib/utils"
import type { DataRoomNode } from "@/types/dataRoom"
import { NodeItem } from "@/components/node/NodeItem"

interface NodeListProps {
  nodes: DataRoomNode[]
}

export const dataRoomListGridClass = "md:grid-cols-[minmax(280px,1fr)_220px_140px_56px]"

export function NodeList({ nodes }: NodeListProps) {
  return (
    <div className="relative border-b">
      <div
        className={cn(
          "sticky top-0 z-10 bg-card hidden grid-cols-[1fr_auto] items-center gap-3 border-b px-4 py-3 text-sm font-medium text-foreground/80 md:grid",
          dataRoomListGridClass,
        )}
      >
        <div>Name</div>
        <div>Updated</div>
        <div>Size</div>
        <div />
      </div>

      <div className="divide-y">
        {nodes.map((node) => (
          <NodeItem key={node.id} node={node} viewMode="list" />
        ))}
      </div>
    </div>
  )
}
