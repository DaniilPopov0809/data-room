import { Button } from "@/components/ui/button"
import { useDebounce } from "@/hooks/useDebounce"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { matchesSearchQuery } from "@/lib/localeHelpers"
import { useDataRoomStore } from "@/store/dataRoomStore"
import type { DataRoomNode, FileNode } from "@/types/dataRoom"
import { Search } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { PdfPreviewDialog } from "../../file/PdfPreviewDialog/PdfPreviewDialog"
import { DataRoomSearchResult } from "./DataRoomSearchResult"
import { DataRoomMobileSearchField } from "./DataRoomMobileSearchField"

interface DataRoomSearchProps {
  isMobileOpen: boolean
  onMobileOpenChange: (open: boolean) => void
}

export function DataRoomSearch({ isMobileOpen, onMobileOpenChange }: DataRoomSearchProps) {
  const nodes: Record<string, DataRoomNode> = useDataRoomStore((state) => state.nodes)
  const setCurrentFolderId: (id: string) => void = useDataRoomStore(
    (state) => state.setCurrentFolderId,
  )

  const isMobile: boolean = useMediaQuery("(max-width: 767px)")

  const [searchQuery, setSearchQuery] = useState<string>("")
  const debouncedSearchQuery = useDebounce(searchQuery, 250)
  const [isDesktopOpen, setIsDesktopOpen] = useState<boolean>(false)
  const [previewOpen, setPreviewOpen] = useState<boolean>(false)
  const [selectedNode, setSelectedNode] = useState<FileNode | null>(null)

  const desktopRef = useRef<HTMLDivElement>(null)
  const mobileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (desktopRef.current && !desktopRef.current.contains(event.target as Node)) {
        setIsDesktopOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDesktopOpen(false)
        closeMobileSearch()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  useEffect(() => {
    if (isMobileOpen) {
      const timer = window.setTimeout(() => mobileInputRef.current?.focus(), 50)
      return () => window.clearTimeout(timer)
    } else {
      setSearchQuery("")
    }
  }, [isMobileOpen])

  const trimmedQuery = debouncedSearchQuery.trim()
  const filteredNodes = useMemo(() => {
    if (!trimmedQuery) return []
    return Object.values(nodes)
      .filter((node) => matchesSearchQuery(node.name, trimmedQuery))
      .slice(0, 10)
  }, [nodes, trimmedQuery])

  const hasQuery: boolean = searchQuery.trim().length > 0

  const showMobileResults: boolean = isMobile && isMobileOpen && hasQuery
  const showDesktopResults: boolean = !isMobile && isDesktopOpen && hasQuery

  const handleNodeClick = (node: DataRoomNode): void => {
    if (node.type === "folder") {
      setCurrentFolderId(node.id)
    } else {
      setSelectedNode(node)
      setPreviewOpen(true)
    }

    setSearchQuery("")
    setIsDesktopOpen(false)
    onMobileOpenChange(false)
  }

  const handleSearchChange = (value: string): void => {
    setSearchQuery(value)
    if (!isMobile) setIsDesktopOpen(true)
  }

  const closeMobileSearch = (): void => {
    setSearchQuery("")
    onMobileOpenChange(false)
  }

  return (
    <>
      {/* Desktop search */}
      <div ref={desktopRef} className="relative hidden min-w-0 max-w-3xl flex-1 md:block">
        <DataRoomMobileSearchField
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => setIsDesktopOpen(true)}
          inputClassName="h-12 pl-14 pr-12"
          className="[&_svg]:left-5"
        />

        {showDesktopResults && (
          <div className="absolute top-full right-0 left-0 z-50 mt-2 max-h-80 overflow-hidden rounded-xl border bg-popover py-2 shadow-lg">
            <DataRoomSearchResult
              nodes={nodes}
              query={searchQuery}
              results={filteredNodes}
              onSelect={handleNodeClick}
            />
          </div>
        )}
      </div>

      {/* Mobile search trigger (hidden when open) */}
      {!isMobileOpen && (
        <Button
          className="ml-auto shrink-0 md:hidden"
          onClick={() => onMobileOpenChange(true)}
          size="icon"
          variant="ghost"
          aria-label="Search"
        >
          <Search className="size-5" />
        </Button>
      )}

      {/* Mobile inline search bar (replaces logo in header) */}
      {isMobileOpen && (
        <div className="flex min-w-0 flex-1 items-center gap-2 md:hidden">
          <DataRoomMobileSearchField
            value={searchQuery}
            onChange={handleSearchChange}
            inputRef={mobileInputRef}
            className="min-w-0 flex-1"
          />
          <Button
            className="shrink-0 normal-case tracking-normal"
            onClick={closeMobileSearch}
            variant="ghost"
          >
            Close
          </Button>
        </div>
      )}

      {/* Mobile results dropdown — fixed below header, doesn't cover full screen */}
      {showMobileResults && (
        <div className="fixed inset-x-0 top-16 z-40 max-h-[60dvh] overflow-y-auto border-b bg-popover shadow-lg md:hidden">
          <DataRoomSearchResult
            nodes={nodes}
            query={searchQuery}
            results={filteredNodes}
            onSelect={handleNodeClick}
          />
        </div>
      )}

      {selectedNode && (
        <PdfPreviewDialog
          key={selectedNode.id}
          node={selectedNode}
          open={previewOpen}
          onOpenChange={setPreviewOpen}
        />
      )}
    </>
  )
}
