import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Search, X } from "lucide-react"
import { type RefObject } from "react"


interface DataRoomMobileSearchFieldProps {
  value: string
  onChange: (value: string) => void
  onFocus?: () => void
  inputRef?: RefObject<HTMLInputElement | null>
  className?: string
  inputClassName?: string
}

export function DataRoomMobileSearchField({
  value,
  onChange,
  onFocus,
  inputRef,
  className,
  inputClassName,
}: DataRoomMobileSearchFieldProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        className={cn(
          "h-11 border-0 bg-secondary pl-12 pr-11 text-base shadow-none",
          inputClassName,
        )}
        placeholder="Search in Data Room"
      />
      {value.length > 0 && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 size-5 -translate-y-1/2 cursor-pointer text-muted-foreground transition hover:text-foreground"
          type="button"
          aria-label="Clear search"
        >
          <X className="size-5" />
        </button>
      )}
    </div>
  )
}

