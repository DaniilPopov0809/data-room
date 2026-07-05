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
          <AlertDialogTitle>Delete {node.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            {node.type === "folder" && counts
              ? `This folder contains ${counts.folders} folders, ${counts.files} files. This action cannot be undone.`
              : "This action cannot be undone."}
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
