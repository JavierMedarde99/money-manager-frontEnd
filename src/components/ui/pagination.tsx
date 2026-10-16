import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = React.useMemo(() => {
    const items: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) items.push(i);
    } else {
      items.push(1);
      if (currentPage > 3) items.push("...");
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        items.push(i);
      }
      if (currentPage < totalPages - 2) items.push("...");
      items.push(totalPages);
    }
    return items;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-1 mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Página anterior"
        className="h-8 px-2 sm:h-9 sm:px-3 rounded-full text-sm font-medium hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all inline-flex items-center justify-center gap-1"
      >
        <ChevronLeft aria-hidden="true" className="h-4 w-4" />
        <span className="hidden sm:inline">Anterior</span>
      </button>
      {pages.map((page, i) =>
        page === "..." ? (
          <span
            key={`dots-${i}`}
            className="h-8 sm:h-9 px-1 sm:px-2 text-sm text-muted-foreground"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              "h-8 w-8 sm:h-9 sm:w-9 rounded-full text-sm font-medium transition-all",
              page === currentPage
                ? "bg-primary text-white shadow-primary"
                : "hover:bg-muted"
            )}
          >
            {page}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Página siguiente"
        className="h-8 px-2 sm:h-9 sm:px-3 rounded-full text-sm font-medium hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all inline-flex items-center justify-center gap-1"
      >
        <span className="hidden sm:inline">Siguiente</span>
        <ChevronRight aria-hidden="true" className="h-4 w-4" />
      </button>
    </div>
  );
}

export { Pagination };
