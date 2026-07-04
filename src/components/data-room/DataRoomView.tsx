import { Grid2X2, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useDataRoomStore } from "@/store/dataRoomStore"

export function DataRoomView() {
  const viewMode = useDataRoomStore((state) => state.viewMode)
  const setViewMode = useDataRoomStore((state) => state.setViewMode)

  return (
    <div className="flex rounded-full border p-0.5">
      <Button
        className={cn(viewMode === "list" && "bg-highlight")}
        onClick={() => setViewMode("list")}
        size="icon-sm"
        variant="ghost"
        aria-label="List view"
      >
        <List />
      </Button>
      <Button
        className={cn(viewMode === "grid" && "bg-highlight")}
        onClick={() => setViewMode("grid")}
        size="icon-sm"
        variant="ghost"
        aria-label="Grid view"
      >
        <Grid2X2 />
      </Button>
    </div>
  )
}
