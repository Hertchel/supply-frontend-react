import {
  ArrowDownIcon,
  ArrowUpIcon,
  CaretSortIcon,
  EyeNoneIcon,
} from "@radix-ui/react-icons"
import { Column } from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>
  }

  return (
    <div
      className={cn(
        "flex items-center space-x-1 sm:space-x-2",
        "text-[clamp(0.75rem,1.5vh,1rem)]",
        className
      )}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="
              -ml-2 sm:-ml-3
              h-7 sm:h-8
              px-2 sm:px-3
              text-[clamp(0.75rem,1.5vh,1rem)]
              data-[state=open]:bg-accent
            "
          >
            <span className="truncate max-w-[100px] sm:max-w-none">
              {title}
            </span>

            {column.getIsSorted() === "desc" ? (
              <ArrowDownIcon className="ml-1 sm:ml-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUpIcon className="ml-1 sm:ml-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />
            ) : (
              <CaretSortIcon className="ml-1 sm:ml-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="text-sm sm:text-base">
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <ArrowUpIcon className="mr-2 h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground/70" />
            Asc
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <ArrowDownIcon className="mr-2 h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground/70" />
            Desc
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
            <EyeNoneIcon className="mr-2 h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground/70" />
            Hide
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
