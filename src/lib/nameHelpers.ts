import type { DataRoomNode } from "@/types/dataRoom"

const MAX_NAME_LENGTH: number = 255

export const normalizeName = (name: string): string => {
  return name.trim().toLowerCase()
}

export const validateName = (
  name: string,
): { ok: true; value: string } | { ok: false; error: string } => {
  const trimmedName: string = name.trim()

  if (!trimmedName) {
    return { ok: false, error: "Name is required" }
  }

  if (trimmedName.length > MAX_NAME_LENGTH) {
    return { ok: false, error: "Name must be 255 characters or fewer" }
  }

  return { ok: true, value: trimmedName }
}

export const splitExtension = (name: string): { baseName: string; extension: string } => {
  const lastDotIndex: number = name.lastIndexOf(".")

  if (lastDotIndex <= 0 || lastDotIndex === name.length - 1) {
    return { baseName: name, extension: "" }
  }

  return {
    baseName: name.slice(0, lastDotIndex),
    extension: name.slice(lastDotIndex + 1),
  }
}

export const resolveDuplicateName = (
  name: string,
  siblings: DataRoomNode[],
  ignoreNodeId?: string,
): string => {
  const siblingNames: Set<string> = new Set(
    siblings.filter((node) => node.id !== ignoreNodeId).map((node) => node.normalizedName),
  )

  if (!siblingNames.has(normalizeName(name))) {
    return name
  }

  const { baseName, extension } = splitExtension(name)

  for (let index: number = 1; index < 10_000; index += 1) {
    const candidate: string = extension
      ? `${baseName} (${index}).${extension}`
      : `${baseName} (${index})`

    if (!siblingNames.has(normalizeName(candidate))) {
      return candidate
    }
  }

  return name
}
