import type { ReactNode } from "react"
import { NodeActionItems } from "@/components/node/NodeActionItems"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import type { DataRoomNode } from "@/types/dataRoom"

interface NodeContextMenuProps {
  node: DataRoomNode
  children: ReactNode
}

export function NodeContextMenu({ node, children }: NodeContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <NodeActionItems node={node} Item={ContextMenuItem} />
      </ContextMenuContent>
    </ContextMenu>
  )
}
