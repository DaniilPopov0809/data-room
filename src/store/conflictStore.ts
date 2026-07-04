import { create } from "zustand"

export type ConflictDecision = "overwrite" | "copy" | "cancel"

interface ConflictRequest {
  id: string
  fileName: string
  resolve: (decision: ConflictDecision) => void
}

interface ConflictState {
  pendingConflicts: ConflictRequest[]
  promptConflict: (fileName: string) => Promise<ConflictDecision>
  resolveConflict: (id: string, decision: ConflictDecision) => void
}

export const useConflictStore = create<ConflictState>((set) => ({
  pendingConflicts: [],
  promptConflict: (fileName) => {
    return new Promise<ConflictDecision>((resolve) => {
      const id = crypto.randomUUID()
      set((state) => ({
        pendingConflicts: [...state.pendingConflicts, { id, fileName, resolve }],
      }))
    })
  },
  resolveConflict: (id, decision) => {
    set((state) => {
      const conflict = state.pendingConflicts.find((c) => c.id === id)
      if (conflict) {
        conflict.resolve(decision)
      }
      return {
        pendingConflicts: state.pendingConflicts.filter((c) => c.id !== id),
      }
    })
  },
}))
