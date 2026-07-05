const PDF_SIGNATURE = "%PDF-"
const PDF_EOF_MARKER = "%%EOF"

export const validatePdfBlob = async (
  blob: Blob,
): Promise<{ ok: true } | { ok: false; error: string }> => {
  if (blob.size === 0) {
    return { ok: false, error: "File is empty (0 bytes)" }
  }

  const headSize: number = Math.min(PDF_SIGNATURE.length, blob.size)
  const headBytes: Uint8Array = new Uint8Array(await blob.slice(0, headSize).arrayBuffer())
  const signature: string = String.fromCharCode(...headBytes)

  if (signature !== PDF_SIGNATURE) {
    return { ok: false, error: "Invalid PDF format" }
  }

  const tailSize: number = Math.min(1024, blob.size)
  const tailBytes: Uint8Array = new Uint8Array(await blob.slice(blob.size - tailSize).arrayBuffer())
  const tailText: string = new TextDecoder("latin1").decode(tailBytes)

  if (!tailText.includes(PDF_EOF_MARKER)) {
    return { ok: false, error: "PDF appears corrupted or incomplete" }
  }

  return { ok: true }
}
