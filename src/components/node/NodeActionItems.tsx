import type { ComponentType, ReactElement, ReactNode } from "react"
import { DownloadIcon, Pencil, Trash2 } from "lucide-react"
import { DeleteNodeDialog } from "@/components/node/DeleteNodeDialog/DeleteNodeDialog"
import { RenameNodeDialog } from "@/components/node/RenameNodeDialog/RenameNodeDialog"
import { downloadNode } from "@/lib/downloadHelper"
import type { DataRoomNode } from "@/types/dataRoom"

interface MenuItemProps {
  onClick?: () => void
  onSelect?: (event: Event) => void
  className?: string
  children: ReactNode
}

interface NodeActionItemsProps {
  node: DataRoomNode
  Item: ComponentType<MenuItemProps>
}

export function NodeActionItems({ node, Item }: NodeActionItemsProps): ReactElement {
  return (
    <>
      {node.type === "file" && (
        <Item onClick={() => downloadNode(node)}>
          <DownloadIcon className="size-4" />
          Download
        </Item>
      )}
      <RenameNodeDialog
        node={node}
        trigger={
          <Item onSelect={(event) => event.preventDefault()}>
            <Pencil className="size-4" />
            Rename
          </Item>
        }
      />
      <DeleteNodeDialog
        node={node}
        trigger={
          <Item
            className="text-destructive focus:text-destructive"
            onSelect={(event) => event.preventDefault()}
          >
            <Trash2 className="size-4" />
            Delete
          </Item>
        }
      />
    </>
  )
}
