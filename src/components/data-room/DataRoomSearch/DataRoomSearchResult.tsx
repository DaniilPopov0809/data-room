import { formatFileSize } from "@/lib/formatHelpers"
import { getPath } from "@/lib/nodeHelpers"
import { cn } from "@/lib/utils"
import type { DataRoomNode } from "@/types/dataRoom"
import { FileText, Folder } from "lucide-react"

interface DataRoomSearchResultProps {
  nodes: Record<string, DataRoomNode>
  query: string
  results: DataRoomNode[]
  onSelect: (node: DataRoomNode) => void
  className?: string
}

export function DataRoomSearchResult({ nodes, query, results, onSelect, className }: DataRoomSearchResultProps) {
  if (results.length === 0) {
    return (
      <div className={cn("px-4 py-6 text-center text-sm text-muted-foreground", className)}>
        No results found for &ldquo;{query}&rdquo;
      </div>
    )
  }

  return (
    <div className={cn("overflow-y-auto py-2", className)}>
      {results.map((node) => {
        const path = getPath(nodes, node.parentId)
        const pathString = path.length > 0 ? path.map((p) => p.name).join(" > ") : "Workspace"

        return (
          <button
            key={node.id}
            onClick={() => onSelect(node)}
            className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-muted active:bg-accent cursor-pointer"
            type="button"
          >
            <div className="flex min-w-0 items-center gap-3">
              {node.type === "folder" ? (
                <Folder className="size-5 shrink-0 fill-foreground text-foreground" />
              ) : (
                <FileText className="size-5 shrink-0 text-destructive" />
              )}
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-foreground">{node.name}</div>
                <div className="truncate text-xs text-muted-foreground">{pathString}</div>
              </div>
            </div>
            {node.type === "file" && (
              <span className="ml-3 shrink-0 text-xs text-muted-foreground">
                {formatFileSize(node.size)}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}