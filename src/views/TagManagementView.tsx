import {useEffect, useRef, useState} from 'react';
import {useLocalStorage} from '@/hooks/use-local-storage';
import {
  ArrowLeft,
  Check,
  Edit3,
  Eye,
  Filter,
  Folder,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import {useSearchParams} from 'react-router-dom';
import {toast} from 'sonner';
import {CompactPagination} from '@/components/common/CompactPagination';
import {DataTableShell} from '@/components/common/DataTableShell';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {Textarea} from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {mockTags, tagCategories, featureMockTags, featureTagCategories} from '@/data/mock';
import {
  contextScopes,
  domainFields,
  fieldTypeOperators,
  ruleDomains,
} from '@/data/rules';
import {cn} from '@/lib/utils';

type ViewMode = 'list' | 'editor';
type EditorTab = 'basic' | 'rules' | 'warning';
type TagStatus = '已发布' | '草稿' | '已停用';
type MainTab = 'basic' | 'feature';

interface RuleCondition {
  id: string;
  type: string;
  domain: string;
  field: string;
  operator: string;
  value: string;
}

interface EditorConfig {
  contextScope: string;
  conditions: RuleCondition[];
}

interface EditableTag {
  id?: string;
  code?: string;
  name: string;
  category: string;
  scene: string;
  status?: TagStatus;
  count?: number | string;
  cycle: string;
  lastScan?: string;
  lastUpdateTime?: string;
  version?: string;
  description?: string;
  isWarningTag?: boolean;
  warningLevel?: string;
  warningType?: string;
  disposalAdvice?: string;
  editorConfig?: EditorConfig;
  referencedTags?: string[];
}

interface TagFormErrors {
  name?: string;
  category?: string;
  scene?: string;
}

interface PatientPreview {
  id: string;
  visitNo: string;
  name: string;
  gender: string;
  age: number;
  lastVisitTime: string;
  lastVisitDept: string;
}

interface Category {
  name: string;
  sort: number;
}

const DEFAULT_CONTEXT = 'SAME_CONSTITUTION_ASSESSMENT';
const DEFAULT_CONDITION: RuleCondition = {
  id: '1',
  type: '纳入条件',
  domain: '中医体质辨识记录',
  field: '九种体质',
  operator: '包含',
  value: '气虚质',
};
const ITEMS_PER_PAGE = 10;

function createEmptyTag(): EditableTag {
  return {
    name: '',
    category: '',
    scene: '',
    cycle: '每日',
    description: '',
    isWarningTag: false,
    warningType: '体质异常预警',
    warningLevel: '中',
    disposalAdvice: '',
  };
}

function validateTag(tag: EditableTag): TagFormErrors {
  const errors: TagFormErrors = {};
  if (!tag.name.trim()) errors.name = '请输入标签名称';
  if (!tag.category) errors.category = '请选择所属分类';
  if (!tag.scene.trim()) errors.scene = '请输入适用场景/业务用途';
  return errors;
}

function toEditableTag(tag: any): EditableTag {
  return {
    ...tag,
    status: tag.status as TagStatus,
    editorConfig: tag.editorConfig as EditorConfig | undefined,
    referencedTags: tag.referencedTags || undefined,
  };
}

function PatientTable({patients}: {patients: PatientPreview[]}) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(patients.length / pageSize);
  const safePage = Math.min(currentPage, Math.max(totalPages, 1));
  const paginatedPatients = patients.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto">
        <Table className="min-w-[700px] whitespace-nowrap text-left">
          <TableHeader>
            <TableRow className="bg-slate-50 text-[11px] text-slate-500">
              <TableHead className="px-4 py-3">患者ID</TableHead>
              <TableHead className="px-4 py-3">门诊号</TableHead>
              <TableHead className="px-4 py-3">姓名</TableHead>
              <TableHead className="px-4 py-3">性别</TableHead>
              <TableHead className="px-4 py-3">年龄</TableHead>
              <TableHead className="px-4 py-3">最近就诊时间</TableHead>
              <TableHead className="px-4 py-3">最近就诊科室</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPatients.map((patient) => (
              <TableRow
                key={`${patient.id}-${patient.visitNo}`}
                className="text-xs text-slate-700"
              >
                <TableCell className="px-4 py-3 font-mono text-slate-500">
                  {patient.id}
                </TableCell>
                <TableCell className="px-4 py-3 font-mono">
                  {patient.visitNo}
                </TableCell>
                <TableCell className="px-4 py-3 font-medium">
                  {patient.name}
                </TableCell>
                <TableCell className="px-4 py-3">{patient.gender}</TableCell>
                <TableCell className="px-4 py-3">{patient.age}</TableCell>
                <TableCell className="px-4 py-3 text-slate-500">
                  {patient.lastVisitTime}
                </TableCell>
                <TableCell className="px-4 py-3">
                  {patient.lastVisitDept}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-auto shrink-0 border-t border-slate-200 bg-white p-3">
        <div className="flex items-center justify-end text-[11px] text-slate-500">
          <CompactPagination
            page={safePage}
            pageSize={pageSize}
            total={patients.length}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}

export function TagManagementView({theme = 'default'}: {theme?: 'default' | 'admin'}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const createMode = searchParams.get('mode') === 'create';
  const queryValue = searchParams.get('q') ?? '';
  const [viewMode, setViewMode] = useState<ViewMode>(
    createMode ? 'editor' : 'list',
  );
  const [mainTabState, setMainTabState] = useState<MainTab>('basic');
  const mainTab = theme === 'admin' ? 'basic' : mainTabState;
  const setMainTab = setMainTabState;
  const [activeCategory, setActiveCategory] = useState(mainTab === 'feature' ? '全部特色标签' : '全部');
  const [editingTag, setEditingTag] = useState<EditableTag | null>(
    createMode ? createEmptyTag() : null,
  );
  const [formErrors, setFormErrors] = useState<TagFormErrors>({});
  
  const [basicCategories, setBasicCategories] = useLocalStorage<Category[]>('tag_mgmt_basicCategories', tagCategories);
  const [featureCategories, setFeatureCategories] = useLocalStorage<Category[]>('tag_mgmt_featureCategories', featureTagCategories);
  const categories = mainTab === 'basic' ? basicCategories : featureCategories;
  const setCategories = mainTab === 'basic' ? setBasicCategories : setFeatureCategories;

  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryInput, setCategoryInput] = useState('');
  const [categorySort, setCategorySort] = useState(1);
  const [categorySearchKw, setCategorySearchKw] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null,
  );
  const [tagSearchKw, setTagSearchKw] = useState(queryValue);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeEditorTab, setActiveEditorTab] =
    useState<EditorTab>('basic');
  const [contextScope, setContextScope] = useState(DEFAULT_CONTEXT);
  const [conditions, setConditions] = useState<RuleCondition[]>([
    DEFAULT_CONDITION,
  ]);
  const [previewResults, setPreviewResults] = useState<{
    total: number;
    patients: PatientPreview[];
  } | null>(null);

  const [basicTags, setBasicTags] = useLocalStorage<EditableTag[]>('tag_mgmt_basicTags_v2', mockTags.map(toEditableTag));
  const [featureTags, setFeatureTags] = useLocalStorage<EditableTag[]>('tag_mgmt_featureTags_v2', featureMockTags.map(toEditableTag));
  const tags = mainTab === 'basic' ? basicTags : featureTags;
  const setTags = mainTab === 'basic' ? setBasicTags : setFeatureTags;

  const [tagToDelete, setTagToDelete] = useState<EditableTag | null>(null);
  const [statusTag, setStatusTag] = useState<EditableTag | null>(null);
  const [isPreviewSheetOpen, setIsPreviewSheetOpen] = useState(false);
  const [previewSheetData, setPreviewSheetData] = useState<{
    tag: EditableTag;
    total: number;
    patients: PatientPreview[];
  } | null>(null);
  const previousCreateMode = useRef(createMode);

  const [isRefTagDropdownOpen, setIsRefTagDropdownOpen] = useState(false);
  const [refTagSearchKw, setRefTagSearchKw] = useState('');
  const refTagContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        refTagContainerRef.current &&
        !refTagContainerRef.current.contains(event.target as Node)
      ) {
        setIsRefTagDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const renderRefTagDropdown = () => {
    if (!isRefTagDropdownOpen) return null;
    const allBasicTags = basicTags.filter(t => t.status === '已发布');
    const filteredBasicTags = allBasicTags.filter(tag => 
      !refTagSearchKw || tag.name.includes(refTagSearchKw) || tag.category.includes(refTagSearchKw) || (tag.code && tag.code.includes(refTagSearchKw))
    );
    const selectedTags = editingTag?.referencedTags || [];

    return (
      <div className="absolute left-0 mt-1 flex w-full max-w-[400px] flex-col overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg z-50">
        <div className="relative flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 p-2">
          <Search className="absolute left-4 text-slate-400" size={12} />
          <Input
            autoFocus
            aria-label="搜索基础标签名称或类别"
            placeholder="搜索基础标签名称/类别..."
            value={refTagSearchKw}
            onChange={(event) => setRefTagSearchKw(event.target.value)}
            className="h-7 pl-6 text-[10px]"
          />
        </div>
        <div className="max-h-60 overflow-y-auto">
          {filteredBasicTags.length === 0 ? (
            <div className="p-4 text-center text-[10px] text-slate-400">
              无匹配的已发布基础标签
            </div>
          ) : (
            filteredBasicTags.map((tag) => {
              const isSelected = selectedTags.includes(tag.name);
              return (
                <Label
                  key={tag.id}
                  className="flex cursor-pointer items-start gap-2 border-b border-slate-50 px-3 py-2 hover:bg-slate-50"
                >
                  <Checkbox
                    checked={isSelected}
                    aria-label={tag.name}
                    onCheckedChange={(checked) => {
                      const newSelected = checked
                        ? [...selectedTags, tag.name]
                        : selectedTags.filter((item) => item !== tag.name);
                      handleTagField('referencedTags', newSelected);
                    }}
                  />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-semibold text-slate-700">
                      {tag.name}
                    </span>
                    <span className="text-[9px] text-slate-500">
                      [{tag.category}] {tag.scene}
                    </span>
                  </div>
                </Label>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const updateSearchParams = (
    updates: Record<string, string | undefined>,
  ) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    setSearchParams(next, {replace: true});
  };

  const returnToList = (clearFilters = false) => {
    setViewMode('list');
    setEditingTag(null);
    setFormErrors({});
    if (clearFilters) {
      setTagSearchKw('');
      setActiveCategory(mainTab === 'feature' ? '全部特色标签' : '全部');
      setCurrentPage(1);
      updateSearchParams({mode: undefined, q: undefined});
      return;
    }
    updateSearchParams({mode: undefined});
  };

  const prepareEmptyEditor = () => {
    setEditingTag(createEmptyTag());
    setFormErrors({});
    setActiveEditorTab('basic');
    setPreviewResults(null);
    setContextScope(DEFAULT_CONTEXT);
    setConditions([{...DEFAULT_CONDITION}]);
    setViewMode('editor');
  };

  const resetEditor = () => {
    prepareEmptyEditor();
    updateSearchParams({mode: 'create'});
  };

  useEffect(() => {
    setTagSearchKw(queryValue);
    setActiveCategory(mainTab === 'feature' ? '全部特色标签' : '全部');
    setCurrentPage(1);
  }, [queryValue]);

  useEffect(() => {
    if (createMode && !previousCreateMode.current) {
      prepareEmptyEditor();
    }
    previousCreateMode.current = createMode;
  }, [createMode]);

  const loadTagConfig = (tag: EditableTag) => {
    setContextScope(tag.editorConfig?.contextScope || 'ANY');
    setConditions(tag.editorConfig?.conditions || []);
  };

  const handleEdit = (tag: EditableTag, tab: EditorTab = 'basic') => {
    setEditingTag({...tag});
    setFormErrors({});
    loadTagConfig(tag);
    setActiveEditorTab(tab);
    setPreviewResults(null);
    setViewMode('editor');
    updateSearchParams({mode: undefined});
  };

  const handleTagField = <K extends keyof EditableTag>(
    field: K,
    value: EditableTag[K],
  ) => {
    setEditingTag((current) => ({
      ...(current ?? createEmptyTag()),
      [field]: value,
    }));
    if (field === 'name' || field === 'category' || field === 'scene') {
      setFormErrors((current) => ({...current, [field]: undefined}));
    }
  };

  const handleSave = (status: Extract<TagStatus, '已发布' | '草稿'>) => {
    const currentTag = editingTag ?? createEmptyTag();
    const errors = validateTag(currentTag);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      setActiveEditorTab('basic');
      toast.error('请完善必填信息后再提交');
      return;
    }

    const savedTag: EditableTag = {
      ...currentTag,
      id: currentTag.id || `T${String(Date.now()).slice(-5)}`,
      code: currentTag.code || `TG_${String(Date.now()).slice(-4)}`,
      name: currentTag.name.trim(),
      category: currentTag.category,
      scene: currentTag.scene.trim(),
      status,
      count: currentTag.count ?? previewResults?.total ?? 0,
      cycle: currentTag.cycle || '每日',
      lastScan: currentTag.lastScan || '刚刚',
      lastUpdateTime: '刚刚',
      version: currentTag.version || 'v1.0.0',
      editorConfig: {contextScope, conditions},
    };

    setTags((current) =>
      currentTag.id
        ? current.map((tag) => (tag.id === currentTag.id ? savedTag : tag))
        : [savedTag, ...current],
    );
    toast.success(status === '已发布' ? '标签已发布' : '草稿已保存');
    returnToList(!currentTag.id);
  };

  const handleSaveCategory = () => {
    const name = categoryInput.trim();
    if (!name) {
      toast.error('请输入标签分类名称');
      return;
    }

    if (editingCategory) {
      setCategories((current) =>
        current.map((category) =>
          category.name === editingCategory.name
            ? {name, sort: categorySort}
            : category,
        ),
      );
      setTags((current) =>
        current.map((tag) =>
          tag.category === editingCategory.name ? {...tag, category: name} : tag,
        ),
      );
      if (activeCategory === editingCategory.name) setActiveCategory(name);
      toast.success('标签分类已更新');
    } else if (!categories.some((category) => category.name === name)) {
      setCategories((current) => [
        ...current,
        {name, sort: categorySort},
      ]);
      toast.success('标签分类已新增');
    }
    setIsCategoryDialogOpen(false);
  };

  const handleConfirmDeleteCategory = () => {
    if (!categoryToDelete) return;
    setCategories((current) =>
      current.filter((category) => category.name !== categoryToDelete.name),
    );
    setTags((current) =>
      current.filter((tag) => tag.category !== categoryToDelete.name),
    );
    if (activeCategory === categoryToDelete.name) setActiveCategory('全部');
    toast.success('标签分类已删除');
    setCategoryToDelete(null);
  };

  const handleConfirmDeleteTag = () => {
    if (!tagToDelete?.id) return;
    setTags((current) => current.filter((tag) => tag.id !== tagToDelete.id));
    toast.success('标签已删除');
    setTagToDelete(null);
  };

  const handleConfirmStatus = () => {
    if (!statusTag?.id) return;
    const nextStatus = statusTag.status === '已发布' ? '已停用' : '已发布';
    setTags((current) =>
      current.map((tag) =>
        tag.id === statusTag.id ? {...tag, status: nextStatus} : tag,
      ),
    );
    toast.success(nextStatus === '已停用' ? '标签已停用' : '标签已发布');
    setStatusTag(null);
  };

  const handleConditionChange = (
    id: string,
    fieldKey: keyof RuleCondition,
    value: string,
  ) => {
    setConditions((current) =>
      current.map((condition) => {
        if (condition.id !== id) return condition;
        const next = {...condition, [fieldKey]: value};
        if (fieldKey === 'domain') {
          const defaultField = domainFields[value][0];
          next.field = defaultField.name;
          next.operator = fieldTypeOperators[defaultField.type][0];
          next.value = '';
        } else if (fieldKey === 'field') {
          const field = domainFields[condition.domain].find(
            (item) => item.name === value,
          );
          if (field) {
            next.operator = fieldTypeOperators[field.type][0];
            next.value = '';
          }
        }
        return next;
      }),
    );
  };

  const generateMockPatients = (count: number): PatientPreview[] => {
    const names = [
      '张伟',
      '王芳',
      '李娜',
      '张敏',
      '刘洋',
      '陈杰',
      '王强',
      '李明',
      '林静',
      '赵强',
    ];
    const departments = [
      '中医内科',
      '心血管科',
      '内分泌科',
      '针灸科',
      '推拿科',
      '治未病科',
      '肿瘤科',
    ];
    return Array.from({length: Math.min(count, 55)}, (_, index) => ({
      id: `P${String(10000 + index + Math.floor(Math.random() * 1000))}`,
      visitNo: `MZ${String(200000 + index + Math.floor(Math.random() * 10000))}`,
      name: names[Math.floor(Math.random() * names.length)],
      gender: Math.random() > 0.5 ? '男' : '女',
      age: Math.floor(Math.random() * 60) + 18,
      lastVisitTime: `2026-06-${String(Math.floor(Math.random() * 10) + 1).padStart(2, '0')}`,
      lastVisitDept:
        departments[Math.floor(Math.random() * departments.length)],
    }));
  };

  const handleRulePreview = () => {
    const total = Math.floor(Math.random() * 10000) + 1000;
    setPreviewResults({total, patients: generateMockPatients(total)});
  };

  const handlePreviewSheet = (tag: EditableTag) => {
    const total =
      typeof tag.count === 'number'
        ? tag.count
        : tag.count && tag.count !== '-'
          ? Number(tag.count)
          : Math.floor(Math.random() * 1000) + 100;
    setPreviewSheetData({
      tag,
      total,
      patients: generateMockPatients(total),
    });
    setIsPreviewSheetOpen(true);
  };

  const filteredTags = tags.filter((tag) => {
    // 平台端（非后台）的基础标签只展示已发布
    if (theme === 'default' && mainTab === 'basic' && tag.status !== '已发布') {
      return false;
    }
    const matchesCategory =
      activeCategory === '全部' || activeCategory === '全部特色标签' || tag.category === activeCategory;
    const keyword = tagSearchKw.trim().toLowerCase();
    const matchesSearch =
      !keyword ||
      tag.name.toLowerCase().includes(keyword) ||
      tag.id?.toLowerCase().includes(keyword) ||
      tag.code?.toLowerCase().includes(keyword);
    return matchesCategory && matchesSearch;
  });
  const totalPages = Math.ceil(filteredTags.length / ITEMS_PER_PAGE);
  const safePage = Math.min(currentPage, Math.max(totalPages, 1));
  const paginatedTags = filteredTags.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE,
  );

  const renderList = () => {
    const canEditCurrentTab = mainTab === 'basic' ? theme === 'admin' : true;
    
    return (
    <div className="flex h-full flex-col gap-4">
      <Tabs
        value={mainTab}
        onValueChange={(v) => {
          setMainTab(v as any);
          setActiveCategory(v === 'feature' ? '全部特色标签' : '全部');
          setCurrentPage(1);
        }}
        className="min-h-0 flex-1 flex flex-col"
      >
        <TabsList className={cn("shrink-0 mb-4 w-fit", theme === 'admin' && "hidden")} aria-label="标签管理视图">
          <TabsTrigger value="basic">
            基础标签
          </TabsTrigger>
          <TabsTrigger value="feature">
            特色标签
          </TabsTrigger>
        </TabsList>
        <div className="flex flex-1 gap-3 min-h-0">
          <aside className="flex w-48 flex-shrink-0 flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="space-y-3 border-b border-slate-200 p-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                aria-label="搜索标签分类"
                className="h-8 bg-slate-50 pl-8 text-xs"
                placeholder="搜索标签分类..."
                value={categorySearchKw}
                onChange={(event) => setCategorySearchKw(event.target.value)}
              />
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
            </div>
            {canEditCurrentTab && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    aria-label="新增标签分类"
                    size="icon-sm"
                    variant="outline"
                    onClick={() => {
                      setEditingCategory(null);
                      setCategoryInput('');
                      setCategorySort(1);
                      setIsCategoryDialogOpen(true);
                    }}
                  >
                    <Plus />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>新增标签分类</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
        <div className="flex-1 space-y-1 overflow-y-auto p-2">
          {[...categories]
            .sort((a, b) => a.sort - b.sort)
            .filter((category) =>
              category.name
                .toLowerCase()
                .includes(categorySearchKw.toLowerCase()),
            )
            .map((category) => (
              <div
                key={category.name}
                className={cn(
                  'group flex items-center rounded-md transition-colors',
                  activeCategory === category.name
                    ? 'bg-cyan-50 text-cyan-700'
                    : 'text-slate-600 hover:bg-slate-50',
                )}
              >
                <Button
                  aria-label={category.name}
                  aria-pressed={activeCategory === category.name}
                  className="h-9 min-w-0 flex-1 justify-start px-3 text-xs"
                  variant="ghost"
                  onClick={() => {
                    setActiveCategory(category.name);
                    setCurrentPage(1);
                  }}
                >
                  <span className="truncate">{category.name}</span>
                  {(category.name === '全部' || category.name === '全部特色标签') && (
                    <span className="ml-auto text-[10px] text-slate-400">
                      {tags.length}
                    </span>
                  )}
                </Button>
                {(category.name !== '全部' && category.name !== '全部特色标签') && canEditCurrentTab && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        aria-label={`编辑标签分类 ${category.name}`}
                        className="mr-1 opacity-0 group-hover:opacity-100"
                        size="icon-xs"
                        variant="ghost"
                        onClick={() => {
                          setEditingCategory(category);
                          setCategoryInput(category.name);
                          setCategorySort(category.sort || 1);
                          setIsCategoryDialogOpen(true);
                        }}
                      >
                        <Edit3 />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>编辑标签分类</TooltipContent>
                  </Tooltip>
                )}
              </div>
            ))}
        </div>
      </aside>

      <DataTableShell
        title={mainTab === 'feature' ? '特色标签清单' : '标签清单'}
        description={mainTab === 'feature' ? `面向业务场景组合而成的复合标签，共 ${filteredTags.length} 个` : `共 ${filteredTags.length} 个标签`}
        className="flex min-w-0 flex-1 flex-col shadow-sm"
        contentClassName="min-h-0 flex-1 overflow-hidden"
        toolbar={
          <>
            {canEditCurrentTab && (
              <Button
                className={cn(
                  "mr-2 text-xs",
                  theme === 'admin' 
                    ? "bg-[#0092B9] hover:bg-[#0081a4]" 
                    : "bg-cyan-600 hover:bg-cyan-700"
                )}
                size="sm"
                onClick={resetEditor}
              >
                <Plus />
                {mainTab === 'feature' ? '新增标签' : '新增标签'}
              </Button>
            )}
            <div className="relative">
              <Input
                aria-label="搜索标签名称或编码"
                className="h-8 w-64 bg-white pl-8 text-xs"
                placeholder="搜索标签名称/编码..."
                value={tagSearchKw}
                onChange={(event) => {
                  const value = event.target.value;
                  setTagSearchKw(value);
                  setActiveCategory(mainTab === 'feature' ? '全部特色标签' : '全部');
                  setCurrentPage(1);
                  updateSearchParams({q: value || undefined});
                }}
              />
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  aria-label="筛选"
                  size="icon-sm"
                  variant="outline"
                >
                  <Filter />
                </Button>
              </TooltipTrigger>
              <TooltipContent>筛选</TooltipContent>
            </Tooltip>
          </>
        }
        footer={
          <div className="flex items-center justify-end text-[11px] text-slate-500">
            <CompactPagination
              page={safePage}
              pageSize={ITEMS_PER_PAGE}
              total={filteredTags.length}
              onPageChange={setCurrentPage}
            />
          </div>
        }
      >
        <div className="h-full min-h-0 flex-1 [&_[data-slot=table-container]]:h-full [&_[data-slot=table-container]]:overflow-auto">
          <Table className="min-w-[880px] table-fixed text-left">
            <TableHeader>
              <TableRow>
                <TableHead className={cn("sticky top-0 z-10 bg-slate-50 p-3 text-[11px] text-slate-500", mainTab === 'feature' ? 'w-[16%]' : 'w-[18%]')}>
                  标签名称 / 编码
                </TableHead>
                {mainTab === 'feature' && (
                  <TableHead className="sticky top-0 z-10 w-[16%] bg-slate-50 p-3 text-[11px] text-slate-500">
                    关联基础标签
                  </TableHead>
                )}
                <TableHead className={cn("sticky top-0 z-10 bg-slate-50 p-3 text-[11px] text-slate-500", mainTab === 'feature' ? 'w-[16%]' : 'w-[20%]')}>
                  所属分类 / 场景
                </TableHead>
                <TableHead className={cn("sticky top-0 z-10 bg-slate-50 p-3 text-center text-[11px] text-slate-500", mainTab === 'feature' ? 'w-[10%]' : 'w-[11%]')}>
                  状态 / 版本
                </TableHead>
                <TableHead className={cn("sticky top-0 z-10 bg-slate-50 p-3 text-right text-[11px] text-slate-500", mainTab === 'feature' ? 'w-[9%]' : 'w-[10%]')}>
                  命中人数
                </TableHead>
                <TableHead className={cn("sticky top-0 z-10 bg-slate-50 p-3 text-[11px] text-slate-500", mainTab === 'feature' ? 'w-[15%]' : 'w-[23%]')}>
                  最近扫描 / 周期
                </TableHead>
                <TableHead className="sticky right-0 top-0 z-20 w-[18%] bg-slate-50 p-3 text-[11px] text-slate-500">
                  操作
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTags.map((tag) => (
                <TableRow key={tag.id} className="group">
                  <TableCell className="p-3">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-800">
                          {tag.name}
                        </span>
                        {tag.isWarningTag && (
                          <div className="flex gap-1">
                            <span className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[9px] text-slate-600">
                              预警
                            </span>
                            <span
                              className={cn(
                                'rounded border px-1.5 py-0.5 text-[9px]',
                                tag.warningLevel?.includes('高')
                                  ? 'border-red-200 bg-red-50 text-red-600'
                                  : tag.warningLevel?.includes('中')
                                    ? 'border-amber-200 bg-amber-50 text-amber-600'
                                    : 'border-blue-200 bg-blue-50 text-blue-600',
                              )}
                            >
                              {tag.warningLevel}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">
                        {tag.id}
                      </span>
                    </div>
                  </TableCell>
                  {mainTab === 'feature' && (
                    <TableCell className="p-3">
                      {tag.referencedTags && tag.referencedTags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {tag.referencedTags.slice(0, 2).map((ref) => (
                            <span key={ref} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-700">
                              {ref}
                            </span>
                          ))}
                          {tag.referencedTags.length > 2 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="cursor-pointer rounded border border-dashed border-slate-300 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-500">
                                  +{tag.referencedTags.length - 2}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="flex flex-wrap gap-1">
                                {tag.referencedTags.map(ref => (
                                  <span key={ref} className="rounded bg-slate-100 px-1 text-[10px] text-slate-700">{ref}</span>
                                ))}
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400">-</span>
                      )}
                    </TableCell>
                  )}
                  <TableCell className="p-3">
                    <div className="flex flex-col items-start gap-1">
                      <span className="inline-flex items-center gap-1 rounded border border-blue-100 bg-blue-50 px-1.5 py-0.5 text-[10px] text-blue-700">
                        <Folder className="size-2.5" />
                        {tag.category}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {tag.scene}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="p-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <StatusBadge status={tag.status || '草稿'} />
                      <span className="font-mono text-[10px] text-slate-400">
                        {tag.version}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="p-3 text-right">
                    <span className="text-sm font-bold text-slate-700">
                      {typeof tag.count === 'number'
                        ? tag.count.toLocaleString()
                        : tag.count}
                    </span>
                  </TableCell>
                  <TableCell className="p-3 text-slate-500">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs">{tag.lastScan}</span>
                      <span className="text-[9px] text-cyan-600">
                        周期: {tag.cycle}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="sticky right-0 z-10 bg-white p-3 group-hover:bg-slate-50">
                    <div className="flex items-center gap-1">
                      {canEditCurrentTab && (
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => handleEdit(tag)}
                        >
                          编辑
                        </Button>
                      )}
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => handlePreviewSheet(tag)}
                      >
                        预览
                      </Button>
                      {canEditCurrentTab && (
                        <>
                          <Button
                            className={
                              tag.status === '已发布'
                                ? 'text-amber-600'
                                : 'text-emerald-600'
                            }
                            size="xs"
                            variant="ghost"
                            onClick={() => setStatusTag(tag)}
                          >
                            {tag.status === '已发布' ? '停用' : '发布'}
                          </Button>
                          {tag.status !== '已发布' && (
                            <Button
                              className="text-red-500"
                              size="xs"
                              variant="ghost"
                              onClick={() => setTagToDelete(tag)}
                            >
                              删除
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedTags.length === 0 && (
                <TableRow>
                  <TableCell
                    className="p-8 text-center text-sm text-slate-400"
                    colSpan={6}
                  >
                    暂无标签数据
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DataTableShell>
        </div>
      </Tabs>
    </div>
  );
  };

  const renderBasicEditor = () => (
    <div className="max-w-3xl space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-xs font-semibold" htmlFor="tag-name">
            标签名称 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="tag-name"
            aria-label="标签名称"
            aria-describedby={formErrors.name ? 'tag-name-error' : undefined}
            aria-invalid={Boolean(formErrors.name)}
            placeholder="例如：气虚质高发人群"
            value={editingTag?.name || ''}
            onChange={(event) => handleTagField('name', event.target.value)}
          />
          {formErrors.name && (
            <p id="tag-name-error" className="text-xs text-red-600">
              {formErrors.name}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-semibold" htmlFor="tag-category">
            所属分类 <span className="text-red-500">*</span>
          </Label>
          <Select
            value={editingTag?.category || ''}
            onValueChange={(value) => handleTagField('category', value)}
          >
            <SelectTrigger
              id="tag-category"
              aria-label="所属分类"
              aria-describedby={
                formErrors.category ? 'tag-category-error' : undefined
              }
              aria-invalid={Boolean(formErrors.category)}
              className="w-full"
            >
              <SelectValue placeholder="请选择所属标签分类" />
            </SelectTrigger>
            <SelectContent>
              {categories
                .filter((category) => category.name !== '全部')
                .map((category) => (
                  <SelectItem key={category.name} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {formErrors.category && (
            <p id="tag-category-error" className="text-xs text-red-600">
              {formErrors.category}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold" htmlFor="tag-scene">
          适用场景 / 业务用途 <span className="text-red-500">*</span>
        </Label>
        <Input
          id="tag-scene"
          aria-label="适用场景 / 业务用途"
          aria-describedby={formErrors.scene ? 'tag-scene-error' : undefined}
          aria-invalid={Boolean(formErrors.scene)}
          placeholder="例如：体质辨识、主动干预、随访管理"
          value={editingTag?.scene || ''}
          onChange={(event) => handleTagField('scene', event.target.value)}
        />
        {formErrors.scene && (
          <p id="tag-scene-error" className="text-xs text-red-600">
            {formErrors.scene}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold" htmlFor="tag-description">
          标签说明
        </Label>
        <Textarea
          id="tag-description"
          className="resize-none"
          placeholder="详细描述该标签的业务含义及圈定的人群特征..."
          rows={3}
          value={editingTag?.description || ''}
          onChange={(event) =>
            handleTagField('description', event.target.value)
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-6 border-t border-slate-100 pt-4">
        <div className="space-y-2">
          <Label className="text-xs font-semibold">扫描周期 / 更新机制</Label>
          <Select
            value={editingTag?.cycle || '每日'}
            onValueChange={(value) => handleTagField('cycle', value)}
          >
            <SelectTrigger aria-label="扫描周期" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="每日">每日自动更新 (T+1)</SelectItem>
              <SelectItem value="每周">每周自动更新</SelectItem>
              <SelectItem value="每月">每月自动更新</SelectItem>
              <SelectItem value="手动">仅手动触发生效</SelectItem>
              <SelectItem value="实时">实时计算 (限定极少场景)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderRulesEditor = () => (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col space-y-4">
        {mainTab === 'feature' && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
            <Label className="mb-2 block text-xs font-semibold text-slate-800">引用基础标签</Label>
            <div className="relative" ref={refTagContainerRef}>
              <div className="min-h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm flex flex-wrap gap-1.5 focus-within:ring-1 focus-within:ring-slate-400">
                  {editingTag?.referencedTags?.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700">
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        className="h-3 w-3 hover:bg-slate-200"
                        onClick={(e) => {
                           e.stopPropagation();
                           handleTagField('referencedTags', editingTag.referencedTags!.filter(t => t !== tag));
                        }}
                      >
                        <X size={8} />
                      </Button>
                    </span>
                  ))}
                  <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      className="h-5 px-1.5 text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50"
                      onClick={() => {
                        setRefTagSearchKw('');
                        setIsRefTagDropdownOpen((open) => !open);
                      }}
                    >
                      <Plus size={10} className="mr-0.5" /> 添加
                  </Button>
              </div>
              {renderRefTagDropdown()}
            </div>
            <p className="mt-2 text-[10px] text-slate-500">
              在计算业务逻辑之前，将作为此复合标签圈选的前置条件或交集条件。
            </p>
          </div>
        )}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">
            构建业务规则逻辑树
          </h3>
          <Button
            className="border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
            size="sm"
            variant="outline"
            onClick={handleRulePreview}
          >
            <Eye />
            预览命中人数
          </Button>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-600 shadow-sm">
                且 (AND)
              </span>
              <span className="text-xs text-slate-500">
                满足以下所有条件组
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-slate-500">上下文约束:</Label>
              <Select value={contextScope} onValueChange={setContextScope}>
                <SelectTrigger
                  aria-label="上下文约束"
                  className="h-8 w-40 bg-white text-xs"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contextScopes.map((scope) => (
                    <SelectItem key={scope.value} value={scope.value}>
                      {scope.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="relative space-y-3 before:absolute before:bottom-6 before:left-[14px] before:top-[-10px] before:w-px before:bg-slate-300">
            {conditions.map((condition) => {
              const fields = domainFields[condition.domain] || [];
              const field =
                fields.find((item) => item.name === condition.field) ||
                fields[0];
              const operators = field
                ? fieldTypeOperators[field.type] || []
                : [];
              return (
                <div key={condition.id} className="relative pl-8">
                  <div className="absolute left-[14px] top-1/2 h-px w-4 bg-slate-300" />
                  <div className="flex flex-wrap items-center gap-3 rounded border border-slate-200 bg-white p-3 shadow-sm lg:flex-nowrap">
                    <Select
                      value={condition.type}
                      onValueChange={(value) =>
                        handleConditionChange(condition.id, 'type', value)
                      }
                    >
                      <SelectTrigger
                        aria-label="条件类型"
                        className="h-8 w-32 text-xs"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="纳入条件">纳入条件</SelectItem>
                        <SelectItem value="排除条件">排除条件</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={condition.domain}
                      onValueChange={(value) =>
                        handleConditionChange(condition.id, 'domain', value)
                      }
                    >
                      <SelectTrigger
                        aria-label="规则域"
                        className="h-8 w-40 text-xs"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ruleDomains.map((domain) => (
                          <SelectItem key={domain} value={domain}>
                            {domain}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={condition.field}
                      onValueChange={(value) =>
                        handleConditionChange(condition.id, 'field', value)
                      }
                    >
                      <SelectTrigger
                        aria-label="规则字段"
                        className="h-8 w-40 text-xs"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fields.map((item) => (
                          <SelectItem key={item.code} value={item.name}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={condition.operator}
                      onValueChange={(value) =>
                        handleConditionChange(condition.id, 'operator', value)
                      }
                    >
                      <SelectTrigger
                        aria-label="规则运算符"
                        className="h-8 w-28 text-xs"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {operators.map((operator) => (
                          <SelectItem key={operator} value={operator}>
                            {operator}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      aria-label="规则值"
                      className="h-8 min-w-[100px] flex-1 text-xs"
                      placeholder="请输入..."
                      value={condition.value}
                      onChange={(event) =>
                        handleConditionChange(
                          condition.id,
                          'value',
                          event.target.value,
                        )
                      }
                    />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          aria-label="删除规则条件"
                          className="text-slate-400 hover:text-red-500"
                          size="icon-sm"
                          variant="ghost"
                          onClick={() =>
                            setConditions((current) =>
                              current.filter(
                                (item) => item.id !== condition.id,
                              ),
                            )
                          }
                        >
                          <Trash2 />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>删除规则条件</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              );
            })}

            <div className="relative pl-8 pt-2">
              <Button
                className="w-full border-dashed border-cyan-300 text-cyan-700"
                variant="outline"
                onClick={() => {
                  const domain = ruleDomains[0];
                  const field = domainFields[domain][0];
                  setConditions((current) => [
                    ...current,
                    {
                      id: Math.random().toString(36).slice(2, 11),
                      type: '纳入条件',
                      domain,
                      field: field.name,
                      operator: fieldTypeOperators[field.type][0],
                      value: '',
                    },
                  ]);
                }}
              >
                <Plus />
                添加规则条件
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
        {previewResults ? (
          <div className="flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 bg-white p-4">
              <h4 className="text-sm font-bold text-slate-800">
                预览命中结果
              </h4>
              <div className="text-xs text-slate-600">
                共命中{' '}
                <span className="px-1 text-base font-bold text-emerald-600">
                  {previewResults.total.toLocaleString()}
                </span>{' '}
                名患者
              </div>
            </div>
            <div className="bg-white">
              <PatientTable patients={previewResults.patients} />
            </div>
            <div className="border-t border-slate-200 bg-slate-50 p-3 text-center text-[10px] text-slate-400">
              仅展示前20条数据用作预览
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center bg-white/50 p-12 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full border border-cyan-200 bg-cyan-100 text-cyan-600 shadow-sm">
              <Search className="size-7" />
            </div>
            <h4 className="mb-2 text-sm font-bold text-slate-800">
              暂未预览命中结果
            </h4>
            <p className="max-w-[280px] text-xs leading-relaxed text-slate-500">
              配置并保存上方业务逻辑规则后，点击右上角的
              <span className="mx-1 font-semibold text-slate-700">
                「预览命中人数」
              </span>
              即可查看筛选结果概览及患者明细。
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderWarningEditor = () => (
    <div className="max-w-3xl space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div>
            <Label htmlFor="warning-switch" className="text-sm font-semibold">
              启用预警标签
            </Label>
            <p className="mt-1 text-xs text-slate-500">
              开启后，该标签圈定的人群可作为高风险盲点或状态退化人群进行统一干预
            </p>
          </div>
          <Switch
            id="warning-switch"
            checked={Boolean(editingTag?.isWarningTag)}
            onCheckedChange={(checked) =>
              handleTagField('isWarningTag', checked)
            }
          />
        </div>

        {editingTag?.isWarningTag && (
          <div className="space-y-6 border-t border-slate-100 pt-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">业务预警类型</Label>
                <Select
                  value={editingTag.warningType || '体质异常预警'}
                  onValueChange={(value) =>
                    handleTagField('warningType', value)
                  }
                >
                  <SelectTrigger aria-label="业务预警类型" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      '体质异常预警',
                      '盲点患者预警',
                      '关键指标异常预警',
                      '用药与药事风险预警',
                      '慢病风险升级预警',
                      '依从性与宣教反馈预警',
                    ].map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">基础预警等级</Label>
                <Select
                  value={editingTag.warningLevel || '中'}
                  onValueChange={(value) =>
                    handleTagField('warningLevel', value)
                  }
                >
                  <SelectTrigger aria-label="基础预警等级" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="高">高风险</SelectItem>
                    <SelectItem value="中">中风险</SelectItem>
                    <SelectItem value="低">低风险</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold" htmlFor="warning-advice">
                预警处置建议
              </Label>
              <Textarea
                id="warning-advice"
                placeholder="请输入预警记录生成后，向医生 / 运营人员给出的推荐干预策略和建议..."
                rows={3}
                value={editingTag.disposalAdvice || ''}
                onChange={(event) =>
                  handleTagField('disposalAdvice', event.target.value)
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderEditor = () => (
    <div className="flex h-full flex-col">
      <div className="z-10 flex flex-shrink-0 items-center justify-between rounded-t-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-label="返回标签清单"
                size="icon-sm"
                variant="ghost"
                onClick={() => returnToList()}
              >
                <ArrowLeft />
              </Button>
            </TooltipTrigger>
            <TooltipContent>返回标签清单</TooltipContent>
          </Tooltip>
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              {editingTag?.id
                ? `编辑标签：${editingTag.name}`
                : '新增业务标签'}
            </h2>
            <p className="mt-0.5 text-[10px] text-slate-500">
              {editingTag?.id
                ? `编码: ${editingTag.id} | 版本: ${editingTag.version}`
                : '配置基础信息并在下方按需保存为草稿'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => returnToList()}
          >
            取消
          </Button>
          <Button
            className="border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
            size="sm"
            variant="outline"
            onClick={() => handleSave('草稿')}
          >
            <Save />
            保存草稿
          </Button>
          <Button
            className="bg-cyan-600 hover:bg-cyan-700"
            size="sm"
            onClick={() => handleSave('已发布')}
          >
            <Check />
            保存并发布
          </Button>
        </div>
      </div>

      <Tabs
        className="min-h-0 flex-1 gap-0"
        value={activeEditorTab}
        onValueChange={(value) => setActiveEditorTab(value as EditorTab)}
      >
        <TabsList
          className="h-10 w-full justify-start rounded-none border-x border-b border-slate-200 bg-slate-50 px-4"
          variant="line"
        >
          <TabsTrigger className="flex-none px-3 text-xs" value="basic">
            基础信息
          </TabsTrigger>
          <TabsTrigger className="flex-none px-3 text-xs" value="rules">
            规则配置区
          </TabsTrigger>
          <TabsTrigger className="flex-none px-3 text-xs" value="warning">
            预警逻辑
          </TabsTrigger>
        </TabsList>
        <div className="min-h-0 flex-1 overflow-y-auto rounded-b-lg border-x border-b border-slate-200 bg-white p-6">
          <TabsContent value="basic">{renderBasicEditor()}</TabsContent>
          <TabsContent value="rules">{renderRulesEditor()}</TabsContent>
          <TabsContent value="warning">{renderWarningEditor()}</TabsContent>
        </div>
      </Tabs>
    </div>
  );

  return (
    <div className="relative h-full">
      {viewMode === 'list' && !createMode ? renderList() : renderEditor()}

      <Dialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? '编辑标签分类' : '新增标签分类'}
            </DialogTitle>
            <DialogDescription>
              设置标签分类名称和在左侧分类树中的显示顺序。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="category-name">
                分类名称 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="category-name"
                placeholder="请输入分类名称"
                value={categoryInput}
                onChange={(event) => setCategoryInput(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category-sort">排序字段</Label>
              <Input
                id="category-sort"
                type="number"
                value={categorySort}
                onChange={(event) => setCategorySort(Number(event.target.value))}
              />
            </div>
          </div>
          <DialogFooter className="items-center">
            {editingCategory && (
              <Button
                className="mr-auto"
                variant="destructive"
                onClick={() => {
                  setCategoryToDelete(editingCategory);
                  setIsCategoryDialogOpen(false);
                }}
              >
                删除
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setIsCategoryDialogOpen(false)}
            >
              取消
            </Button>
            <Button onClick={handleSaveCategory}>确定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(categoryToDelete)}
        onOpenChange={(open) => !open && setCategoryToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除标签分类</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将删除该分类下的所有标签，确定删除？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmDeleteCategory}
            >
              确定删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={Boolean(tagToDelete)}
        onOpenChange={(open) => !open && setTagToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除标签</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除标签 {tagToDelete?.name} 吗？此操作无法恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmDeleteTag}
            >
              彻底删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={Boolean(statusTag)}
        onOpenChange={(open) => !open && setStatusTag(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {statusTag?.status === '已发布' ? '停用标签' : '发布标签'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {statusTag?.status === '已发布'
                ? `停用后标签“${statusTag?.name}”将不再参与自动扫描。`
                : `确认发布标签“${statusTag?.name}”？`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmStatus}>
              {statusTag?.status === '已发布' ? '确认停用' : '确认发布'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Sheet open={isPreviewSheetOpen} onOpenChange={setIsPreviewSheetOpen}>
        <SheetContent 
          className="w-[800px] gap-0 sm:max-w-[800px]" 
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <SheetHeader className="border-b border-slate-200">
            <SheetTitle>预览标签数据集</SheetTitle>
            <SheetDescription>
              标签：{previewSheetData?.tag.name}，共命中{' '}
              {previewSheetData?.total.toLocaleString()} 名患者
            </SheetDescription>
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col bg-slate-50 p-4">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white">
              {previewSheetData && (
                <PatientTable patients={previewSheetData.patients} />
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
