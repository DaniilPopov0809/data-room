import type { TypeFilter } from "@/types/dataRoom"

export const FILTER_LABELS: Record<TypeFilter, string> = {
  all: "All",
  folder: "Folders",
  file: "Files",
  image: "Images",
}

export const getTypeFilterLabel = (typeFilter: TypeFilter): string | null => {
  if (typeFilter === "all") {
    return null
  }

  return FILTER_LABELS[typeFilter]
}
