import { type ReactElement } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { DataRoomNode } from "@/types/dataRoom"
import { useRenameNode } from "./useRenameNode"

interface RenameNodeDialogProps {
  node: DataRoomNode
  trigger: ReactElement
  onCloseMenu?: () => void
}

export function RenameNodeDialog({ node, trigger, onCloseMenu }: RenameNodeDialogProps) {
  const { isOpen, nodeName, setNodeName, validation, handleOpenChange, confirmRenameNode } =
    useRenameNode(node, onCloseMenu)

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename {node.type}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor={`rename-${node.id}`}>Name</Label>
          <div className="flex items-center gap-1">
            <Input
              id={`rename-${node.id}`}
              className="rounded-none flex-1"
              value={nodeName}
              onChange={(event) => setNodeName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  confirmRenameNode()
                }
              }}
            />
            {node.type === "file" && (
              <span className="text-base text-muted-foreground select-none pb-1 self-end">
                .{node.extension}
              </span>
            )}
          </div>
          {validation.ok === false && (
            <p className="text-sm text-destructive">{validation.error}</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!validation.ok} onClick={() => confirmRenameNode()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
