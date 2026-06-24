import {useEffect, useMemo, useRef, useState} from 'react';
import {useLocalStorage} from '@/hooks/use-local-storage';
import {
  ChevronRight,
  Database,
  FileText,
  Filter,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Search,
  Send,
  Share2,
  X,
} from 'lucide-react';
import {useNavigate} from 'react-router-dom';

import {CompactPagination} from '@/components/common/CompactPagination';
import {ConfirmAction} from '@/components/common/ConfirmAction';
import {Button} from '@/components/ui/button';
import {Checkbox} from '@/components/ui/checkbox';
import {
  Dialog,
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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
import {mockPatients, mockTags} from '@/data/mock';
import type {
  DataServiceInsertRouteState,
  DataServiceRouteData,
  TouchpointCreateRouteState,
} from '@/lib/route-state';
import {cn} from '@/lib/utils';

type Patient = (typeof mockPatients)[number];

type Snapshot = {
  id: string;
  name: string;
  count: number;
  createdAt: string;
  patients: Patient[];
  mustHaveArgs: string[];
  excludeArgs: string[];
};

type DataServiceConfig = DataServiceRouteData;
type SnapshotPatientAction =
  | 'keep'
  | 'remove-offline'
  | 'remove-invalid'
  | 'remove-other';

const fieldOptions = [
  {label: '患者唯一标识', value: 'patientId'},
  {label: '命中标签', value: 'hitTags'},
  {label: '标签命中时间', value: 'hitTime'},
  {label: '最近更新时间', value: 'updateTime'},
  {label: '命中依据引用ID', value: 'refId'},
];

const initialSnapshots: Snapshot[] = [
  {
    id: 'SNP-1',
    name: '高危气虚质复诊提醒快照',
    count: 1250,
    createdAt: '2026-06-12 10:30',
    patients: mockPatients.slice(0, 2),
    mustHaveArgs: ['气虚质', '高危'],
    excludeArgs: [],
  },
];

export function PopulationView() {
  const navigate = useNavigate();
  const [lastScanTime, setLastScanTime] = useState('2026-06-14 08:00');
  const [mustHaveArgs, setMustHaveArgs] = useState(['气虚质', '脾胃虚弱']);
  const [excludeArgs, setExcludeArgs] = useState(['寒凉药慎用']);
  const [appliedMustHaveArgs, setAppliedMustHaveArgs] = useState([
    '气虚质',
    '脾胃虚弱',
  ]);
  const [appliedExcludeArgs, setAppliedExcludeArgs] = useState([
    '寒凉药慎用',
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMustHaveOpen, setIsMustHaveOpen] = useState(false);
  const [isExcludeOpen, setIsExcludeOpen] = useState(false);
  const [tagSearchKw, setTagSearchKw] = useState('');
  const [activeTab, setActiveTab] = useLocalStorage<'dynamic' | 'snapshots'>(
    'pop_activeTab',
    'dynamic',
  );
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [snapshotPatients, setSnapshotPatients] = useState<Patient[]>([]);
  const [savedSnapshots, setSavedSnapshots] =
    useLocalStorage<Snapshot[]>('pop_savedSnapshots', initialSnapshots);
  const [snapshotNameInput, setSnapshotNameInput] = useState('');
  const [snapshotPatientActions, setSnapshotPatientActions] = useLocalStorage<
    Record<string, SnapshotPatientAction>
  >('pop_snapshotActions', {});
  const [editingSnapshot, setEditingSnapshot] = useState<Snapshot | null>(null);
  const [snapshotDialogOpen, setSnapshotDialogOpen] = useState(false);
  const [dataServiceModalOpen, setDataServiceModalOpen] = useState(false);
  const [dataServiceConfig, setDataServiceConfig] =
    useState<DataServiceConfig | null>(null);

  const mustHaveRef = useRef<HTMLDivElement>(null);
  const excludeRef = useRef<HTMLDivElement>(null);
  const traceabilityTriggerRef = useRef<HTMLButtonElement>(null);
  const snapshotTriggerRef = useRef<HTMLButtonElement>(null);
  const snapshotNameInputRef = useRef<HTMLInputElement>(null);
  const snapshotsTabRef = useRef<HTMLButtonElement>(null);
  const snapshotActionRefs = useRef(
    new Map<string, HTMLButtonElement>(),
  );
  const snapshotDeleteRefs = useRef(
    new Map<string, HTMLButtonElement>(),
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        mustHaveRef.current &&
        !mustHaveRef.current.contains(event.target as Node)
      ) {
        setIsMustHaveOpen(false);
      }
      if (
        excludeRef.current &&
        !excludeRef.current.contains(event.target as Node)
      ) {
        setIsExcludeOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // toEditableTag is needed to properly format the items from local storage 
  // if not we can just use the tags
  const [tags] = useLocalStorage<any[]>('tag_mgmt_tags', mockTags);
  const [patients] = useLocalStorage<any[]>('pop_patients', mockPatients);

  const filteredTags = tags.filter(
    (tag) =>
      tag.status === '已发布' &&
      (tag.name.toLowerCase().includes(tagSearchKw.toLowerCase()) ||
        tag.category.toLowerCase().includes(tagSearchKw.toLowerCase())),
  );

  const displayPatients = useMemo(() => {
    if (appliedMustHaveArgs.length === 0) return [];

    return patients.filter((patient) => {
      const patientTags = patient.tags ?? [];
      const hasAllMustHave = appliedMustHaveArgs.every((tag) =>
        patientTags.includes(tag),
      );
      const hasAnyExclude = appliedExcludeArgs.some((tag) =>
        patientTags.includes(tag),
      );
      return hasAllMustHave && !hasAnyExclude;
    });
  }, [appliedExcludeArgs, appliedMustHaveArgs]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.setTimeout(() => {
      setIsRefreshing(false);
      const offset = 8 * 60;
      const now = new Date(
        Date.now() + (new Date().getTimezoneOffset() + offset) * 60000,
      );
      setLastScanTime(
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      );
    }, 1000);
  };

  const openSnapshotDialog = (
    patients: Patient[],
    snapshot?: Snapshot,
  ) => {
    setSnapshotPatients([...patients]);
    setSnapshotPatientActions(
      Object.fromEntries(
        patients.map((patient) => [patient.id, 'keep' as const]),
      ),
    );
    setSnapshotNameInput(
      snapshot?.name ?? `动态人群的快照 ${new Date().toLocaleDateString()}`,
    );
    setEditingSnapshot(snapshot ?? null);
    setSnapshotDialogOpen(true);
  };

  const handleSnapshotPatientAction = (
    patientId: string,
    action: SnapshotPatientAction,
  ) => {
    setSnapshotPatientActions((current) => ({
      ...current,
      [patientId]: action,
    }));
    if (action === 'keep') return;

    const patientIndex = snapshotPatients.findIndex(
      (patient) => patient.id === patientId,
    );
    const nextPatient = snapshotPatients[patientIndex + 1];
    setSnapshotPatients((current) =>
      current.filter((patient) => patient.id !== patientId),
    );
    window.setTimeout(() => {
      if (nextPatient) {
        snapshotActionRefs.current.get(nextPatient.id)?.focus();
      } else {
        snapshotNameInputRef.current?.focus();
      }
    }, 0);
  };

  const deleteSnapshot = (snapshotId: string) => {
    const snapshotIndex = savedSnapshots.findIndex(
      (snapshot) => snapshot.id === snapshotId,
    );
    const nextSnapshot =
      savedSnapshots[snapshotIndex + 1] ??
      savedSnapshots[snapshotIndex - 1] ??
      null;

    setSavedSnapshots((current) =>
      current.filter((snapshot) => snapshot.id !== snapshotId),
    );
    window.setTimeout(() => {
      if (nextSnapshot) {
        snapshotDeleteRefs.current.get(nextSnapshot.id)?.focus();
      } else {
        snapshotsTabRef.current?.focus();
      }
    }, 0);
  };

  const saveSnapshot = () => {
    if (editingSnapshot) {
      setSavedSnapshots((current) =>
        current.map((snapshot) =>
          snapshot.id === editingSnapshot.id
            ? {
                ...snapshot,
                name: snapshotNameInput,
                patients: [...snapshotPatients],
                count: snapshotPatients.length,
              }
            : snapshot,
        ),
      );
    } else {
      setSavedSnapshots((current) => [
        {
          id: `SNP-${Date.now()}`,
          name:
            snapshotNameInput ||
            `未命名快照 ${new Date().toLocaleDateString()}`,
          count: snapshotPatients.length,
          createdAt: new Date().toLocaleString('zh-CN', {hour12: false}),
          patients: [...snapshotPatients],
          mustHaveArgs: [...appliedMustHaveArgs],
          excludeArgs: [...appliedExcludeArgs],
        },
        ...current,
      ]);
    }

    setEditingSnapshot(null);
    setSnapshotDialogOpen(false);
    setActiveTab('snapshots');
  };

  const openDataServiceDialog = (snapshot: Snapshot) => {
    setDataServiceConfig({
      name: `${snapshot.name}开放服务`,
      code: `SRV-${Date.now()}`,
      snapshotId: snapshot.id,
      snapshotName: snapshot.name,
      returnFields: ['patientId', 'hitTags'],
      caller: '',
      authMethod: 'API Key',
      status: 'Enabled',
      rateLimit: '100 次/分钟',
    });
    setDataServiceModalOpen(true);
  };

  const renderTagDropdown = (
    isOpen: boolean,
    selectedTags: string[],
    setSelectedTags: (tags: string[]) => void,
  ) => {
    if (!isOpen) return null;

    return (
      <div className="absolute left-0 top-full z-50 mt-1 flex w-64 flex-col overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
        <div className="relative flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 p-2">
          <Search className="absolute left-4 text-slate-400" size={12} />
          <Input
            autoFocus
            aria-label="搜索标签名称或类别"
            placeholder="搜索标签名称/类别..."
            value={tagSearchKw}
            onChange={(event) => setTagSearchKw(event.target.value)}
            className="h-7 pl-6 text-[10px]"
          />
        </div>
        <div className="max-h-60 overflow-y-auto">
          {filteredTags.length === 0 ? (
            <div className="p-4 text-center text-[10px] text-slate-400">
              无匹配的已发布标签
            </div>
          ) : (
            filteredTags.map((tag) => {
              const isSelected = selectedTags.includes(tag.name);
              return (
                <Label
                  key={tag.id}
                  className="flex cursor-pointer items-start gap-2 border-b border-slate-50 px-3 py-2 hover:bg-slate-50"
                >
                  <Checkbox
                    checked={isSelected}
                    aria-label={tag.name}
                    onCheckedChange={(checked) =>
                      setSelectedTags(
                        checked
                          ? [...selectedTags, tag.name]
                          : selectedTags.filter((item) => item !== tag.name),
                      )
                    }
                  />
                  <span className="flex flex-col gap-0.5">
                    <span
                      className={cn(
                        'text-[11px] font-medium leading-none',
                        isSelected ? 'text-cyan-700' : 'text-slate-700',
                      )}
                    >
                      {tag.name}
                    </span>
                    <span className="text-[9px] leading-none text-slate-400">
                      {tag.category}
                    </span>
                  </span>
                </Label>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) =>
        setActiveTab(value as 'dynamic' | 'snapshots')
      }
      className="flex h-full flex-col gap-4"
    >
      <TabsList
        variant="line"
        className="h-auto w-full justify-start rounded-lg border border-slate-200 bg-white px-2 shadow-sm"
      >
        <TabsTrigger
          value="dynamic"
          className="h-11 flex-none px-4 text-sm font-bold"
        >
          患者群体圈选
        </TabsTrigger>
        <TabsTrigger
          ref={snapshotsTabRef}
          value="snapshots"
          className="h-11 flex-none px-4 text-sm font-bold"
        >
          人群快照管理
        </TabsTrigger>
      </TabsList>

      <TabsContent value="snapshots" className="min-h-0">
        <section className="flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 p-4">
            <h2 className="text-sm font-bold text-slate-800">
              已生成的人群快照
            </h2>
            <div className="text-xs text-slate-500">
              共 {savedSnapshots.length} 个人群快照记录
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-auto">
            <Table aria-label="人群快照列表">
              <TableHeader className="sticky top-0 z-10 bg-slate-50">
                <TableRow>
                  <TableHead className="px-4 text-xs">快照名称 / ID</TableHead>
                  <TableHead className="px-4 text-xs">生成时间</TableHead>
                  <TableHead className="px-4 text-xs">患者数</TableHead>
                  <TableHead className="px-4 text-right text-xs">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {savedSnapshots.map((snapshot) => (
                  <TableRow key={snapshot.id}>
                    <TableCell className="px-4">
                      <div className="font-semibold text-slate-800">
                        {snapshot.name}
                      </div>
                      <div className="mt-0.5 font-mono text-[10px] text-slate-400">
                        {snapshot.id}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 text-xs text-slate-500">
                      {snapshot.createdAt}
                    </TableCell>
                    <TableCell className="px-4 text-sm font-bold text-cyan-700">
                      {snapshot.count} 人
                    </TableCell>
                    <TableCell className="px-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            openSnapshotDialog(snapshot.patients, snapshot)
                          }
                        >
                          编辑
                        </Button>
                        <ConfirmAction
                          trigger={
                            <Button
                              ref={(node) => {
                                if (node) {
                                  snapshotDeleteRefs.current.set(
                                    snapshot.id,
                                    node,
                                  );
                                } else {
                                  snapshotDeleteRefs.current.delete(
                                    snapshot.id,
                                  );
                                }
                              }}
                              type="button"
                              variant="outline"
                              size="sm"
                              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                              删除
                            </Button>
                          }
                          title="确认删除操作"
                          description={`此操作将删除该人群快照「${snapshot.name}」的所有记录，确定删除？`}
                          onConfirm={() => deleteSnapshot(snapshot.id)}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="border-cyan-200 text-cyan-700"
                          onClick={() => {
                            const state: TouchpointCreateRouteState = {
                              action: 'create_task',
                              snapshotName: snapshot.name,
                              patientCount: snapshot.count,
                            };
                            navigate('/touchpoint', {state});
                          }}
                        >
                          <Send size={12} /> 新建触达
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="border-blue-200 text-blue-700"
                          onClick={() => openDataServiceDialog(snapshot)}
                        >
                          <Database size={12} /> 数据开放
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {savedSnapshots.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-40 text-center text-slate-500"
                    >
                      暂未生成任何人群快照，请在「动态人群」里进行生成。
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </section>
      </TabsContent>

      <TabsContent value="dynamic" className="min-h-0">
        <div className="flex h-full flex-col gap-4 xl:flex-row">
          <aside className="w-full shrink-0 xl:w-[280px]">
            <div className="flex h-full flex-col overflow-visible rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 bg-slate-50/50 p-3">
                <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                  <Filter size={16} className="text-slate-400" />
                  人群归属与筛选
                </h3>
              </div>
              <div className="flex-1 space-y-6 overflow-visible p-3">
                <div className="space-y-2" ref={mustHaveRef}>
                  <div className="relative flex items-center justify-between text-[11px] font-bold uppercase">
                    <span className="text-cyan-700">必须命中 (交集)</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      className="text-cyan-600"
                      onClick={() => {
                        setTagSearchKw('');
                        setIsMustHaveOpen((open) => !open);
                        setIsExcludeOpen(false);
                      }}
                    >
                      <Plus size={12} /> 添加
                    </Button>
                    {renderTagDropdown(
                      isMustHaveOpen,
                      mustHaveArgs,
                      setMustHaveArgs,
                    )}
                  </div>
                  <div className="space-y-1">
                    {mustHaveArgs.map((tag) => (
                      <div
                        key={tag}
                        className="flex items-center justify-between rounded border border-cyan-200 bg-cyan-50 px-2 py-1.5 text-[11px] font-medium"
                      >
                        <span className="text-cyan-800">{tag}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          aria-label={`移除${tag}`}
                          className="text-cyan-500"
                          onClick={() =>
                            setMustHaveArgs((current) =>
                              current.filter((item) => item !== tag),
                            )
                          }
                        >
                          <X size={12} />
                        </Button>
                      </div>
                    ))}
                    {mustHaveArgs.length === 0 ? (
                      <div className="rounded border border-dashed border-slate-200 py-2 text-center text-[10px] text-slate-400">
                        暂未添加必须命中标签
                      </div>
                    ) : null}
                  </div>
                </div>

                <div
                  className="space-y-2 border-t border-slate-100 pt-4"
                  ref={excludeRef}
                >
                  <div className="relative flex items-center justify-between text-[11px] font-bold uppercase">
                    <span className="text-red-700">排除标签</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      className="text-red-600"
                      onClick={() => {
                        setTagSearchKw('');
                        setIsExcludeOpen((open) => !open);
                        setIsMustHaveOpen(false);
                      }}
                    >
                      <Plus size={12} /> 添加
                    </Button>
                    {renderTagDropdown(
                      isExcludeOpen,
                      excludeArgs,
                      setExcludeArgs,
                    )}
                  </div>
                  <div className="space-y-1">
                    {excludeArgs.map((tag) => (
                      <div
                        key={tag}
                        className="flex items-center justify-between rounded border border-red-200 bg-red-50 px-2 py-1.5 text-[11px] font-medium"
                      >
                        <span className="text-red-800">{tag}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          aria-label={`移除${tag}`}
                          className="text-red-500"
                          onClick={() =>
                            setExcludeArgs((current) =>
                              current.filter((item) => item !== tag),
                            )
                          }
                        >
                          <X size={12} />
                        </Button>
                      </div>
                    ))}
                    {excludeArgs.length === 0 ? (
                      <div className="rounded border border-dashed border-slate-200 py-2 text-center text-[10px] text-slate-400">
                        暂未添加排除标签
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-500">
                    当前评估命中
                  </span>
                  <span className="text-xl font-bold text-slate-800">
                    {displayPatients.length}
                    <span className="mx-1 text-xs font-normal text-slate-500">
                      人
                    </span>
                  </span>
                </div>
                <div className="flex items-center justify-between rounded border border-slate-200 bg-white px-2 py-1.5 text-[10px] text-slate-500">
                  <span>规则群最近扫描</span>
                  <span className="font-mono">
                    {isRefreshing ? (
                      <Loader2 size={10} className="inline animate-spin" />
                    ) : (
                      lastScanTime
                    )}
                  </span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  className="w-full bg-cyan-600 hover:bg-cyan-700"
                  disabled={isGenerating}
                  onClick={() => {
                    setIsGenerating(true);
                    window.setTimeout(() => {
                      setAppliedMustHaveArgs(mustHaveArgs);
                      setAppliedExcludeArgs(excludeArgs);
                      setIsGenerating(false);
                    }, 600);
                  }}
                >
                  {isGenerating ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <FileText size={14} />
                  )}
                  {isGenerating ? '检索中...' : '查看患者清单'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={isRefreshing}
                  onClick={handleRefresh}
                >
                  <RefreshCw
                    size={12}
                    className={cn(isRefreshing && 'animate-spin text-cyan-600')}
                  />
                  刷新标签状态
                </Button>
              </div>
            </div>
          </aside>

          <section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/50 p-3">
              <h2 className="text-sm font-bold text-slate-700">动态结果清单</h2>
              <Button
                ref={snapshotTriggerRef}
                type="button"
                variant="outline"
                size="sm"
                className="text-cyan-700"
                disabled={
                  displayPatients.length === 0 ||
                  appliedMustHaveArgs.length === 0
                }
                onClick={() => openSnapshotDialog(displayPatients)}
              >
                <Save size={14} /> 生成人群快照
              </Button>
            </div>
            <div className="relative min-h-0 flex-1 overflow-auto">
              {isGenerating ? (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60">
                  <Loader2 className="animate-spin text-cyan-600" size={32} />
                </div>
              ) : null}
              {appliedMustHaveArgs.length > 0 ? (
                <Table aria-label="动态结果清单">
                  <TableHeader className="sticky top-0 z-10 bg-slate-50">
                    <TableRow>
                      <TableHead className="px-4 text-[10px]">
                        患者信息标识
                      </TableHead>
                      <TableHead className="px-4 text-[10px]">
                        最近就诊轨迹
                      </TableHead>
                      <TableHead className="px-4 text-[10px]">
                        当前命中标签
                      </TableHead>
                      <TableHead className="px-4 text-right text-[10px]">
                        操作
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayPatients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell className="px-4">
                          <div className="font-semibold text-slate-800">
                            {patient.name}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {patient.gender} · {patient.age}岁 · ID:{patient.id}
                          </div>
                        </TableCell>
                        <TableCell className="px-4">
                          <div className="text-xs font-medium text-slate-700">
                            {patient.lastVisitDept}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {patient.lastVisitTime}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[280px] px-4">
                          <div className="flex flex-wrap gap-1.5">
                            {patient.tags.map((tag) => (
                              <span
                                key={tag}
                                className={cn(
                                  'rounded border px-1.5 py-0.5 text-[9px]',
                                  appliedMustHaveArgs.includes(tag)
                                    ? 'border-cyan-200 bg-cyan-50 font-medium text-cyan-700'
                                    : 'border-slate-200 bg-slate-50 text-slate-600',
                                )}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-cyan-600"
                            onClick={(event) => {
                              traceabilityTriggerRef.current =
                                event.currentTarget;
                              setSelectedPatient(patient);
                            }}
                          >
                            溯源详情 <ChevronRight size={12} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex h-full flex-col items-center justify-center p-12 text-center">
                  <Filter size={28} className="mb-4 text-slate-400" />
                  <h4 className="mb-2 text-sm font-bold text-slate-800">
                    未设定人群规则
                  </h4>
                  <p className="max-w-[280px] text-xs leading-relaxed text-slate-500">
                    请在左侧设定「人群归属规则」，必须命中一项或多项条件才能检索患者清单。
                  </p>
                </div>
              )}
            </div>
            {appliedMustHaveArgs.length > 0 ? (
              <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/50 p-3">
                <CompactPagination
                  page={1}
                  pageSize={Math.max(1, displayPatients.length)}
                  total={displayPatients.length}
                  onPageChange={() => undefined}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label="当前页 1"
                  aria-current="page"
                  disabled
                >
                  1
                </Button>
              </div>
            ) : null}
          </section>
        </div>
      </TabsContent>

      <Sheet
        open={selectedPatient !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedPatient(null);
        }}
      >
        <SheetContent
          className="w-full overflow-y-auto sm:max-w-2xl"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            traceabilityTriggerRef.current?.focus();
          }}
        >
          <SheetHeader className="border-b">
            <SheetTitle>患者溯源详情</SheetTitle>
            <SheetDescription>
              查看患者 {selectedPatient?.name} 命中当前动态人群规则的依据
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-6 px-4 pb-6">
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <section className="overflow-hidden rounded-lg border border-slate-200">
                <h3 className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700">
                  基础信息
                </h3>
                <div className="grid grid-cols-2 gap-x-2 gap-y-4 p-4 text-sm">
                  <div>
                    <span className="block text-xs text-slate-500">
                      患者标识
                    </span>
                    <span className="font-medium">{selectedPatient?.id}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500">
                      脱敏姓名
                    </span>
                    <span className="font-medium">{selectedPatient?.name}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500">
                      性别/年龄
                    </span>
                    <span className="font-medium">
                      {selectedPatient?.gender} / {selectedPatient?.age}岁
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500">
                      最近就诊
                    </span>
                    <span className="font-medium">
                      {selectedPatient?.lastVisitDept}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-xs text-slate-500">
                      最近就诊时间
                    </span>
                    <span className="font-medium">
                      {selectedPatient?.lastVisitTime}
                    </span>
                  </div>
                </div>
              </section>

              <section className="overflow-hidden rounded-lg border border-slate-200">
                <h3 className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700">
                  命中规则要素
                </h3>
                <div className="space-y-4 p-4 text-sm">
                  <div>
                    <span className="mb-1 block text-xs text-slate-500">
                      命中相关标签 (版本 V2.0)
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedPatient?.tags.map((tag) => (
                        <span
                          key={tag}
                          className={cn(
                            'rounded border px-2 py-0.5 text-xs',
                            appliedMustHaveArgs.includes(tag)
                              ? 'border-cyan-200 bg-cyan-50 text-cyan-700'
                              : 'border-slate-200 bg-slate-50 text-slate-600',
                          )}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-slate-100 pt-2">
                    <span className="mb-2 block text-xs text-slate-500">
                      命中规则明细
                    </span>
                    <ul className="space-y-2">
                      {selectedPatient?.tags
                        .filter((tag) => appliedMustHaveArgs.includes(tag))
                        .map((tag) => {
                          const tagDefinition = tags.find(
                            (item) => item.name === tag,
                          );
                          return (
                            <li
                              key={tag}
                              className="flex items-center justify-between rounded border border-slate-100 bg-slate-50 p-2 text-xs text-slate-700"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-cyan-700">
                                  {tag}
                                </span>
                                <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] text-slate-500">
                                  {tagDefinition?.version || 'V1.0'}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400">
                                最新匹配: {selectedPatient?.lastScanTime}
                              </span>
                            </li>
                          );
                        })}
                    </ul>
                  </div>
                </div>
              </section>
            </div>

            <section className="overflow-hidden rounded-lg border border-slate-200">
              <h3 className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700">
                命中依据溯源视图
              </h3>
              <div className="p-4">
                <div className="space-y-6 border-l-2 border-slate-200 pl-6">
                  <div className="relative">
                    <span className="absolute -left-[31px] top-1 size-4 rounded-full border-2 border-cyan-500 bg-cyan-100" />
                    <div className="text-sm font-bold text-slate-800">
                      临床诊断/辩证提取: 气虚质
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      引用来源: 治未病中心/门诊病历系统 [DOC_ID: 9940291] /
                      2026-06-08 09:12:00
                    </div>
                    <div className="mt-2 rounded border border-slate-200 bg-slate-50 p-3 text-sm italic text-slate-600 shadow-sm">
                      "...舌淡白，边有齿痕，脉弱。辩证为气虚质，伴有脾胃虚弱症状..."
                    </div>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[31px] top-1 size-4 rounded-full border-2 border-cyan-500 bg-cyan-100" />
                    <div className="text-sm font-bold text-slate-800">
                      处方用药规则命中: 脾胃虚弱相关药组
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      引用来源: 中药房/处方系统 [RX_ID: 109238] / 2026-06-08
                      09:45:00
                    </div>
                    <div className="mt-2 flex items-start gap-2 rounded border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600 shadow-sm">
                      <Database
                        size={14}
                        className="mt-0.5 shrink-0 text-cyan-600"
                      />
                      <div>
                        包含黄芪、党参、白术、炙甘草等健脾益气类药材
                        (命中量: 4, 阈值: {">=3"})
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog
        open={snapshotDialogOpen}
        onOpenChange={(open) => {
          setSnapshotDialogOpen(open);
          if (!open) setEditingSnapshot(null);
        }}
      >
        <DialogContent
          className="grid h-[90vh] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0 sm:max-w-5xl"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            snapshotTriggerRef.current?.focus();
          }}
        >
          <DialogHeader className="border-b p-5">
            <DialogTitle>人群快照确认</DialogTitle>
            <DialogDescription>
              预览并建立稳态的人群快照数据
            </DialogDescription>
          </DialogHeader>
          <div
            data-testid="snapshot-dialog-body"
            className="grid min-h-0 gap-5 overflow-hidden p-5 lg:grid-cols-[280px_1fr]"
          >
            <div
              data-testid="snapshot-dialog-sidebar"
              className="min-h-0 space-y-4 overflow-auto pr-1"
            >
              <div className="space-y-1.5">
                <Label htmlFor="snapshot-name">快照名称</Label>
                <Input
                  ref={snapshotNameInputRef}
                  id="snapshot-name"
                  value={snapshotNameInput}
                  onChange={(event) => setSnapshotNameInput(event.target.value)}
                />
              </div>
              <div className="rounded border border-slate-200 bg-slate-50 p-3">
                <span className="text-xs text-slate-500">人群筛选逻辑</span>
                <div className="mt-2 space-y-2">
                  {(editingSnapshot?.mustHaveArgs ?? appliedMustHaveArgs).length >
                  0 ? (
                    <div className="flex items-start gap-2 text-[11px]">
                      <span className="shrink-0 font-bold text-slate-600">
                        包含标签:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {(editingSnapshot?.mustHaveArgs ?? appliedMustHaveArgs).map(
                          (tag) => (
                            <span
                              key={tag}
                              className="rounded border border-cyan-200 bg-cyan-100 px-1.5 py-0.5 text-cyan-700"
                            >
                              {tag}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] italic text-slate-500">
                      来自外部引入或手动指定名单
                    </div>
                  )}
                  {(editingSnapshot?.excludeArgs ?? appliedExcludeArgs).length >
                  0 ? (
                    <div className="flex items-start gap-2 text-[11px]">
                      <span className="shrink-0 font-bold text-slate-600">
                        排除标签:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {(editingSnapshot?.excludeArgs ?? appliedExcludeArgs).map(
                          (tag) => (
                            <span
                              key={tag}
                              className="rounded border border-red-200 bg-red-100 px-1.5 py-0.5 text-red-700"
                            >
                              {tag}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="rounded border border-slate-200 bg-slate-50 p-3">
                <span className="text-xs text-slate-500">生成时间</span>
                <div className="mt-1 text-sm font-medium text-slate-800">
                  {editingSnapshot?.createdAt ??
                    new Date().toLocaleString('zh-CN', {hour12: false})}
                </div>
              </div>
              <div className="rounded border border-slate-200 bg-slate-50 p-3">
                <span className="text-xs text-slate-500">快照患者人数</span>
                <div className="mt-1 text-sm font-bold text-cyan-700">
                  {snapshotPatients.length} 人
                </div>
              </div>
              <div className="rounded-lg border border-cyan-100 bg-cyan-50/50 p-4">
                <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-cyan-800">
                  <Share2 size={14} /> 联动操作推荐
                </h4>
                <p className="mb-3 text-[11px] leading-relaxed text-slate-600">
                  创建快照后，可基于此快照一键创建干预触达运营任务。
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full border-cyan-200 text-cyan-700"
                  onClick={() => {
                    const state: TouchpointCreateRouteState = {
                      action: 'create_task',
                      snapshotName: snapshotNameInput,
                      patientCount: snapshotPatients.length,
                    };
                    navigate('/touchpoint', {state});
                  }}
                >
                  创建触达任务
                </Button>
              </div>
            </div>
            <div
              data-testid="snapshot-dialog-patients"
              className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-slate-200"
            >
              <div
                data-testid="snapshot-patient-table-scroll"
                className="min-h-0 flex-1 overflow-auto"
              >
                <Table aria-label="快照患者名单">
                  <TableHeader className="sticky top-0 z-10 bg-slate-50">
                    <TableRow>
                      <TableHead className="px-4">姓名/ID</TableHead>
                      <TableHead className="px-4">最近就诊</TableHead>
                      <TableHead className="px-4 text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {snapshotPatients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell className="px-4">
                          <div>{patient.name}</div>
                          <div className="text-[10px] text-slate-400">
                            {patient.id}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 text-xs">
                          {patient.lastVisitDept} / {patient.lastVisitTime}
                        </TableCell>
                        <TableCell className="px-4 text-right">
                          <Select
                            value={
                              snapshotPatientActions[patient.id] ?? 'keep'
                            }
                            onValueChange={(value) => {
                              if (
                                value === 'keep' ||
                                value === 'remove-offline' ||
                                value === 'remove-invalid' ||
                                value === 'remove-other'
                              ) {
                                handleSnapshotPatientAction(
                                  patient.id,
                                  value,
                                );
                              }
                            }}
                          >
                            <SelectTrigger
                              ref={(node) => {
                                if (node) {
                                  snapshotActionRefs.current.set(
                                    patient.id,
                                    node,
                                  );
                                } else {
                                  snapshotActionRefs.current.delete(
                                    patient.id,
                                  );
                                }
                              }}
                              size="sm"
                              aria-label={`${patient.name}处理方式`}
                              className="ml-auto"
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="keep">保留</SelectItem>
                              <SelectItem value="remove-offline">
                                移除: 已线下处理
                              </SelectItem>
                              <SelectItem value="remove-invalid">
                                移除: 联系方式无效
                              </SelectItem>
                              <SelectItem value="remove-other">
                                移除: 其他原因
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
          <DialogFooter className="border-t bg-slate-50 p-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSnapshotDialogOpen(false)}
            >
              取消
            </Button>
            <Button type="button" onClick={saveSnapshot}>
              <Save size={14} />
              {editingSnapshot ? '保存修改' : '确认并生成快照'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={dataServiceModalOpen}
        onOpenChange={setDataServiceModalOpen}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>新建数据开放服务</DialogTitle>
            <DialogDescription>
              配置标签数据集开放的数据字段、鉴权和调用限制。
            </DialogDescription>
          </DialogHeader>
          {dataServiceConfig ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="service-name">服务名称</Label>
                <Input
                  id="service-name"
                  value={dataServiceConfig.name}
                  onChange={(event) =>
                    setDataServiceConfig({
                      ...dataServiceConfig,
                      name: event.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="service-code">服务编码</Label>
                <Input
                  id="service-code"
                  value={dataServiceConfig.code}
                  readOnly
                  className="bg-slate-50 font-mono text-slate-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label>调用方</Label>
                <div className="relative">
                  <Select
                    key={dataServiceConfig.caller ? 'has-value' : 'empty'}
                    value={dataServiceConfig.caller || undefined}
                    onValueChange={(value) =>
                      setDataServiceConfig({
                        ...dataServiceConfig,
                        caller: value,
                      })
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
                  {dataServiceConfig.caller && (
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
                        setDataServiceConfig({
                          ...dataServiceConfig,
                          caller: '',
                        });
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
              <div>
                <Label>绑定动态人群快照</Label>
                <div className="mt-1.5 rounded border border-slate-200 bg-slate-50 p-2 text-sm text-slate-700">
                  {dataServiceConfig.snapshotName}
                </div>
              </div>
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium">返回字段 (勾选)</legend>
                <div className="grid grid-cols-2 gap-2">
                  {fieldOptions.map((option) => {
                    const checked =
                      dataServiceConfig.returnFields.includes(option.value);
                    return (
                      <Label
                        key={option.value}
                        className="flex cursor-pointer items-center gap-2 text-sm font-normal"
                      >
                        <Checkbox
                          aria-label={option.label}
                          checked={checked}
                          onCheckedChange={(nextChecked) =>
                            setDataServiceConfig({
                              ...dataServiceConfig,
                              returnFields: nextChecked
                                ? [
                                    ...dataServiceConfig.returnFields,
                                    option.value,
                                  ]
                                : dataServiceConfig.returnFields.filter(
                                    (field) => field !== option.value,
                                  ),
                            })
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
                    value={dataServiceConfig.authMethod}
                    onValueChange={(value) =>
                      setDataServiceConfig({
                        ...dataServiceConfig,
                        authMethod: value,
                      })
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
                    value={dataServiceConfig.rateLimit}
                    onValueChange={(value) =>
                      setDataServiceConfig({
                        ...dataServiceConfig,
                        rateLimit: value,
                      })
                    }
                  >
                    <SelectTrigger
                      className="w-full"
                      aria-label="调用频率限制"
                    >
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
              <div className="flex items-center justify-between rounded border border-slate-200 p-3">
                <div>
                  <Label htmlFor="service-status">启停状态</Label>
                  <p className="text-xs text-slate-500">
                    {dataServiceConfig.status === 'Enabled'
                      ? '已启用 - 保存后即刻生效'
                      : '已停用 - 服务将拒绝任何调用'}
                  </p>
                </div>
                <Switch
                  id="service-status"
                  aria-label="启停状态"
                  checked={dataServiceConfig.status === 'Enabled'}
                  onCheckedChange={(checked) =>
                    setDataServiceConfig({
                      ...dataServiceConfig,
                      status: checked ? 'Enabled' : 'Disabled',
                    })
                  }
                />
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDataServiceModalOpen(false)}
            >
              取消
            </Button>
            <Button
              type="button"
              disabled={!dataServiceConfig}
              onClick={() => {
                if (!dataServiceConfig) return;
                const state: DataServiceInsertRouteState = {
                  action: 'insert_service',
                  serviceData: dataServiceConfig,
                };
                setDataServiceModalOpen(false);
                navigate('/dataservice', {state});
              }}
            >
              确认保存配置
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Tabs>
  );
}
