import type { FileNode } from "@/types/dataRoom"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { usePdfPreload } from "./usePdfPreload"

interface PdfPreviewDialogProps {
  node: FileNode | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PdfPreviewDialog({ node, open, onOpenChange }: PdfPreviewDialogProps) {
  const { url, isLoading, error, handleOpenChange } = usePdfPreload({ node, open, onOpenChange })

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl sm:max-w-4xl w-[calc(100vw-20px)] h-[80vh] flex flex-col pt-8 pb-6 px-3 rounded-lg">
        <DialogHeader>
          <DialogTitle className="truncate">{node?.name ?? "Preview"}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 w-full h-full min-h-0 bg-muted relative rounded-md overflow-hidden border">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="animate-spin" />
            </div>
          )}
          {!isLoading && url && (
            <iframe src={`${url}#toolbar=0`} className="w-full h-full border-0" title={node?.name} />
          )}
          {!isLoading && error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm text-destructive">{error}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
