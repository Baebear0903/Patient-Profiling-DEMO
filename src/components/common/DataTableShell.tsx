import type {ReactNode} from 'react';

import {cn} from '@/lib/utils';

type DataTableShellProps = {
  title?: string;
  description?: string;
  toolbar?: ReactNode;
  children: ReactNode;
  empty?: ReactNode;
  footer?: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function DataTableShell({
  title,
  description,
  toolbar,
  children,
  empty,
  footer,
  className,
  contentClassName,
}: DataTableShellProps) {
  const hasHeader = title || description || toolbar;
  const hasEmptyState =
    empty !== null && empty !== undefined && empty !== false;

  return (
    <section
      data-slot="data-table-shell"
      className={cn(
        'overflow-hidden rounded-lg border bg-card text-card-foreground',
        className,
      )}
    >
      {hasHeader ? (
        <div className="flex items-start justify-between gap-4 border-b px-4 py-3">
          <div className="min-w-0">
            {title ? <h2 className="font-medium">{title}</h2> : null}
            {description ? (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          {toolbar ? (
            <div className="flex shrink-0 items-center gap-2">{toolbar}</div>
          ) : null}
        </div>
      ) : null}
      {hasEmptyState ? (
        <div className="px-4 py-10 text-center">{empty}</div>
      ) : (
        <div
          data-slot="data-table-content"
          className={cn('overflow-x-auto', contentClassName)}
        >
          {children}
        </div>
      )}
      {footer ? <div className="border-t px-4 py-3">{footer}</div> : null}
    </section>
  );
}
