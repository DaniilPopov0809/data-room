🇬🇧 English | [🇺🇦 Українська](./README.uk.md)

# Data Room MVP

A virtual Data Room for secure document storage and organization. The project is implemented as a Single Page Application (SPA) as part of a technical assessment.

---

## Quick Start

```bash
pnpm install
pnpm dev
```

The application will be available at [http://localhost:5173](http://localhost:5173).

### Available Commands

| Command | Description |
|---------|-------------|
| `pnpm build` | Build the production bundle |
| `pnpm preview` | Preview the production build |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Format the code with Prettier |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui (Radix UI, Sera preset) |
| Icons | Lucide React |
| Global State | Zustand with `persist` middleware |
| Metadata Storage | IndexedDB via `idb-keyval` |
| File Storage | IndexedDB via `idb` |
| Notifications | Sonner |
| Fonts | Noto Sans, Playfair Display (variable fonts) |

---

## Architecture & Key Design Decisions

### Why IndexedDB Instead of a Real Backend

The assignment allows using mock storage. IndexedDB was chosen over `localStorage` and `sessionStorage` for several reasons:

1. **No 5 MB storage limit.** `localStorage` is unsuitable for binary data. IndexedDB stores `Blob` objects directly while the browser manages storage quotas automatically.
2. **Asynchronous API.** IndexedDB operations are non-blocking, unlike synchronous `localStorage`.
3. **Separation of metadata and binary data.** Node metadata (name, size, type, timestamps) is stored through `idb-keyval` and serialized as JSON. Actual `Blob` objects are stored separately in IndexedDB via `idb` using a unique `blobId`. Zustand stores only metadata and blob references, never binary data, preventing unnecessary UI freezes during rendering.
4. **Persistence across sessions.** Data remains available after page reloads without requiring any backend infrastructure.

### Normalized Flat Data Structure

All folders and files are stored in a single `Record<string, DataRoomNode>` inside Zustand. Relationships between nodes are established through the `parentId: string | null` field (`null` represents the root).

This approach:

- simplifies recursive deletion (`getDescendantIds` performs an iterative graph traversal);
- avoids deep cloning of nested trees during updates;
- scales well when implementing global search or filtering.

### Separation of Responsibilities

```text
store/dataRoomStore.ts   → node metadata and UI state (sorting, view, filters)
store/conflictStore.ts   → filename conflict dialog queue (non-persistent)
db/blobStore.ts          → single entry point for IndexedDB (idb)
lib/*Helpers.ts          → pure business logic independent of React
```

Components call helper functions from `lib/` and remain free of business logic.

### URL Synchronization

`useUrlSync` synchronizes navigation and UI preferences with query parameters:

```text
?folder=<id>&sort=name-asc&view=grid&filter=all&folders=top
```

Browser Back/Forward navigation (`popstate`) is fully supported.

Navigating between folders creates a new history entry (`pushState`), while changing view or sorting options updates the current entry (`replaceState`).

### Garbage Collector

Every time the store is hydrated, `runGarbageCollector` compares `blobId`s referenced in metadata with actual IndexedDB entries and removes orphaned blobs.

This prevents abandoned files from accumulating, for example if the browser tab is closed during a partial delete operation.

---

## File Upload

### Supported Formats

Currently, **only PDF files** are supported.

### PDF Signature Validation

The application validates not only the MIME type but also the **magic bytes** of each uploaded file.

The first four bytes are checked against the PDF signature (`%PDF`, hex `25 50 44 46`), preventing files with a renamed `.pdf` extension from being accepted.

### File Size Limit

The maximum allowed file size is **3 MB**.

This limit helps stay within browser storage quotas. If a file exceeds the limit, an error toast is displayed while the remaining files continue uploading.

### Multiple File Upload

Each file is processed independently.

A failure affecting one file (invalid format, oversized file, or IndexedDB write error) does not interrupt uploads of the remaining files.

Every processed file generates its own toast notification.

---

## Error Handling

### Error Boundary

The application is wrapped in an `ErrorBoundary` (`src/components/layout/ErrorBoundary.tsx`).

If an unhandled exception occurs anywhere in the component tree, users see an error screen with a **Reload Page** button instead of a blank screen.

This is particularly useful for IndexedDB hydration failures or corrupted stored data.

### Filename Conflict Resolution

When uploading a file whose name already exists in the current folder, a dialog presents three options:

- **Overwrite** — replaces the existing file and removes its old `Blob` from IndexedDB.
- **Keep Both** — uploads a duplicate using an automatically generated suffix such as `report (1).pdf`.
- **Cancel** — skips the file.

Dialogs are queued through `conflictStore`, with each dialog returning a `Promise<ConflictDecision>` that resolves only after user interaction.

---

## Features

### Folders

- ✅ Create folders with name validation (empty names, whitespace-only names, names longer than 255 characters)
- ✅ Unlimited nesting depth
- ✅ Rename with automatic duplicate resolution
- ✅ Recursive deletion of nested content with a toast summarizing the number of deleted items

### Files

- ✅ Upload via drag-and-drop or file picker
- ✅ Built-in PDF preview
- ✅ Rename while preserving the file extension
- ✅ Download via `URL.createObjectURL`
- ✅ Delete files and clean up associated blobs in IndexedDB

### User Interface

- ✅ Grid and list views
- ✅ Sorting by name, last updated date, or file size (ascending/descending)
- ✅ Filtering by type (all / folders / files)
- ✅ Option to keep folders on top or mixed with files
- ✅ Clickable breadcrumb navigation
- ✅ Right-click context menus
- ✅ Empty folder state (`EmptyState`)
- ✅ Toast notifications after every action
- ✅ Long filenames displayed with `text-overflow: ellipsis` and tooltips
- ✅ URL-synchronized UI state

---

## Project Structure

```text
src/
  components/
    data-room/    # container, toolbar, breadcrumbs, empty state
    file/         # upload, dropzone, PDF preview
    folder/       # create folder dialog
    node/         # card, context menu, rename/delete dialogs
    layout/       # AppShell, ErrorBoundary

  store/
    dataRoomStore.ts   # metadata + UI state (Zustand + idb-keyval)
    conflictStore.ts   # filename conflict queue

  db/
    blobStore.ts       # single IndexedDB entry point

  hooks/
    useCurrentFolder.ts
    useFileUpload.ts
    useUrlSync.ts
    useDebounce.ts
    useMediaQuery.ts

  lib/
    nodeHelpers.ts     # getChildren, getDescendantIds, isPdf
    nameHelpers.ts     # validateName, resolveDuplicateName, splitExtension
    sortHelpers.ts     # sortNodes
    formatHelpers.ts   # formatFileSize, formatDate
    downloadHelper.ts  # downloadNode

  types/
    dataRoom.ts        # FolderNode, FileNode, DataRoomNode, SortOption, ...
```

---

## Data Model

A normalized flat storage structure where relationships are defined via `parentId`.

```ts
interface BaseNode {
  id: string
  name: string
  normalizedName: string   // lowercase + trimmed for case-insensitive comparisons
  parentId: string | null  // null = root
  type: "folder" | "file"
  createdAt: number
  updatedAt: number
}

interface FileNode extends BaseNode {
  type: "file"
  mimeType: string
  size: number
  extension: string  // e.g. "pdf"
  blobId: string     // IndexedDB key; Blob itself is never stored in Zustand
}
```

---

## Edge Cases Covered

| Scenario | Behavior |
|----------|----------|
| Duplicate filename during creation/upload | Automatically generates `name (1).pdf` |
| Non-PDF upload | Error toast; file is skipped |
| Fake PDF extension | Rejected after magic-byte validation |
| File larger than 3 MB | Error toast; file is skipped |
| Deleting a folder with nested content | Confirmation dialog showing the exact number of affected items; recursive deletion |
| Empty or whitespace-only names | Validation prevents confirmation |
| Name longer than 255 characters | Validation error |
| Renaming to an existing name | Automatic duplicate resolution |
| Invalid `folderId` in the URL after reload | Falls back to the root folder |
| One file fails during multi-file upload | Remaining files continue uploading |
| Browser tab closed during upload | Garbage collector removes orphaned blobs on the next application startup |