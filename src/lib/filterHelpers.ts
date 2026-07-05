import type { TypeFilter } from "@/types/dataRoom"

const FILTER_LABELS: Record<Exclude<TypeFilter, "all">, string> = {
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
