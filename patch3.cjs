const fs = require('fs');
const path = require('path');

const mockPath = path.join(__dirname, 'src/data/mock.ts');
let mockContent = fs.readFileSync(mockPath, 'utf8');

// Replace mockTags array completely to include new ones and add isWarningTag
const newTagsStr = `export const mockTags = [
  // 九种体质倾向类
  { id: "TCM-CONS-001", name: "平和质", category: "九种体质倾向类", scene: "体质辨识", status: "已发布", count: 8500, version: "v1", lastScan: "2026-06-14 08:00", cycle: "每日" },
  { 
    id: "TCM-CONS-002", name: "气虚质", category: "九种体质倾向类", scene: "体质辨识", status: "已发布", count: 4260, version: "v1", lastScan: "2026-06-14 08:00", cycle: "每日",
    editorConfig: {
      contextScope: "SAME_CONSTITUTION_ASSESSMENT",
      conditions: [
        { id: "1", type: "纳入条件", domain: "中医体质辨识记录", field: "九种体质", operator: "包含", value: "气虚质" },
        { id: "2", type: "纳入条件", domain: "中医体质辨识记录", field: "体质得分", operator: "大于等于", value: "60" },
        { id: "3", type: "排除条件", domain: "随访记录", field: "是否失访", operator: "等于", value: "是" },
      ]
    }
  },
  { id: "TCM-CONS-003", name: "阳虚质", category: "九种体质倾向类", scene: "体质辨识", status: "已发布", count: 3780, version: "v1", lastScan: "2026-06-14 08:00", cycle: "每日" },
  { id: "TCM-CONS-004", name: "阴虚质", category: "九种体质倾向类", scene: "体质辨识", status: "已发布", count: 2950, version: "v1", lastScan: "2026-06-14 08:00", cycle: "每日" },
  { id: "TCM-CONS-005", name: "痰湿质", category: "九种体质倾向类", scene: "体质辨识", status: "已发布", count: 3420, version: "v1", lastScan: "2026-06-14 08:00", cycle: "每日" },
  { id: "TCM-CONS-006", name: "湿热质", category: "九种体质倾向类", scene: "体质辨识", status: "已发布", count: 2680, version: "v1", lastScan: "2026-06-14 08:00", cycle: "每日" },
  { id: "TCM-CONS-007", name: "血瘀质", category: "九种体质倾向类", scene: "体质辨识", status: "已发布", count: 1960, version: "v1", lastScan: "2026-06-14 08:00", cycle: "每日" },
  { id: "TCM-CONS-008", name: "气郁质", category: "九种体质倾向类", scene: "体质辨识", status: "已发布", count: 2110, version: "v1", lastScan: "2026-06-14 08:00", cycle: "每日" },
  { id: "TCM-CONS-009", name: "特禀质", category: "九种体质倾向类", scene: "体质辨识", status: "已发布", count: 1240, version: "v1", lastScan: "2026-06-14 08:00", cycle: "每日" },
  { id: "TCM-CONS-010", name: "复合体质倾向", category: "体质异常预警类", scene: "体质综合评估", status: "已发布", count: 3100, version: "v1", lastScan: "2026-06-14 08:00", cycle: "每日", isWarningTag: true, warningLevel: "中" },
  { id: "TCM-CONS-011", name: "体质偏颇明显", category: "体质异常预警类", scene: "重点人群筛查", status: "已发布", count: 1850, version: "v1", lastScan: "2026-06-14 08:00", cycle: "每日", isWarningTag: true, warningLevel: "中" },
  { id: "TCM-CONS-012", name: "体质状态稳定", category: "九种体质倾向类", scene: "随访管理", status: "草稿", count: 0, version: "v1", lastScan: "-", cycle: "每月" },

  // 脏腑功能偏颇类
  { id: "TCM-ZF-001", name: "肺气不足", category: "脏腑功能偏颇类", scene: "脏腑辨识", status: "已发布", count: 1680, version: "v1", lastScan: "2026-06-14 08:00", cycle: "每周" },
  { id: "TCM-ZF-002", name: "脾胃虚弱", category: "脏腑功能偏颇类", scene: "脏腑辨识", status: "已发布", count: 3260, version: "v1", lastScan: "2026-06-14 08:00", cycle: "每周" },
  { id: "TCM-ZF-003", name: "肝郁气滞", category: "脏腑功能偏颇类", scene: "情志管理", status: "已发布", count: 2040, version: "v1", lastScan: "2026-06-14 08:00", cycle: "每周" },

  // 慢病风险预警类
  { id: "TCM-RISK-001", name: "高血压易感风险", category: "关键指标异常预警类", scene: "慢病风险筛查", status: "已发布", count: 1860, version: "v2", lastScan: "2026-06-14 08:00", cycle: "每日", isWarningTag: true, warningLevel: "中" },
  { id: "TCM-RISK-002", name: "糖代谢异常风险", category: "关键指标异常预警类", scene: "慢病风险筛查", status: "已发布", count: 1420, version: "v2", lastScan: "2026-06-14 08:00", cycle: "每日", isWarningTag: true, warningLevel: "中" },
  { id: "TCM-RISK-003", name: "血脂异常风险", category: "关键指标异常预警类", scene: "慢病风险筛查", status: "已发布", count: 1760, version: "v1", lastScan: "2026-06-14 08:00", cycle: "每日", isWarningTag: true, warningLevel: "中" },
  { id: "TCM-RISK-004", name: "脑卒中高危倾向", category: "慢病风险升级预警类", scene: "卒中风险预警", status: "已发布", count: 620, version: "v1", lastScan: "2026-06-14 08:00", cycle: "每日", isWarningTag: true, warningLevel: "高" },
  { id: "TCM-RISK-005", name: "冠心病风险倾向", category: "慢病风险升级预警类", scene: "心血管风险管理", status: "已发布", count: 740, version: "v1", lastScan: "2026-06-14 08:00", cycle: "每日", isWarningTag: true, warningLevel: "高" },
  { id: "TCM-RISK-008", name: "代谢综合征风险倾向", category: "慢病风险升级预警类", scene: "代谢风险管理", status: "已发布", count: 880, version: "v1", lastScan: "2026-06-14 08:00", cycle: "每日", isWarningTag: true, warningLevel: "中" },

  // 用药禁忌与药事风险类
  { id: "TCM-MED-001", name: "寒凉药慎用", category: "用药与药事风险预警类", scene: "处方审核", status: "已发布", count: 560, version: "v1", lastScan: "2026-06-14 08:00", cycle: "实时", isWarningTag: true, warningLevel: "中" },
  { id: "TCM-MED-005", name: "孕产妇中药禁忌风险", category: "用药与药事风险预警类", scene: "妇幼用药审核", status: "已发布", count: 120, version: "v2", lastScan: "2026-06-14 08:00", cycle: "实时", isWarningTag: true, warningLevel: "高" },
  { id: "TCM-MED-007", name: "肝肾功能异常用药风险", category: "用药与药事风险预警类", scene: "药事风控", status: "已发布", count: 210, version: "v1", lastScan: "2026-06-14 08:00", cycle: "实时", isWarningTag: true, warningLevel: "高" },
  { id: "TCM-MED-008", name: "多药联用风险", category: "用药与药事风险预警类", scene: "药事风控", status: "草稿", count: 0, version: "v1", lastScan: "-", cycle: "实时", isWarningTag: true, warningLevel: "中" },

  // 体质异常预警类
  { id: "WARN-CONS-001", name: "体质劣向演变", category: "体质异常预警类", scene: "体质趋势预警", status: "已发布", count: 236, version: "v1", lastScan: "2026-06-14 08:00", cycle: "每日", isWarningTag: true, warningLevel: "高" },
  { id: "WARN-CONS-002", name: "平和质转偏颇预警", category: "体质异常预警类", scene: "体质趋势预警", status: "已发布", count: 185, version: "v1", lastScan: "2026-06-14 08:00", cycle: "每日", isWarningTag: true, warningLevel: "中" },
  { id: "WARN-CONS-003", name: "偏颇等级加重预警", category: "体质异常预警类", scene: "体质趋势预警", status: "已发布", count: 156, version: "v1", lastScan: "2026-06-14 08:00", cycle: "每日", isWarningTag: true, warningLevel: "高" },

  // 盲点患者预警类
  { id: "WARN-BLIND-001", name: "高危失联患者", category: "盲点患者预警类", scene: "主动随访干预", status: "已发布", count: 320, version: "v1", lastScan: "2026-06-14 08:00", cycle: "每日", isWarningTag: true, warningLevel: "高" },
  { id: "WARN-BLIND-002", name: "断药失访患者", category: "盲点患者预警类", scene: "用药连续性管理", status: "已发布", count: 180, version: "v1", lastScan: "2026-06-14 08:00", cycle: "每日", isWarningTag: true, warningLevel: "高" },
  { id: "WARN-BLIND-003", name: "复诊逾期患者", category: "盲点患者预警类", scene: "慢病复诊管理", status: "已发布", count: 450, version: "v1", lastScan: "2026-06-14 08:00", cycle: "每日", isWarningTag: true, warningLevel: "中" },
  { id: "WARN-BLIND-004", name: "复查缺失患者", category: "盲点患者预警类", scene: "慢病复查管理", status: "已发布", count: 280, version: "v1", lastScan: "2026-06-14 08:00", cycle: "每周", isWarningTag: true, warningLevel: "中" },

  // 依从性与宣教反馈预警类
  { id: "WARN-COMP-001", name: "宣教未触达预警", category: "依从性与宣教反馈预警类", scene: "健康宣教运营", status: "已发布", count: 520, version: "v1", lastScan: "2026-06-14 08:00", cycle: "每日", isWarningTag: true, warningLevel: "低" },
  { id: "WARN-COMP-002", name: "宣教未完成预警", category: "依从性与宣教反馈预警类", scene: "健康宣教运营", status: "已发布", count: 680, version: "v1", lastScan: "2026-06-14 08:00", cycle: "每周", isWarningTag: true, warningLevel: "低" },
  { id: "WARN-COMP-003", name: "依从性下降预警", category: "依从性与宣教反馈预警类", scene: "依从性管理", status: "已发布", count: 210, version: "v1", lastScan: "2026-06-14 08:00", cycle: "每周", isWarningTag: true, warningLevel: "中" },

  // 重点人群管理类
  { id: "TCM-POP-004", name: "慢病患者体质随访", category: "重点人群管理类", scene: "慢病随访", status: "已发布", count: 2340, version: "v1", lastScan: "2026-06-14 08:00", cycle: "每周", isWarningTag: true, warningLevel: "中" },
  { id: "TCM-POP-005", name: "体质异常预警人群", category: "重点人群管理类", scene: "重点人群预警", status: "已发布", count: 730, version: "v1", lastScan: "2026-06-14 08:00", cycle: "每日", isWarningTag: true, warningLevel: "中" }
];`;

const replacementRegex = /export const mockTags = \[[\s\S]*?\];/;
mockContent = mockContent.replace(replacementRegex, newTagsStr);

fs.writeFileSync(mockPath, mockContent);
console.log('done');
