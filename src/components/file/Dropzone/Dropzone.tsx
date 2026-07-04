import { Loader2, UploadCloud, FolderOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDropzone } from "./useDropzone"

interface DropzoneProps {
  isEmpty?: boolean
}

export function Dropzone({ isEmpty = false }: DropzoneProps) {
  const { isDragging, isUploading, folderName } = useDropzone();

  if (isUploading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-primary/30 bg-primary/10 px-4 py-2 text-sm text-primary">
        <Loader2 className="size-4 animate-spin" />
        Uploading files...
      </div>
    )
  }

  if (isDragging && !isEmpty) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-primary/10 backdrop-blur-xs transition-all duration-200">
        <div className="w-full h-full border-2 border-dashed border-primary rounded-3xl bg-card/95 flex flex-col items-center justify-center pointer-events-none shadow-xl">
          <UploadCloud className="size-16 animate-bounce text-primary mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Drop files here to upload
          </h3>
          <p className="text-sm text-primary/80">
            to <span className="font-medium underline">{folderName}</span>
          </p>
          <span className="mt-4 text-xs font-medium uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/30">
            PDF · Images
          </span>
        </div>
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div
        className={cn(
          "flex min-h-90 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed p-6 text-center transition-all duration-200",
          isDragging ? "border-primary bg-primary/10" : "border-border bg-background",
        )}
      >
        <div
          className={cn(
            "flex size-16 items-center justify-center rounded-full transition-colors duration-200",
            isDragging ? "bg-primary/20" : "bg-accent",
          )}
        >
          <FolderOpen className="size-8 text-primary transition-colors duration-200" />
        </div>
        <div className="max-w-sm space-y-1">
          <h2 className="text-xl font-medium text-foreground transition-colors duration-200">
            This folder is empty
          </h2>
          <p
            className={cn(
              "text-sm transition-colors duration-200",
              isDragging ? "text-primary/80" : "text-muted-foreground",
            )}
          >
            Create a folder, upload, or drag & drop PDF and image files here.
          </p>
        </div>
      </div>
    )
  }

  return null
}
