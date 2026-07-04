import type { DataRoomNode } from "@/types/dataRoom"

export const getChildren = (
  nodes: Record<string, DataRoomNode>,
  parentId: string | null,
): DataRoomNode[] => {
  return Object.values(nodes).filter((node) => node.parentId === parentId)
}

export const getPath = (
  nodes: Record<string, DataRoomNode>,
  folderId: string | null,
): DataRoomNode[] => {
  const path: DataRoomNode[] = []
  let currentId = folderId

  while (currentId) {
    const node = nodes[currentId]

    if (!node) {
      break
    }

    path.unshift(node)
    currentId = node.parentId
  }

  return path
}

const buildChildrenByParent = (
  nodes: Record<string, DataRoomNode>,
): Map<string | null, string[]> => {
  const childrenByParent = new Map<string | null, string[]>()

  for (const node of Object.values(nodes)) {
    const siblings = childrenByParent.get(node.parentId)
    if (siblings) {
      siblings.push(node.id)
    } else {
      childrenByParent.set(node.parentId, [node.id])
    }
  }

  return childrenByParent
}

export const getDescendantIds = (
  nodes: Record<string, DataRoomNode>,
  parentId: string,
): string[] => {
  const childrenByParent = buildChildrenByParent(nodes)
  const descendantIds: string[] = []
  const queue = [...(childrenByParent.get(parentId) ?? [])]

  while (queue.length > 0) {
    const id = queue.shift()

    if (!id) {
      continue
    }

    descendantIds.push(id)
    const children = childrenByParent.get(id)

    if (children) {
      queue.push(...children)
    }
  }

  return descendantIds
}

export const countDescendants = (
  nodes: Record<string, DataRoomNode>,
  folderId: string,
): { folders: number; files: number } => {
  const descendantIds = getDescendantIds(nodes, folderId)

  return descendantIds.reduce(
    (counts, id) => {
      const node = nodes[id]

      if (node?.type === "folder") {
        counts.folders += 1
      }

      if (node?.type === "file") {
        counts.files += 1
      }

      return counts
    },
    { folders: 0, files: 0 },
  )
}

export  const isPdf = async (file: File): Promise<boolean> => {
  const isPdfExtension = file.name.toLowerCase().endsWith(".pdf")
  if (file.type !== "application/pdf" && !isPdfExtension) return false
  const buffer = await file.slice(0, 5).arrayBuffer()
  const bytes = new Uint8Array(buffer)
  const signature = String.fromCharCode(...bytes)
  return signature === "%PDF-"
}
