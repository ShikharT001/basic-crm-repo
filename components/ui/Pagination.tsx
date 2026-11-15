import React from "react";
import { PaginationMeta } from "@/types/crm";
import { Button } from "./Button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  meta?: PaginationMeta;
  onPageChange: (newPage: number) => void;
  isLoading?: boolean;
}

export function Pagination({
  meta,
  onPageChange,
  isLoading = false,
}: PaginationProps) {
  if (!meta || meta.total_pages <= 1) return null;

  const { page, page_size, total_count, total_pages } = meta;
  const startItem = (page - 1) * page_size + 1;
  const endItem = Math.min(page * page_size, total_count);

  return (
    <div className="flex items-center justify-between px-3 py-3 border-t border-border bg-card/60 text-xs">
      <div className="text-muted-foreground font-mono text-[11px] tabular-nums">
        Showing <span className="text-foreground font-medium">{startItem}</span> to{" "}
        <span className="text-foreground font-medium">{endItem}</span> of{" "}
        <span className="text-foreground font-medium">{total_count}</span> records
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground font-mono text-[11px] mr-2">
          Page {page} of {total_pages}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-7 p-0"
          disabled={page <= 1 || isLoading}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-7 p-0"
          disabled={page >= total_pages || isLoading}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
