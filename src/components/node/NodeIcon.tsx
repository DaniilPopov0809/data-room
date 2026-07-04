import { FileText, Folder } from "lucide-react"

interface NodeIconProps {
  type: "folder" | "file"
  size?: string
}

export function NodeIcon({ type, size = "size-6" }: NodeIconProps) {
  return type === "folder" ? (
    <Folder className={`${size} shrink-0 fill-brand-to text-brand-to`} />
  ) : (
    <FileText className={`${size} shrink-0 text-destructive`} />
  )
}