import { openDB } from "idb"

const DB_NAME: string = "data-room-blobs"
const STORE_NAME: string = "files"
const DB_VERSION: number = 1

const getBlobDb = (): Promise<any> => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME)
      }
    },
  })
}

export const saveBlob = async (blobId: string, blob: Blob): Promise<void> => {
  const database = await getBlobDb()
  await database.put(STORE_NAME, blob, blobId)
}

export const getBlob = async (blobId: string): Promise<Blob | undefined> => {
  const database = await getBlobDb()
  return database.get(STORE_NAME, blobId) as Promise<Blob | undefined>
}

export const deleteBlob = async (blobId: string): Promise<void> => {
  const database = await getBlobDb()
  await database.delete(STORE_NAME, blobId)
}

export const deleteBlobs = async (blobIds: string[]): Promise<void> => {
  await Promise.all(blobIds.map((blobId) => deleteBlob(blobId)))
}

export const getAllBlobIds = async (): Promise<string[]> => {
  const database = await getBlobDb()
  return database.getAllKeys(STORE_NAME) as Promise<string[]>
}
