import { useCallback } from "react"
import { toast } from "sonner"
import { saveBlob, deleteBlob } from "@/db/blobStore"
import { useDataRoomStore } from "@/store/dataRoomStore"
import { useConflictStore } from "@/store/conflictStore"
import { getChildren, isPdf } from "@/lib/nodeHelpers"
import { normalizeName } from "@/lib/nameHelpers"
import type { FileNode } from "@/types/dataRoom"

const MAX_FILE_SIZE: number = 3 * 1024 * 1024 // 3 MB

export const useFileUpload = (): { uploadFiles: (files: FileList | File[]) => Promise<void> } => {
  const addFile = useDataRoomStore((state) => state.addFile)
  const overwriteFile = useDataRoomStore((state) => state.overwriteFile)
  const setIsUploading = useDataRoomStore((state) => state.setIsUploading)
  const promptConflict = useConflictStore((state) => state.promptConflict)

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileList = Array.from(files)

      if (fileList.length === 0) {
        return
      }

      setIsUploading(true)

      try {
        for (const file of fileList) {
          let blobId: string | null = null

          try {
            const validPdf = await isPdf(file)
            if (!validPdf) {
              toast.error(`${file.name}: only PDF files are supported`)
              continue
            }

            if (file.size > MAX_FILE_SIZE) {
              toast.error(`${file.name}: file is too large (max ${MAX_FILE_SIZE / 1024 / 1024} MB)`)
              continue
            }

            const state = useDataRoomStore.getState()
            const resolvedParentId = state.currentFolderId
            const siblings = getChildren(state.nodes, resolvedParentId)
            const duplicate = siblings.find(
              (node) => node.type === "file" && node.normalizedName === normalizeName(file.name),
            )

            let decision: "overwrite" | "copy" | "cancel" = "copy"

            if (duplicate) {
              decision = await promptConflict(file.name)
            }

            if (decision === "cancel") {
              continue
            }

            blobId = crypto.randomUUID()
            await saveBlob(blobId, file)

            if (decision === "overwrite" && duplicate) {
              const oldBlobId = (duplicate as FileNode).blobId
              const updated = overwriteFile(duplicate.id, {
                mimeType: file.type,
                size: file.size,
                blobId,
              })

              if (!updated) {
                throw new Error("Failed to update file metadata")
              }

              if (oldBlobId) {
                try {
                  await deleteBlob(oldBlobId)
                } catch (error) {
                  console.error("Failed to delete old blob:", error)
                }
              }

              toast.success(`${file.name} overwritten`)
            } else {
              addFile({
                name: file.name,
                mimeType: file.type,
                size: file.size,
                blobId,
                parentId: resolvedParentId,
              })
              toast.success(`${file.name} uploaded`)
            }

            blobId = null
          } catch (error) {
            console.error("Failed to upload file:", error)
            if (blobId) {
              try {
                await deleteBlob(blobId)
              } catch (error) {
                console.error("Failed to delete blob:", error)
              }
            }

            toast.error(`${file.name}: upload failed`)
          }
        }
      } finally {
        setIsUploading(false)
      }
    },
    [addFile, overwriteFile, promptConflict, setIsUploading],
  )

  return { uploadFiles }
}
