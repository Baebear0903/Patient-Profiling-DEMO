import {useEffect, useRef, useState} from 'react';
import {useLocalStorage} from '@/hooks/use-local-storage';
import {
  Filter,
  MessageSquare,
  Plus,
  Search,
  Send,
  Smartphone,
  Users,
  X,
} from 'lucide-react';
import {useLocation, useNavigate} from 'react-router-dom';
import {toast} from 'sonner';

import {DataTableShell} from '@/components/common/DataTableShell';
import {PageHeader} from '@/components/common/PageHeader';
import {StatusBadge} from '@/components/common/StatusBadge';
import {Button} from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {isTouchpointCreateRouteState} from '@/lib/route-state';
import {cn} from '@/lib/utils';

interface TouchpointTask {
  id: string;
  name: string;
  snapshotName: string;
  patientCount: number;
  channel: 'SMS' | 'WeChat' | 'AppPush';
  status: 'Draft' | 'Running' | 'Completed';
  createdAt: string;
  operator: string;
}

const initialTasks: TouchpointTask[] = [
  {
    id: 'TP-20260612-01',
    name: '高危气虚质复诊提醒',
    snapshotName: '气虚质+多病不适长未复诊人群',
    patientCount: 1250,
    channel: 'WeChat',
    status: 'Completed',
    createdAt: '2026-06-12 10:30',
    operator: 'Admin',
  },
  {
    id: 'TP-20260614-02',
    name: '三伏贴适用人群夏季推文',
    snapshotName: '阳虚质/寒湿体质人群快照',
    patientCount: 3400,
    channel: 'AppPush',
    status: 'Running',
    createdAt: '2026-06-14 09:15',
    operator: '张医生',
  },
];

const channelOptions: Array<{
  value: TouchpointTask['channel'];
  label: string;
}> = [
  {value: 'SMS', label: '短信'},
  {value: 'WeChat', label: '微信服务号'},
  {value: 'AppPush', label: 'APP/小程序'},
];

const statusPresentation: Record<
  TouchpointTask['status'],
  {label: string; className: string}
> = {
  Draft: {
    label: '待发布',
    className: 'border-slate-200 bg-slate-50 text-slate-600',
  },
  Running: {
    label: '执行中',
    className: 'border-sky-200 bg-sky-50 text-sky-700',
  },
  Completed: {
    label: '已完成',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
};

function isTouchpointChannel(value: string): value is TouchpointTask['channel'] {
  return channelOptions.some((option) => option.value === value);
}

function ChannelLabel({channel}: {channel: TouchpointTask['channel']}) {
  if (channel === 'SMS') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-slate-600">
        <MessageSquare className="size-3 text-blue-500" />
        短信
      </span>
    );
  }
  if (channel === 'WeChat') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-slate-600">
        <MessageSquare className="size-3 text-green-500" />
        微信服务号
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-slate-600">
      <Smartphone className="size-3 text-blue-500" />
      院内APP/小程序
    </span>
  );
}

export function TouchpointView() {
  const location = useLocation();
  const navigate = useNavigate();
  const consumedStateRef = useRef<unknown>(null);
  const createTaskTriggerRef = useRef<HTMLButtonElement>(null);
  const taskNameRef = useRef<HTMLInputElement>(null);
  const [tasks, setTasks] = useLocalStorage<TouchpointTask[]>('touchpoint_tasks', initialTasks);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [snapshotLocked, setSnapshotLocked] = useState(false);
  const [searchKw, setSearchKw] = useState('');
  const [newTask, setNewTask] = useState<Partial<TouchpointTask>>({
    name: '',
    snapshotName: '',
    patientCount: 0,
    channel: 'SMS',
  });

  useEffect(() => {
    const state = location.state;
    if (state === null || consumedStateRef.current === state) {
      return;
    }

    consumedStateRef.current = state;
    navigate(location.pathname, {replace: true, state: null});
    if (!isTouchpointCreateRouteState(state)) {
      return;
    }

    setNewTask({
      name: `${state.snapshotName} 触达计划`,
      snapshotName: state.snapshotName,
      patientCount: state.patientCount,
      channel: 'SMS',
    });
    setSnapshotLocked(true);
    setIsCreateModalOpen(true);
  }, [location.pathname, location.state, navigate]);

  const openManualCreate = () => {
    setNewTask({
      name: '',
      snapshotName: '',
      patientCount: 0,
      channel: 'SMS',
    });
    setSnapshotLocked(false);
    setIsCreateModalOpen(true);
  };

  const handleCreate = () => {
    const task: TouchpointTask = {
      id: `TP-${new Date().toISOString().replace(/\D/g, '').slice(0, 14)}`,
      name: newTask.name?.trim() || '未命名触达任务',
      snapshotName: newTask.snapshotName?.trim() || '未知群体',
      patientCount: newTask.patientCount ?? 0,
      channel: newTask.channel ?? 'SMS',
      status: 'Draft',
      createdAt: new Date().toLocaleString('zh-CN', {hour12: false}),
      operator: 'Admin',
    };

    setTasks((current) => [task, ...current]);
    setIsCreateModalOpen(false);
    toast.success('任务创建成功');
  };

  const normalizedSearch = searchKw.trim().toLowerCase();
  const filteredTasks = tasks.filter(
    (task) =>
      !normalizedSearch ||
      task.name.toLowerCase().includes(normalizedSearch) ||
      task.snapshotName.toLowerCase().includes(normalizedSearch),
  );

  const toolbar = (
    <>
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
        <Input
          aria-label="搜索触达任务"
          className="h-8 w-64 bg-white pl-8 text-xs"
          placeholder="搜索任务名称/人群快照..."
          value={searchKw}
          onChange={(event) => setSearchKw(event.target.value)}
        />
      </div>
      <Button type="button" variant="outline" size="sm">
        <Filter />
        筛选任务
      </Button>
    </>
  );

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <PageHeader
        title="触达运营中心"
        description="基于人群快照进行患者消息触达、随访与健康干预计划管理。"
        icon={<Send />}
      >
        <Button
          ref={createTaskTriggerRef}
          type="button"
          size="sm"
          onClick={openManualCreate}
        >
          <Plus />
          创建触达任务
        </Button>
      </PageHeader>

      <DataTableShell
        title="触达任务"
        description="管理患者消息触达、随访与健康干预任务"
        toolbar={toolbar}
        className="flex min-h-0 flex-1 flex-col shadow-sm"
        contentClassName="min-h-0 flex-1 overflow-hidden [&_[data-slot=table-container]]:h-full [&_[data-slot=table-container]]:overflow-auto"
        footer={
          <span className="text-[10px] text-muted-foreground">
            共计 {filteredTasks.length} 条数据记录
          </span>
        }
      >
        <Table aria-label="触达任务列表" className="min-w-[920px]">
          <TableHeader className="sticky top-0 z-10 bg-white">
            <TableRow>
              <TableHead className="px-4 text-[10px] uppercase text-slate-400">
                任务名称 / 编号
              </TableHead>
              <TableHead className="px-4 text-[10px] uppercase text-slate-400">
                目标人群快照
              </TableHead>
              <TableHead className="px-4 text-[10px] uppercase text-slate-400">
                触达渠道
              </TableHead>
              <TableHead className="px-4 text-[10px] uppercase text-slate-400">
                状态进展
              </TableHead>
              <TableHead className="px-4 text-[10px] uppercase text-slate-400">
                创建信息
              </TableHead>
              <TableHead className="px-4 text-right text-[10px] uppercase text-slate-400">
                操作
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-sm text-slate-400"
                >
                  暂无匹配任务记录
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task) => {
                const status = statusPresentation[task.status];
                return (
                  <TableRow key={task.id}>
                    <TableCell className="px-4 py-3">
                      <div className="text-sm font-semibold text-slate-800">
                        {task.name}
                      </div>
                      <div className="mt-0.5 font-mono text-[10px] text-slate-400">
                        {task.id}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="inline-flex rounded border border-slate-200 bg-slate-100/70 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                        {task.snapshotName}
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">
                        <Users className="size-3" />
                        {task.patientCount} 人
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <ChannelLabel channel={task.channel} />
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <StatusBadge
                        status={status.label}
                        className={status.className}
                      />
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="text-[11px] text-slate-600">
                        {task.createdAt}
                      </div>
                      <div className="mt-0.5 text-[10px] text-slate-400">
                        {task.operator}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button type="button" variant="ghost" size="xs">
                          概览
                        </Button>
                        {task.status === 'Draft' ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            className="text-cyan-600"
                          >
                            去发布
                          </Button>
                        ) : null}
                        {task.status === 'Running' ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            className="text-red-600"
                          >
                            中止
                          </Button>
                        ) : null}
                        {task.status === 'Completed' ? (
                          <Button type="button" variant="ghost" size="xs">
                            效果报告
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </DataTableShell>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent
          className="gap-0 overflow-hidden p-0 sm:max-w-lg"
          showCloseButton={false}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            taskNameRef.current?.focus();
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            createTaskTriggerRef.current?.focus();
          }}
        >
          <DialogHeader className="border-b border-slate-100 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle>新建触达运营任务</DialogTitle>
                <DialogDescription className="mt-1">
                  配置目标人群和触达渠道。
                </DialogDescription>
              </div>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="关闭"
                >
                  <X />
                </Button>
              </DialogClose>
            </div>
          </DialogHeader>
          <div className="space-y-4 p-6">
            <div>
              <Label htmlFor="touchpoint-task-name" className="mb-1">
                任务名称
              </Label>
              <Input
                ref={taskNameRef}
                id="touchpoint-task-name"
                value={newTask.name ?? ''}
                onChange={(event) =>
                  setNewTask((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="例如：流感季气虚质人群干预提醒"
              />
            </div>
            <div>
              <Label htmlFor="touchpoint-snapshot-name" className="mb-1">
                目标人群快照
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="touchpoint-snapshot-name"
                  readOnly={snapshotLocked}
                  value={newTask.snapshotName ?? ''}
                  onChange={(event) =>
                    setNewTask((current) => ({
                      ...current,
                      snapshotName: event.target.value,
                    }))
                  }
                  className={cn(
                    'h-9 flex-1 text-sm',
                    snapshotLocked && 'bg-slate-50',
                  )}
                />
                <span className="rounded border border-cyan-100 bg-cyan-50 px-2 py-0.5 text-xs font-bold text-cyan-600">
                  {newTask.patientCount ?? 0} 人
                </span>
              </div>
            </div>
            <fieldset>
              <legend className="mb-2 text-xs font-bold text-slate-700">
                触达渠道
              </legend>
              <RadioGroup
                name="touchpoint-channel"
                aria-label="触达渠道"
                orientation="horizontal"
                value={newTask.channel ?? 'SMS'}
                onValueChange={(value) => {
                  if (isTouchpointChannel(value)) {
                    setNewTask((current) => ({
                      ...current,
                      channel: value,
                    }));
                  }
                }}
                className="grid grid-cols-3 gap-2"
              >
                {channelOptions.map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      'flex items-center justify-center gap-2 rounded border p-2 text-center transition-colors focus-within:ring-2 focus-within:ring-cyan-500',
                      newTask.channel === option.value
                        ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50',
                    )}
                  >
                    <RadioGroupItem
                      id={`touchpoint-channel-${option.value}`}
                      value={option.value}
                    />
                    <Label
                      htmlFor={`touchpoint-channel-${option.value}`}
                      className="cursor-pointer text-xs font-medium"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </fieldset>
          </div>
          <DialogFooter className="border-t border-slate-100 bg-slate-50 p-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                取消
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleCreate}>
              确认创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
