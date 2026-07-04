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
import { useCreateFolder } from "./useCreateFolder"
import type { ReactElement } from "react"

interface CreateFolderDialogProps {
  trigger: ReactElement
}

export function CreateFolderDialog({ trigger }: CreateFolderDialogProps) {
  const {
    isOpen,
    nodeName,
    isDirty,
    validation,
    handleOpenChange,
    setNodeName,
    setIsDirty,
    createNewFolder,
  } = useCreateFolder()
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New folder</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="folder-name">Name</Label>
          <Input
            autoFocus
            id="folder-name"
            className="rounded-none"
            value={nodeName}
            onChange={(event) => {
              setNodeName(event.target.value)
              setIsDirty(true)
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                createNewFolder()
              }
            }}
          />
          {!validation.ok && isDirty && (
            <p className="text-sm text-destructive">{validation.error}</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!validation.ok} onClick={createNewFolder}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
