import { useState } from "react"
import { validateName } from "@/lib/nameHelpers"
import { useDataRoomStore } from "@/store/dataRoomStore"
import { toast } from "sonner"

interface UseCreateFolderResult {
  isOpen: boolean
  nodeName: string
  setNodeName: (nodeName: string) => void
  isDirty: boolean
  validation: ReturnType<typeof validateName>
  setIsDirty: (isDirty: boolean) => void
  handleOpenChange: (nextOpen: boolean) => void
  createNewFolder: () => void
}

export const useCreateFolder = (): UseCreateFolderResult => {
  const createFolder = useDataRoomStore((state) => state.createFolder)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [nodeName, setNodeName] = useState<string>("")
  const [isDirty, setIsDirty] = useState<boolean>(false)
  const validation = validateName(nodeName)

  const handleOpenChange = (nextOpen: boolean): void => {
    setIsOpen(nextOpen)
    if (!nextOpen) {
      setNodeName("")
      setIsDirty(false)
    }
  }

  const createNewFolder = (): void => {
    if (!validation.ok) {
      setIsDirty(true)
      return
    }

    try {
      const folder = createFolder(validation.value)
      toast.success(`${folder.name} created`)
      setNodeName("")
      handleOpenChange(false)
    } catch {
      toast.error("Failed to create folder")
    }
  }

  return {
    isOpen,
    nodeName,
    setNodeName,
    isDirty,
    validation,
    handleOpenChange,
    createNewFolder,
    setIsDirty,
  }
}