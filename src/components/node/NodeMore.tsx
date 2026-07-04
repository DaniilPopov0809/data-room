import { MoreVertical } from "lucide-react"
import { NodeActionItems } from "@/components/node/NodeActionItems"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { DataRoomNode } from "@/types/dataRoom"

export function NodeMore({ node }: { node: DataRoomNode }) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button size="icon-xs" variant="ghost" aria-label="Node actions">
          <MoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <NodeActionItems node={node} Item={DropdownMenuItem} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
