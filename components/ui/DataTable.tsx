import React from "react";
import { cn } from "@/lib/utils";
import { TableSkeleton } from "./Skeleton";
import { EmptyState } from "./EmptyState";

export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render?: (item: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function DataTable<T extends { id?: string }>({
  columns,
  data,
  isLoading = false,
  emptyTitle = "No records found",
  emptyDescription = "There are no entries recorded under this category yet.",
  emptyActionLabel,
  onEmptyAction,
  onRowClick,
  className,
}: DataTableProps<T>) {
  if (isLoading) {
    return <TableSkeleton rows={5} cols={columns.length} />;
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  }

  return (
    <div
      className={cn(
        "w-full overflow-x-auto border border-border rounded-sm bg-card",
        className
      )}
    >
      <table className="w-full text-left text-xs border-collapse">
        <thead className="border-b border-border bg-muted/30 sticky top-0 z-10">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn("p-3 micro-label font-medium select-none", col.className)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {data.map((item, idx) => (
            <tr
              key={item.id || idx}
              onClick={() => onRowClick && onRowClick(item)}
              className={cn(
                "transition-colors hover:bg-muted/30",
                onRowClick && "cursor-pointer"
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn("p-3 text-foreground align-middle", col.className)}
                >
                  {col.render
                    ? col.render(item)
                    : (item as any)[col.key] !== undefined &&
                      (item as any)[col.key] !== null
                    ? String((item as any)[col.key])
                    : "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
