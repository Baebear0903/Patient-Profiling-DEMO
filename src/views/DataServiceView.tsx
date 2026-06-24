import {useLocalStorage} from '@/hooks/use-local-storage';
import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react';
import {
  Copy,
  Database,
  Edit,
  FileText,
  Key,
  Play,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Square,
  Trash2,
  X,
} from 'lucide-react';
import {useLocation, useNavigate, useSearchParams} from 'react-router-dom';
import {toast} from 'sonner';

import {ConfirmAction} from '@/components/common/ConfirmAction';
import {DataTableShell} from '@/components/common/DataTableShell';
import {PageHeader} from '@/components/common/PageHeader';
import {StatusBadge} from '@/components/common/StatusBadge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {Button} from '@/components/ui/button';
import {Checkbox} from '@/components/ui/checkbox';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {Switch} from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  isDataServiceInsertRouteState,
  type DataServiceRouteData,
} from '@/lib/route-state';

interface DataService extends DataServiceRouteData {
  id: string;
  createdAt: string;
}

interface CallRecord {
  id: string;
  serviceId: string;
  serviceName: string;
  caller: string;
  callTime: string;
  result: 'Success' | 'Failed';
  recordCount?: number;
  failureReason?: string;
}

type SnapshotOption = {
  id: string;
  name: string;
};

type EditableService = DataServiceRouteData &
  Partial<Pick<DataService, 'id' | 'createdAt'>>;

const mockServices: DataService[] = [
  {
    id: 'DS-001',
    name: '气虚质患者重点关注名单服务',
    code: 'SRV-QX-PATS-001',
    snapshotId: 'SNP-1',
    snapshotName: '高危气虚质复诊提醒快照',
    returnFields: ['patientId', 'hitTags', 'hitTime'],
    caller: '门诊电子病历系统',
    authMethod: 'API Key + IP 白名单',
    status: 'Enabled',
    rateLimit: '100 次/分钟',
    createdAt: '2026-06-12 11:20',
  },
];

const mockRecords: CallRecord[] = [
  {
    id: 'LOG-001',
    serviceId: 'DS-001',
    serviceName: '气虚质患者重点关注名单服务',
    caller: '门诊电子病历系统',
    callTime: '2026-06-15 09:12:33',
    result: 'Success',
    recordCount: 1250,
  },
  {
    id: 'LOG-002',
    serviceId: 'DS-001',
    serviceName: '气虚质患者重点关注名单服务',
    caller: '未知调用方客户端',
    callTime: '2026-06-15 09:15:10',
    result: 'Failed',
    failureReason: 'API Key 无效',
  },
];

const fallbackSnapshots: SnapshotOption[] = [
  {id: 'SNP-1', name: '高危气虚质复诊提醒快照'},
  {id: 'SNP-2', name: '阳虚质/寒湿体质人群快照'},
  {id: 'SNP-3', name: '更年期阴虚质重点关注人群'},
];

const fieldOptions = [
  {label: '患者唯一标识', value: 'patientId'},
  {label: '命中标签', value: 'hitTags'},
  {label: '标签命中时间', value: 'hitTime'},
  {label: '最近更新时间', value: 'updateTime'},
  {label: '命中依据引用ID', value: 'refId'},
];

function createEmptyService(): EditableService {
  return {
    name: '',
    code: `SRV-${Date.now()}`,
    snapshotId: '',
    snapshotName: '',
    returnFields: ['patientId', 'hitTags'],
    caller: '',
    authMethod: 'API Key',
    status: 'Enabled',
    rateLimit: '100 次/分钟',
  };
}

function readSavedSnapshots(): SnapshotOption[] {
  const saved = localStorage.getItem('savedSnapshots');
  if (!saved) return fallbackSnapshots;

  try {
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) return fallbackSnapshots;
    const valid = parsed.filter(
      (item): item is SnapshotOption =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as SnapshotOption).id === 'string' &&
        typeof (item as SnapshotOption).name === 'string',
    );
    return valid.length > 0 ? valid : fallbackSnapshots;
  } catch {
    return fallbackSnapshots;
  }
}

function IconAction({
  label,
  children,
  onClick,
  className,
}: {
  label: string;
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          aria-label={label}
          variant="ghost"
          size="icon-xs"
          className={className}
          onClick={onClick}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export function DataServiceView() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const consumedStateRef = useRef<unknown>(null);
  const createTriggerRef = useRef<HTMLButtonElement>(null);
  const editTriggerRef = useRef<HTMLButtonElement | null>(null);
  const credentialsTriggerRef = useRef<HTMLButtonElement | null>(null);
  const statusToggleTriggerRef = useRef<HTMLButtonElement | null>(null);
  const servicesTabRef = useRef<HTMLButtonElement>(null);
  const serviceNameRef = useRef<HTMLInputElement>(null);
  const activeTab =
    searchParams.get('tab') === 'records' ? 'records' : 'services';
  const searchKeyword = searchParams.get('q') ?? '';

  const [services, setServices] = useLocalStorage<DataService[]>('ds_services', mockServices);
  const [records] = useState<CallRecord[]>(mockRecords);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editService, setEditService] =
    useState<EditableService>(createEmptyService);
  const [credentialsModalOpen, setCredentialsModalOpen] = useState(false);
  const [selectedServiceForCreds, setSelectedServiceForCreds] =
    useState<DataService | null>(null);
  const [availableSnapshots, setAvailableSnapshots] =
    useLocalStorage<SnapshotOption[]>('ds_snapshots', fallbackSnapshots);
  const [statusToggleTarget, setStatusToggleTarget] =
    useState<DataService | null>(null);

  useEffect(() => {
    const state = location.state;
    if (state === null || consumedStateRef.current === state) return;

    consumedStateRef.current = state;
    navigate(location.pathname, {replace: true, state: null});
    if (!isDataServiceInsertRouteState(state)) return;

    const newService: DataService = {
      ...state.serviceData,
      id: `DS-${Date.now()}`,
      createdAt: new Date().toLocaleString('zh-CN', {hour12: false}),
    };
    setServices((current) => [newService, ...current]);
    toast.success('数据服务已创建');
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (isEditModalOpen) {
      setAvailableSnapshots(readSavedSnapshots());
    }
  }, [isEditModalOpen]);

  const updateParams = (update: (params: URLSearchParams) => void) => {
    const next = new URLSearchParams(searchParams);
    update(next);
    setSearchParams(next, {replace: true});
  };

  const handleTabChange = (value: string) => {
    updateParams((params) => {
      if (value === 'records') params.set('tab', 'records');
      else params.delete('tab');
    });
  };

  const handleSearchChange = (value: string) => {
    updateParams((params) => {
      if (activeTab === 'records') params.set('tab', 'records');
      else params.delete('tab');
      if (value) params.set('q', value);
      else params.delete('q');
    });
  };

  const openCreateDialog = () => {
    editTriggerRef.current = createTriggerRef.current;
    setEditService(createEmptyService());
    setIsEditModalOpen(true);
  };

  const openEditDialog = (
    service: DataService,
    trigger: HTMLButtonElement,
  ) => {
    editTriggerRef.current = trigger;
    setEditService({...service});
    setIsEditModalOpen(true);
  };

  const handleCreateOrUpdate = () => {
    const isEditing = Boolean(editService.id);
    if (isEditing) {
      setServices((current) =>
        current.map((service) =>
          service.id === editService.id
            ? {
                ...editService,
                id: service.id,
                createdAt: service.createdAt,
              }
            : service,
        ),
      );
      toast.success('服务已更新');
    } else {
      const newService: DataService = {
        ...editService,
        id: `DS-${Date.now()}`,
        createdAt: new Date().toLocaleString('zh-CN', {hour12: false}),
      };
      setServices((current) => [newService, ...current]);
      toast.success('服务已创建');
    }
    setIsEditModalOpen(false);
  };

  const confirmStatusToggle = () => {
    if (!statusToggleTarget) return;
    setServices((current) =>
      current.map((service) =>
        service.id === statusToggleTarget.id
          ? {
              ...service,
              status:
                statusToggleTarget.status === 'Enabled'
                  ? 'Disabled'
                  : 'Enabled',
            }
          : service,
      ),
    );
    setStatusToggleTarget(null);
  };

  const openCredentials = (
    service: DataService,
    trigger: HTMLButtonElement,
  ) => {
    credentialsTriggerRef.current = trigger;
    setSelectedServiceForCreds(service);
    setCredentialsModalOpen(true);
  };

  const openCallRecords = (service: DataService) => {
    updateParams((params) => {
      params.set('tab', 'records');
      params.set('q', service.name);
    });
  };

  const deleteService = (serviceId: string) => {
    setServices((current) =>
      current.filter((service) => service.id !== serviceId),
    );
    window.setTimeout(() => {
      servicesTabRef.current?.focus();
    }, 0);
  };

  const normalizedSearch = searchKeyword.trim().toLowerCase();
  const filteredServices = services.filter(
    (service) =>
      !normalizedSearch ||
      service.name.toLowerCase().includes(normalizedSearch) ||
      service.code.toLowerCase().includes(normalizedSearch),
  );
  const filteredRecords = records.filter(
    (record) =>
      !normalizedSearch ||
      record.serviceName.toLowerCase().includes(normalizedSearch) ||
      record.caller.toLowerCase().includes(normalizedSearch),
  );

  const servicesToolbar = (
    <>
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
        <Input
          aria-label="搜索数据服务"
          className="h-8 w-64 bg-white pl-8 text-xs"
          placeholder="搜索服务名称/编码..."
          value={searchKeyword}
          onChange={(event) => handleSearchChange(event.target.value)}
        />
      </div>
      <Button
        ref={createTriggerRef}
        type="button"
        size="sm"
        onClick={openCreateDialog}
      >
        <Plus />
        创建服务
      </Button>
    </>
  );

  const recordsToolbar = (
    <>
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
        <Input
          aria-label="搜索调用记录"
          className="h-8 w-64 bg-white pl-8 text-xs"
          placeholder="按服务名称或调用方搜索..."
          value={searchKeyword}
          onChange={(event) => handleSearchChange(event.target.value)}
        />
      </div>
      <Button type="button" variant="outline" size="sm">
        <RefreshCw />
        刷新
      </Button>
    </>
  );

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <PageHeader
        title="数据开放服务"
        description="管理基于动态人群快照生成的数据API服务和同步对接配置。"
        icon={<Database />}
      />

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="flex min-h-0 flex-1 flex-col"
      >
        <TabsList className="shrink-0" aria-label="数据服务视图">
          <TabsTrigger ref={servicesTabRef} value="services">
            服务管理列表
          </TabsTrigger>
          <TabsTrigger value="records">API调用记录</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="min-h-0">
          <DataTableShell
            title="服务管理列表"
            description="管理快照数据服务、鉴权与调用状态"
            toolbar={servicesToolbar}
            className="flex h-full min-h-0 flex-col"
            contentClassName="min-h-0 flex-1 overflow-hidden [&_[data-slot=table-container]]:h-full [&_[data-slot=table-container]]:overflow-auto"
            footer={
              <span className="text-xs text-muted-foreground">
                共 {filteredServices.length} 个服务
              </span>
            }
          >
            <Table aria-label="数据服务列表" className="min-w-[860px]">
              <TableHeader className="sticky top-0 z-10 bg-slate-50">
                <TableRow>
                  <TableHead className="px-4 text-[10px] uppercase">
                    服务标识
                  </TableHead>
                  <TableHead className="px-4 text-[10px] uppercase">
                    绑定快照
                  </TableHead>
                  <TableHead className="px-4 text-[10px] uppercase">
                    调用方/鉴权
                  </TableHead>
                  <TableHead className="px-4 text-[10px] uppercase">
                    状态
                  </TableHead>
                  <TableHead className="px-4 text-right text-[10px] uppercase">
                    操作
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-32 text-center text-sm text-slate-400"
                    >
                      暂无匹配的数据服务
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="px-4 py-3">
                        <div className="text-sm font-semibold text-slate-800">
                          {service.name}
                        </div>
                        <div className="mt-0.5 font-mono text-[10px] text-slate-400">
                          {service.code}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] px-4 py-3">
                        <div className="inline-flex max-w-full truncate rounded border bg-slate-100/70 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                          {service.snapshotName || '未绑定'}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="text-[11px] font-medium text-slate-700">
                          {service.caller}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-500">
                          <Shield className="size-3" />
                          {service.authMethod}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Switch
                            aria-label={`${service.name}启停状态`}
                            checked={service.status === 'Enabled'}
                            onClick={(event) => {
                              statusToggleTriggerRef.current =
                                event.currentTarget;
                            }}
                            onCheckedChange={() =>
                              setStatusToggleTarget(service)
                            }
                          />
                          <StatusBadge
                            status={
                              service.status === 'Enabled'
                                ? '已启用'
                                : '已停用'
                            }
                          />
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <IconAction
                            label="查看调用凭证"
                            onClick={(event) =>
                              openCredentials(service, event.currentTarget)
                            }
                          >
                            <Key />
                          </IconAction>
                          <IconAction
                            label="查看调用记录"
                            onClick={() => openCallRecords(service)}
                          >
                            <FileText />
                          </IconAction>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                aria-label="编辑服务"
                                variant="ghost"
                                size="icon-xs"
                                onClick={(event) =>
                                  openEditDialog(
                                    service,
                                    event.currentTarget,
                                  )
                                }
                              >
                                <Edit />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>编辑服务</TooltipContent>
                          </Tooltip>
                          <IconAction
                            label={
                              service.status === 'Enabled'
                                ? '停用服务'
                                : '启用服务'
                            }
                            onClick={(event) => {
                              statusToggleTriggerRef.current =
                                event.currentTarget;
                              setStatusToggleTarget(service);
                            }}
                          >
                            {service.status === 'Enabled' ? (
                              <Square />
                            ) : (
                              <Play />
                            )}
                          </IconAction>
                          {service.status === 'Disabled' ? (
                            <ConfirmAction
                              trigger={
                                <Button
                                  type="button"
                                  aria-label="删除服务"
                                  variant="ghost"
                                  size="icon-xs"
                                  className="text-red-500"
                                >
                                  <Trash2 />
                                </Button>
                              }
                              title="确认删除操作"
                              description={`此操作将永久删除数据服务「${service.name}」，确定删除？`}
                              onConfirm={() => deleteService(service.id)}
                            />
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </DataTableShell>
        </TabsContent>

        <TabsContent value="records" className="min-h-0">
          <DataTableShell
            title="API调用记录"
            description="查看服务调用结果与返回信息"
            toolbar={recordsToolbar}
            className="flex h-full min-h-0 flex-col"
            contentClassName="min-h-0 flex-1 overflow-hidden [&_[data-slot=table-container]]:h-full [&_[data-slot=table-container]]:overflow-auto"
            footer={
              <span className="text-xs text-muted-foreground">
                共 {filteredRecords.length} 条调用记录
              </span>
            }
          >
            <Table aria-label="API调用记录列表" className="min-w-[760px]">
              <TableHeader className="sticky top-0 z-10 bg-slate-50">
                <TableRow>
                  <TableHead className="px-4 text-[10px] uppercase">
                    调用时间
                  </TableHead>
                  <TableHead className="px-4 text-[10px] uppercase">
                    服务名称
                  </TableHead>
                  <TableHead className="px-4 text-[10px] uppercase">
                    调用方
                  </TableHead>
                  <TableHead className="px-4 text-[10px] uppercase">
                    调用结果
                  </TableHead>
                  <TableHead className="px-4 text-[10px] uppercase">
                    信息
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-32 text-center text-sm text-slate-400"
                    >
                      暂无调用记录
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="px-4 py-3 font-mono text-xs text-slate-600">
                        {record.callTime}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm font-medium text-slate-800">
                        {record.serviceName}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-[11px] text-slate-600">
                        {record.caller}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <StatusBadge
                          status={record.result === 'Success' ? '成功' : '失败'}
                          className={
                            record.result === 'Success'
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                              : 'border-red-200 bg-red-50 text-red-700'
                          }
                        />
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {record.result === 'Success' ? (
                          <span className="text-xs text-slate-500">
                            返回 {record.recordCount} 条
                          </span>
                        ) : (
                          <span className="text-xs text-red-500">
                            {record.failureReason}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </DataTableShell>
        </TabsContent>
      </Tabs>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent
          className="grid h-[90vh] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0 sm:max-w-lg"
          showCloseButton={false}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            serviceNameRef.current?.focus();
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            editTriggerRef.current?.focus();
          }}
        >
          <DialogHeader className="border-b p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle>
                  {editService.id
                    ? '编辑数据服务配置'
                    : '新建数据开放服务'}
                </DialogTitle>
                <DialogDescription className="mt-1">
                  配置快照、返回字段、鉴权和调用限制。
                </DialogDescription>
              </div>
              <DialogClose asChild>
                <Button
                  type="button"
                  aria-label="关闭"
                  variant="ghost"
                  size="icon"
                >
                  <X />
                </Button>
              </DialogClose>
            </div>
          </DialogHeader>
          <div className="min-h-0 space-y-4 overflow-y-auto p-5">
            <div className="space-y-1.5">
              <Label htmlFor="service-name">服务名称</Label>
              <Input
                ref={serviceNameRef}
                id="service-name"
                value={editService.name ?? ''}
                onChange={(event) =>
                  setEditService((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="service-code">服务编码</Label>
              <Input
                id="service-code"
                readOnly
                value={editService.code ?? ''}
                className="bg-slate-50 font-mono text-slate-500"
              />
            </div>
            <div className="space-y-1.5">
              <Label>调用方</Label>
              <div className="relative">
                <Select
                  key={editService.caller ? 'has-value' : 'empty'}
                  value={editService.caller || undefined}
                  onValueChange={(value) =>
                    setEditService((current) => ({
                      ...current,
                      caller: value,
                    }))
                  }
                >
                  <SelectTrigger className="w-full" aria-label="调用方">
                    <SelectValue placeholder="请选择" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="通用">通用</SelectItem>
                    <SelectItem value="中医智能宣教及专病随访系统">
                      中医智能宣教及专病随访系统
                    </SelectItem>
                    <SelectItem value="中医医患全域服务系统">
                      中医医患全域服务系统
                    </SelectItem>
                    <SelectItem value="多模态治未病慢病管理智联平台">
                      多模态治未病慢病管理智联平台
                    </SelectItem>
                    <SelectItem value="中医健康体检管理系统">
                      中医健康体检管理系统
                    </SelectItem>
                  </SelectContent>
                </Select>
                {editService.caller && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-8 top-1/2 h-6 w-6 -translate-y-1/2 z-10 text-slate-400 hover:text-slate-600 hover:bg-transparent"
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setEditService((current) => ({
                        ...current,
                        caller: '',
                      }));
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>绑定动态人群快照</Label>
              <Select
                value={editService.snapshotId || undefined}
                onValueChange={(snapshotId) => {
                  const snapshot = availableSnapshots.find(
                    (item) => item.id === snapshotId,
                  );
                  setEditService((current) => ({
                    ...current,
                    snapshotId,
                    snapshotName: snapshot?.name ?? current.snapshotName ?? '',
                  }));
                }}
              >
                <SelectTrigger className="w-full" aria-label="绑定动态人群快照">
                  <SelectValue placeholder="选择快照..." />
                </SelectTrigger>
                <SelectContent>
                  {editService.snapshotId &&
                  !availableSnapshots.some(
                    (snapshot) => snapshot.id === editService.snapshotId,
                  ) ? (
                    <SelectItem value={editService.snapshotId}>
                      {editService.snapshotName || editService.snapshotId}
                    </SelectItem>
                  ) : null}
                  {availableSnapshots.map((snapshot) => (
                    <SelectItem key={snapshot.id} value={snapshot.id}>
                      {snapshot.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">返回字段 (勾选)</legend>
              <div className="grid grid-cols-2 gap-2">
                {fieldOptions.map((option) => {
                  const checked = (editService.returnFields ?? []).includes(
                    option.value,
                  );
                  return (
                    <Label
                      key={option.value}
                      className="flex cursor-pointer items-center gap-2 text-sm font-normal"
                    >
                      <Checkbox
                        aria-label={option.label}
                        checked={checked}
                        onCheckedChange={(nextChecked) =>
                          setEditService((current) => ({
                            ...current,
                            returnFields: nextChecked
                              ? [
                                  ...(current.returnFields ?? []),
                                  option.value,
                                ]
                              : (current.returnFields ?? []).filter(
                                  (field) => field !== option.value,
                                ),
                          }))
                        }
                      />
                      {option.label}
                    </Label>
                  );
                })}
              </div>
            </fieldset>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>鉴权方式</Label>
                <Select
                  value={editService.authMethod ?? 'API Key'}
                  onValueChange={(authMethod) =>
                    setEditService((current) => ({
                      ...current,
                      authMethod,
                    }))
                  }
                >
                  <SelectTrigger className="w-full" aria-label="鉴权方式">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="API Key">API Key</SelectItem>
                    <SelectItem value="API Key + IP 白名单">
                      API Key + IP 白名单
                    </SelectItem>
                    <SelectItem value="OAuth 2.0">OAuth 2.0</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>调用频率限制</Label>
                <Select
                  value={editService.rateLimit ?? '100 次/分钟'}
                  onValueChange={(rateLimit) =>
                    setEditService((current) => ({
                      ...current,
                      rateLimit,
                    }))
                  }
                >
                  <SelectTrigger className="w-full" aria-label="调用频率限制">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="无限制">无限制</SelectItem>
                    <SelectItem value="100 次/分钟">100 次/分钟</SelectItem>
                    <SelectItem value="1000 次/小时">1000 次/小时</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between rounded border p-3">
              <div>
                <Label htmlFor="edit-service-status">启停状态</Label>
                <p className="text-xs text-muted-foreground">
                  {editService.status === 'Enabled'
                    ? '已启用 - 保存后即刻生效'
                    : '已停用 - 服务将拒绝任何调用'}
                </p>
              </div>
              <Switch
                id="edit-service-status"
                aria-label="启停状态"
                checked={editService.status === 'Enabled'}
                onCheckedChange={(checked) =>
                  setEditService((current) => ({
                    ...current,
                    status: checked ? 'Enabled' : 'Disabled',
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter className="border-t bg-slate-50 p-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                取消
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleCreateOrUpdate}>
              保存配置
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={credentialsModalOpen}
        onOpenChange={setCredentialsModalOpen}
      >
        <DialogContent
          className="grid h-[90vh] grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden p-0 sm:max-w-lg"
          showCloseButton={false}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            credentialsTriggerRef.current?.focus();
          }}
        >
          <DialogHeader className="border-b p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle>调用凭证信息</DialogTitle>
                <DialogDescription className="mt-1">
                  {selectedServiceForCreds?.name ?? ''}
                </DialogDescription>
              </div>
              <DialogClose asChild>
                <Button
                  type="button"
                  aria-label="关闭"
                  variant="ghost"
                  size="icon"
                >
                  <X />
                </Button>
              </DialogClose>
            </div>
          </DialogHeader>
          {selectedServiceForCreds ? (
            <div className="min-h-0 space-y-5 overflow-y-auto p-5">
              <CredentialInput
                id="api-base-url"
                label="API Base URL"
                value="https://api.internal-hospital.com/v1/data"
                actionLabel="复制 API Base URL"
              />
              {selectedServiceForCreds.authMethod.startsWith('API Key') ? (
                <>
                  <CredentialInput
                    id="api-key"
                    label="API Key"
                    type="password"
                    value={`sk_${selectedServiceForCreds.code}_xxxxxxxxxxxxxxxx`}
                    actionLabel="复制 API Key"
                  />
                  {selectedServiceForCreds.authMethod ===
                  'API Key + IP 白名单' ? (
                    <div className="space-y-1.5">
                      <Label>已配置 IP 白名单</Label>
                      <div className="rounded border bg-slate-50 px-3 py-2 font-mono text-sm text-slate-600">
                        10.0.1.200, 192.168.1.50
                      </div>
                    </div>
                  ) : null}
                  <div className="space-y-1.5">
                    <Label>接口文档</Label>
                    <a
                      href="#"
                      className="flex items-center gap-1 text-sm text-cyan-600 hover:underline"
                    >
                      查看 OpenAPI 规范文档 →
                    </a>
                  </div>
                </>
              ) : null}
              {selectedServiceForCreds.authMethod === 'OAuth 2.0' ? (
                <>
                  <CredentialInput
                    id="client-id"
                    label="Client ID"
                    value={`client_${selectedServiceForCreds.code}`}
                    actionLabel="复制 Client ID"
                  />
                  <CredentialInput
                    id="client-secret"
                    label="Client Secret"
                    type="password"
                    value="************************"
                    actionLabel="重新生成 Client Secret"
                    actionIcon={<RefreshCw />}
                  />
                  <p className="text-[10px] text-amber-600">
                    仅创建时完整展示，如遗失请重新生成。
                  </p>
                  <CredentialInput
                    id="authorization-url"
                    label="Authorization URL"
                    value="https://auth.internal-hospital.com/oauth2/auth"
                  />
                  <CredentialInput
                    id="token-url"
                    label="Token URL"
                    value="https://auth.internal-hospital.com/oauth2/token"
                  />
                  <CredentialInput
                    id="redirect-uri"
                    label="Redirect URI"
                    value="https://third-party.client.com/callback"
                  />
                  <div className="space-y-1.5">
                    <Label>Scopes</Label>
                    <div className="flex flex-wrap gap-1">
                      {selectedServiceForCreds.returnFields.map((field) => (
                        <span
                          key={field}
                          className="rounded border bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600"
                        >
                          read:{field}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={statusToggleTarget !== null}
        onOpenChange={(open) => {
          if (!open) setStatusToggleTarget(null);
        }}
      >
        <AlertDialogContent
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            statusToggleTriggerRef.current?.focus();
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>
              {statusToggleTarget?.status === 'Enabled'
                ? '确认停用服务'
                : '确认启用服务'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {statusToggleTarget?.status === 'Enabled'
                ? `停用后「${statusToggleTarget?.name ?? ''}」将拒绝新的数据调用。`
                : `启用后「${statusToggleTarget?.name ?? ''}」将恢复数据调用。`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusToggle}>
              确认
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CredentialInput({
  id,
  label,
  value,
  type = 'text',
  actionLabel,
  actionIcon,
}: {
  id: string;
  label: string;
  value: string;
  type?: 'text' | 'password';
  actionLabel?: string;
  actionIcon?: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          type={type}
          readOnly
          value={value}
          className="bg-slate-50 font-mono text-sm text-slate-600"
        />
        {actionLabel ? (
          <IconAction label={actionLabel}>
            {actionIcon ?? <Copy />}
          </IconAction>
        ) : null}
      </div>
    </div>
  );
}
