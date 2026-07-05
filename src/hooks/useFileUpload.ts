import { useCallback } from "react"
import { toast } from "sonner"

import { saveBlob, deleteBlob } from "@/db/blobStore"
import { getChildren, isEmptyFile, isSupportedFile } from "@/lib/nodeHelpers"
import { normalizeName } from "@/lib/nameHelpers"
import {
  canStoreBytes,
  getQuotaExceededMessage,
  isQuotaExceededError,
} from "@/lib/storageHelpers"
import { useConflictStore } from "@/store/conflictStore"
import { useDataRoomStore } from "@/store/dataRoomStore"
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

      const batchNormalizedNames = new Set<string>()

      try {
        for (const file of fileList) {
          let blobId: string | null = null

          try {
            if (isEmptyFile(file)) {
              toast.error(`${file.name}: file is empty (0 bytes)`)
              continue
            }

            const fileCheck = await isSupportedFile(file)
            if (fileCheck.ok === false) {
              toast.error(`${file.name}: ${fileCheck.error}`)
              continue
            }

            if (file.size > MAX_FILE_SIZE) {
              toast.error(`${file.name}: file is too large (max ${MAX_FILE_SIZE / 1024 / 1024} MB)`)
              continue
            }

            const quotaCheck = await canStoreBytes(file.size)
            if (quotaCheck.ok === false) {
              toast.error(`${file.name}: ${quotaCheck.error}`)
              continue
            }

            const state = useDataRoomStore.getState()
            const resolvedParentId = state.currentFolderId
            const siblings = getChildren(state.nodes, resolvedParentId)
            const normalizedFileName = normalizeName(file.name)
            const duplicate = siblings.find(
              (node) => node.type === "file" && normalizeName(node.name) === normalizedFileName,
            )
            const duplicateInBatch = batchNormalizedNames.has(normalizedFileName)

            let decision: "overwrite" | "copy" | "cancel" = "copy"

            if (duplicate || duplicateInBatch) {
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

              batchNormalizedNames.add(normalizeName(updated.name))

              if (oldBlobId) {
                try {
                  await deleteBlob(oldBlobId)
                } catch (error) {
                  console.error("Failed to delete old blob:", error)
                }
              }

              toast.success(`${file.name} overwritten`)
            } else {
              const createdFile = addFile({
                name: file.name,
                mimeType: file.type,
                size: file.size,
                blobId,
                parentId: resolvedParentId,
              })
              batchNormalizedNames.add(normalizeName(createdFile.name))
              toast.success(`${createdFile.name} uploaded`)
            }

            blobId = null
          } catch (error) {
            console.error("Failed to upload file:", error)
            if (blobId) {
              try {
                await deleteBlob(blobId)
              } catch (cleanupError) {
                console.error("Failed to delete blob:", cleanupError)
              }
            }

            if (isQuotaExceededError(error)) {
              toast.error(`${file.name}: ${getQuotaExceededMessage()}`)
              continue
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
