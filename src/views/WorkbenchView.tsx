import React from "react";
import { Users, Tag, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import { PageHeader } from "../components/common/PageHeader";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { cn } from "../lib/utils";
import { tcmConstitutions } from "../data/analysisData";

const COLORS = [
  "#0e7490",
  "#2563eb",
  "#16a34a",
  "#d97706",
  "#dc2626",
  "#64748b",
  "#0f766e",
  "#475569",
  "#64748b",
];

export function WorkbenchView() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex-shrink-0">
        <PageHeader
          title="运营概览"
          description="查看平台整体运行状态和关键人群指标"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 flex-shrink-0">
        <StatCard
          title="在管人群总数"
          value="125,430"
          trend="+2%"
          isUp
          color="bg-cyan-100 text-cyan-600"
        />
        <StatCard
          title="已建画像人数"
          value="84,210"
          trend="+5%"
          isUp
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="今日新增命中"
          value="1,245"
          trend="-1%"
          isUp={false}
          color="bg-emerald-100 text-emerald-600"
        />
        <StatCard
          title="盲点患者数"
          value="4,200"
          trend="+12%"
          isUp={false}
          color="bg-red-100 text-red-600"
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-4 min-h-0 flex-1">
        {/* Left Column: Charts & Distributions */}
        <div className="flex flex-col gap-4 min-w-0 lg:w-2/3 flex-1">
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm flex flex-col min-h-[240px] flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-slate-700">
                中医体质画像分布
              </h2>
              <Button
                variant="link"
                size="xs"
                className="h-auto p-0 text-[10px] text-cyan-600 font-medium"
              >
                查看详情
              </Button>
            </div>

            <div className="flex items-center gap-4 flex-1 min-h-0">
              <div className="min-h-0 min-w-0 flex-1 h-full">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                  initialDimension={{width: 480, height: 220}}
                >
                  <PieChart>
                    <Pie
                      data={tcmConstitutions.slice(0, 5)}
                      cx="50%"
                      cy="50%"
                      innerRadius="50%"
                      outerRadius="80%"
                      paddingAngle={2}
                      dataKey="count"
                      stroke="none"
                    >
                      {tcmConstitutions.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value: number) =>
                        value.toLocaleString() + " 人"
                      }
                      contentStyle={{
                        borderRadius: "4px",
                        border: "1px solid #e2e8f0",
                        fontSize: "12px",
                        padding: "4px 8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Top 5 list */}
              <div className="w-[200px] flex flex-col justify-center space-y-2 flex-shrink-0">
                {tcmConstitutions.slice(0, 5).map((item, i) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-2.5 h-2.5 rounded-sm"
                        style={{ backgroundColor: COLORS[i] }}
                      ></div>
                      <span className="text-slate-600">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-800 font-semibold">
                        {item.count.toLocaleString()}
                      </span>
                      <span className="text-slate-400 w-8 text-right text-[10px]">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 flex flex-col min-h-[200px] flex-1 overflow-hidden shadow-sm">
            <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xs font-bold text-slate-700">
                近期规则扫描状态
              </h2>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="flex items-center gap-1 text-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>{" "}
                  正常
                </span>
                <span className="flex items-center gap-1 text-red-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>{" "}
                  失败
                </span>
              </div>
            </div>
            <div className="min-h-0 flex-1 [&_[data-slot=table-container]]:h-full [&_[data-slot=table-container]]:overflow-auto">
              <Table className="text-left border-collapse">
                <TableHeader className="bg-slate-50 sticky top-0">
                  <TableRow className="border-b border-slate-200">
                    <TableHead className="h-auto p-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-4">
                      任务批次 / 标签
                    </TableHead>
                    <TableHead className="h-auto p-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:table-cell w-20">
                      耗时
                    </TableHead>
                    <TableHead className="h-auto p-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right pr-4 w-28">
                      执行结果
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100">
                  {[
                    {
                      tag: "气虚质扫描",
                      time: "12ms",
                      status: "success",
                      count: "+150",
                    },
                    {
                      tag: "高危失联召回",
                      time: "45ms",
                      status: "success",
                      count: "+12",
                    },
                    {
                      tag: "断药失访风险筛查",
                      time: "1.2s",
                      status: "fail",
                      error: "源表超时",
                    },
                    {
                      tag: "阳虚质扫描",
                      time: "11ms",
                      status: "success",
                      count: "+43",
                    },
                  ].map((log, i) => (
                    <TableRow
                      key={i}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <TableCell className="p-2.5 pl-4 text-xs font-medium text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Tag size={12} className="text-slate-400" />
                          {log.tag}
                        </div>
                      </TableCell>
                      <TableCell className="p-2.5 text-xs text-slate-500 hidden sm:table-cell">
                        {log.time}
                      </TableCell>
                      <TableCell className="p-2.5 pr-4 text-right">
                        {log.status === "success" ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border-emerald-100"
                          >
                            {log.count} 人
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] text-red-600 bg-red-50 px-1.5 py-0.5 rounded border-red-100"
                          >
                            失败: {log.error}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* Right Column: Pending Tasks */}
        <div className="flex flex-col gap-4 lg:w-1/3 flex-shrink-0 min-w-0 flex-1">
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm relative overflow-hidden flex-shrink-0">
            <h3 className="text-xs font-bold text-slate-700 mb-3">快捷操作</h3>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="ghost"
                className="h-auto items-start justify-start p-3 bg-slate-50 border border-slate-100 rounded hover:bg-blue-50 hover:border-blue-200 transition text-left flex flex-col gap-2"
                onClick={() => navigate("/tags")}
              >
                <Tag size={16} className="text-blue-500" />
                <span className="text-[11px] font-medium text-slate-700">
                  管理画像标签
                </span>
              </Button>
              <Button
                variant="ghost"
                className="h-auto items-start justify-start p-3 bg-slate-50 border border-slate-100 rounded hover:bg-cyan-50 hover:border-cyan-200 transition text-left flex flex-col gap-2"
                onClick={() => navigate("/population")}
              >
                <Users size={16} className="text-cyan-600" />
                <span className="text-[11px] font-medium text-slate-700">
                  新建动态人群
                </span>
              </Button>
              <Button
                variant="ghost"
                className="h-auto items-start justify-start p-3 bg-slate-50 border border-slate-100 rounded hover:border-amber-200 hover:bg-amber-50 transition text-left flex flex-col gap-2"
                onClick={() => navigate("/touchpoint")}
              >
                <Send size={16} className="text-amber-500" />
                <span className="text-[11px] font-medium text-slate-700">
                  发起体质宣教
                </span>
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 flex flex-col min-h-[200px] flex-1 shadow-sm overflow-hidden">
            <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                待办提醒
                <span className="bg-red-100 text-red-600 px-1.5 rounded-full text-[10px] font-bold">
                  5
                </span>
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              <TodoItem
                title="待确认快照: 长期未复诊"
                desc="356名患者名单生成"
                time="10m前"
                type="warning"
              />
              <TodoItem
                title="发送失败: 秋季关怀短信"
                desc="12条短信网关失败"
                time="1h前"
                type="danger"
              />
              <TodoItem
                title="待电话联系: 严重断药失访"
                desc="新增 8 名高风险患者"
                time="2h前"
                type="info"
              />
              <TodoItem
                title="扫描批次失败"
                desc="源数据提取连接超时"
                time="昨天"
                type="danger"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, isUp, color }: any) {
  return (
    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
        {title}
      </div>
      <div className="flex items-end justify-between mt-1">
        <span className="text-2xl font-semibold text-slate-800">{value}</span>
        <span
          className={cn(
            "text-[10px] px-1.5 py-0.5 rounded flex items-center",
            isUp
              ? "text-emerald-600 bg-emerald-50"
              : "text-red-600 bg-red-50",
          )}
        >
          {trend}
        </span>
      </div>
    </div>
  );
}

function TodoItem({ title, desc, time, type }: any) {
  const types: Record<string, string> = {
    warning: "border-l-amber-400 bg-amber-50/30",
    danger: "border-l-red-400 bg-red-50/30",
    info: "border-l-cyan-400 bg-cyan-50/30",
  };
  return (
    <div
      className={cn(
        "p-2 rounded border-l-2 border-y border-r border-slate-100",
        types[type],
      )}
    >
      <div className="flex justify-between items-start">
        <h4 className="text-[11px] font-bold text-slate-700 leading-tight">
          {title}
        </h4>
        <span className="text-[9px] text-slate-400 shrink-0">{time}</span>
      </div>
      <div className="flex justify-between items-center mt-1">
        <p className="text-[10px] text-slate-500 truncate">{desc}</p>
        <Button
          variant="link"
          size="xs"
          className="h-auto p-0 text-[9px] font-medium text-cyan-600"
        >
          处理
        </Button>
      </div>
    </div>
  );
}
