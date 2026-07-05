# Manual Testing Plan: Data Room MVP

This plan will help ensure nothing is missed during manual testing on desktop and mobile devices. Mark completed items as you go.

## 1. Core Functionality (CRUD)

> **IMPORTANT**
> On mobile devices, pay attention to tap target sizes (buttons) and keyboard behavior when entering names.

### Folders

* [ ] Create: Create a folder, verify that it appears and a success toast is displayed.
* [ ] Rename: Change the folder name.
* [ ] Delete Empty Folder: Delete a folder, verify that it disappears and a success toast is displayed.

### Files

* [ ] Upload (via button): Select files through the standard file picker (on mobile — from the gallery or file manager).
* [ ] Image Upload: Upload `webp`, `png`, `jpg/jpeg`, and `tiff` files — verify that all supported formats are accepted and rendered correctly (`<img>`).
* [ ] Preview (PDF): Open a PDF file in the modal (if implemented) or verify correct rendering (`<iframe>`).
* [ ] Preview (Image): Open an image and verify that it is displayed correctly.
* [ ] Delete: Delete a file.

## 2. Edge Cases — Critical!

> **WARNING**
> These test cases verify application robustness and are essential according to the requirements.

### Names and Duplicates

* [ ] Duplicate Creation: Create a new folder/file with a name that already exists in the current directory. A suffix should be automatically added (e.g., `Report (1)`).
* [ ] Upload Conflicts: Upload a file with a name that already exists. A conflict dialog (Overwrite / Copy / Cancel) should appear. Test every option.
* [ ] Empty Name Validation: Attempt to save a folder/file with the name `""` or `"   "`. The save button should be disabled or an error should be shown.
* [ ] Trim Names: Enter a name like `"  My Folder  "`. It should automatically be trimmed to `"My Folder"`.
* [ ] Long Names: Create a file/folder with a name longer than 255 characters (validation error expected) or simply a very long name. The UI should truncate it correctly using ellipsis (`text-overflow: ellipsis`) and display a tooltip on hover.
* [ ] Case-Only Rename: Rename `Report` to `report`. This should not trigger a duplicate conflict (the current node must be excluded from validation).

### Files: Formats and Integrity

* [ ] Upload Non-PDF and Non-Image Files: Upload a `.txt` or `.docx` file. An error toast should appear and the file should be skipped.
* [ ] File with Fake Extension: Rename a `.txt` file to `.pdf` and upload it. Magic byte validation (`%PDF`) should reject the file.
* [ ] Zero-Byte File: Upload an empty file (0 KB). It should be caught by `isEmptyFile()` and show an error toast before any further validation.
* [ ] File Size Boundary: Upload a file exactly 3 MB (should succeed) and a file of 3 MB + 1 byte (should be rejected with an error toast).

### Multi-Upload

* [ ] Errors During Multi-Upload: Select multiple files at once, including one invalid file (e.g., unsupported format or oversized). The invalid file should trigger an error toast, while all valid files must still upload successfully.

### Cascade Deletion

* [ ] Delete Non-Empty Folder:

  * Place 2 subfolders and 3 files inside a folder.
  * Click delete.
  * The exact message `"This folder contains 2 folders, 3 files"` should appear.
  * Verify that IndexedDB data is removed as well (check via DevTools → Application → IndexedDB).

## 3. Navigation and Display

> **TIP**
> Try changing settings and immediately refreshing the page (F5) — all preferences should persist.

* [ ] Breadcrumbs: Navigate several levels deep into folders. Click a middle breadcrumb item — it should correctly navigate to that level.
* [ ] Context Menu: Verify it works both via right-click (desktop) and via the `...` icon (mobile).
* [ ] Empty State: Verify that an empty folder displays a placeholder state instead of a blank screen.
* [ ] Sorting: Test all 6 sorting options (Name ↑↓, Updated ↑↓, Size ↑↓). Verify that folders and files are sorted correctly.
* [ ] Filtering: Switch between All / Folder / File / Image. Verify that irrelevant items are hidden.
* [ ] Folder Position: Verify the "Folders Top / Bottom" setting.
* [ ] View Modes (Grid / List): Switch between view modes. Verify that the layout does not break on narrow mobile screens.
* [ ] Non-Existent `folderId` in URL: Manually enter a non-existent folder id in the URL (`?folder=fake-id`) and refresh the page. The application should reset to the root folder.
