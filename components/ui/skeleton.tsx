import * as React from "react"
import { cn } from "cn"

function Skeleton({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-slate-200 dark:bg-slate-700/90", className)}
      {...props}
    />
  )
}

export { Skeleton }
