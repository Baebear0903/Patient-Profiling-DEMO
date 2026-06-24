export const tcmConstitutions = [
  { name: "平和质", count: 12500, percentage: 25 },
  { name: "气虚质", count: 8500, percentage: 17 },
  { name: "阳虚质", count: 6200, percentage: 12.4 },
  { name: "阴虚质", count: 5800, percentage: 11.6 },
  { name: "痰湿质", count: 4500, percentage: 9 },
  { name: "湿热质", count: 4200, percentage: 8.4 },
  { name: "血瘀质", count: 3800, percentage: 7.6 },
  { name: "气郁质", count: 2500, percentage: 5 },
  { name: "特禀质", count: 2000, percentage: 4 },
];

export const genderDistribution = [
  { name: "男", count: 24500 },
  { name: "女", count: 25500 },
];

export const diseaseDistribution = [
  { name: "慢性胃炎", count: 4500 },
  { name: "高血压病", count: 4200 },
  { name: "2型糖尿病", count: 3800 },
  { name: "冠心病", count: 2500 },
  { name: "失眠症", count: 2100 },
  { name: "骨关节炎", count: 1800 },
];

export const constitutionTrendData = [
  { month: "1月", 平和质: 10800, 气虚质: 9800, 阳虚质: 7400, 阴虚质: 4600, 痰湿质: 6100, 湿热质: 3600, 血瘀质: 3000, 气郁质: 3200, 特禀质: 1700 },
  { month: "2月", 平和质: 11250, 气虚质: 9400, 阳虚质: 7100, 阴虚质: 5000, 痰湿质: 5700, 湿热质: 3900, 血瘀质: 3150, 气郁质: 3050, 特禀质: 1780 },
  { month: "3月", 平和质: 11750, 气虚质: 9000, 阳虚质: 6800, 阴虚质: 5400, 痰湿质: 5200, 湿热质: 4300, 血瘀质: 3350, 气郁质: 2850, 特禀质: 1850 },
  { month: "4月", 平和质: 12100, 气虚质: 8700, 阳虚质: 6500, 阴虚质: 5650, 痰湿质: 4850, 湿热质: 4500, 血瘀质: 3550, 气郁质: 2700, 特禀质: 1920 },
  { month: "5月", 平和质: 12350, 气虚质: 8550, 阳虚质: 6300, 阴虚质: 5750, 痰湿质: 4600, 湿热质: 4350, 血瘀质: 3700, 气郁质: 2600, 特禀质: 1970 },
  { month: "6月", 平和质: 12500, 气虚质: 8500, 阳虚质: 6200, 阴虚质: 5800, 痰湿质: 4500, 湿热质: 4200, 血瘀质: 3800, 气郁质: 2500, 特禀质: 2000 },
];

export const keyPopulationTrendData = [
  { month: "1月", 慢病共病人群: 15000, 亚健康及治未病高风险人群: 12000, 中药调理或膏方干预人群: 5400, 老年及多药联用人群: 8000, 妇女儿童等特殊体质管理人群: 3000 },
  { month: "2月", 慢病共病人群: 15200, 亚健康及治未病高风险人群: 12200, 中药调理或膏方干预人群: 5200, 老年及多药联用人群: 8200, 妇女儿童等特殊体质管理人群: 3100 },
  { month: "3月", 慢病共病人群: 15500, 亚健康及治未病高风险人群: 12500, 中药调理或膏方干预人群: 5000, 老年及多药联用人群: 8500, 妇女儿童等特殊体质管理人群: 3300 },
  { month: "4月", 慢病共病人群: 15800, 亚健康及治未病高风险人群: 12800, 中药调理或膏方干预人群: 4800, 老年及多药联用人群: 8800, 妇女儿童等特殊体质管理人群: 3500 },
  { month: "5月", 慢病共病人群: 16000, 亚健康及治未病高风险人群: 13000, 中药调理或膏方干预人群: 4500, 老年及多药联用人群: 9000, 妇女儿童等特殊体质管理人群: 3800 },
  { month: "6月", 慢病共病人群: 16500, 亚健康及治未病高风险人群: 13500, 中药调理或膏方干预人群: 4200, 老年及多药联用人群: 9500, 妇女儿童等特殊体质管理人群: 4000 },
];

export const sankeyData = {
  nodes: [
    { name: '初评·气虚质', type: '气虚质', stage: '初评' },
    { name: '初评·痰湿质', type: '痰湿质', stage: '初评' },
    { name: '初评·阳虚质', type: '阳虚质', stage: '初评' },
    { name: '初评·平和质', type: '平和质', stage: '初评' },
    
    { name: '一月·气虚质', type: '气虚质', stage: '1个月复评' },
    { name: '一月·痰湿质', type: '痰湿质', stage: '1个月复评' },
    { name: '一月·阳虚质', type: '阳虚质', stage: '1个月复评' },
    { name: '一月·平和质', type: '平和质', stage: '1个月复评' },

    { name: '三月·平和质', type: '平和质', stage: '3个月复评' },
    { name: '三月·湿热质', type: '湿热质', stage: '3个月复评' },
    { name: '三月·气虚质', type: '气虚质', stage: '3个月复评' },

    { name: '六月·平和质', type: '平和质', stage: '6个月复评' },
    { name: '六月·气虚质', type: '气虚质', stage: '6个月复评' },
  ],
  links: [
    { source: 0, target: 4, value: 150, action: '宣教随访', status: 'stable' },
    { source: 4, target: 8, value: 150, action: '中药调理', status: 'improve' },
    { source: 8, target: 11, value: 150, action: '预防保健', status: 'stable' },
    
    { source: 1, target: 5, value: 100, action: '饮食干预', status: 'stable' },
    { source: 5, target: 9, value: 100, action: '健康预警', status: 'worsen' },
    { source: 9, target: 11, value: 100, action: '药事随访', status: 'improve' },

    { source: 2, target: 6, value: 80, action: '起居指导', status: 'stable' },
    { source: 6, target: 10, value: 80, action: '中药配方', status: 'improve' },
    { source: 10, target: 11, value: 80, action: '运动指导', status: 'improve' },

    { source: 3, target: 7, value: 200, action: '健康打卡', status: 'stable' },
    { source: 7, target: 8, value: 200, action: '随访维持', status: 'stable' },
    { source: 8, target: 12, value: 200, action: '体检监测', status: 'worsen' },
  ]
};

export const topImprovementPaths = [
  { path: '气虚质 → 平和质', count: 35, percentage: '18.6%', action: '预防保健' },
  { path: '痰湿质 → 平和质', count: 28, percentage: '14.8%', action: '随访维持' },
  { path: '湿热质 → 平和质', count: 25, percentage: '13.2%', action: '健康打卡' },
  { path: '阳虚质 → 平和质', count: 20, percentage: '10.6%', action: '饮食指导' },
  { path: '血瘀质 → 平和质', count: 18, percentage: '9.5%', action: '运动指导' },
];

export const topWorseningPaths = [
  { path: '平和质 → 气虚质', count: 20, percentage: '11.1%', action: '健康提醒' },
  { path: '平和质 → 痰湿质', count: 15, percentage: '8.3%', action: '饮食干预' },
  { path: '平和质 → 阳虚质', count: 10, percentage: '5.5%', action: '养生指导' },
  { path: '气虚质 → 痰湿质', count: 12, percentage: '6.6%', action: '复诊建议' },
  { path: '气郁质 → 血瘀质', count: 20, percentage: '11.1%', action: '慢病管理' },
];

export const transitionMatrixData = [
  { prev: "平和质", next: { 平和质: 180, 气虚质: 20, 阳虚质: 10, 阴虚质: 5, 痰湿质: 15, 湿热质: 8, 血瘀质: 4, 气郁质: 6, 特禀质: 2 } },
  { prev: "气虚质", next: { 平和质: 35, 气虚质: 120, 阳虚质: 18, 阴虚质: 7, 痰湿质: 12, 湿热质: 5, 血瘀质: 6, 气郁质: 4, 特禀质: 1 } },
  { prev: "阳虚质", next: { 平和质: 20, 气虚质: 15, 阳虚质: 100, 阴虚质: 4, 痰湿质: 10, 湿热质: 2, 血瘀质: 8, 气郁质: 5, 特禀质: 2 } },
  { prev: "阴虚质", next: { 平和质: 15, 气虚质: 8, 阳虚质: 3, 阴虚质: 90, 痰湿质: 6, 湿热质: 15, 血瘀质: 10, 气郁质: 12, 特禀质: 1 } },
  { prev: "痰湿质", next: { 平和质: 28, 气虚质: 12, 阳虚质: 8, 阴虚质: 4, 痰湿质: 95, 湿热质: 20, 血瘀质: 15, 气郁质: 6, 特禀质: 3 } },
  { prev: "湿热质", next: { 平和质: 25, 气虚质: 6, 阳虚质: 2, 阴虚质: 18, 痰湿质: 22, 湿热质: 85, 血瘀质: 12, 气郁质: 8, 特禀质: 4 } },
  { prev: "血瘀质", next: { 平和质: 18, 气虚质: 10, 阳虚质: 12, 阴虚质: 14, 痰湿质: 16, 湿热质: 10, 血瘀质: 80, 气郁质: 25, 特禀质: 2 } },
  { prev: "气郁质", next: { 平和质: 22, 气虚质: 14, 阳虚质: 6, 阴虚质: 15, 痰湿质: 8, 湿热质: 12, 血瘀质: 20, 气郁质: 75, 特禀质: 1 } },
  { prev: "特禀质", next: { 平和质: 10, 气虚质: 5, 阳虚质: 4, 阴虚质: 2, 痰湿质: 3, 湿热质: 5, 血瘀质: 2, 气郁质: 4, 特禀质: 90 } },
];

export const tagCategories = [
  { name: "全部", sort: 1 },
  { name: "九种体质倾向类", sort: 2 },
  { name: "体质异常预警类", sort: 3 },
  { name: "脏腑功能偏颇类", sort: 4 },
  { name: "慢病体质风险类", sort: 5 },
  { name: "中医药事风险类", sort: 6 },
  { name: "调养干预建议类", sort: 7 },
  { name: "底层名医知识规则类", sort: 8 },
];

export const mockTags = [
  { id: "TCM-CONS-001", name: "平和质", category: "九种体质倾向类", scene: "体质辨识", status: "已发布", version: "v1", count: 8500, cycle: "每日自动更新（T+1）", lastScan: "2026-06-14 08:00", isWarningTag: false },
  { id: "TCM-CONS-002", name: "气虚质", category: "九种体质倾向类", scene: "体质辨识", status: "已发布", version: "v1", count: 4260, cycle: "每日自动更新（T+1）", lastScan: "2026-06-14 08:00", isWarningTag: false,
    editorConfig: {
      contextScope: "SAME_CONSTITUTION_ASSESSMENT",
      conditions: [
        { id: "c1", type: "纳入条件", domain: "中医体质辨识记录", field: "九种体质", operator: "包含", value: "气虚质" },
        { id: "c2", type: "纳入条件", domain: "中医体质辨识记录", field: "体质得分", operator: "大于等于", value: "60" },
        { id: "c3", type: "排除条件", domain: "中医体质辨识记录", field: "辨识来源", operator: "等于", value: "无效记录" }
      ]
    }
  },
  { id: "TCM-CONS-003", name: "阳虚质", category: "九种体质倾向类", scene: "体质辨识", status: "已发布", version: "v1", count: 3780, cycle: "每日自动更新（T+1）", lastScan: "2026-06-14 08:00", isWarningTag: false },
  { id: "TCM-CONS-004", name: "阴虚质", category: "九种体质倾向类", scene: "体质辨识", status: "已发布", version: "v1", count: 2950, cycle: "每日自动更新（T+1）", lastScan: "2026-06-14 08:00", isWarningTag: false },
  { id: "TCM-CONS-005", name: "痰湿质", category: "九种体质倾向类", scene: "体质辨识", status: "已发布", version: "v1", count: 3420, cycle: "每日自动更新（T+1）", lastScan: "2026-06-14 08:00", isWarningTag: false,
    editorConfig: {
      contextScope: "SAME_PATIENT",
      conditions: [
        { id: "c1", type: "纳入条件", domain: "中医体质辨识记录", field: "九种体质", operator: "包含", value: "痰湿质" },
        { id: "c2", type: "纳入条件", domain: "中医体质辨识记录", field: "体质得分", operator: "大于等于", value: "60" },
        { id: "c3", type: "纳入条件", domain: "病历文书", field: "中医四诊摘要", operator: "包含任一", value: "苔腻、痰多、胸闷、困倦" }
      ]
    }
  },
  { id: "TCM-CONS-006", name: "湿热质", category: "九种体质倾向类", scene: "体质辨识", status: "已发布", version: "v1", count: 2680, cycle: "每日自动更新（T+1）", lastScan: "2026-06-14 08:00", isWarningTag: false },
  { id: "TCM-CONS-007", name: "血瘀质", category: "九种体质倾向类", scene: "体质辨识", status: "已发布", version: "v1", count: 1960, cycle: "每日自动更新（T+1）", lastScan: "2026-06-14 08:00", isWarningTag: false },
  { id: "TCM-CONS-008", name: "气郁质", category: "九种体质倾向类", scene: "体质辨识", status: "已发布", version: "v1", count: 2110, cycle: "每日自动更新（T+1）", lastScan: "2026-06-14 08:00", isWarningTag: false },
  { id: "TCM-CONS-009", name: "特禀质", category: "九种体质倾向类", scene: "体质辨识", status: "已发布", version: "v1", count: 1240, cycle: "每日自动更新（T+1）", lastScan: "2026-06-14 08:00", isWarningTag: false },
  { id: "TCM-CONS-010", name: "复合体质倾向", category: "九种体质倾向类", scene: "体质综合评估", status: "已发布", version: "v1", count: 3100, cycle: "每日自动更新（T+1）", lastScan: "2026-06-14 08:00", isWarningTag: false },

  // 体质异常预警类
  { id: "TCM-WARN-001", name: "体质劣向演变预警", category: "体质异常预警类", scene: "体质异常预警", status: "已发布", version: "v2", count: 286, cycle: "每日自动更新（T+1）", lastScan: "2026-06-14 08:00", isWarningTag: true, warningLevel: "中危", warningType: "体质异常预警",
    editorConfig: {
      contextScope: "SAME_PATIENT",
      conditions: [
        { id: "c1", type: "纳入条件", domain: "中医体质辨识记录", field: "历史九种体质", operator: "包含", value: "平和质" },
        { id: "c2", type: "纳入条件", domain: "中医体质辨识记录", field: "最近九种体质", operator: "包含任一", value: "气虚质、阳虚质、阴虚质、痰湿质、湿热质、血瘀质、气郁质、特禀质" },
        { id: "c3", type: "纳入条件", domain: "中医体质辨识记录", field: "最近偏颇等级", operator: "大于等于", value: "中度" },
        { id: "c4", type: "纳入条件", domain: "中医体质辨识记录", field: "最近体质得分较上次变化", operator: "大于等于", value: "15" }
      ]
    }
  },
  { id: "TCM-WARN-002", name: "体质偏颇加重预警", category: "体质异常预警类", scene: "体质异常预警", status: "已发布", version: "v2", count: 198, cycle: "每日自动更新（T+1）", lastScan: "2026-06-14 08:00", isWarningTag: true, warningLevel: "中危", warningType: "体质异常预警",
    editorConfig: {
      contextScope: "SAME_PATIENT",
      conditions: [
        { id: "c1", type: "纳入条件", domain: "中医体质辨识记录", field: "九种体质", operator: "包含任一", value: "气虚质、阳虚质、阴虚质、痰湿质、湿热质、血瘀质、气郁质、特禀质" },
        { id: "c2", type: "纳入条件", domain: "中医体质辨识记录", field: "偏颇等级", operator: "大于等于", value: "中度" },
        { id: "c3", type: "纳入条件", domain: "中医体质辨识记录", field: "体质得分较上次变化", operator: "大于等于", value: "10" },
        { id: "c4", type: "纳入条件", domain: "随访记录", field: "随访结果", operator: "不等于", value: "已改善" }
      ]
    }
  },
  { id: "TCM-WARN-003", name: "复合异常体质预警", category: "体质异常预警类", scene: "体质异常预警", status: "已发布", version: "v1", count: 164, cycle: "每日自动更新（T+1）", lastScan: "2026-06-14 08:00", isWarningTag: true, warningLevel: "高危", warningType: "复合风险预警",
    editorConfig: {
      contextScope: "SAME_PATIENT",
      conditions: [
        { id: "c1", type: "纳入条件", domain: "中医体质辨识记录", field: "偏颇体质数量", operator: "大于等于", value: "2" },
        { id: "c2", type: "纳入条件", domain: "中医体质辨识记录", field: "最高体质得分", operator: "大于等于", value: "70" },
        { id: "c3", type: "纳入条件", domain: "慢病管理记录", field: "风险等级", operator: "属于", value: "中危、高危" },
        { id: "c4", type: "纳入条件", domain: "健康监测指标", field: "关键指标异常数量", operator: "大于等于", value: "2" }
      ]
    }
  },
  { id: "TCM-WARN-004", name: "高危失联体质患者预警", category: "体质异常预警类", scene: "盲点患者预警", status: "已发布", version: "v1", count: 92, cycle: "每日自动更新（T+1）", lastScan: "2026-06-14 09:00", isWarningTag: true, warningLevel: "高危", warningType: "盲点患者预警",
    editorConfig: {
      contextScope: "SAME_PATIENT",
      conditions: [
        { id: "c1", type: "纳入条件", domain: "中医体质辨识记录", field: "偏颇等级", operator: "大于等于", value: "中度" },
        { id: "c2", type: "纳入条件", domain: "慢病管理记录", field: "风险等级", operator: "属于", value: "中危、高危" },
        { id: "c3", type: "纳入条件", domain: "随访记录", field: "是否失访", operator: "等于", value: "是" },
        { id: "c4", type: "纳入条件", domain: "随访记录", field: "最近随访时间", operator: "早于", value: "90天前" }
      ]
    }
  },
  { id: "TCM-WARN-005", name: "断药失访体质患者预警", category: "体质异常预警类", scene: "盲点患者预警", status: "已发布", version: "v1", count: 76, cycle: "实时扫描", lastScan: "2026-06-14 10:00", isWarningTag: true, warningLevel: "高危", warningType: "盲点患者预警",
    editorConfig: {
      contextScope: "SAME_PATIENT",
      conditions: [
        { id: "c1", type: "纳入条件", domain: "中医药事记录", field: "中药处方名称", operator: "不为空", value: "" },
        { id: "c2", type: "纳入条件", domain: "中医药事记录", field: "用药执行状态", operator: "属于", value: "中断、未执行" },
        { id: "c3", type: "纳入条件", domain: "中医药事记录", field: "断药风险", operator: "属于", value: "中、高" },
        { id: "c4", type: "纳入条件", domain: "随访记录", field: "最近随访时间", operator: "早于", value: "30天前" },
        { id: "c5", type: "纳入条件", domain: "中医体质辨识记录", field: "九种体质", operator: "包含任一", value: "气虚质、阳虚质、痰湿质、血瘀质" }
      ]
    }
  },

  // 脏腑功能偏颇类
  { id: "TCM-ZF-001", name: "脾胃虚弱", category: "脏腑功能偏颇类", scene: "脏腑辨识", status: "已发布", version: "v1", count: 3260, cycle: "每周自动更新", lastScan: "2026-06-14 08:00", isWarningTag: false,
    editorConfig: {
      contextScope: "SAME_ZANGFU_ASSESSMENT",
      conditions: [
        { id: "c1", type: "纳入条件", domain: "脏腑功能评估", field: "脏腑名称", operator: "等于", value: "脾胃" },
        { id: "c2", type: "纳入条件", domain: "脏腑功能评估", field: "脏腑状态", operator: "包含", value: "脾胃虚弱" },
        { id: "c3", type: "纳入条件", domain: "脏腑功能评估", field: "异常等级", operator: "大于等于", value: "轻度" }
      ]
    }
  },
  { id: "TCM-ZF-002", name: "肺气不足", category: "脏腑功能偏颇类", scene: "脏腑辨识", status: "已发布", version: "v1", count: 1680, cycle: "每周自动更新", lastScan: "2026-06-14 08:00", isWarningTag: false },
  { id: "TCM-ZF-003", name: "肝郁气滞", category: "脏腑功能偏颇类", scene: "情志管理", status: "已发布", version: "v1", count: 2040, cycle: "每周自动更新", lastScan: "2026-06-14 08:00", isWarningTag: false },
  { id: "TCM-ZF-004", name: "肾阳不足", category: "脏腑功能偏颇类", scene: "老年健康管理", status: "已发布", version: "v1", count: 1520, cycle: "每周自动更新", lastScan: "2026-06-14 08:00", isWarningTag: false },
  { id: "TCM-ZF-005", name: "心脾两虚", category: "脏腑功能偏颇类", scene: "睡眠疲劳管理", status: "草稿", version: "v1", count: 0, cycle: "每周自动更新", lastScan: "-", isWarningTag: false },

  // 慢病体质风险类
  { id: "TCM-RISK-001", name: "高血压体质风险", category: "慢病体质风险类", scene: "慢病风险筛查", status: "已发布", version: "v2", count: 1860, cycle: "每日自动更新（T+1）", lastScan: "2026-06-14 08:00", isWarningTag: false },
  { id: "TCM-RISK-002", name: "糖代谢异常体质风险", category: "慢病体质风险类", scene: "慢病风险筛查", status: "已发布", version: "v2", count: 1420, cycle: "每日自动更新（T+1）", lastScan: "2026-06-14 08:00", isWarningTag: false,
    editorConfig: {
      contextScope: "SAME_PATIENT",
      conditions: [
        { id: "c1", type: "纳入条件", domain: "中医体质辨识记录", field: "九种体质", operator: "包含任一", value: "痰湿质、湿热质" },
        { id: "c2", type: "纳入条件", domain: "检验", field: "指标名称", operator: "等于", value: "空腹血糖" },
        { id: "c3", type: "纳入条件", domain: "检验", field: "结果值", operator: "大于等于", value: "7.0" },
        { id: "c4", type: "排除条件", domain: "慢病管理记录", field: "管理阶段", operator: "等于", value: "已结案" }
      ]
    }
  },
  { id: "TCM-RISK-003", name: "血脂异常体质风险", category: "慢病体质风险类", scene: "代谢风险管理", status: "已发布", version: "v1", count: 1760, cycle: "每日自动更新（T+1）", lastScan: "2026-06-14 08:00", isWarningTag: false },
  { id: "TCM-RISK-004", name: "脑卒中体质高危倾向", category: "慢病体质风险类", scene: "卒中风险预警", status: "已发布", version: "v1", count: 620, cycle: "每日自动更新（T+1）", lastScan: "2026-06-14 08:00", isWarningTag: false },
  { id: "TCM-RISK-005", name: "慢性咳喘体质风险", category: "慢病体质风险类", scene: "呼吸慢病管理", status: "已发布", version: "v1", count: 930, cycle: "每周自动更新", lastScan: "2026-06-14 08:00", isWarningTag: false },

  // 中医药事风险类
  { id: "TCM-MED-001", name: "寒凉药慎用", category: "中医药事风险类", scene: "处方审核", status: "已发布", version: "v1", count: 560, cycle: "实时扫描", lastScan: "2026-06-14 08:00", isWarningTag: false,
    editorConfig: {
      contextScope: "SAME_PRESCRIPTION",
      conditions: [
        { id: "c1", type: "纳入条件", domain: "中医体质辨识记录", field: "九种体质", operator: "包含任一", value: "阳虚质、脾胃虚弱" },
        { id: "c2", type: "纳入条件", domain: "中医药事记录", field: "中药饮片名称", operator: "属于", value: "黄连、黄柏、石膏、知母" },
        { id: "c3", type: "纳入条件", domain: "中医药事记录", field: "用药执行状态", operator: "属于", value: "待审方、未执行" }
      ]
    }
  },
  { id: "TCM-MED-002", name: "温燥药慎用", category: "中医药事风险类", scene: "处方审核", status: "已发布", version: "v1", count: 430, cycle: "实时扫描", lastScan: "2026-06-14 08:00", isWarningTag: false },
  { id: "TCM-MED-003", name: "断药风险", category: "中医药事风险类", scene: "药事随访", status: "已发布", version: "v1", count: 210, cycle: "实时扫描", lastScan: "2026-06-14 08:00", isWarningTag: false },

  // 调养干预建议类
  { id: "TCM-INT-001", name: "饮食调养适配", category: "调养干预建议类", scene: "健康宣教", status: "已发布", version: "v1", count: 4800, cycle: "每月自动更新", lastScan: "2026-06-14 08:00", isWarningTag: false },
  { id: "TCM-INT-002", name: "运动调养适配", category: "调养干预建议类", scene: "健康干预", status: "已发布", version: "v1", count: 3600, cycle: "每月自动更新", lastScan: "2026-06-14 08:00", isWarningTag: false },

  // 底层名医知识规则类
  { id: "TCM-MASTER-001", name: "张仲景经方证候匹配", category: "底层名医知识规则类", scene: "经方证候识别", status: "已发布", version: "v1", count: 1280, cycle: "每日自动更新（T+1）", lastScan: "-", isWarningTag: false },
  { id: "TCM-MASTER-002", name: "李东垣脾胃升降失调", category: "底层名医知识规则类", scene: "脾胃辨证增强", status: "已发布", version: "v1", count: 1640, cycle: "每周自动更新", lastScan: "-", isWarningTag: false },
  { id: "TCM-MASTER-003", name: "朱丹溪阴虚火旺倾向", category: "底层名医知识规则类", scene: "阴虚辨识增强", status: "已发布", version: "v1", count: 980, cycle: "每周自动更新", lastScan: "-", isWarningTag: false },
  { id: "TCM-MASTER-004", name: "叶天士温病阶段识别", category: "底层名医知识规则类", scene: "温病阶段识别", status: "已发布", version: "v1", count: 460, cycle: "每日自动更新（T+1）", lastScan: "-", isWarningTag: false },
  { id: "TCM-MASTER-005", name: "吴鞠通三焦湿热传变风险", category: "底层名医知识规则类", scene: "湿热传变风险", status: "已发布", version: "v1", count: 390, cycle: "每日自动更新（T+1）", lastScan: "-", isWarningTag: true, warningLevel: "中危", warningType: "底层名医规则预警",
    editorConfig: {
      contextScope: "SAME_PATIENT",
      conditions: [
        { id: "c1", type: "纳入条件", domain: "中医体质辨识记录", field: "九种体质", operator: "包含", value: "湿热质" },
        { id: "c2", type: "纳入条件", domain: "病历文书", field: "中医四诊摘要", operator: "包含任一", value: "发热、口苦、胸闷、脘痞、尿黄、便黏" },
        { id: "c3", type: "纳入条件", domain: "病历文书", field: "现病史", operator: "包含任一", value: "持续7天" },
        { id: "c4", type: "纳入条件", domain: "健康监测指标", field: "关键指标异常数量", operator: "大于等于", value: "1" }
      ]
    }
  },
  { id: "TCM-MASTER-006", name: "孙思邈治未病调养适配", category: "底层名医知识规则类", scene: "调养建议生成", status: "已发布", version: "v1", count: 2300, cycle: "每月自动更新", lastScan: "-", isWarningTag: false },
  { id: "TCM-MASTER-007", name: "王清任血瘀证据增强", category: "底层名医知识规则类", scene: "血瘀证据增强", status: "已发布", version: "v1", count: 720, cycle: "每周自动更新", lastScan: "-", isWarningTag: false },
  { id: "TCM-MASTER-008", name: "张景岳肾阳亏虚辨识增强", category: "底层名医知识规则类", scene: "肾阳辨识增强", status: "草稿", version: "v1", count: 0, cycle: "每周自动更新", lastScan: "-", isWarningTag: false }
];

export const featureTagCategories = [
  { name: "全部特色标签", sort: 1 },
  { name: "妇产康复管理类", sort: 2 },
  { name: "慢病中医干预类", sort: 3 },
  { name: "老年治未病管理类", sort: 4 },
  { name: "呼吸专病管理类", sort: 5 },
  { name: "睡眠情志管理类", sort: 6 },
  { name: "中医药事随访类", sort: 7 },
];

export const featureMockTags = [
  { id: "TCM-COMP-001", code: "TCM-COMP-001", name: "产后阳虚质康复随访人群", category: "妇产康复管理类", scene: "产后康复随访", status: "已发布", version: "v1", count: 186, cycle: "每日", lastScan: "每日", isWarningTag: false, referencedTags: ["阳虚质", "肾阳不足", "张景岳肾阳亏虚辨识增强"], editorConfig: { rootLogic: "AND", timeRange: { type: "postpartum_days", days: 42, label: "产后42天内" }, conditions: [ { id: "c001_1", domain: "妇产专科记录", field: "分娩日期", type: "纳入条件", operator: "距今小于等于", value: "42", unit: "天" }, { id: "c001_2", domain: "中医四诊摘要", field: "症状描述", type: "纳入条件", operator: "包含任一", value: "畏寒,乏力,腰膝酸软,少气懒言" }, { id: "c001_3", domain: "随访记录", field: "产后康复随访状态", type: "纳入条件", operator: "属于", value: "待随访,未完成" }, { id: "c001_4", domain: "产后随访记录", field: "最近一次随访结论", type: "排除条件", operator: "等于", value: "已完成康复评估" } ] } },
  { id: "TCM-COMP-002", code: "TCM-COMP-002", name: "围绝经期阴虚火旺调养人群", category: "妇产康复管理类", scene: "妇科调养管理", status: "已发布", version: "v1", count: 268, cycle: "每周", lastScan: "每周", isWarningTag: false, referencedTags: ["阴虚质", "朱丹溪阴虚火旺倾向", "温燥药慎用"], editorConfig: { rootLogic: "AND", timeRange: { type: "recent_days", days: 180, label: "近半年" }, conditions: [ { id: "c002_1", domain: "患者基本信息", field: "年龄", type: "纳入条件", operator: "介于", value: "45-60", unit: "岁" }, { id: "c002_2", domain: "中医四诊摘要", field: "症状描述", type: "纳入条件", operator: "包含任一", value: "潮热,盗汗,失眠" } ] } },
  { id: "TCM-COMP-003", code: "TCM-COMP-003", name: "痰湿湿热型糖代谢干预人群", category: "慢病中医干预类", scene: "糖代谢异常干预", status: "已发布", version: "v1", count: 394, cycle: "每日", lastScan: "每日", isWarningTag: true, warningLevel: "中危", referencedTags: ["痰湿质", "湿热质", "糖代谢异常体质风险", "吴鞠通三焦湿热传变风险"], editorConfig: { rootLogic: "AND", timeRange: { type: "recent_days", days: 180, label: "近180天" }, conditions: [ { id: "c003_1", domain: "检验检查", field: "空腹血糖", type: "纳入条件", operator: "大于等于", value: "7.0", unit: "mmol/L" }, { id: "c003_2", domain: "健康监测指标", field: "BMI", type: "纳入条件", operator: "大于等于", value: "24", unit: "" }, { id: "c003_3", domain: "慢病管理记录", field: "糖代谢管理状态", type: "纳入条件", operator: "属于", value: "未纳入,待干预,随访中断" }, { id: "c003_4", domain: "随访记录", field: "最近随访时间", type: "纳入条件", operator: "早于", value: "30", unit: "天" } ] } },
  { id: "TCM-COMP-004", code: "TCM-COMP-004", name: "血瘀痰湿型卒中高危管理人群", category: "慢病中医干预类", scene: "卒中高危管理", status: "已发布", version: "v1", count: 126, cycle: "每日", lastScan: "每日", isWarningTag: true, warningLevel: "高危", referencedTags: ["血瘀质", "痰湿质", "脑卒中体质高危倾向", "王清任血瘀证据增强"], editorConfig: { rootLogic: "AND", timeRange: { type: "recent_days", days: 180, label: "近180天" }, conditions: [ { id: "c004_1", domain: "患者基本信息", field: "年龄", type: "纳入条件", operator: "大于等于", value: "60", unit: "岁" }, { id: "c004_2", domain: "诊断", field: "诊断名称", type: "纳入条件", operator: "包含任一", value: "高血压,血脂异常,短暂性脑缺血发作" }, { id: "c004_3", domain: "健康监测指标", field: "最近收缩压", type: "纳入条件", operator: "大于等于", value: "140", unit: "mmHg" }, { id: "c004_4", domain: "门急诊记录", field: "最近复诊时间", type: "纳入条件", operator: "早于", value: "90", unit: "天" }, { id: "c004_5", domain: "随访记录", field: "管理状态", type: "排除条件", operator: "等于", value: "已结案" } ] } },
  { id: "TCM-COMP-005", code: "TCM-COMP-005", name: "老年肾阳不足冬季调护人群", category: "老年治未病管理类", scene: "老年治未病调护", status: "已发布", version: "v1", count: 312, cycle: "每周", lastScan: "每周", isWarningTag: false, referencedTags: ["阳虚质", "肾阳不足", "张景岳肾阳亏虚辨识增强", "孙思邈治未病调养适配"], editorConfig: { rootLogic: "AND", timeRange: { type: "recent_days", days: 90, label: "近90天" }, conditions: [ { id: "c005_1", domain: "患者基本信息", field: "年龄", type: "纳入条件", operator: "大于等于", value: "65", unit: "岁" }, { id: "c005_2", domain: "中医四诊摘要", field: "症状描述", type: "纳入条件", operator: "包含任一", value: "畏寒,腰膝酸软,夜尿增多" } ] } },
  { id: "TCM-COMP-006", code: "TCM-COMP-006", name: "慢性咳喘易感随访人群", category: "呼吸专病管理类", scene: "呼吸专病随访", status: "已发布", version: "v1", count: 208, cycle: "每日", lastScan: "每日", isWarningTag: true, warningLevel: "中危", referencedTags: ["肺气不足", "特禀质", "慢性咳喘体质风险"], editorConfig: { rootLogic: "AND", timeRange: { type: "recent_days", days: 90, label: "近90天" }, conditions: [ { id: "c006_1", domain: "诊断", field: "诊断名称", type: "纳入条件", operator: "包含任一", value: "慢性支气管炎,哮喘,慢性咳嗽" }, { id: "c006_2", domain: "门急诊记录", field: "近90天急性发作次数", type: "纳入条件", operator: "大于等于", value: "1", unit: "次" }, { id: "c006_3", domain: "随访记录", field: "呼吸专病随访状态", type: "纳入条件", operator: "属于", value: "待随访,超期未随访" }, { id: "c006_4", domain: "随访记录", field: "中医呼吸调养宣教状态", type: "纳入条件", operator: "不等于", value: "已完成" } ] } },
  { id: "TCM-COMP-007", code: "TCM-COMP-007", name: "气郁心脾两虚失眠干预人群", category: "睡眠情志管理类", scene: "睡眠情志干预", status: "草稿", version: "v1", count: 0, cycle: "每周", lastScan: "每周", isWarningTag: false, referencedTags: ["气郁质", "心脾两虚", "李东垣脾胃升降失调"], editorConfig: { rootLogic: "AND", timeRange: { type: "recent_days", days: 90, label: "近90天" }, conditions: [ { id: "c007_1", domain: "中医四诊摘要", field: "症状描述", type: "纳入条件", operator: "包含任一", value: "失眠,情绪低落,疲乏纳差" } ] } },
  { id: "TCM-COMP-008", code: "TCM-COMP-008", name: "中药调理断药需药师干预人群", category: "中医药事随访类", scene: "药事随访干预", status: "已发布", version: "v1", count: 74, cycle: "实时", lastScan: "实时", isWarningTag: true, warningLevel: "高危", referencedTags: ["断药风险", "断药失访体质患者预警", "寒凉药慎用", "温燥药慎用"], editorConfig: { rootLogic: "AND", timeRange: { type: "recent_days", days: 60, label: "近60天" }, conditions: [ { id: "c008_1", domain: "中医药事记录", field: "中药处方名称", type: "纳入条件", operator: "不为空", value: "" }, { id: "c008_2", domain: "中医药事记录", field: "用药执行状态", type: "纳入条件", operator: "属于", value: "中断,未执行,未续方" }, { id: "c008_3", domain: "药师干预记录", field: "最近干预状态", type: "纳入条件", operator: "不等于", value: "已完成" } ] } }
];

export const mockPatients = [
  { id: "P100293", name: "张*伟", gender: "男", age: 62, lastVisitDept: "治未病中心", lastVisitTime: "2026-06-08", tags: ["气虚质", "长期未复诊", "脾胃虚弱", "阳虚质"], hitTime: "2026-06-10 08:00", lastScanTime: "2026-06-14 08:00" },
  { id: "P883921", name: "李*梅", gender: "女", age: 55, lastVisitDept: "中医内科", lastVisitTime: "2026-06-05", tags: ["痰湿质", "高血压痰湿阻滞", "脾胃虚弱"], hitTime: "2026-06-10 08:00", lastScanTime: "2026-06-14 08:00" },
  { id: "P743029", name: "王*强", gender: "男", age: 48, lastVisitDept: "心血管内科", lastVisitTime: "2026-06-09", tags: ["血瘀质", "断药失访风险", "气虚质", "阳虚质"], hitTime: "2026-06-10 09:00", lastScanTime: "2026-06-14 08:00" },
  { id: "P293041", name: "赵*秀", gender: "女", age: 68, lastVisitDept: "康复科", lastVisitTime: "2026-06-01", tags: ["气虚质", "长期未复诊", "脾胃虚弱", "阳虚质"], hitTime: "2026-06-10 08:00", lastScanTime: "2026-06-14 08:00" },
  { id: "P502938", name: "刘*洋", gender: "男", age: 35, lastVisitDept: "治未病中心", lastVisitTime: "2026-06-11", tags: ["气虚质", "脾胃虚弱", "寒凉药慎用", "阳虚质"], hitTime: "2026-06-10 08:00", lastScanTime: "2026-06-14 08:00" },
  { id: "P602111", name: "孙*婷", gender: "女", age: 28, lastVisitDept: "妇科", lastVisitTime: "2026-06-12", tags: ["气血两虚", "寒凉药慎用", "阳虚质"], hitTime: "2026-06-13 08:00", lastScanTime: "2026-06-14 08:00" },
  { id: "P109923", name: "周*杰", gender: "男", age: 72, lastVisitDept: "脾胃病科", lastVisitTime: "2026-05-30", tags: ["气虚质", "脾胃虚弱", "长期未复诊"], hitTime: "2026-06-11 09:00", lastScanTime: "2026-06-14 08:00" },
  { id: "P381123", name: "吴*华", gender: "女", age: 61, lastVisitDept: "治未病中心", lastVisitTime: "2026-06-03", tags: ["气虚质", "脾胃虚弱", "阳虚质"], hitTime: "2026-06-12 14:00", lastScanTime: "2026-06-14 08:00" },
];

export const trendData = [
  { month: "1月", 核心盲点: 5400, 偏颇体质: 32000, 预警人群: 4000, 气虚改善: 1200 },
  { month: "2月", 核心盲点: 5200, 偏颇体质: 32500, 预警人群: 4200, 气虚改善: 1350 },
  { month: "3月", 核心盲点: 5000, 偏颇体质: 33000, 预警人群: 4100, 气虚改善: 1500 },
  { month: "4月", 核心盲点: 4800, 偏颇体质: 34500, 预警人群: 4500, 气虚改善: 1450 },
  { month: "5月", 核心盲点: 4500, 偏颇体质: 35000, 预警人群: 4800, 气虚改善: 1700 },
  { month: "6月", 核心盲点: 4200, 偏颇体质: 37500, 预警人群: 5200, 气虚改善: 1900 },
];

export const ageDistribution = [
  { name: "18-35岁", count: 1200 },
  { name: "36-45岁", count: 3500 },
  { name: "46-55岁", count: 5200 },
  { name: "56-65岁", count: 8500 },
  { name: "65岁以上", count: 6600 },
];

export const deptDistribution = [
  { name: "治未病中心", count: 8500 },
  { name: "内分泌科", count: 4200 },
  { name: "心血管科", count: 3800 },
  { name: "呼吸内科", count: 2500 },
  { name: "中医综合", count: 2100 },
  { name: "脾胃病科", count: 1800 },
];

export const warningRecords = [
  { 
    warningRecordId: "WRN-20260614-0001",
    tagCode: "TCM-WARN-001",
    tagName: "体质劣向演变预警",
    patientId: "P20260614001",
    patientName: "张某某",
    age: 67,
    gender: "女",
    primaryConstitution: "气虚质",
    relatedConstitutions: "气虚质、痰湿质",
    riskLevel: "中危",
    riskScore: 78,
    triggerReason: "近180天体质由平和质转为气虚质，体质得分上升18分",
    evidenceSummary: "最近体质得分72分，偏颇等级中度",
    latestScanTime: "2026-06-14 08:00",
    handleStatus: "待处理",
    recommendedAction: "发起体质复评、推送调养建议、安排随访",
    owner: "健康管理师",
  },
  { 
    warningRecordId: "WRN-20260614-0002",
    tagCode: "TCM-WARN-002",
    tagName: "体质偏颇加重预警",
    patientId: "P20260614002",
    patientName: "刘某某",
    age: 52,
    gender: "男",
    primaryConstitution: "血瘀质",
    relatedConstitutions: "血瘀质",
    riskLevel: "中危",
    riskScore: 82,
    triggerReason: "血瘀质得分较上次上升12分，连续两次未改善",
    evidenceSummary: "偏颇等级升为重度，得分81分",
    latestScanTime: "2026-06-14 08:00",
    handleStatus: "待处理",
    recommendedAction: "复核体质辨识结果、调整干预方案、跟进随访反馈",
    owner: "中医师",
  },
  { 
    warningRecordId: "WRN-20260614-0003",
    tagCode: "TCM-WARN-003",
    tagName: "复合异常体质预警",
    patientId: "P20260614003",
    patientName: "陈某某",
    age: 65,
    gender: "女",
    primaryConstitution: "痰湿质",
    relatedConstitutions: "痰湿质、气虚质",
    riskLevel: "高危",
    riskScore: 90,
    triggerReason: "存在2种偏颇体质，伴随高血压高危风险",
    evidenceSummary: "偏颇体质数量2种，慢病风险评估高危",
    latestScanTime: "2026-06-14 08:00",
    handleStatus: "处理中",
    recommendedAction: "纳入重点人群管理、生成风险评估、推送医生复核",
    owner: "慢病专员",
  },
  { 
    warningRecordId: "WRN-20260614-0004",
    tagCode: "TCM-WARN-004",
    tagName: "高危失联体质患者预警",
    patientId: "P20260614004",
    patientName: "王某某",
    age: 72,
    gender: "男",
    primaryConstitution: "阳虚质",
    relatedConstitutions: "阳虚质、痰湿质",
    riskLevel: "高危",
    riskScore: 85,
    triggerReason: "慢病中危，上次随访超过90天且失联",
    evidenceSummary: "距离上次有效随访时间105天，偏颇等级中度",
    latestScanTime: "2026-06-14 09:00",
    handleStatus: "已处理",
    recommendedAction: "电话外呼、短信触达、转人工随访、必要时社区协同",
    owner: "随访专员",
  },
  { 
    warningRecordId: "WRN-20260614-0005",
    tagCode: "TCM-WARN-005",
    tagName: "断药失访体质患者预警",
    patientId: "P20260614005",
    patientName: "李某某",
    age: 48,
    gender: "男",
    primaryConstitution: "气虚质",
    relatedConstitutions: "气虚质、血瘀质",
    riskLevel: "高危",
    riskScore: 92,
    triggerReason: "中药处方状态中断，超过30天未续方",
    evidenceSummary: "断药风险[高]，超过35天未随访",
    latestScanTime: "2026-06-14 10:00",
    handleStatus: "待处理",
    recommendedAction: "药师复核、提醒续方、随访用药执行、记录处置结果",
    owner: "药师",
  }
];
