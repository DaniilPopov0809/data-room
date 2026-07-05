import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface NodeNameProps {
  name: string
  className?: string
}

export function NodeName({ name, className = "truncate text-sm font-medium" }: NodeNameProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span dir="auto" className={className}>
          {name}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs break-words">
        <span dir="auto">{name}</span>
      </TooltipContent>
    </Tooltip>
  )
}
