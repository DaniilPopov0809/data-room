import type { DataRoomNode } from "@/types/dataRoom"
import { NodeItem } from "@/components/node/NodeItem"

interface NodeGridProps {
  nodes: DataRoomNode[]
}

export function NodeGrid({ nodes }: NodeGridProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {nodes.map((node) => (
        <NodeItem key={node.id} node={node} viewMode="grid" />
      ))}
    </div>
  )
}
