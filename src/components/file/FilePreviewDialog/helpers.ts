import { type RefObject } from "react"

export const revokeObjectUrl = (objectUrlRef: RefObject<string | null>): void => {
  if (objectUrlRef.current) {
    URL.revokeObjectURL(objectUrlRef.current)
    objectUrlRef.current = null
  }
}
