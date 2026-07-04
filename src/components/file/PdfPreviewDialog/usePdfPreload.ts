import type { FileNode } from "@/types/dataRoom"
import { toast } from "sonner"
import { useEffect, useRef, useState } from "react"
import { getBlob } from "@/db/blobStore"
import { revokeObjectUrl } from "./helpers"

interface UsePdfPreloadParams {
  node: FileNode | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface UsePdfPreloadResult {
  url: string | null
  isLoading: boolean
  error: string | null
  handleOpenChange: (nextOpen: boolean) => void
}

export const usePdfPreload = ({
  node,
  open,
  onOpenChange,
}: UsePdfPreloadParams): UsePdfPreloadResult => {
  const [url, setUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const objectUrlRef = useRef<string | null>(null)

  const handleOpenChange = (nextOpen: boolean): void => {
    if (!nextOpen) {
      revokeObjectUrl(objectUrlRef)
      setUrl(null)
      setIsLoading(false)
      setError(null)
    }

    onOpenChange(nextOpen)
  }

  useEffect(() => {
    if (!open) return

    if (!node) {
      setError("File not found")
      return
    }

    setError(null)
    const currentNode = node
    let active = true

    const loadPdf = async (): Promise<void> => {
      setIsLoading(true)
      setUrl(null)

      try {
        const blob = await getBlob(currentNode.blobId)
        if (!active) return

        if (blob) {
          const pdfBlob = new Blob([blob], { type: "application/pdf" })
          const objectUrl = URL.createObjectURL(pdfBlob)
          objectUrlRef.current = objectUrl
          setUrl(objectUrl)
        } else {
          toast.error("File content not found")
          setError("File content not found")
        }
      } catch {
        if (active) {
          toast.error("Failed to load PDF preview")
          setError("Failed to load PDF preview")
        }
      } finally {
        if (active) setIsLoading(false)
      }
    }

    loadPdf()

    return () => {
      active = false
      revokeObjectUrl(objectUrlRef)
    }
  }, [open, node, onOpenChange])

  return { url, isLoading, error, handleOpenChange }
}
