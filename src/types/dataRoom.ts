export interface BaseNode {
  id: string
  name: string
  normalizedName: string
  parentId: string | null
  type: "folder" | "file"
  createdAt: number
  updatedAt: number
}

export interface FolderNode extends BaseNode {
  type: "folder"
}

export interface FileNode extends BaseNode {
  type: "file"
  mimeType: string
  size: number
  extension: string
  blobId: string
}

export type DataRoomNode = FolderNode | FileNode

export type SortOption =
  | "name-asc"
  | "name-desc"
  | "updated-asc"
  | "updated-desc"
  | "size-asc"
  | "size-desc"

export type ViewMode = "list" | "grid"

export type FoldersPosition = "top" | "bottom"

export type TypeFilter = "all" | "folder" | "file"
