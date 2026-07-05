import { useEffect } from "react"
import { toast } from "sonner"

import { setBlobStorageBackend, testBlobDbAccess } from "@/db/blobStore"
import { checkStorageAvailability } from "@/lib/storageHelpers"
import { configureMetadataStorage, useDataRoomStore } from "@/store/dataRoomStore"

export const useStorageInit = (): void => {
  const isHydrated = useDataRoomStore((state) => state.isHydrated)
  const setStorageAvailability = useDataRoomStore((state) => state.setStorageAvailability)

  useEffect(() => {
    if (!isHydrated) {
      return
    }

    const initStorage = async (): Promise<void> => {
      const availability = await checkStorageAvailability(testBlobDbAccess)
      setStorageAvailability(availability)

      if (!availability.canUseIndexedDb) {
        configureMetadataStorage({ disablePersist: true })
        setBlobStorageBackend(true)
      }

      if (availability.warning) {
        toast.warning(availability.warning, { id: "storage-warning" })
      }
    }

    void initStorage()
  }, [isHydrated, setStorageAvailability])
}
