import { type ReactElement } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { DataRoomNode } from "@/types/dataRoom"
import { useDeleteNode } from "./useDeleteNode"

interface DeleteNodeDialogProps {
  node: DataRoomNode
  trigger: ReactElement
  onCloseMenu?: () => void
}

export function DeleteNodeDialog({ node, trigger, onCloseMenu }: DeleteNodeDialogProps) {
  const { counts, confirmDelete } = useDeleteNode(node)

  return (
    <AlertDialog onOpenChange={(open) => { if (!open) onCloseMenu?.() }}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete {node.type === "folder" ? "folder" : "file"}?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left sm:text-left">
            {node.type === "folder" && counts ? (
              <>
                Are you sure you want to delete{" "}
                <span className="font-semibold text-foreground break-all">
                  &ldquo;{node.name}&rdquo;
                </span>
                ? This folder contains {counts.folders} folders, {counts.files} files. This action
                cannot be undone.
              </>
            ) : (
              <>
                Are you sure you want to delete{" "}
                <span className="font-semibold text-foreground break-all">
                  &ldquo;{node.name}&rdquo;
                </span>
                ? This action cannot be undone.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => confirmDelete()}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
