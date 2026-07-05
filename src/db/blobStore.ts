import { openDB, type IDBPDatabase } from "idb"

import { isQuotaExceededError } from "@/lib/storageHelpers"

const DB_NAME: string = "data-room-blobs"
const STORE_NAME: string = "files"
const DB_VERSION: number = 1
const TEST_BLOB_ID: string = "__data-room-blob-test__"

const memoryBlobs = new Map<string, Blob>()
let useMemoryStore = false

export const setBlobStorageBackend = (memoryOnly: boolean): void => {
  useMemoryStore = memoryOnly

  if (memoryOnly) {
    memoryBlobs.clear()
  }
}

export const testBlobDbAccess = async (): Promise<void> => {
  const database = await getBlobDb()
  await database.put(STORE_NAME, new Blob(["test"]), TEST_BLOB_ID)
  await database.delete(STORE_NAME, TEST_BLOB_ID)
}

const getBlobDb = (): Promise<IDBPDatabase<unknown>> => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME)
      }
    },
  })
}

export const saveBlob = async (blobId: string, blob: Blob): Promise<void> => {
  if (useMemoryStore) {
    memoryBlobs.set(blobId, blob)
    return
  }

  try {
    const database = await getBlobDb()
    await database.put(STORE_NAME, blob, blobId)
  } catch (error) {
    if (isQuotaExceededError(error)) {
      throw new Error("Storage quota exceeded", { cause: error })
    }

    throw error
  }
}

export const getBlob = async (blobId: string): Promise<Blob | undefined> => {
  if (useMemoryStore) {
    return memoryBlobs.get(blobId)
  }

  const database = await getBlobDb()
  return database.get(STORE_NAME, blobId) as Promise<Blob | undefined>
}

export const deleteBlob = async (blobId: string): Promise<void> => {
  if (useMemoryStore) {
    memoryBlobs.delete(blobId)
    return
  }

  const database = await getBlobDb()
  await database.delete(STORE_NAME, blobId)
}

export const deleteBlobs = async (blobIds: string[]): Promise<void> => {
  await Promise.all(blobIds.map((blobId) => deleteBlob(blobId)))
}

export const getAllBlobIds = async (): Promise<string[]> => {
  if (useMemoryStore) {
    return [...memoryBlobs.keys()]
  }

  const database = await getBlobDb()
  return database.getAllKeys(STORE_NAME) as Promise<string[]>
}
