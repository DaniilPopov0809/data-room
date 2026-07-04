import type { FileNode } from "@/types/dataRoom"
import { toast } from "sonner"
import { useEffect, useRef, useState } from "react"
import { getBlob } from "@/db/blobStore"
import { revokeObjectUrl } from "./helpers"

interface UseFilePreloadParams {
  node: FileNode | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface UseFilePreloadResult {
  url: string | null
  isLoading: boolean
  error: string | null
  handleOpenChange: (nextOpen: boolean) => void
}

export const useFilePreload = ({
  node,
  open,
  onOpenChange,
}: UseFilePreloadParams): UseFilePreloadResult => {
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

    const loadFile = async (): Promise<void> => {
      setIsLoading(true)
      setUrl(null)

      try {
        const blob = await getBlob(currentNode.blobId)
        if (!active) return

        if (blob) {
          const typedBlob = new Blob([blob], { type: currentNode.mimeType })
          const objectUrl = URL.createObjectURL(typedBlob)
          objectUrlRef.current = objectUrl
          setUrl(objectUrl)
        } else {
          toast.error("File content not found")
          setError("File content not found")
        }
      } catch {
        if (active) {
          toast.error("Failed to load file preview")
          setError("Failed to load file preview")
        }
      } finally {
        if (active) setIsLoading(false)
      }
    }

    loadFile()

    return () => {
      active = false
      revokeObjectUrl(objectUrlRef)
    }
  }, [open, node, onOpenChange])

  return { url, isLoading, error, handleOpenChange }
}
