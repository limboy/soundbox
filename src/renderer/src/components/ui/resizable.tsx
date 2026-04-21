import { GripVerticalIcon } from "lucide-react"
import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "@/lib/utils"

function ResizablePanelGroup({
  className,
  ...props
}: ResizablePrimitive.GroupProps) {
  return (
    <ResizablePrimitive.Group
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full aria-[orientation=vertical]:flex-col",
        className
      )}
      {...props}
    />
  )
}

function ResizablePanel({ className, ...props }: ResizablePrimitive.PanelProps) {
  return (
    <ResizablePrimitive.Panel
      data-slot="resizable-panel"
      className={cn("flex flex-col min-h-0", className)}
      style={{ ...props.style, height: '100%' }}
      {...props}
    />
  )
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: ResizablePrimitive.SeparatorProps & {
  withHandle?: boolean
}) {
  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      className={cn(
        "relative flex w-1 h-full items-center justify-center bg-transparent transition-all group focus-visible:outline-none aria-[orientation=horizontal]:h-1 aria-[orientation=horizontal]:w-full",
        className
      )}
      {...props}
    >
      <div className="z-10 h-full w-px bg-border transition-all group-hover:w-0.5 group-hover:bg-primary/60 group-active:w-0.5 group-active:bg-primary/60 aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full group-hover:aria-[orientation=horizontal]:h-0.5 group-active:aria-[orientation=horizontal]:h-0.5" />
      {withHandle && (
        <div className="z-20 flex h-4 w-3 items-center justify-center rounded-xs border bg-border">
          <GripVerticalIcon className="size-2.5" />
        </div>
      )}
    </ResizablePrimitive.Separator>
  )
}

export { ResizableHandle, ResizablePanel, ResizablePanelGroup }
