import type {ReactNode} from 'react';

type PageHeaderProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  children?: ReactNode;
};

export function PageHeader({
  title,
  description,
  icon,
  children,
}: PageHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 items-start gap-3">
        {icon ? (
          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            {icon}
          </div>
        ) : null}
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 text-[10px] text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {children ? (
        <div className="flex shrink-0 items-center gap-2">{children}</div>
      ) : null}
    </header>
  );
}
