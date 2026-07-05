import { compareLocalizedNames } from "@/lib/localeHelpers"
import type { DataRoomNode, SortOption, FoldersPosition } from "@/types/dataRoom"

export const SORT_LABELS: Record<SortOption, string> = {
  "name-asc": "Name (A-Z)",
  "name-desc": "Name (Z-A)",
  "updated-desc": "Updated (Newest)",
  "updated-asc": "Updated (Oldest)",
  "size-desc": "Size (Largest)",
  "size-asc": "Size (Smallest)",
}

const getNodeSize = (node: DataRoomNode): number => {
  return node.type === "file" ? node.size : 0
}

const compareAsc = (left: number, right: number): number => {
  return left - right
}

const compareDesc = (left: number, right: number): number => {
  return right - left
}

export const sortNodes = (
  nodes: DataRoomNode[],
  sortOption: SortOption,
  foldersPosition: FoldersPosition = "top",
): DataRoomNode[] => {
  return [...nodes].sort((left, right) => {
    if (left.type !== right.type) {
      if (foldersPosition === "top") {
        return left.type === "folder" ? -1 : 1
      } else {
        return left.type === "folder" ? 1 : -1
      }
    }

    switch (sortOption) {
      case "name-desc":
        return compareLocalizedNames(right.name, left.name)
      case "updated-desc":
        return (
          compareDesc(left.updatedAt, right.updatedAt) ||
          compareLocalizedNames(left.name, right.name)
        )
      case "updated-asc":
        return (
          compareAsc(left.updatedAt, right.updatedAt) ||
          compareLocalizedNames(left.name, right.name)
        )
      case "size-desc":
        return (
          compareDesc(getNodeSize(left), getNodeSize(right)) ||
          compareLocalizedNames(left.name, right.name)
        )
      case "size-asc":
        return (
          compareAsc(getNodeSize(left), getNodeSize(right)) ||
          compareLocalizedNames(left.name, right.name)
        )
      case "name-asc":
      default:
        return compareLocalizedNames(left.name, right.name)
    }
  })
}

