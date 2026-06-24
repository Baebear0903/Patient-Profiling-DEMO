import {ChevronLeftIcon, ChevronRightIcon} from 'lucide-react';

import {Button} from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from '@/components/ui/pagination';

type CompactPaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
};

function toInteger(value: number, fallback: number) {
  return Number.isFinite(value) ? Math.trunc(value) : fallback;
}

export function CompactPagination({
  page,
  pageSize,
  total,
  onPageChange,
}: CompactPaginationProps) {
  const safeTotal = Math.max(0, toInteger(total, 0));
  const safePageSize = Math.max(1, toInteger(pageSize, 1));
  const totalPages = Math.max(1, Math.ceil(safeTotal / safePageSize));
  const currentPage = Math.min(
    totalPages,
    Math.max(1, toInteger(page, 1)),
  );
  const hasMultiplePages = totalPages > 1;

  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="shrink-0 text-muted-foreground">共 {safeTotal} 条</span>
      {hasMultiplePages ? (
        <Pagination className="mx-0 w-auto justify-end">
          <PaginationContent>
            <PaginationItem>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="上一页"
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
              >
                <ChevronLeftIcon />
              </Button>
            </PaginationItem>
            <PaginationItem>
              <span
                className="flex h-7 min-w-16 items-center justify-center px-2 text-xs text-muted-foreground"
                aria-current="page"
              >
                {currentPage} / {totalPages}
              </span>
            </PaginationItem>
            <PaginationItem>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="下一页"
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(currentPage + 1)}
              >
                <ChevronRightIcon />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}
    </div>
  );
}
