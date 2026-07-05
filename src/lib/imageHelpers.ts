export const validateImageBlob = async (
  blob: Blob,
): Promise<{ ok: true } | { ok: false; error: string }> => {
  if (blob.size === 0) {
    return { ok: false, error: "File is empty (0 bytes)" }
  }

  const buffer = await blob.slice(0, 12).arrayBuffer()
  const bytes = new Uint8Array(buffer)

  if (bytes.length < 3) {
    return { ok: false, error: "Invalid image format (too small)" }
  }

  // Check PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4E &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0D &&
    bytes[5] === 0x0A &&
    bytes[6] === 0x1A &&
    bytes[7] === 0x0A
  ) {
    return { ok: true }
  }

  // Check JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { ok: true }
  }

  // Check WebP: RIFF (52 49 46 46) ... WEBP (57 45 42 50)
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return { ok: true }
  }

  // Check TIFF: II* (49 49 2A 00) or MM* (4D 4D 00 2A)
  if (
    bytes.length >= 4 &&
    ((bytes[0] === 0x49 && bytes[1] === 0x49 && bytes[2] === 0x2a && bytes[3] === 0x00) ||
      (bytes[0] === 0x4d && bytes[1] === 0x4d && bytes[2] === 0x00 && bytes[3] === 0x2a))
  ) {
    return { ok: true }
  }

  return { ok: false, error: "Invalid image format (signature mismatch)" }
}
