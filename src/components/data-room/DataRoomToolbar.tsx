import { UploadButton } from "@/components/file/UploadButton"
import { CreateFolderDialog } from "@/components/folder/CreateFolderDialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ArrowUpDown, ChevronDown, Loader2, Plus, Upload } from "lucide-react"
import { DataRoomBreadcrumbs } from "./DataRoomBreadcrumbs"
import { DataRoomView } from "./DataRoomView"
import { useDataRoomStore } from "@/store/dataRoomStore"
import type { SortOption, TypeFilter } from "@/types/dataRoom"
import { FILTER_LABELS } from "@/lib/filterHelpers"
import { SORT_LABELS } from "@/lib/sortHelpers"


export function DataRoomToolbar() {
  const isUploading = useDataRoomStore((state) => state.isUploading)
  const sortOption = useDataRoomStore((state) => state.sortOption)
  const setSortOption = useDataRoomStore((state) => state.setSortOption)
  const foldersPosition = useDataRoomStore((state) => state.foldersPosition)
  const setFoldersPosition = useDataRoomStore((state) => state.setFoldersPosition)
  const typeFilter = useDataRoomStore((state) => state.typeFilter)
  const setTypeFilter = useDataRoomStore((state) => state.setTypeFilter)

  const currentLabel: string = SORT_LABELS[sortOption] || "Sort"
  const currentFilterLabel: string = FILTER_LABELS[typeFilter] || "All"

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <DataRoomBreadcrumbs />
      </div>

      <div className="flex flex-col-reverse gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                className="rounded-lg normal-case tracking-normal animate-fade-in flex items-center gap-2"
                variant="outline"
              >
                {typeFilter !== "all" ? `Type: ${currentFilterLabel}` : "Type"}
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
              <DropdownMenuRadioGroup
                value={typeFilter}
                onValueChange={(value) => setTypeFilter(value as TypeFilter)}
              >
                {(Object.keys(FILTER_LABELS) as TypeFilter[]).map((key) => (
                  <DropdownMenuRadioItem
                    key={key}
                    className="normal-case tracking-normal"
                    value={key}
                  >
                    {FILTER_LABELS[key]}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                className="rounded-lg normal-case tracking-normal flex items-center gap-2"
                variant="outline"
              >
                <ArrowUpDown className="size-4 text-muted-foreground" />
                {currentLabel}
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuRadioGroup
                value={sortOption}
                onValueChange={(value) => setSortOption(value as SortOption)}
              >
                {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                  <DropdownMenuRadioItem
                    key={key}
                    className="normal-case tracking-normal"
                    value={key}
                  >
                    {SORT_LABELS[key]}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>

              <DropdownMenuSeparator />

              <DropdownMenuLabel className="normal-case tracking-normal text-muted-foreground font-semibold">
                Folders Placement
              </DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={foldersPosition}
                onValueChange={(value) => setFoldersPosition(value as "top" | "bottom")}
              >
                <DropdownMenuRadioItem className="normal-case tracking-normal" value="top">
                  Folders on Top
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem className="normal-case tracking-normal" value="bottom">
                  Folders on Bottom
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          <CreateFolderDialog
            trigger={
              <Button className="flex-1 normal-case tracking-normal md:flex-none" variant="outline">
                <Plus />
                Folder
              </Button>
            }
          />
          <UploadButton
            trigger={
              <Button
                className="flex-1 normal-case tracking-normal md:flex-none"
                disabled={isUploading}
              >
                {isUploading ? <Loader2 className="animate-spin" /> : <Upload />}
                Upload
              </Button>
            }
          />
          <DataRoomView />
        </div>
      </div>
    </div>
  )
}
