import { splitExtension } from "@/lib/nameHelpers"
import type { DataRoomNode } from "@/types/dataRoom"

export const getBaseName = (node: DataRoomNode): string =>
  node.type === "file" ? splitExtension(node.name).baseName : node.name