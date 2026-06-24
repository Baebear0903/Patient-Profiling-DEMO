import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, Sankey } from 'recharts';
import { tcmConstitutions, ageDistribution, deptDistribution, genderDistribution, diseaseDistribution, constitutionTrendData, keyPopulationTrendData, transitionMatrixData, sankeyData, topImprovementPaths, topWorseningPaths } from '../data/analysisData';
import { cn } from '../lib/utils';
import { Calendar, Filter, Activity, Users, FileText, AlertCircle, TrendingUp, CheckSquare, RefreshCw, HeartPulse, Layers, Smartphone, ShieldCheck } from 'lucide-react';

import {CompactPagination} from '@/components/common/CompactPagination';
import {Button} from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';

const COLORS = ['#0ea5e9', '#3b82f6', '#22c55e', '#f59e0b', '#f43f5e', '#2dd4bf', '#8b5cf6', '#fb923c', '#94a3b8'];

const chartTooltipContentStyle: React.CSSProperties = {
  borderRadius: '4px',
  border: '1px solid #e2e8f0',
  fontSize: '12px',
  padding: '4px 8px',
  boxShadow: '0 10px 24px rgba(15, 23, 42, 0.12)',
};

const chartTooltipWrapperStyle: React.CSSProperties = {
  zIndex: 30,
  pointerEvents: 'none',
};

const chartInitialDimension = {width: 800, height: 260};


type TransitionTone = 'positive' | 'negative' | 'neutral';
type AnalysisTab = 'constitution' | 'disease' | 'tracking';
type TrendMetric = '依从性' | '复诊率' | '改善率';

const positiveTransitionRules: Record<string, string[]> = {
  湿热质: ['痰湿质', '气虚质'],
  痰湿质: ['气虚质'],
  阳虚质: ['气虚质'],
  阴虚质: ['气虚质'],
  血瘀质: ['气虚质'],
  气郁质: ['气虚质'],
};

const negativeTransitionRules: Record<string, string[]> = {
  气虚质: ['阳虚质', '痰湿质', '血瘀质'],
  阳虚质: ['痰湿质'],
  痰湿质: ['湿热质', '血瘀质'],
  气郁质: ['血瘀质', '湿热质'],
  阴虚质: ['湿热质'],
  血瘀质: ['湿热质'],
  特禀质: ['湿热质', '痰湿质', '血瘀质'],
};

const getTransitionTone = (previous: string, current: string): TransitionTone => {
  if (previous === current) return 'neutral';
  if (positiveTransitionRules[previous]?.includes(current)) return 'positive';
  if (negativeTransitionRules[previous]?.includes(current)) return 'negative';
  if (previous === '平和质' && current !== '平和质') return 'negative';
  if (previous !== '平和质' && current === '平和质') return 'positive';
  return 'neutral';
};

const transitionToneClasses: Record<TransitionTone, string> = {
  positive: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100',
  negative: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-100',
  neutral: '',
};

const CustomSankeyTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    if (data.source && data.target) {
      const statusText = data.status === 'improve' ? '改善转归' : data.status === 'worsen' ? '偏颇加重' : '维持稳定';
      return (
        <div className="bg-slate-800 text-slate-50 p-3 rounded-lg shadow-xl text-xs flex flex-col gap-1 z-50">
          <p className="font-semibold">{data.source.name} → {data.target.name}</p>
          <div className="flex justify-between items-center mt-1">
            <span className="text-slate-400">人数 / 占比：</span>
            <span>{data.value}人 ({((data.value / 530) * 100).toFixed(1)}%)</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">判定结果：</span>
            <span className={cn("font-medium", data.status === 'improve' ? 'text-emerald-400' : data.status === 'worsen' ? 'text-rose-400' : 'text-blue-300')}>{statusText}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">干预动作：</span>
            <span>{data.action}</span>
          </div>
        </div>
      );
    } else {
      return (
        <div className="bg-slate-800 text-slate-50 p-3 rounded-lg shadow-xl text-xs flex flex-col gap-1 z-50">
          <p className="font-semibold">{data.name}</p>
          <div className="flex justify-between items-center mt-1">
            <span className="text-slate-400">总人数：</span>
            <span>{data.value}人</span>
          </div>
        </div>
      );
    }
  }
  return null;
};

const CustomSankeyLink = (props: any) => {
  const { sourceX, targetX, sourceY, targetY, sourceControlX, targetControlX, linkWidth, payload } = props;
  
  let color = '#94a3b8'; 
  if (payload.status === 'improve') color = '#10b981';
  if (payload.status === 'worsen') color = '#f43f5e';

  return (
    <path
      d={`
        M${sourceX},${sourceY}
        C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}
      `}
      stroke={color}
      strokeWidth={Math.max(linkWidth, 1)}
      strokeOpacity={0.25}
      fill="none"
      className="hover:stroke-opacity-100 transition-opacity duration-300"
    />
  );
};

const CustomSankeyNode = ({ x, y, width, height, index, payload }: any) => {
  // If it's the rightmost node, put text on the left. Otherwise put on the right.
  const isRightmost = x > 200;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill="#0ea5e9" opacity="0.9" rx="2" />
      <text
        x={isRightmost ? x - 6 : x + width + 6}
        y={y + height / 2}
        textAnchor={isRightmost ? 'end' : 'start'}
        dominantBaseline="middle"
        fontSize="10"
        fill="#475569"
        fontWeight="bold"
      >
        {payload.name}
      </text>
    </g>
  );
};

const CustomPieLabel = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, outerRadius, payload, percent } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  
  // Start point of the line
  const sx = cx + (outerRadius + 2) * cos;
  const sy = cy + (outerRadius + 2) * sin;
  // Middle point (bend)
  const mx = cx + (outerRadius + 35) * cos;
  const my = cy + (outerRadius + 35) * sin;
  // End point
  const ex = mx + (cos >= 0 ? 1 : -1) * 20;
  const ey = my;
  
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke="#94a3b8" fill="none" strokeWidth={1} />
      <circle cx={ex} cy={ey} r={2} fill="#94a3b8" stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 6} y={ey} textAnchor={textAnchor} fill="#64748b" fontSize={10} dominantBaseline="central">
        {`${payload.name} ${(percent * 100).toFixed(1)}%`}
      </text>
    </g>
  );
};

const ConstitutionDropdown = ({ selectedConstitutions, toggleConstitution, tcmConstitutions }: any) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const isAllSelected = selectedConstitutions.length === tcmConstitutions.length;
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className="flex h-8 items-center justify-between whitespace-nowrap rounded-md border border-slate-200 bg-white px-3 py-1 text-xs shadow-sm cursor-pointer min-w-[140px] text-slate-600 hover:bg-slate-50 transition-colors"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        {isAllSelected ? "全部体质" : `已选体质 (${selectedConstitutions.length})`}
        <Filter size={12} className="ml-2 text-slate-400" />
      </div>
      {isDropdownOpen && (
        <div className="absolute z-50 top-10 right-0 w-[180px] bg-white border border-slate-200 rounded-md shadow-lg p-2 flex flex-col gap-1 max-h-[300px] overflow-y-auto">
          <label className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded cursor-pointer text-xs text-slate-700 transition-colors">
            <input type="checkbox" className="accent-blue-500 cursor-pointer" checked={isAllSelected} onChange={() => toggleConstitution('全部')} />
            全部
          </label>
          {tcmConstitutions.map((c: any) => (
            <label key={c.name} className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded cursor-pointer text-xs text-slate-700 transition-colors">
              <input type="checkbox" className="accent-blue-500 cursor-pointer" checked={selectedConstitutions.includes(c.name)} onChange={() => toggleConstitution(c.name)} />
              {c.name}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export function AnalysisView() {
  const [activeTab, setActiveTab] = useState<AnalysisTab>('constitution');
  const [trendMetric, setTrendMetric] = useState<TrendMetric>('依从性');
  const [deptPage, setDeptPage] = useState(1);
  const [diseasePage, setDiseasePage] = useState(1);
  const [hiddenLines, setHiddenLines] = useState<Record<string, boolean>>({});
  const [selectedConstitutions, setSelectedConstitutions] = useState<string[]>(tcmConstitutions.map(c => c.name));

  const ITEMS_PER_PAGE = 10;
  
  const toggleConstitution = (name: string) => {
    if (name === '全部') {
      if (selectedConstitutions.length === tcmConstitutions.length) {
        setSelectedConstitutions([]);
      } else {
        setSelectedConstitutions(tcmConstitutions.map(c => c.name));
      }
      return;
    }
    setSelectedConstitutions(prev => {
      if (prev.includes(name)) {
        return prev.filter(c => c !== name);
      } else {
        return [...prev, name];
      }
    });
  };

  const scaleFactor = selectedConstitutions.length / 9;

  const filteredDeptDistribution = useMemo(() => {
    return deptDistribution.map(d => ({...d, count: Math.round(d.count * scaleFactor)}));
  }, [scaleFactor]);

  const filteredDiseaseDistribution = useMemo(() => {
    return diseaseDistribution.map(d => ({...d, count: Math.round(d.count * scaleFactor)}));
  }, [scaleFactor]);

  const pieDeptDistribution = useMemo(() => {
    if (filteredDeptDistribution.length <= 10) return filteredDeptDistribution;
    const top10 = filteredDeptDistribution.slice(0, 10);
    const otherCount = filteredDeptDistribution.slice(10).reduce((acc, curr) => acc + curr.count, 0);
    return [...top10, { name: "其他", count: otherCount }];
  }, [filteredDeptDistribution]);

  const pieDiseaseDistribution = useMemo(() => {
    if (filteredDiseaseDistribution.length <= 10) return filteredDiseaseDistribution;
    const top10 = filteredDiseaseDistribution.slice(0, 10);
    const otherCount = filteredDiseaseDistribution.slice(10).reduce((acc, curr) => acc + curr.count, 0);
    return [...top10, { name: "其他", count: otherCount }];
  }, [filteredDiseaseDistribution]);

  const filteredAgeDistribution = useMemo(() => {
    return ageDistribution.map(d => ({...d, count: Math.round(d.count * scaleFactor)}));
  }, [scaleFactor]);

  const filteredGenderDistribution = useMemo(() => {
    return genderDistribution.map(d => ({...d, count: Math.round(d.count * scaleFactor)}));
  }, [scaleFactor]);

  const filteredTcmConstitutions = useMemo(() => {
    return tcmConstitutions.filter(c => selectedConstitutions.includes(c.name));
  }, [selectedConstitutions]);

  const paginatedDept = filteredDeptDistribution.slice((deptPage - 1) * ITEMS_PER_PAGE, deptPage * ITEMS_PER_PAGE);
  const paginatedDisease = filteredDiseaseDistribution.slice((diseasePage - 1) * ITEMS_PER_PAGE, diseasePage * ITEMS_PER_PAGE);
  const trendDataKey = trendMetric === '改善率' ? '指标改善' : trendMetric;

  const toggleLine = (dataKey: string) => {
    setHiddenLines(prev => ({ ...prev, [dataKey]: !prev[dataKey] }));
  };

  const proportionData = useMemo(() => {
    return constitutionTrendData.map(item => {
      let total = 0;
      Object.keys(item).forEach(key => {
        if (key !== 'month') total += Number(item[key as keyof typeof item]);
      });
      const newItem: any = { month: item.month };
      Object.keys(item).forEach(key => {
        if (key !== 'month') {
          newItem[key] = total > 0 ? ((Number(item[key as keyof typeof item]) / total) * 100).toFixed(1) : 0;
        }
      });
      return newItem;
    });
  }, []);

  const funnelData = useMemo(() => [
    { stage: '目标人群总量', value: 10000, color: '#94a3b8' },
    { stage: '已纳入人群', value: 8500, color: '#38bdf8' },
    { stage: '完成干预人群', value: 6800, color: '#0ea5e9' },
    { stage: '完整随访人群', value: 5200, color: '#0284c7' },
    { stage: '达标改善人群', value: 3900, color: '#0369a1' },
  ], []);

  const interventionTrendData = useMemo(() => [
    { month: '1月', 依从性: 65, 复诊率: 42, 指标改善: 30 },
    { month: '2月', 依从性: 68, 复诊率: 45, 指标改善: 35 },
    { month: '3月', 依从性: 75, 复诊率: 50, 指标改善: 42 },
    { month: '4月', 依从性: 78, 复诊率: 55, 指标改善: 48 },
    { month: '5月', 依从性: 82, 复诊率: 60, 指标改善: 52 },
    { month: '6月', 依从性: 85, 复诊率: 65, 指标改善: 58 },
  ], []);

  const compareData = useMemo(() => [
    { name: '糖尿病', '方药干预': 82, '调理方案': 75, '生活方式': 68 },
    { name: '高血压', '方药干预': 85, '调理方案': 70, '生活方式': 65 },
    { name: '失眠', '方药干预': 78, '调理方案': 82, '生活方式': 75 },
    { name: '脾胃病', '方药干预': 80, '调理方案': 85, '生活方式': 72 },
  ], []);

  const stateTrendData = useMemo(() => [
    { month: '1月', 平和质流转率: 30, 体质偏颇加重: 70, 慢病恶化风险: 15 },
    { month: '2月', 平和质流转率: 32, 体质偏颇加重: 68, 慢病恶化风险: 14 },
    { month: '3月', 平和质流转率: 35, 体质偏颇加重: 65, 慢病恶化风险: 12 },
    { month: '4月', 平和质流转率: 38, 体质偏颇加重: 62, 慢病恶化风险: 10 },
    { month: '5月', 平和质流转率: 42, 体质偏颇加重: 58, 慢病恶化风险: 8 },
    { month: '6月', 平和质流转率: 45, 体质偏颇加重: 55, 慢病恶化风险: 6 },
  ], []);

  const heatmapData = useMemo(() => [
    { group: '糖尿病高危', 宣教: 80, 随访: 60, 设备: 30, 问诊: 40 },
    { group: '高频失眠人群', 宣教: 90, 随访: 75, 设备: 10, 问诊: 85 },
    { group: '脾胃病老患者', 宣教: 60, 随访: 50, 设备: 5, 问诊: 30 },
    { group: '高血压偏颇质', 宣教: 85, 随访: 70, 设备: 80, 问诊: 50 },
  ], []);

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as AnalysisTab)}
      className="h-full gap-4"
    >
      {/* Secondary Menu */}
      <TabsList className="h-10 w-full flex-shrink-0 justify-start border border-slate-200 bg-white shadow-sm">
        <TabsTrigger value="constitution" className="flex-none px-4 text-xs">
          中医体质分布与演变分析
        </TabsTrigger>
        <TabsTrigger value="disease" className="flex-none px-4 text-xs">
          重点病种干预转化效果分析
        </TabsTrigger>
        <TabsTrigger value="tracking" className="flex-none px-4 text-xs">
          院后追踪服务与盲点洞察分析
        </TabsTrigger>
      </TabsList>

      <TabsContent value="disease" className="min-h-0">
        <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto pb-4 pr-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 flex-shrink-0">
            <div>
              <h1 className="text-lg font-semibold text-slate-800 tracking-tight">重点病种干预转化效果分析</h1>
              <p className="text-[10px] text-slate-500 mt-0.5">评估“名老中医经验方案”在重点病种中的实际干预转化效果与依从性。</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="xs" className="text-[10px] text-slate-600">
                <Calendar size={12} className="text-slate-400" />
                近半年
              </Button>
              <Button type="button" variant="outline" size="xs" className="text-[10px] text-slate-600">
                <Filter size={12} className="text-slate-400" />
                全局筛选
              </Button>
            </div>
          </div>

          {/* Core Overview Indicators */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 shrink-0 flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-md">
                <Users className="text-blue-500" size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">干预患者总数</p>
                <div className="flex items-baseline gap-1">
                  <h3 className="text-lg font-bold text-slate-800">10,000</h3>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 shrink-0 flex items-center gap-3">
              <div className="bg-teal-50 p-2 rounded-md">
                <CheckSquare className="text-teal-500" size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">平均依从性提升率</p>
                <div className="flex items-baseline gap-1">
                  <h3 className="text-lg font-bold text-slate-800">18.5%</h3>
                  <span className="text-[10px] text-teal-600 flex items-center"><TrendingUp size={10} className="mr-0.5"/> 2.1%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 shrink-0 flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-md">
                <RefreshCw className="text-blue-500" size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">复诊率提升</p>
                <div className="flex items-baseline gap-1">
                  <h3 className="text-lg font-bold text-slate-800">12.3%</h3>
                  <span className="text-[10px] text-blue-600 flex items-center"><TrendingUp size={10} className="mr-0.5"/> 1.5%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 shrink-0 flex items-center gap-3">
              <div className="bg-emerald-50 p-2 rounded-md">
                <HeartPulse className="text-emerald-500" size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">核心指标改善率</p>
                <div className="flex items-baseline gap-1">
                  <h3 className="text-lg font-bold text-slate-800">32.8%</h3>
                  <span className="text-[10px] text-emerald-600 flex items-center"><TrendingUp size={10} className="mr-0.5"/> 4.2%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 干预转化漏斗 */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col min-h-[320px]">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center shrink-0">
                <h3 className="text-sm font-bold text-slate-800">干预转化漏斗</h3>
                <span className="text-[10px] text-slate-500 px-2 py-1 bg-slate-50 rounded">评估链路损耗</span>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-center gap-2">
                 {funnelData.map((item, index) => {
                    const maxVal = funnelData[0].value;
                    const percent = ((item.value / maxVal) * 100).toFixed(0);
                    return (
                       <div key={item.stage} className="flex flex-col items-center">
                          <div 
                            className="h-8 rounded flex items-center justify-between px-3 relative overflow-hidden transition-all duration-500" 
                            style={{ 
                              width: `${Math.max(Number(percent), 20)}%`, 
                              backgroundColor: item.color,
                              opacity: 1 - (index * 0.1)
                            }}
                          >
                             <span className="text-[10px] text-white font-medium relative z-10 break-keep">{item.stage}</span>
                             <span className="text-[10px] text-white relative z-10">{item.value.toLocaleString()}人 / {percent}%</span>
                          </div>
                          {index < funnelData.length - 1 && (
                            <div className="h-4 w-px bg-slate-300"></div>
                          )}
                       </div>
                    )
                 })}
              </div>
            </div>

            {/* 干预效果趋势分析 */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col min-h-[320px]">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center shrink-0">
                <h3 className="text-sm font-bold text-slate-800">干预效果趋势分析</h3>
                <Select
                  value={trendMetric}
                  onValueChange={(value) => setTrendMetric(value as TrendMetric)}
                >
                  <SelectTrigger
                    size="sm"
                    aria-label="趋势指标"
                    className="min-w-24 bg-slate-50 text-xs text-slate-600"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="依从性">依从性</SelectItem>
                    <SelectItem value="复诊率">复诊率</SelectItem>
                    <SelectItem value="改善率">改善率</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="min-h-0 min-w-0 flex-1 p-4">
                <ResponsiveContainer width="100%" height="100%" initialDimension={chartInitialDimension}>
                  <LineChart data={interventionTrendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dx={-10} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                    <Line
                      type="monotone"
                      dataKey={trendDataKey}
                      name={trendMetric}
                      stroke="#0ea5e9"
                      strokeWidth={2}
                      dot={{ r: 3, strokeWidth: 1 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 病种/方案效果对比 */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col min-h-[320px] lg:col-span-2">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center shrink-0">
                <h3 className="text-sm font-bold text-slate-800">病种 / 方案效果对比 (改善率)</h3>
              </div>
              <div className="h-[260px] min-h-[260px] min-w-0 p-4">
                <ResponsiveContainer width="100%" height="100%" initialDimension={chartInitialDimension}>
                  <BarChart data={compareData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dx={-10} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{ fill: '#f8fafc' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                    <Bar dataKey="方药干预" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="调理方案" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="生活方式" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="constitution" className="min-h-0">
        <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto pb-4 pr-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 flex-shrink-0">
            <div>
              <h1 className="text-lg font-semibold text-slate-800 tracking-tight">中医体质分布与演变分析</h1>
              <p className="text-[10px] text-slate-500 mt-0.5">面向中医健康追踪场景提供专属的主题分析。全局视角洞察患者中医体质分布现状与演变趋势。</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="xs" className="text-[10px] text-slate-600">
                <Calendar size={12} className="text-slate-400" />
                近半年
              </Button>
              <Button type="button" variant="outline" size="xs" className="text-[10px] text-slate-600">
                <Filter size={12} className="text-slate-400" />
                全局筛选
              </Button>
            </div>
          </div>

          <h2 className="text-base font-bold text-slate-800 tracking-tight shrink-0 mt-2">核心数据概览</h2>

          {/* Core Overview Indicators */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 shrink-0 flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-md">
                <Users className="text-blue-500" size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">在管人群总数</p>
                <div className="flex items-baseline gap-1">
                  <h3 className="text-lg font-bold text-slate-800">50,000</h3>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 shrink-0 flex items-center gap-3">
              <div className="bg-emerald-50 p-2 rounded-md">
                <FileText className="text-emerald-500" size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">已建画像人数</p>
                <div className="flex items-baseline gap-1">
                  <h3 className="text-lg font-bold text-slate-800">50,000</h3>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 shrink-0 flex items-center gap-3">
              <div className="bg-amber-50 p-2 rounded-md">
                <TrendingUp className="text-amber-500" size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">偏颇体质人数</p>
                <div className="flex items-baseline gap-1">
                  <h3 className="text-lg font-bold text-slate-800">37,500</h3>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 shrink-0 flex items-center gap-3">
              <div className="bg-red-50 p-2 rounded-md">
                <AlertCircle className="text-red-500" size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">异常预警人数</p>
                <div className="flex items-baseline gap-1">
                  <h3 className="text-lg font-bold text-slate-800">5,200</h3>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 shrink-0 flex items-center gap-3">
              <div className="bg-indigo-50 p-2 rounded-md">
                <Activity className="text-indigo-500" size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">体质评估人次</p>
                <div className="flex items-baseline gap-1">
                  <h3 className="text-lg font-bold text-slate-800">125,430</h3>
                </div>
              </div>
            </div>
          </div>

          {/* 9 Constitutions Overview */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 shrink-0 mt-4">
            <h3 className="text-sm font-bold text-slate-800 mb-3">九种体质类型人数及占比</h3>
            <div className="grid grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-2">
              {tcmConstitutions.map((c, i) => (
                <div key={i} className="bg-slate-50 rounded-lg border border-slate-100 p-3 flex flex-col justify-center items-center text-center hover:border-slate-300 hover:bg-slate-100 transition-colors">
                  <p className="text-[11px] font-bold text-slate-700">{c.name}</p>
                  <p className="text-sm font-black text-slate-800 mt-1">{c.count.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">占比 {c.percentage}%</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 border-t border-slate-200 pt-6">
            <h2 className="text-base font-bold text-slate-800 tracking-tight shrink-0 mb-3 sm:mb-0">中医体质分布分析</h2>
            <ConstitutionDropdown 
              selectedConstitutions={selectedConstitutions} 
              toggleConstitution={toggleConstitution} 
              tcmConstitutions={tcmConstitutions} 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 shrink-0 mt-4">
            {/* Chart 1: Constitution Pie */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 col-span-1 flex flex-col h-[300px]">
              <h2 className="text-xs font-bold text-slate-700 mb-2">体质类型人数及占比</h2>
              <div className="min-h-0 min-w-0 flex-1">
                <ResponsiveContainer width="100%" height="100%" initialDimension={chartInitialDimension}>
                  <PieChart>
                    <Pie
                      data={filteredTcmConstitutions}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="count"
                      stroke="none"
                      labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                      label={({ name, value, percent, x, y, cx, cy }) => (
                        <text x={x} y={y} fontSize={10} fill="#64748b" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                          {`${name} ${value.toLocaleString()}人 (${(percent * 100).toFixed(1)}%)`}
                        </text>
                      )}
                    >
                      {filteredTcmConstitutions.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => value.toLocaleString() + ' 人'}
                      contentStyle={{ borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '12px', padding: '4px 8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Age Bar */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 col-span-1 flex flex-col h-[300px]">
              <h2 className="text-xs font-bold text-slate-700 mb-2">年龄段体质人群分布</h2>
              <div className="min-h-0 min-w-0 flex-1">
                <ResponsiveContainer width="100%" height="100%" initialDimension={chartInitialDimension}>
                  <BarChart
                    data={filteredAgeDistribution}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dx={-10} />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '12px', padding: '4px 8px' }}
                    />
                    <Bar dataKey="count" fill="#2563eb" radius={[2, 2, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Gender Pie */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 col-span-1 flex flex-col h-[300px]">
              <h2 className="text-xs font-bold text-slate-700 mb-2">人群性别分析</h2>
              <div className="min-h-0 min-w-0 flex-1">
                <ResponsiveContainer width="100%" height="100%" initialDimension={chartInitialDimension}>
                  <PieChart>
                    <Pie
                      data={filteredGenderDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={0}
                      outerRadius={75}
                      dataKey="count"
                      stroke="none"
                      labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                      label={({ name, value, percent, x, y, cx, cy }) => (
                        <text x={x} y={y} fontSize={10} fill="#64748b" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                          {`${name} ${value.toLocaleString()}人 (${(percent * 100).toFixed(1)}%)`}
                        </text>
                      )}
                    >
                      <Cell fill="#3b82f6" />
                      <Cell fill="#0f766e" />
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => value.toLocaleString() + ' 人'}
                      contentStyle={{ borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '12px', padding: '4px 8px' }}
                    />
                    <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 shrink-0 mt-4">
            {/* Chart 4: Dept Ranking */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex flex-col min-h-[300px]">
              <h2 className="text-xs font-bold text-slate-700 mb-4">科室人数分布Top10</h2>
              <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-[250px]">
                <div className="flex-1 lg:flex-[1.2] min-h-[200px] min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieDeptDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={80}
                        dataKey="count"
                        stroke="none"
                        labelLine={false}
                        label={<CustomPieLabel />}
                      >
                        {pieDeptDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => value.toLocaleString() + ' 人'}
                        contentStyle={{ borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '12px', padding: '4px 8px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 overflow-y-auto pr-2">
                  <Table aria-label="科室分布排名">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="h-8 text-[11px] text-slate-500">排名</TableHead>
                        <TableHead className="h-8 text-[11px] text-slate-500">科室名称</TableHead>
                        <TableHead className="h-8 text-right text-[11px] text-slate-500">人数</TableHead>
                        <TableHead className="h-8 text-right text-[11px] text-slate-500">占比</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDeptDistribution.slice(0, 10).map((item, idx) => {
                        const total = filteredDeptDistribution.reduce((acc, curr) => acc + curr.count, 0);
                        const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) + '%' : '0%';
                        return (
                        <TableRow key={item.name}>
                          <TableCell className="py-2 text-[11px] text-slate-400">{idx + 1}</TableCell>
                          <TableCell className="py-2 text-[11px] text-slate-600">{item.name}</TableCell>
                          <TableCell className="py-2 text-right text-[11px] font-medium text-slate-700">{item.count.toLocaleString()}</TableCell>
                          <TableCell className="py-2 text-right text-[11px] text-slate-500">{percentage}</TableCell>
                        </TableRow>
                      )})}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            {/* Chart 5: Disease Ranking */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex flex-col min-h-[300px]">
              <h2 className="text-xs font-bold text-slate-700 mb-4">病种人数分布Top10</h2>
              <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-[250px]">
                <div className="flex-1 lg:flex-[1.2] min-h-[200px] min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieDiseaseDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={80}
                        dataKey="count"
                        stroke="none"
                        labelLine={false}
                        label={<CustomPieLabel />}
                      >
                        {pieDiseaseDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => value.toLocaleString() + ' 人'}
                        contentStyle={{ borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '12px', padding: '4px 8px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 overflow-y-auto pr-2">
                  <Table aria-label="病种分布排名">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="h-8 text-[11px] text-slate-500">排名</TableHead>
                        <TableHead className="h-8 text-[11px] text-slate-500">病种名称</TableHead>
                        <TableHead className="h-8 text-right text-[11px] text-slate-500">人数</TableHead>
                        <TableHead className="h-8 text-right text-[11px] text-slate-500">占比</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDiseaseDistribution.slice(0, 10).map((item, idx) => {
                        const total = filteredDiseaseDistribution.reduce((acc, curr) => acc + curr.count, 0);
                        const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) + '%' : '0%';
                        return (
                        <TableRow key={item.name}>
                          <TableCell className="py-2 text-[11px] text-slate-400">{idx + 1}</TableCell>
                          <TableCell className="py-2 text-[11px] text-slate-600">{item.name}</TableCell>
                          <TableCell className="py-2 text-right text-[11px] font-medium text-slate-700">{item.count.toLocaleString()}</TableCell>
                          <TableCell className="py-2 text-right text-[11px] text-slate-500">{percentage}</TableCell>
                        </TableRow>
                      )})}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-end gap-2 mt-6 border-t border-slate-200 pt-6">
            <h2 className="text-base font-bold text-slate-800 tracking-tight shrink-0">体质演变趋势分析</h2>
            <span className="text-xs font-normal text-slate-500 mb-[2px]">融合体检、慢病监测、宣教随访、医患互动、药事用药、智能体咨询等多源回流追踪数据，实现体质特征、健康风险与干预效果的动态分析。</span>
          </div>

          {/* Individual Rows for the 4 modules */}
          <div className="flex flex-col gap-4 shrink-0">
            {/* Chart 5: Constitution Trends */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex flex-col h-[350px]">
              <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xs font-bold text-slate-700">患者群体体质情况分析</h2>
                </div>
              </div>
              <div className="min-h-0 min-w-0 flex-1">
                <ResponsiveContainer width="100%" height="100%" initialDimension={chartInitialDimension}>
                  <LineChart data={constitutionTrendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dx={-10}/>
                    <Tooltip 
                      contentStyle={chartTooltipContentStyle} 
                      wrapperStyle={chartTooltipWrapperStyle} 
                      formatter={(value: any, name: string, props: any) => {
                        let total = 0;
                        if (props && props.payload) {
                          total = (Object.values(props.payload) as any[]).reduce((acc: number, val: any) => typeof val === 'number' ? acc + val : acc, 0) as number;
                        }
                        const numValue = typeof value === 'number' ? value : Number(value);
                        const percent = total > 0 ? ((numValue / total) * 100).toFixed(1) + '%' : '0%';
                        return [`${numValue}人 (${percent})`, name];
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '10px', cursor: 'pointer', zIndex: 1 }} onClick={(e) => toggleLine(String(e.dataKey))} />
                    {tcmConstitutions.map((c, i) => (
                      <Line 
                        key={c.name} 
                        type="monotone" 
                        dataKey={c.name} 
                        stroke={COLORS[i % COLORS.length]} 
                        strokeWidth={2} 
                        dot={{ strokeWidth: 1, r: 3 }} 
                        activeDot={{ r: 5 }}
                        hide={hiddenLines[c.name]}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* --- NEW SECTION: Path Evolution & Transition --- */}
            <div className="flex flex-col gap-4 mt-6 border-t border-slate-200 pt-6">
              {/* Core Indicators */}
              <div className="flex flex-col gap-3 shrink-0">
                <h3 className="text-sm font-bold text-slate-800">患者群体体质变化趋势</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                   <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-500 font-medium whitespace-nowrap">体质改善率</p>
                        <h3 className="text-xl font-bold text-slate-800 mt-1">18.6%</h3>
                      </div>
                      <div className="bg-emerald-50 text-emerald-500 p-2 rounded-full"><TrendingUp size={16} /></div>
                   </div>
                   <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-500 font-medium whitespace-nowrap">体质稳定率</p>
                        <h3 className="text-xl font-bold text-slate-800 mt-1">62.4%</h3>
                      </div>
                      <div className="bg-blue-50 text-blue-500 p-2 rounded-full"><Activity size={16} /></div>
                   </div>
                   <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-500 font-medium whitespace-nowrap">偏颇加重率</p>
                        <h3 className="text-xl font-bold text-slate-800 mt-1">12.8%</h3>
                      </div>
                      <div className="bg-rose-50 text-rose-500 p-2 rounded-full"><TrendingUp size={16} className="rotate-180" /></div>
                   </div>
                   <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-500 font-medium whitespace-nowrap">平和质保持率</p>
                        <h3 className="text-xl font-bold text-slate-800 mt-1">72.0%</h3>
                      </div>
                      <div className="bg-emerald-50 text-emerald-600 p-2 rounded-full"><ShieldCheck size={16} /></div>
                   </div>
                </div>
              </div>

              {/* Grid 1: Matrix and Sankey */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-2">
                 <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex flex-col min-h-[440px]">
                    <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="text-xs font-bold text-slate-700 whitespace-nowrap">体质转归趋势分析</h2>
                        <p className="text-[10px] text-slate-500 mt-1 max-w-xl text-wrap">展示患者体质在相邻评估周期内的变化方向，识别改善、稳定及加重趋势；绿色表示改善，红色表示加重。</p>
                      </div>
                    </div>
                    <div className="flex-1 w-full overflow-auto pr-2 relative">
                      <Table aria-label="体质转归矩阵" className="min-w-[700px] text-left">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="sticky left-0 top-0 z-20 h-10 w-[90px] border-r border-slate-100 bg-slate-50 px-2 text-[10px] text-slate-500 whitespace-nowrap">
                              上次  本次
                            </TableHead>
                            {tcmConstitutions.map(c => (
                              <TableHead key={c.name} className="h-10 bg-slate-50 px-2 top-0 sticky text-center z-10 text-[10px] text-slate-600 whitespace-nowrap">{c.name}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {transitionMatrixData.map((row, idx) => (
                            <TableRow key={idx} className="group">
                              <TableCell className="sticky left-0 z-10 border-r border-slate-50 bg-white px-2 py-3 text-[10px] font-medium text-slate-600 group-hover:bg-slate-50 whitespace-nowrap">{row.prev}</TableCell>
                              {tcmConstitutions.map(c => {
                                const tone = getTransitionTone(row.prev, c.name);
                                return (
                                  <TableCell
                                    key={c.name}
                                    className={cn(
                                      'px-2 py-3 text-center text-[10px] font-medium text-slate-600 whitespace-nowrap',
                                      transitionToneClasses[tone],
                                    )}
                                  >
                                    {row.next[c.name as keyof typeof row.next]}
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                 </div>

                 {/* Sankey */}
                 <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex flex-col min-h-[440px]">
                    <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="text-xs font-bold text-slate-700 whitespace-nowrap">中医体质演变趋势图</h2>
                        <p className="text-[10px] text-slate-500 mt-1 max-w-xl text-wrap">展示不同体质人群在多个连续评估周期内的流转路径，流线宽度代表流转规模。</p>
                      </div>
                    </div>
                    <div className="flex-1 min-h-0 min-w-0">
                      <ResponsiveContainer width="100%" height="100%" initialDimension={{width: 500, height: 400}}>
                        <Sankey 
                          data={sankeyData} 
                          nodePadding={40} 
                          margin={{ top: 20, right: 10, left: 10, bottom: 20 }} 
                          link={<CustomSankeyLink />}
                          node={<CustomSankeyNode />} 
                        >
                          <Tooltip content={<CustomSankeyTooltip />} />
                        </Sankey>
                      </ResponsiveContainer>
                    </div>
                 </div>
              </div>

              {/* Grid 2: Top Paths */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                 <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex flex-col h-[280px]">
                    <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <h2 className="text-xs font-bold text-slate-700">改善转归路径 Top 5</h2>
                    </div>
                    <div className="flex-1 overflow-auto min-w-0 pr-2 pb-2">
                       <Table>
                         <TableHeader>
                           <TableRow>
                             <TableHead className="h-8 text-[11px] px-2 text-slate-500 whitespace-nowrap">转归路径</TableHead>
                             <TableHead className="h-8 text-[11px] px-2 text-slate-500 whitespace-nowrap">占改善总数比</TableHead>
                             <TableHead className="h-8 text-[11px] px-2 text-slate-500 text-right whitespace-nowrap">推荐追踪服务</TableHead>
                           </TableRow>
                         </TableHeader>
                         <TableBody>
                           {topImprovementPaths.map((p, i) => (
                             <TableRow key={i}>
                               <TableCell className="py-2 px-2 text-[11px] font-medium text-emerald-600 whitespace-nowrap">{p.path}</TableCell>
                               <TableCell className="py-2 px-2 text-[11px] text-slate-600 whitespace-nowrap">{p.percentage} ({p.count}人)</TableCell>
                               <TableCell className="py-2 px-2 text-right whitespace-nowrap"><span className="text-[10px] bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full">{p.action}</span></TableCell>
                             </TableRow>
                           ))}
                         </TableBody>
                       </Table>
                    </div>
                 </div>
                 <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex flex-col h-[280px]">
                    <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <h2 className="text-xs font-bold text-slate-700">加重劣向路径 Top 5</h2>
                    </div>
                    <div className="flex-1 overflow-auto min-w-0 pr-2 pb-2">
                       <Table>
                         <TableHeader>
                           <TableRow>
                             <TableHead className="h-8 text-[11px] px-2 text-slate-500 whitespace-nowrap">转归路径</TableHead>
                             <TableHead className="h-8 text-[11px] px-2 text-slate-500 whitespace-nowrap">占加重总数比</TableHead>
                             <TableHead className="h-8 text-[11px] px-2 text-slate-500 text-right whitespace-nowrap">建议预警处置</TableHead>
                           </TableRow>
                         </TableHeader>
                         <TableBody>
                           {topWorseningPaths.map((p, i) => (
                             <TableRow key={i}>
                               <TableCell className="py-2 px-2 text-[11px] font-medium text-rose-500 whitespace-nowrap">{p.path}</TableCell>
                               <TableCell className="py-2 px-2 text-[11px] text-slate-600 whitespace-nowrap">{p.percentage} ({p.count}人)</TableCell>
                               <TableCell className="py-2 px-2 text-right whitespace-nowrap"><span className="text-[10px] bg-rose-50 text-rose-600 border border-rose-100 px-2 py-0.5 rounded-full">{p.action}</span></TableCell>
                             </TableRow>
                           ))}
                         </TableBody>
                       </Table>
                    </div>
                 </div>
              </div>
            </div>

            {/* Chart 7: Key Population Trends */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex flex-col h-[300px]">
              <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xs font-bold text-slate-700">重点人群变化情况</h2>
              </div>
              <div className="min-h-0 min-w-0 flex-1">
                <ResponsiveContainer width="100%" height="100%" initialDimension={chartInitialDimension}>
                  <LineChart data={keyPopulationTrendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dx={-10}/>
                    <Tooltip contentStyle={chartTooltipContentStyle} wrapperStyle={chartTooltipWrapperStyle} />
                    <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '10px', zIndex: 1 }} />
                    <Line type="monotone" dataKey="慢病共病人群" stroke="#f59e0b" strokeWidth={2} dot={{ strokeWidth: 1, r: 3 }} />
                    <Line type="monotone" dataKey="亚健康及治未病高风险人群" stroke="#64748b" strokeWidth={2} dot={{ strokeWidth: 1, r: 3 }} />
                    <Line type="monotone" dataKey="中药调理或膏方干预人群" stroke="#ef4444" strokeWidth={2} dot={{ strokeWidth: 1, r: 3 }} />
                    <Line type="monotone" dataKey="老年及多药联用人群" stroke="#10b981" strokeWidth={2} dot={{ strokeWidth: 1, r: 3 }} />
                    <Line type="monotone" dataKey="妇女儿童等特殊体质管理人群" stroke="#8b5cf6" strokeWidth={2} dot={{ strokeWidth: 1, r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="tracking" className="min-h-0">
        <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto pb-4 pr-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 flex-shrink-0">
            <div>
              <h1 className="text-lg font-semibold text-slate-800 tracking-tight">院后追踪服务与盲点洞察分析</h1>
              <p className="text-[10px] text-slate-500 mt-0.5">构建全生命周期追踪体系，识别随访盲点与低活跃人群。</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="xs" className="text-[10px] text-slate-600">
                <Calendar size={12} className="text-slate-400" />
                近半年
              </Button>
              <Button type="button" variant="outline" size="xs" className="text-[10px] text-slate-600">
                <Filter size={12} className="text-slate-400" />
                全局筛选
              </Button>
            </div>
          </div>

          {/* Core Overview Indicators */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 shrink-0 flex items-center gap-3">
              <div className="bg-cyan-50 p-2 rounded-md">
                <Users className="text-cyan-500" size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">院后随访建立率</p>
                <div className="flex items-baseline gap-1">
                  <h3 className="text-lg font-bold text-slate-800">82.4%</h3>
                  <span className="text-[10px] text-cyan-600 flex items-center"><TrendingUp size={10} className="mr-0.5"/> 3.4%</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 shrink-0 flex items-center gap-3">
              <div className="bg-violet-50 p-2 rounded-md">
                <CheckSquare className="text-violet-500" size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">宣教触达率</p>
                <div className="flex items-baseline gap-1">
                  <h3 className="text-lg font-bold text-slate-800">95.2%</h3>
                  <span className="text-[10px] text-violet-600 flex items-center"><TrendingUp size={10} className="mr-0.5"/> 1.1%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 shrink-0 flex items-center gap-3">
              <div className="bg-orange-50 p-2 rounded-md">
                <Smartphone className="text-orange-500" size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">设备活跃率</p>
                <div className="flex items-baseline gap-1">
                  <h3 className="text-lg font-bold text-slate-800">42.8%</h3>
                  <span className="text-[10px] text-orange-600 flex items-center">下降导致盲点增加</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 shrink-0 flex items-center gap-3">
              <div className="bg-emerald-50 p-2 rounded-md">
                <ShieldCheck className="text-emerald-500" size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">健康状态稳定率</p>
                <div className="flex items-baseline gap-1">
                  <h3 className="text-lg font-bold text-slate-800">76.5%</h3>
                  <span className="text-[10px] text-emerald-600 flex items-center"><TrendingUp size={10} className="mr-0.5"/> 2.2%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 院后患者旅程全景图 */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col min-h-[320px] lg:col-span-2">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center shrink-0">
                <h3 className="text-sm font-bold text-slate-800">院后患者旅程流转（路径桑基简化图）</h3>
                <span className="text-[10px] text-slate-500 px-2 py-1 bg-slate-50 rounded">展示人群留存与流失链路</span>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-center overflow-x-auto">
                 <div className="min-w-[700px] flex items-stretch h-40 px-8 py-4 gap-2">
                    <div className="flex flex-col flex-1 shrink-0 group">
                       <span className="text-xs font-bold text-slate-700 mb-2 truncate text-center">出院人群</span>
                       <div className="flex-1 bg-slate-200 rounded relative flex items-center px-3 hover:bg-slate-300 transition-colors">
                          <span className="text-xs font-bold text-slate-600 relative z-10 w-full text-center">10,000人</span>
                          {/* connect vector right */}
                          <div className="absolute right-[-16px] top-1/2 w-4 h-[2px] bg-sky-200"></div>
                       </div>
                    </div>
                    <div className="flex flex-col flex-[1.2] shrink-0 group">
                       <span className="text-xs font-bold text-slate-700 mb-2 truncate text-center">宣教触达</span>
                       <div className="flex-1 bg-sky-200 rounded relative flex items-center px-3 hover:bg-sky-300 transition-colors">
                         <span className="text-xs font-medium text-sky-800 relative z-10 w-full text-center">9,520人 (95.2%)</span>
                          <div className="absolute right-[-16px] top-1/2 w-4 h-[2px] bg-cyan-200"></div>
                       </div>
                       <div className="h-6 w-full text-center text-[10px] text-slate-400 mt-2 border-t-2 border-slate-100 pt-1 border-dashed">失联流失 4.8%</div>
                    </div>
                    <div className="flex flex-col flex-[1.4] shrink-0 group">
                       <span className="text-xs font-bold text-slate-700 mb-2 truncate text-center">随访建立</span>
                       <div className="h-[80%] bg-cyan-300 rounded relative flex items-center px-2 hover:bg-cyan-400 transition-colors mt-auto mb-auto">
                         <span className="text-xs font-medium text-cyan-900 relative z-10 w-full text-center">8,240人 (82.4%)</span>
                          <div className="absolute right-[-16px] top-1/2 w-4 h-[2px] bg-teal-300 mx-auto"></div>
                       </div>
                       <div className="h-6 w-full text-center text-[10px] text-slate-400 mt-2 border-t-2 border-slate-100 pt-1 border-dashed">未回复 12.8%</div>
                    </div>
                    <div className="flex flex-col flex-[1.5] shrink-0 group relative">
                       <span className="text-xs font-bold text-slate-700 mb-2 truncate">健康状态分支 (按随访统计)</span>
                       <div className="flex flex-col gap-1 h-full pt-1">
                          <div className="flex-1 bg-teal-400 rounded flex items-center px-1 text-center group-hover:bg-teal-500 transition-colors">
                             <span className="text-[10px] text-white w-full">状态平稳/改善 45% (3,708人)</span>
                          </div>
                          <div className="h-10 bg-amber-400 rounded flex items-center px-1 text-center shrink-0 group-hover:bg-amber-500 transition-colors">
                             <span className="text-[10px] text-amber-900 w-full truncate">体质偏颇波动 30% (2,472人)</span>
                          </div>
                          <div className="h-8 bg-red-400 rounded flex items-center px-1 text-center group-hover:bg-red-500 transition-colors">
                             <span className="text-[10px] text-white w-full">失联或恶化 25% (2,060人)</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            </div>

            {/* 健康状态与体质变化趋势 */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col min-h-[320px]">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center shrink-0">
                <h3 className="text-sm font-bold text-slate-800">健康状态与体质变化趋势</h3>
              </div>
              <div className="min-h-0 min-w-0 flex-1 p-4">
                <ResponsiveContainer width="100%" height="100%" initialDimension={chartInitialDimension}>
                  <LineChart data={stateTrendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dx={-10} tickFormatter={v => `${v}%`} />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                    <Line type="monotone" dataKey="平和质流转率" stroke="#10b981" strokeWidth={2} dot={{ r: 3, strokeWidth: 1 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="体质偏颇加重" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, strokeWidth: 1 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="慢病恶化风险" stroke="#ef4444" strokeWidth={2} dot={{ r: 3, strokeWidth: 1 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 院后服务盲点热力分析 */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col min-h-[320px]">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center shrink-0">
                <h3 className="text-sm font-bold text-slate-800">院后服务盲点热力分析</h3>
                <span className="text-[10px] text-slate-500 px-2 py-1 bg-slate-50 rounded">颜色越浅表示触达/活跃度越低</span>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                 <div className="grid grid-cols-[100px_repeat(4,_minmax(0,_1fr))] text-center border-b border-slate-100 pb-2 mb-2 gap-1 shrink-0">
                    <div></div>
                    <div className="text-[10px] font-bold text-slate-500">宣教触达</div>
                    <div className="text-[10px] font-bold text-slate-500">定期随访</div>
                    <div className="text-[10px] font-bold text-slate-500">设备监测</div>
                    <div className="text-[10px] font-bold text-slate-500">线上问诊</div>
                 </div>
                 <div className="flex-1 flex flex-col gap-1 overflow-auto">
                    {heatmapData.map((row) => (
                       <div key={row.group} className="grid grid-cols-[100px_repeat(4,_minmax(0,_1fr))] gap-1 min-h-[40px]">
                          <div className="flex items-center text-[10px] font-medium text-slate-600 truncate pr-2 border-r border-slate-100" title={row.group}>{row.group}</div>
                          {['宣教', '随访', '设备', '问诊'].map(col => {
                             const val = row[col as keyof typeof row] as number;
                             // Calculate opacity based on value
                             const opacity = Math.max(val / 100, 0.1);
                             let colorClass = 'bg-red-500'; // Default low is bad
                             if (val > 80) colorClass = 'bg-emerald-500';
                             else if (val > 50) colorClass = 'bg-amber-500';
                             
                             return (
                               <div key={col} className="relative flex items-center justify-center rounded overflow-hidden group cursor-pointer ring-1 ring-slate-100">
                                   <div className={`absolute inset-0 ${colorClass}`} style={{ opacity }}></div>
                                   <span className="relative z-10 text-[10px] font-medium text-slate-800">{val}%</span>
                               </div>
                             );
                          })}
                       </div>
                    ))}
                 </div>
                 <div className="mt-auto flex justify-end gap-3 px-2 pt-2 border-t border-slate-50 shrink-0">
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-500/30 rounded ring-1 ring-slate-100"></div><span className="text-[10px] text-slate-500">盲点危机区</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-amber-500/60 rounded ring-1 ring-slate-100"></div><span className="text-[10px] text-slate-500">待提升区</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-emerald-500/80 rounded ring-1 ring-slate-100"></div><span className="text-[10px] text-slate-500">健康稳定区</span></div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
