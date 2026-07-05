import { useEffect, useRef, useState } from "react"
import { useFileUpload } from "@/hooks/useFileUpload"
import { useCurrentFolderContext } from "@/contexts/useCurrentFolderContext"
import { useDataRoomStore } from "@/store/dataRoomStore"

export const useDropzone = (): {
  isDragging: boolean
  folderName: string
  isUploading: boolean
} => {
  const { uploadFiles } = useFileUpload()
  const isUploading = useDataRoomStore((state) => state.isUploading)
  const { currentFolder } = useCurrentFolderContext()
  const [isDragging, setIsDragging] = useState(false)
  const dragCounter = useRef(0)

  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      if (
        e.dataTransfer &&
        e.dataTransfer.types &&
        Array.from(e.dataTransfer.types).includes("Files")
      ) {
        dragCounter.current++
        if (dragCounter.current === 1) {
          setIsDragging(true)
        }
      }
    }

    const handleDragLeave = (e: DragEvent) => {
      if (
        e.dataTransfer &&
        e.dataTransfer.types &&
        Array.from(e.dataTransfer.types).includes("Files")
      ) {
        dragCounter.current--
        if (dragCounter.current === 0) {
          setIsDragging(false)
        }
      }
    }

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
    }

    const handleDrop = (e: DragEvent) => {
      if (
        e.dataTransfer &&
        e.dataTransfer.types &&
        Array.from(e.dataTransfer.types).includes("Files")
      ) {
        e.preventDefault()
        dragCounter.current = 0
        setIsDragging(false)
        if (!isUploading && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          void uploadFiles(e.dataTransfer.files)
        }
      }
    }

    window.addEventListener("dragenter", handleDragEnter)
    window.addEventListener("dragleave", handleDragLeave)
    window.addEventListener("dragover", handleDragOver)
    window.addEventListener("drop", handleDrop)

    return () => {
      window.removeEventListener("dragenter", handleDragEnter)
      window.removeEventListener("dragleave", handleDragLeave)
      window.removeEventListener("dragover", handleDragOver)
      window.removeEventListener("drop", handleDrop)
    }
  }, [isUploading, uploadFiles])

  const folderName: string = currentFolder ? currentFolder.name : "Root folder"

  return {
    isDragging,
    folderName,
    isUploading,
  }
}
