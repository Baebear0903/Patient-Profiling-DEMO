import {useMemo, useRef, useState} from 'react';
import {useLocalStorage} from '@/hooks/use-local-storage';
import {Download, Filter, Search, UserRound} from 'lucide-react';
import {useNavigate, useSearchParams} from 'react-router-dom';

import {DataTableShell} from '@/components/common/DataTableShell';
import {CompactPagination} from '@/components/common/CompactPagination';
import {PageHeader} from '@/components/common/PageHeader';
import {StatusBadge} from '@/components/common/StatusBadge';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {Checkbox} from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {Label} from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {Switch} from '@/components/ui/switch';
import type {
  DataServiceInsertRouteState,
  DataServiceRouteData,
  TouchpointCreateRouteState,
} from '@/lib/route-state';
import {mockTags, featureMockTags, warningRecords} from '@/data/mock';
import {cn} from '@/lib/utils';

const fieldOptions = [
  {label: '患者唯一标识', value: 'patientId'},
  {label: '命中标签', value: 'hitTags'},
  {label: '标签命中时间', value: 'hitTime'},
  {label: '最近更新时间', value: 'updateTime'},
  {label: '命中依据引用ID', value: 'refId'},
];

function toEditableTag(tag: any) {
  return {
    ...tag,
  };
}

type WarningTab = 'tags' | 'records';
type RecordFilter = '全部' | '待处理' | '处理中';
type WarningRecord = (typeof warningRecords)[number];

type WarningTag = {
  id: string;
  name: string;
  category: string;
  warningLevel: string;
  status: string;
  scanCycle: string;
  latestScanTime: string;
  hitCount: number;
  newWarningCount: number;
  pendingCount: number;
};

function getSeverityColor(level: string) {
  if (level.includes('高')) {
    return 'border-red-200 bg-red-50 text-red-600';
  }
  if (level.includes('中')) {
    return 'border-amber-200 bg-amber-50 text-amber-600';
  }
  if (level.includes('低')) {
    return 'border-blue-200 bg-blue-50 text-blue-600';
  }
  return 'border-slate-200 bg-slate-50 text-slate-600';
}

function getStableWarningMetric(
  tagId: string,
  metric: 'new-warning' | 'pending',
  limit: number,
) {
  const source = `${tagId}:${metric}`;
  let hash = 2166136261;

  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0) % limit;
}

function ReadOnlyPagination({total}: {total: number}) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">共 {total} 条</span>
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
  );
}

export function WarningManagementView() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab: WarningTab =
    searchParams.get('tab') === 'records' ? 'records' : 'tags';
  const searchKeyword = searchParams.get('q') ?? '';

  const [recordsFilter, setRecordsFilter] = useState<RecordFilter>('全部');
  const [selectedRecord, setSelectedRecord] = useState<WarningRecord | null>(null);
  const [recordsData, setRecordsData] = useLocalStorage<WarningRecord[]>('wm_recordsData', warningRecords);
  const detailTriggerRef = useRef<HTMLButtonElement | null>(null);
  const recordsSearchRef = useRef<HTMLInputElement | null>(null);
  const tagsTabRef = useRef<HTMLButtonElement | null>(null);
  const recordsTabRef = useRef<HTMLButtonElement | null>(null);

  const [dataServiceModalOpen, setDataServiceModalOpen] = useState(false);
  const [dataServiceConfig, setDataServiceConfig] =
    useState<DataServiceRouteData | null>(null);

  const openDataServiceDialog = (tag: WarningTag) => {
    setDataServiceConfig({
      name: `${tag.name}的开放服务`,
      code: `SRV-${Date.now()}`,
      snapshotId: tag.id,
      snapshotName: `预警: ${tag.name}`,
      returnFields: ['patientId', 'hitTags'],
      caller: '',
      authMethod: 'API Key',
      status: 'Enabled',
      rateLimit: '100 次/分钟',
    });
    setDataServiceModalOpen(true);
  };

  const [basicTags] = useLocalStorage<any[]>('tag_mgmt_basicTags_v2', mockTags.map(toEditableTag));
  const [featureTags] = useLocalStorage<any[]>('tag_mgmt_featureTags_v2', featureMockTags.map(toEditableTag));
  const tags = useMemo(() => [...basicTags, ...featureTags], [basicTags, featureTags]);
  
  const warningTags = useMemo<WarningTag[]>(
    () =>
      tags
        .filter((tag) => tag.isWarningTag)
        .map((tag) => ({
          id: tag.id,
          name: tag.name,
          category: tag.category,
          warningLevel:
            'warningLevel' in tag ? tag.warningLevel || '中' : '中',
          status: tag.status,
          scanCycle: tag.cycle,
          latestScanTime: tag.lastScan,
          hitCount: tag.count,
          newWarningCount: getStableWarningMetric(
            tag.id,
            'new-warning',
            20,
          ),
          pendingCount: getStableWarningMetric(tag.id, 'pending', 30),
        })),
    [],
  );

  const normalizedKeyword = searchKeyword.trim().toLowerCase();
  const filteredTags = warningTags.filter(
    (tag) =>
      !normalizedKeyword ||
      tag.name.toLowerCase().includes(normalizedKeyword) ||
      tag.id.toLowerCase().includes(normalizedKeyword),
  );
  const filteredRecords = recordsData.filter((record) => {
    const matchesFilter =
      recordsFilter === '全部' || record.handleStatus === recordsFilter;
    const matchesSearch =
      !normalizedKeyword ||
      record.patientName.toLowerCase().includes(normalizedKeyword) ||
      record.patientId.toLowerCase().includes(normalizedKeyword) ||
      record.tagName.toLowerCase().includes(normalizedKeyword);

    return matchesFilter && matchesSearch;
  });

  const ITEMS_PER_PAGE = 10;
  const [tagsPage, setTagsPage] = useState(1);
  const totalTagsPages = Math.ceil(filteredTags.length / ITEMS_PER_PAGE);
  const safeTagsPage = Math.min(tagsPage, Math.max(totalTagsPages, 1));
  const paginatedTags = filteredTags.slice((safeTagsPage - 1) * ITEMS_PER_PAGE, safeTagsPage * ITEMS_PER_PAGE);

  const [recordsPage, setRecordsPage] = useState(1);
  const totalRecordsPages = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE);
  const safeRecordsPage = Math.min(recordsPage, Math.max(totalRecordsPages, 1));
  const paginatedRecords = filteredRecords.slice((safeRecordsPage - 1) * ITEMS_PER_PAGE, safeRecordsPage * ITEMS_PER_PAGE);

  const totalRecords = recordsData.length;
  const pendingRecords = recordsData.filter(
    (record) => record.handleStatus === '待处理',
  ).length;
  const processingRecords = recordsData.filter(
    (record) => record.handleStatus === '处理中',
  ).length;

  const updateParams = (update: (params: URLSearchParams) => void) => {
    const nextParams = new URLSearchParams(searchParams);
    update(nextParams);
    setSearchParams(nextParams, {replace: true});
  };

  const handleTabChange = (value: string) => {
    const nextTab = value === 'records' ? 'records' : 'tags';
    updateParams((params) => {
      if (nextTab === 'records') {
        params.set('tab', 'records');
      } else {
        params.delete('tab');
      }
    });
  };

  const handleSearchChange = (value: string) => {
    updateParams((params) => {
      if (activeTab === 'records') {
        params.set('tab', 'records');
      } else {
        params.delete('tab');
      }
      if (value) {
        params.set('q', value);
      } else {
        params.delete('q');
      }
    });
  };

  const handleViewRecords = (tag: WarningTag) => {
    setRecordsFilter('全部');
    updateParams((params) => {
      params.set('tab', 'records');
      params.set('q', tag.name);
    });
  };

  const handleViewRules = (tag: WarningTag) => {
    navigate(`/tags?q=${encodeURIComponent(tag.name)}`);
  };

  const openRecordDetails = (
    record: WarningRecord,
    trigger: HTMLButtonElement,
  ) => {
    detailTriggerRef.current = trigger;
    setSelectedRecord(record);
  };

  const closeRecordDetails = () => {
    setSelectedRecord(null);
  };

  const tagsToolbar = (
    <>
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-2 size-4 text-slate-400" />
        <Input
          aria-label="搜索预警标签"
          placeholder="搜索标签名称/编码"
          value={searchKeyword}
          onChange={(event) => handleSearchChange(event.target.value)}
          className="w-64 pl-8"
        />
      </div>
      <Button type="button" variant="outline" size="sm">
        <Filter />
        筛选
      </Button>
    </>
  );

  const recordsToolbar = (
    <>
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-2 size-4 text-slate-400" />
        <Input
          ref={recordsSearchRef}
          aria-label="搜索预警记录"
          placeholder="搜索患者/ID/标签"
          value={searchKeyword}
          onChange={(event) => handleSearchChange(event.target.value)}
          className="w-64 pl-8"
        />
      </div>
      <Button type="button" variant="outline" size="sm">
        <Filter />
        筛选
      </Button>
      <Button type="button" variant="outline" size="sm">
        <Download />
        导出
      </Button>
    </>
  );

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <PageHeader
        title="预警管理"
        description="识别关键风险与盲点人群，实现主动干预与早防早治。"
      />

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="min-h-0 flex-1"
      >
        <TabsList className="shrink-0" aria-label="预警管理视图">
          <TabsTrigger ref={tagsTabRef} value="tags">
            预警标签
          </TabsTrigger>
          <TabsTrigger ref={recordsTabRef} value="records">
            预警记录
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tags" className="min-h-0">
          <DataTableShell
            title="预警标签管理"
            toolbar={tagsToolbar}
            className="flex h-full min-h-0 flex-col"
            contentClassName="min-h-0 flex-1 [&_[data-slot=table-container]]:h-full [&_[data-slot=table-container]]:overflow-auto"
            empty={
              filteredTags.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  没有找到匹配的标签
                </p>
              ) : null
            }
            footer={
              <div className="flex items-center justify-end text-[11px] text-slate-500">
                <CompactPagination 
                  page={safeTagsPage} 
                  pageSize={ITEMS_PER_PAGE} 
                  total={filteredTags.length} 
                  onPageChange={setTagsPage} 
                />
              </div>
            }
          >
            <Table aria-label="预警标签列表">
              <TableHeader className="sticky top-0 z-10 bg-slate-50 text-xs uppercase text-slate-500 shadow-sm">
                <TableRow>
                  <TableHead className="px-4">标签名称/编码</TableHead>
                  <TableHead className="px-4">预警分类</TableHead>
                  <TableHead className="px-4">等级</TableHead>
                  <TableHead className="px-4">状态</TableHead>
                  <TableHead className="px-4">扫描信息</TableHead>
                  <TableHead className="px-4 text-right">命中人数</TableHead>
                  <TableHead className="px-4 text-right">新增预警</TableHead>
                  <TableHead className="px-4 text-right">待处理</TableHead>
                  <TableHead className="px-4">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTags.map((tag) => (
                  <TableRow key={tag.id}>
                    <TableCell className="px-4 py-3">
                      <div className="font-medium text-slate-800">
                        {tag.name}
                      </div>
                      <div className="mt-0.5 font-mono text-xs text-slate-400">
                        {tag.id}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-slate-600">
                      {tag.category}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <StatusBadge
                        status={`${tag.warningLevel}风险`}
                        className={getSeverityColor(tag.warningLevel)}
                      />
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <StatusBadge status={tag.status} />
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="text-slate-700">{tag.scanCycle}</div>
                      <div className="mt-0.5 text-[10px] text-slate-400">
                        {tag.latestScanTime}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right font-medium text-slate-700">
                      {tag.hitCount}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right font-medium text-red-600">
                      +{tag.newWarningCount}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right font-medium text-amber-600">
                      {tag.pendingCount}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          className="text-cyan-600 hover:text-cyan-800"
                          onClick={() => handleViewRecords(tag)}
                        >
                          查看记录
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          className="text-slate-500 hover:text-slate-700"
                          onClick={() => handleViewRules(tag)}
                        >
                          规则
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => openDataServiceDialog(tag)}
                        >
                          数据开放
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DataTableShell>
        </TabsContent>

        <TabsContent value="records" className="min-h-0">
          <DataTableShell
            title="预警记录"
            description="按处理状态快速筛选当前预警记录"
            toolbar={recordsToolbar}
            className="flex h-full min-h-0 flex-col"
            contentClassName="flex min-h-0 flex-1 flex-col overflow-hidden [&_[data-slot=table-container]]:min-h-0 [&_[data-slot=table-container]]:flex-1 [&_[data-slot=table-container]]:overflow-auto"
            footer={
              <div className="flex items-center justify-end text-[11px] text-slate-500">
                <CompactPagination 
                  page={safeRecordsPage} 
                  pageSize={ITEMS_PER_PAGE} 
                  total={filteredRecords.length} 
                  onPageChange={setRecordsPage} 
                />
              </div>
            }
          >
            <div className="flex flex-wrap gap-2 border-b bg-slate-50 px-4 py-2">
              {(
                [
                  ['全部', totalRecords],
                  ['待处理', pendingRecords],
                  ['处理中', processingRecords],
                ] as const
              ).map(([filter, count]) => (
                <Button
                  key={filter}
                  type="button"
                  variant={recordsFilter === filter ? 'outline' : 'ghost'}
                  size="xs"
                  aria-pressed={recordsFilter === filter}
                  className={cn(
                    recordsFilter === filter && filter === '待处理'
                      ? 'border-red-200 bg-red-50 text-red-700'
                      : '',
                    recordsFilter === filter && filter === '处理中'
                      ? 'border-amber-200 bg-amber-50 text-amber-700'
                      : '',
                  )}
                  onClick={() => setRecordsFilter(filter)}
                >
                  {filter} ({count})
                </Button>
              ))}
            </div>
            <Table aria-label="预警记录列表">
              <TableHeader className="sticky top-0 z-10 bg-slate-50 text-xs uppercase text-slate-500 shadow-sm">
                <TableRow>
                  <TableHead className="px-4">预警时间</TableHead>
                  <TableHead className="px-4">患者信息</TableHead>
                  <TableHead className="px-4">预警标签/分类</TableHead>
                  <TableHead className="px-4">风险等级</TableHead>
                  <TableHead className="max-w-[250px] px-4">
                    命中原因
                  </TableHead>
                  <TableHead className="px-4">状态 / 责任人</TableHead>
                  <TableHead className="px-4 text-center">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-32 text-center text-sm text-muted-foreground"
                    >
                      没有找到匹配的记录
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRecords.map((record) => (
                    <TableRow key={record.warningRecordId}>
                      <TableCell className="px-4 py-3">
                        <div className="font-medium text-slate-800">
                          {record.latestScanTime.split(' ')[0]}
                        </div>
                        <div className="text-xs text-slate-500">
                          {record.latestScanTime.split(' ')[1] || ''}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-1 font-medium text-slate-800">
                          {record.patientName}
                          <span className="text-xs font-normal text-slate-400">
                            ({record.gender}, {record.age}岁)
                          </span>
                        </div>
                        <div className="mt-0.5 font-mono text-xs text-slate-500">
                          {record.patientId}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="font-medium text-slate-800">
                          {record.tagName}
                        </div>
                        <div className="mt-0.5 text-xs text-slate-500">
                          {record.tagCode}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <StatusBadge
                          status={record.riskLevel}
                          className={getSeverityColor(record.riskLevel)}
                        />
                      </TableCell>
                      <TableCell className="px-4 py-3 text-xs text-slate-600">
                        <div
                          className="line-clamp-2 whitespace-normal"
                          title={record.triggerReason}
                        >
                          {record.triggerReason}
                        </div>
                        <div
                          className="mt-1 line-clamp-1 whitespace-normal text-[10px] text-slate-400"
                          title={record.evidenceSummary}
                        >
                          {record.evidenceSummary}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <StatusBadge status={record.handleStatus} />
                        <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                          <UserRound className="size-3" />
                          {record.owner}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            className="text-cyan-600 hover:text-cyan-800"
                            onClick={(event) =>
                              openRecordDetails(record, event.currentTarget)
                            }
                          >
                            详情
                          </Button>
                          {record.handleStatus !== '已处理' ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="xs"
                              className="text-blue-600 hover:text-blue-800"
                              onClick={() => {
                                const state: TouchpointCreateRouteState = {
                                  action: 'create_task',
                                  snapshotName: `预警: ${record.tagName}`,
                                  patientCount: 1,
                                };
                                navigate('/touchpoint', {state});
                              }}
                            >
                              处置
                            </Button>
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
      </Tabs>

      <Sheet
        open={selectedRecord !== null}
        onOpenChange={(open) => {
          if (!open) {
            closeRecordDetails();
          }
        }}
      >
        <SheetContent
          side="right"
          className="w-[440px] gap-0 overflow-hidden p-0 sm:max-w-[440px]"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (detailTriggerRef.current?.isConnected) {
              detailTriggerRef.current.focus();
              return;
            }
            if (recordsSearchRef.current?.isConnected) {
              recordsSearchRef.current.focus();
              return;
            }
            const activeTabElement =
              activeTab === 'records'
                ? recordsTabRef.current
                : tagsTabRef.current;
            activeTabElement?.focus();
          }}
        >
          <SheetHeader className="shrink-0 border-b px-5 py-4">
            <SheetTitle>预警记录详情</SheetTitle>
            <SheetDescription>
              查看患者身份、预警依据和当前处置责任。
            </SheetDescription>
          </SheetHeader>

          {selectedRecord ? (
            <>
              <div
                data-testid="warning-sheet-scroll"
                className="min-h-0 flex-1 overflow-y-auto bg-slate-50"
              >
                <div className="space-y-4 p-5">
                  <section className="rounded-lg border bg-white p-5 shadow-sm">
                    <h3 className="mb-4 border-b pb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                      患者身份
                    </h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-5 text-sm">
                      <div>
                        <div className="mb-1 text-xs text-slate-500">
                          患者姓名
                        </div>
                        <div className="font-semibold text-slate-800">
                          {selectedRecord.patientName}
                        </div>
                      </div>
                      <div>
                        <div className="mb-1 text-xs text-slate-500">
                          患者ID
                        </div>
                        <div className="font-mono font-semibold text-slate-800">
                          {selectedRecord.patientId}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="mb-1 text-xs text-slate-500">
                          性别/年龄
                        </div>
                        <div className="font-semibold text-slate-800">
                          {selectedRecord.gender}，{selectedRecord.age}岁
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-lg border bg-white p-5 shadow-sm">
                    <h3 className="mb-4 border-b pb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                      预警信息
                    </h3>
                    <div className="space-y-4 text-sm">
                      <div>
                        <div className="mb-1 text-xs text-slate-500">
                          预警编号
                        </div>
                        <div className="font-mono font-semibold text-slate-800">
                          {selectedRecord.warningRecordId}
                        </div>
                      </div>
                      <div>
                        <div className="mb-1 text-xs text-slate-500">
                          预警标签
                        </div>
                        <div className="font-semibold text-slate-800">
                          {selectedRecord.tagName}
                        </div>
                      </div>
                      <div>
                        <div className="mb-1 text-xs text-slate-500">
                          风险等级
                        </div>
                        <StatusBadge
                          status={selectedRecord.riskLevel}
                          className={getSeverityColor(
                            selectedRecord.riskLevel,
                          )}
                        />
                      </div>
                      <div>
                        <div className="mb-1 text-xs text-slate-500">
                          预警时间
                        </div>
                        <div className="font-semibold text-slate-800">
                          {selectedRecord.latestScanTime}
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-lg border bg-white p-5 shadow-sm">
                    <h3 className="mb-4 border-b pb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                      命中规则
                    </h3>
                    <div className="mb-4 text-sm font-medium text-slate-800">
                      {selectedRecord.triggerReason}
                    </div>
                    <div className="rounded border bg-slate-50 p-4 text-sm text-slate-700">
                      <span className="mb-2 block text-xs font-bold uppercase text-slate-400">
                        抽取证据
                      </span>
                      <div className="mt-2 border-l-2 border-cyan-400 pl-3">
                        {selectedRecord.evidenceSummary}
                      </div>
                    </div>
                  </section>
                </div>
              </div>

              <SheetFooter className="shrink-0 gap-0 border-t p-0">
                <div className="flex items-center justify-between border-b p-5">
                  <div>
                    <div className="mb-1 text-xs text-slate-500">
                      当前状态及责任人
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                      <StatusBadge status={selectedRecord.handleStatus} />
                      <span className="font-normal text-slate-300">|</span>
                      <span className="font-normal text-slate-600">
                        {selectedRecord.owner}
                      </span>
                    </div>
                  </div>
                </div>
                {selectedRecord.recommendedAction ? (
                  <div className="bg-blue-50/50 px-5 py-4">
                    <div className="mb-2 text-xs font-bold uppercase tracking-wider text-blue-400">
                      系统推荐处置
                    </div>
                    <div className="text-sm font-medium text-blue-900">
                      {selectedRecord.recommendedAction}
                    </div>
                  </div>
                ) : null}
                <div className="flex gap-3 border-t p-5">
                  <SheetClose asChild>
                    <Button type="button" variant="outline" className="flex-1">
                      关闭
                    </Button>
                  </SheetClose>
                  {selectedRecord.handleStatus !== '已处理' ? (
                    <Button type="button" className="flex-1">
                      立即处置
                    </Button>
                  ) : null}
                </div>
              </SheetFooter>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <Dialog
        open={dataServiceModalOpen}
        onOpenChange={setDataServiceModalOpen}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>新建数据开放服务</DialogTitle>
            <DialogDescription>
              配置预警标签数据集开放的数据字段、鉴权和调用限制。
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
                      className="absolute right-8 top-1/2 h-6 w-6 -translate-y-1/2 text-slate-400 hover:text-slate-600 hover:bg-transparent z-10"
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
    </div>
  );
}
