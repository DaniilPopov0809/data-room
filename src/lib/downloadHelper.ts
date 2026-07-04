import { getBlob } from "@/db/blobStore"
import type { DataRoomNode } from "@/types/dataRoom"
import { toast } from "sonner"

export const downloadNode = async (node: DataRoomNode) => {
  if (node.type !== "file") {
    return
  }

  try {
    const blob: Blob | undefined = await getBlob(node.blobId)
    if (!blob) {
      toast.error(`File content for ${node.name} was not found`)
      return
    }

    const url: string = URL.createObjectURL(blob)
    const link: HTMLAnchorElement = document.createElement("a")
    link.href = url
    link.download = node.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success(`Downloading ${node.name}...`)
  } catch (error) {
    console.error("Failed to download file:", error)
    toast.error("Failed to download file")
  }
}
