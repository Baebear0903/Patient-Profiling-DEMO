const fs = require('fs');
let file = fs.readFileSync('src/views/TagManagementView.tsx', 'utf8');

file = file.replace(
  '<th className="sticky top-0 bg-slate-50 p-3 text-[11px] font-medium text-slate-500 border-b z-10 w-48">标签名称 / 编码</th>',
  '<th className="sticky top-0 bg-slate-50 p-3 text-[11px] font-medium text-slate-500 border-b border-slate-200 z-10 w-[25%]">标签名称 / 编码</th>'
);

file = file.replace(
  '<th className="sticky top-0 bg-slate-50 p-3 text-[11px] font-medium text-slate-500 border-b z-10 min-w-[200px]">所属目录 / 场景</th>',
  '<th className="sticky top-0 bg-slate-50 p-3 text-[11px] font-medium text-slate-500 border-b border-slate-200 z-10 w-[20%]">所属目录 / 场景</th>'
);

file = file.replace(
  '<th className="sticky top-0 bg-slate-50 p-3 text-[11px] font-medium text-slate-500 border-b z-10 w-24 text-center">状态 / 版本</th>',
  '<th className="sticky top-0 bg-slate-50 p-3 text-[11px] font-medium text-slate-500 border-b border-slate-200 z-10 w-[15%] text-center">状态 / 版本</th>'
);

file = file.replace(
  '<th className="sticky top-0 bg-slate-50 p-3 text-[11px] font-medium text-slate-500 border-b z-10 w-28 text-right">命中人数</th>',
  '<th className="sticky top-0 bg-slate-50 p-3 text-[11px] font-medium text-slate-500 border-b border-slate-200 z-10 w-[15%] text-right">命中人数</th>'
);

file = file.replace(
  '<th className="sticky top-0 bg-slate-50 p-3 text-[11px] font-medium text-slate-500 border-b z-10 w-40">最近扫描 / 周期</th>',
  '<th className="sticky top-0 bg-slate-50 p-3 text-[11px] font-medium text-slate-500 border-b border-slate-200 z-10 w-[25%]">最近扫描 / 周期</th>'
);

file = file.replace(
  '<th className="sticky top-0 right-0 bg-slate-50 p-3 text-[11px] font-medium text-slate-500 border-b z-20 w-[180px] text-left">操作</th>',
  '<th className="sticky top-0 right-0 bg-slate-50 p-3 text-[11px] font-medium text-slate-500 border-b border-slate-200 border-l border-slate-100 shadow-[-2px_0_4px_rgba(0,0,0,0.02)] z-20 w-[160px] text-left">操作</th>'
);

fs.writeFileSync('src/views/TagManagementView.tsx', file);
