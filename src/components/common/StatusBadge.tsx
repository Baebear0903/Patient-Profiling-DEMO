import {Badge} from '@/components/ui/badge';
import {cn} from '@/lib/utils';

const statusStyles: Record<string, string> = {
  已发布: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  已启用: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  运行中: 'border-blue-200 bg-blue-50 text-blue-700',
  草稿: 'border-slate-200 bg-slate-50 text-slate-600',
  已停用: 'border-slate-200 bg-slate-100 text-slate-500',
  待处理: 'border-red-200 bg-red-50 text-red-700',
  处理中: 'border-amber-200 bg-amber-50 text-amber-700',
  已处理: 'border-emerald-200 bg-emerald-50 text-emerald-700',
};

type StatusBadgeProps = {
  status: string;
  className?: string;
};

export function StatusBadge({status, className}: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        statusStyles[status] ??
          'border-slate-200 bg-slate-50 text-slate-700',
        className,
      )}
    >
      {status}
    </Badge>
  );
}
