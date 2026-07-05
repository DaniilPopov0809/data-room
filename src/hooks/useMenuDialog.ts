import { useRef, useState } from "react"

interface UseMenuDialogReturn {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  handleOpenChange: (nextOpen: boolean) => void
  handleBeforeDialogOpen: () => void
  handleCloseMenu: () => void
}

export const useMenuDialog = (): UseMenuDialogReturn => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const isDialogOpenRef = useRef<boolean>(false)

  const handleOpenChange = (nextOpen: boolean): void => {
    if (!nextOpen && isDialogOpenRef.current) return
    setIsOpen(nextOpen)
  }

  const handleBeforeDialogOpen = (): void => {
    isDialogOpenRef.current = true
  }

  const handleCloseMenu = (): void => {
    isDialogOpenRef.current = false
    setIsOpen(false)
  }

  return {
    isOpen,
    setIsOpen,
    handleOpenChange,
    handleBeforeDialogOpen,
    handleCloseMenu,
  }
}
