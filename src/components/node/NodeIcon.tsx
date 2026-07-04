import { FileText, Folder, Image } from "lucide-react"
import { SUPPORTED_IMAGE_MIME_TYPES } from "@/lib/nodeHelpers"

interface NodeIconProps {
  type: "folder" | "file"
  size?: string
  mimeType?: string
}

export function NodeIcon({ type, size = "size-6", mimeType }: NodeIconProps) {
  if (type === "folder") {
    return <Folder className={`${size} shrink-0 fill-brand-to text-brand-to`} />
  }

  if (mimeType && SUPPORTED_IMAGE_MIME_TYPES.has(mimeType)) {
    return <Image className={`${size} shrink-0 text-emerald-500`} />
  }

  return <FileText className={`${size} shrink-0 text-destructive`} />
}