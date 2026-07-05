import type { ReactNode } from "react"
import { NodeActionItems } from "@/components/node/NodeActionItems"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { useMenuDialog } from "@/hooks/useMenuDialog"
import type { DataRoomNode } from "@/types/dataRoom"

interface NodeContextMenuProps {
  node: DataRoomNode
  children: ReactNode
}

export function NodeContextMenu({ node, children }: NodeContextMenuProps) {
  const { isOpen, handleOpenChange, handleBeforeDialogOpen, handleCloseMenu } = useMenuDialog()

  return (
    <ContextMenu open={isOpen} onOpenChange={handleOpenChange}>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <NodeActionItems
          node={node}
          Item={ContextMenuItem}
          onBeforeDialogOpen={handleBeforeDialogOpen}
          onCloseMenu={handleCloseMenu}
        />
      </ContextMenuContent>
    </ContextMenu>
  )
}
