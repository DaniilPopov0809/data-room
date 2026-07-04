import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useConflictStore } from "@/store/conflictStore"

export function ConflictDialog() {
  const pendingConflicts = useConflictStore((state) => state.pendingConflicts)
  const resolveConflict = useConflictStore((state) => state.resolveConflict)

  const currentConflict = pendingConflicts[0]

  if (!currentConflict) {
    return null
  }

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) {
          resolveConflict(currentConflict.id, "cancel")
        }
      }}
    >
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>File already exists</DialogTitle>
          <DialogDescription>
            A file named{" "}
            <span className="font-semibold text-foreground">
              {currentConflict.fileName}
            </span>{" "}
            already exists in this folder. What would you like to do?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={() => resolveConflict(currentConflict.id, "cancel")}
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={() => resolveConflict(currentConflict.id, "copy")}
          >
            Save a copy
          </Button>
          <Button
            onClick={() => resolveConflict(currentConflict.id, "overwrite")}
          >
            Overwrite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
