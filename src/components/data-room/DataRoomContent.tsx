import { DataRoomToolbar } from "@/components/data-room/DataRoomToolbar"
import { NodeGrid } from "@/components/node/NodeGrid"
import { NodeList } from "@/components/node/NodeList"
import { Dropzone } from "@/components/file/Dropzone/Dropzone"
import { useCurrentFolderContext } from "@/contexts/useCurrentFolderContext"
import { getTypeFilterLabel } from "@/lib/filterHelpers"
import { useDataRoomStore } from "@/store/dataRoomStore"

export function DataRoomContent() {
  const viewMode = useDataRoomStore((state) => state.viewMode)
  const { children, isFolderEmpty, isFilterEmpty, typeFilter } = useCurrentFolderContext()

  const emptyState = isFolderEmpty ? "empty-folder" : isFilterEmpty ? "empty-filter" : null

  return (
    <div className="h-full flex flex-col min-h-0 space-y-4">
      <DataRoomToolbar />
      <Dropzone emptyState={emptyState} filterLabel={getTypeFilterLabel(typeFilter)} />
      {children.length > 0 && (
        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
          {viewMode === "grid" ? <NodeGrid nodes={children} /> : <NodeList nodes={children} />}
        </div>
      )}
    </div>
  )
}
