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

const sortLabels: Record<SortOption, string> = {
  "name-asc": "Name (A-Z)",
  "name-desc": "Name (Z-A)",
  "updated-desc": "Last updated (Newest)",
  "updated-asc": "Last updated (Oldest)",
  "size-desc": "Size (Largest)",
  "size-asc": "Size (Smallest)",
}

const filterLabels: Record<TypeFilter, string> = {
  all: "All",
  folder: "Folders",
  file: "PDFs",
}

export function DataRoomToolbar() {
  const isUploading = useDataRoomStore((state) => state.isUploading)
  const sortOption = useDataRoomStore((state) => state.sortOption)
  const setSortOption = useDataRoomStore((state) => state.setSortOption)
  const foldersPosition = useDataRoomStore((state) => state.foldersPosition)
  const setFoldersPosition = useDataRoomStore((state) => state.setFoldersPosition)
  const typeFilter = useDataRoomStore((state) => state.typeFilter)
  const setTypeFilter = useDataRoomStore((state) => state.setTypeFilter)

  const currentLabel: string = sortLabels[sortOption] || "Sort"
  const currentFilterLabel: string = filterLabels[typeFilter] || "All"

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
                <DropdownMenuRadioItem className="normal-case tracking-normal" value="all">
                  All
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem className="normal-case tracking-normal" value="folder">
                  Folders
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem className="normal-case tracking-normal" value="file">
                  PDFs
                </DropdownMenuRadioItem>
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
                <DropdownMenuRadioItem className="normal-case tracking-normal" value="name-asc">
                  Name (A-Z)
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem className="normal-case tracking-normal" value="name-desc">
                  Name (Z-A)
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem className="normal-case tracking-normal" value="updated-desc">
                  Last updated (Newest)
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem className="normal-case tracking-normal" value="updated-asc">
                  Last updated (Oldest)
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem className="normal-case tracking-normal" value="size-desc">
                  Size (Largest)
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem className="normal-case tracking-normal" value="size-asc">
                  Size (Smallest)
                </DropdownMenuRadioItem>
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
              <Button
                className="flex-1 normal-case tracking-normal md:flex-none"
                variant="outline"
              >
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
                PDF
              </Button>
            }
          />
          <DataRoomView />
        </div>
      </div>
    </div>
  )
}
