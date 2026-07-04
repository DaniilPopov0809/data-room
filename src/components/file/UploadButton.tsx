import { cloneElement, useRef, type ReactElement } from "react"
import { useFileUpload } from "@/hooks/useFileUpload"
import { useDataRoomStore } from "@/store/dataRoomStore"

interface UploadButtonProps {
  trigger: ReactElement<{ disabled?: boolean }>
}

export function UploadButton({ trigger }: UploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { uploadFiles } = useFileUpload()
  const isUploading = useDataRoomStore((state) => state.isUploading)

  return (
    <>
      <div
        onClick={() => {
          if (!isUploading) {
            inputRef.current?.click()
          }
        }}
        className="flex-1 flex items-center justify-center"
      >
        {cloneElement(trigger, { disabled: isUploading })}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        multiple
        disabled={isUploading}
        className="hidden"
        onChange={(event) => {
          if (event.target.files) {
            void uploadFiles(event.target.files)
          }
          event.target.value = ""
        }}
      />
    </>
  )
}
