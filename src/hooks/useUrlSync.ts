import { useEffect, useRef } from "react"
import { useDataRoomStore } from "@/store/dataRoomStore"
import type {
  DataRoomNode,
  FoldersPosition,
  SortOption,
  TypeFilter,
  ViewMode,
} from "@/types/dataRoom"

const DEFAULT_SORT: SortOption = "name-asc"
const DEFAULT_FILTER: TypeFilter = "all"
const DEFAULT_VIEW_MODE: ViewMode = "list"
const DEFAULT_FOLDERS_POSITION: FoldersPosition = "top"

const SORT_OPTIONS: SortOption[] = [
  "name-asc",
  "name-desc",
  "updated-asc",
  "updated-desc",
  "size-asc",
  "size-desc",
]

const VALID_VIEW_MODES: ViewMode[] = ["list", "grid"]
const VALID_FOLDERS_POSITIONS: FoldersPosition[] = ["top", "bottom"]

const isValidSortOption = (value: string | null): value is SortOption => {
  return SORT_OPTIONS.includes(value as SortOption)
}

const VALID_TYPE_FILTERS: TypeFilter[] = ["all", "folder", "file"]

const isValidTypeFilter = (value: string | null): value is TypeFilter => {
  return VALID_TYPE_FILTERS.includes(value as TypeFilter)
}

const isValidViewMode = (value: string | null): value is ViewMode => {
  return VALID_VIEW_MODES.includes(value as ViewMode)
}

const isValidFoldersPosition = (value: string | null): value is FoldersPosition => {
  return VALID_FOLDERS_POSITIONS.includes(value as FoldersPosition)
}

interface UrlState {
  folderId: string | null
  sortOption: SortOption
  typeFilter: TypeFilter
  viewMode: ViewMode
  foldersPosition: FoldersPosition
}

const readUrlState = (nodes: Record<string, DataRoomNode>): UrlState => {
  const params = new URLSearchParams(window.location.search)

  const urlFolder = params.get("folder")
  const node = urlFolder ? nodes[urlFolder] : undefined
  const folderId = node && node.type === "folder" ? urlFolder : null

  const urlSort = params.get("sort")
  const sortOption = isValidSortOption(urlSort) ? urlSort : DEFAULT_SORT

  const urlFilter = params.get("filter")
  const typeFilter = isValidTypeFilter(urlFilter) ? urlFilter : DEFAULT_FILTER

  const urlView = params.get("view")
  const viewMode = isValidViewMode(urlView) ? urlView : DEFAULT_VIEW_MODE

  const urlFoldersPosition = params.get("folders")
  const foldersPosition = isValidFoldersPosition(urlFoldersPosition)
    ? urlFoldersPosition
    : DEFAULT_FOLDERS_POSITION

  return { folderId, sortOption, typeFilter, viewMode, foldersPosition }
}

const buildSearchString = (state: UrlState): string => {
  const params = new URLSearchParams()

  if (state.folderId) {
    params.set("folder", state.folderId)
  }
  if (state.sortOption !== DEFAULT_SORT) {
    params.set("sort", state.sortOption)
  }
  if (state.typeFilter !== DEFAULT_FILTER) {
    params.set("filter", state.typeFilter)
  }
  if (state.viewMode !== DEFAULT_VIEW_MODE) {
    params.set("view", state.viewMode)
  }
  if (state.foldersPosition !== DEFAULT_FOLDERS_POSITION) {
    params.set("folders", state.foldersPosition)
  }

  return params.toString()
}

const applyUrlStateToStore = (urlState: UrlState) => {
  const {
    currentFolderId,
    sortOption,
    typeFilter,
    viewMode,
    foldersPosition,
    setCurrentFolderId,
    setSortOption,
    setTypeFilter,
    setViewMode,
    setFoldersPosition,
  } = useDataRoomStore.getState()

  if (currentFolderId !== urlState.folderId) {
    setCurrentFolderId(urlState.folderId)
  }
  if (sortOption !== urlState.sortOption) {
    setSortOption(urlState.sortOption)
  }
  if (typeFilter !== urlState.typeFilter) {
    setTypeFilter(urlState.typeFilter)
  }
  if (viewMode !== urlState.viewMode) {
    setViewMode(urlState.viewMode)
  }
  if (foldersPosition !== urlState.foldersPosition) {
    setFoldersPosition(urlState.foldersPosition)
  }
}

export const useUrlSync = () => {
  const currentFolderId = useDataRoomStore((state) => state.currentFolderId)
  const sortOption = useDataRoomStore((state) => state.sortOption)
  const typeFilter = useDataRoomStore((state) => state.typeFilter)
  const viewMode = useDataRoomStore((state) => state.viewMode)
  const foldersPosition = useDataRoomStore((state) => state.foldersPosition)
  const isHydrated = useDataRoomStore((state) => state.isHydrated)

  const hasInitialLoadedRef = useRef(false)
  const prevFolderIdRef = useRef<string | null | undefined>(undefined)

  // 1. Initial hydration and URL reading — runs once, after persist hydration
  useEffect(() => {
    if (!isHydrated || hasInitialLoadedRef.current) {
      return
    }

    hasInitialLoadedRef.current = true

    const urlState: UrlState = readUrlState(useDataRoomStore.getState().nodes)
    applyUrlStateToStore(urlState)

    const searchString: string = buildSearchString(urlState)
    const newUrl: string = `${window.location.pathname}${searchString ? `?${searchString}` : ""}`
    window.history.replaceState(null, "", newUrl)

    prevFolderIdRef.current = urlState.folderId
  }, [isHydrated])

  // 2. Sync store changes back to the URL
  useEffect(() => {
    if (!isHydrated || !hasInitialLoadedRef.current) {
      return
    }

    const prevFolderId = prevFolderIdRef.current
    const isPush = prevFolderId !== undefined && currentFolderId !== prevFolderId
    prevFolderIdRef.current = currentFolderId

    const nextSearch: string = buildSearchString({
      folderId: currentFolderId,
      sortOption,
      typeFilter,
      viewMode,
      foldersPosition,
    })
    const currentSearch: string = window.location.search.replace(/^\?/, "")

    if (nextSearch === currentSearch) {
      return
    }

    const newUrl: string = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}`

    if (isPush) {
      window.history.pushState(null, "", newUrl)
    } else {
      window.history.replaceState(null, "", newUrl)
    }
  }, [currentFolderId, foldersPosition, isHydrated, sortOption, typeFilter, viewMode])

  // 3. Listen to browser Back/Forward navigation
  useEffect(() => {
    if (!isHydrated) {
      return
    }

    const handlePopState = () => {
      const urlState = readUrlState(useDataRoomStore.getState().nodes)
      applyUrlStateToStore(urlState)
      prevFolderIdRef.current = urlState.folderId
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [isHydrated])
}
