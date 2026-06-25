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
  { id: "TCM-CONS-001", name: "平和质", category: "九种体质倾向类", scene: "体质辨识", status: "已启用", version: "v1", count: 8500, cycle: "每日自动更新（T+1）", lastScan: "2026-06-14 08:00", isWarningTag: false },
  { id: "TCM-CONS-002", name: "气虚质", category: "九种体质倾向类", scene: "体质辨识", status: "已启用", version: "v1", count: 4260, cycle: "每日自动更新（T+1）", lastScan: "2026-06-14 08:00", isWarningTag: false,
    editorConfig: {
      contextScope: "SAME_CONSTITUTION_ASSESSMENT",
      conditions: [
        { id: "c1", type: "纳入条件", domain: "中医体质辨识记录", field: "九种体质", operator: "包含", value: "气虚质" },
        { id: "c2", type: "纳入条件", domain: "中医体质辨识记录", field: "体质得分", operator: "大于等于", value: "60" },
        { id: "c3", type: "排除条件", domain: "中医体质辨识记录", field: "辨识来源", operator: "等于", value: "无效记录" }
      ]
    }
  },
  { id: "TCM-CONS-003", name: "阳虚质", category: "九种体质倾向类", scene: "体质辨识", status: "已启用", version: "v1", count: 3780, cycle: "每日自动更新（T+1）", lastScan: "2026-06-14 08:00", isWarningTag: false },
  { id: "TCM-CONS-004", name: "阴虚质", category: "九种体质倾向类", scene: "体质辨识", status: "已启用", version: "v1", count: 2950, cycle: "每日自动更新（T+1）", lastScan: "2026-06-14 08:00", isWarningTag: false },
  { id: "TCM-CONS-005", name: "痰湿质", category: "九种体质倾向类", scene: "体质辨识", status: "已启用", version: "v1", count: 3420, cycle: "每日自动更新（T+1）", lastScan: "2026-06-14 08:00", isWarningTag: false,
    editorConfig: {
      contextScope: "SAME_PATIENT",
      conditions: [
        { id: "c1", type: "纳入条件", domain: "中医体质辨识记录", field: "九种体质", operator: "包含", value: "痰湿质" },
        { id: "c2", type: "纳入条件", domain: "中医体质辨识记录", field: "体质得分", operator: "大于等于", value: "60" },
        { id: "c3", type: "纳入条件", domain: "病历文书", field: "中医四诊摘要", operator: "包含任一", value: "苔腻、痰多、胸闷、困倦" }
      ]
    }
  },
  { id: "TCM-CONS-006", name: "湿热质", category: "九种体质倾向类", scene: "体质辨识", status: "已启用", version: "v1", count: 2680, cycle: "每日自动更新（T+1）", lastScan: "2026-06-14 08:00", isWarningTag: false },
  { id: "TCM-CONS-007", name: "血瘀质", category: "九种体质倾向类", scene: "体质辨识", status: "已启用", version: "v1", count: 1960, cycle: "每日自动更新（T+1）", lastScan: "2026-06-14 08:00", isWarningTag: false },
  { id: "TCM-CONS-008", name: "气郁质", category: "九种体质倾向类", scene: "体质辨识", status: "已启用", version: "v1", count: 2110, cycle: "每日自动更新（T+1）", lastScan: "2026-06-14 08:00", isWarningTag: false },
  { id: "TCM-CONS-009", name: "特禀质", category: "九种体质倾向类", scene: "体质辨识", status: "已启用", version: "v1", count: 1240, cycle: "每日自动更新（T+1）", lastScan: "2026-06-14 08:00", isWarningTag: false },
  { id: "TCM-CONS-010", name: "复合体质倾向", category: "九种体质倾向类", scene: "体质综合评估", status: "已启用", version: "v1", count: 3100, cycle: "每日自动更新（T+1）", lastScan: "2026-06-14 08:00", isWarningTag: false },

  // 体质异常预警类
  { id: "TCM-WARN-001", name: "体质劣向演变预警", category: "体质异常预警类", scene: "体质异常预警", status: "已启用", version: "v2", count: 286, cycle: "每日自动更新（T+1）", lastScan: "2026-06-14 08:00", isWarningTag: true, warningLevel: "中危", warningType: "体质异常预警",
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
  { id: "TCM-WARN-002", name: "体质偏颇加重预警", category: "体质异常预警类", scene: "体质异常预警", status: "已启用", version: "v2", count: 198, cycle: "每日自动更新（T+1）", lastScan: "2026-06-14 08:00", isWarningTag: true, warningLevel: "中危", warningType: "体质异常预警",
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
  { id: "TCM-WARN-003", name: "复合异常体质预警", category: "体质异常预警类", scene: "体质异常预警", status: "已启用", version: "v1", count: 164, cycle: "每日自动更新（T+1）", lastScan: "2026-06-14 08:00", isWarningTag: true, warningLevel: "高危", warningType: "复合风险预警",
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
  { id: "TCM-WARN-004", name: "高危失联体质患者预警", category: "体质异常预警类", scene: "盲点患者预警", status: "已启用", version: "v1", count: 92, cycle: "每日自动更新（T+1）", lastScan: "2026-06-14 09:00", isWarningTag: true, warningLevel: "高危", warningType: "盲点患者预警",
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
  { id: "TCM-WARN-005", name: "断药失访体质患者预警", category: "体质异常预警类", scene: "盲点患者预警", status: "已启用", version: "v1", count: 76, cycle: "实时扫描", lastScan: "2026-06-14 10:00", isWarningTag: true, warningLevel: "高危", warningType: "盲点患者预警",
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
  { id: "TCM-ZF-001", name: "脾胃虚弱", category: "脏腑功能偏颇类", scene: "脏腑辨识", status: "已启用", version: "v1", count: 3260, cycle: "每周自动更新", lastScan: "2026-06-14 08:00", isWarningTag: false,
    editorConfig: {
      contextScope: "SAME_ZANGFU_ASSESSMENT",
      conditions: [
        { id: "c1", type: "纳入条件", domain: "脏腑功能评估", field: "脏腑名称", operator: "等于", value: "脾胃" },
        { id: "c2", type: "纳入条件", domain: "脏腑功能评估", field: "脏腑状态", operator: "包含", value: "脾胃虚弱" },
        { id: "c3", type: "纳入条件", domain: "脏腑功能评估", field: "异常等级", operator: "大于等于", value: "轻度" }
      ]
    }
  },
  { id: "TCM-ZF-002", name: "肺气不足", category: "脏腑功能偏颇类", scene: "脏腑辨识", status: "已启用", version: "v1", count: 1680, cycle: "每周自动更新", lastScan: "2026-06-14 08:00", isWarningTag: false },
  { id: "TCM-ZF-003", name: "肝郁气滞", category: "脏腑功能偏颇类", scene: "情志管理", status: "已启用", version: "v1", count: 2040, cycle: "每周自动更新", lastScan: "2026-06-14 08:00", isWarningTag: false },
  { id: "TCM-ZF-004", name: "肾阳不足", category: "脏腑功能偏颇类", scene: "老年健康管理", status: "已启用", version: "v1", count: 1520, cycle: "每周自动更新", lastScan: "2026-06-14 08:00", isWarningTag: false },
  { id: "TCM-ZF-005", name: "心脾两虚", category: "脏腑功能偏颇类", scene: "睡眠疲劳管理", status: "草稿", version: "v1", count: 0, cycle: "每周自动更新", lastScan: "-", isWarningTag: false },

  // 慢病体质风险类
  { id: "TCM-RISK-001", name: "高血压体质风险", category: "慢病体质风险类", scene: "慢病风险筛查", status: "已启用", version: "v2", count: 1860, cycle: "每日自动更新（T+1）", lastScan: "2026-06-14 08:00", isWarningTag: false },
  { id: "TCM-RISK-002", name: "糖代谢异常体质风险", category: "慢病体质风险类", scene: "慢病风险筛查", status: "已启用", version: "v2", count: 1420, cycle: "每日自动更新（T+1）", lastScan: "2026-06-14 08:00", isWarningTag: false,
    editorConfig: {
      contextScope: "SAME_PATIENT",
      conditions: [
        { id: "c1", type: "纳入条件", domain: "中医体质辨识记录", field: "九种体质", operator: "包含任一", value: "痰湿质、湿热质" },
        { id: "c2", type: "纳入条件", domain: "检验检查", field: "指标名称", operator: "等于", value: "空腹血糖" },
        { id: "c3", type: "纳入条件", domain: "检验检查", field: "结果值", operator: "大于等于", value: "7.0" },
        { id: "c4", type: "排除条件", domain: "慢病管理记录", field: "管理阶段", operator: "等于", value: "已结案" }
      ]
    }
  },
  { id: "TCM-RISK-003", name: "血脂异常体质风险", category: "慢病体质风险类", scene: "代谢风险管理", status: "已启用", version: "v1", count: 1760, cycle: "每日自动更新（T+1）", lastScan: "2026-06-14 08:00", isWarningTag: false },
  { id: "TCM-RISK-004", name: "脑卒中体质高危倾向", category: "慢病体质风险类", scene: "卒中风险预警", status: "已启用", version: "v1", count: 620, cycle: "每日自动更新（T+1）", lastScan: "2026-06-14 08:00", isWarningTag: false },
  { id: "TCM-RISK-005", name: "慢性咳喘体质风险", category: "慢病体质风险类", scene: "呼吸慢病管理", status: "已启用", version: "v1", count: 930, cycle: "每周自动更新", lastScan: "2026-06-14 08:00", isWarningTag: false },

  // 中医药事风险类
  { id: "TCM-MED-001", name: "寒凉药慎用", category: "中医药事风险类", scene: "处方审核", status: "已启用", version: "v1", count: 560, cycle: "实时扫描", lastScan: "2026-06-14 08:00", isWarningTag: false,
    editorConfig: {
      contextScope: "SAME_PRESCRIPTION",
      conditions: [
        { id: "c1", type: "纳入条件", domain: "中医体质辨识记录", field: "九种体质", operator: "包含任一", value: "阳虚质、脾胃虚弱" },
        { id: "c2", type: "纳入条件", domain: "中医药事记录", field: "中药饮片名称", operator: "属于", value: "黄连、黄柏、石膏、知母" },
        { id: "c3", type: "纳入条件", domain: "中医药事记录", field: "用药执行状态", operator: "属于", value: "待审方、未执行" }
      ]
    }
  },
  { id: "TCM-MED-002", name: "温燥药慎用", category: "中医药事风险类", scene: "处方审核", status: "已启用", version: "v1", count: 430, cycle: "实时扫描", lastScan: "2026-06-14 08:00", isWarningTag: false },
  { id: "TCM-MED-003", name: "断药风险", category: "中医药事风险类", scene: "药事随访", status: "已启用", version: "v1", count: 210, cycle: "实时扫描", lastScan: "2026-06-14 08:00", isWarningTag: false },

  // 调养干预建议类
  { id: "TCM-INT-001", name: "饮食调养适配", category: "调养干预建议类", scene: "健康宣教", status: "已启用", version: "v1", count: 4800, cycle: "每月自动更新", lastScan: "2026-06-14 08:00", isWarningTag: false },
  { id: "TCM-INT-002", name: "运动调养适配", category: "调养干预建议类", scene: "健康干预", status: "已启用", version: "v1", count: 3600, cycle: "每月自动更新", lastScan: "2026-06-14 08:00", isWarningTag: false },

  // 底层名医知识规则类
  { id: "TCM-MASTER-001", name: "张仲景经方证候匹配", category: "底层名医知识规则类", scene: "经方证候识别", status: "已启用", version: "v1", count: 1280, cycle: "每日自动更新（T+1）", lastScan: "-", isWarningTag: false },
  { id: "TCM-MASTER-002", name: "李东垣脾胃升降失调", category: "底层名医知识规则类", scene: "脾胃辨证增强", status: "已启用", version: "v1", count: 1640, cycle: "每周自动更新", lastScan: "-", isWarningTag: false },
  { id: "TCM-MASTER-003", name: "朱丹溪阴虚火旺倾向", category: "底层名医知识规则类", scene: "阴虚辨识增强", status: "已启用", version: "v1", count: 980, cycle: "每周自动更新", lastScan: "-", isWarningTag: false },
  { id: "TCM-MASTER-004", name: "叶天士温病阶段识别", category: "底层名医知识规则类", scene: "温病阶段识别", status: "已启用", version: "v1", count: 460, cycle: "每日自动更新（T+1）", lastScan: "-", isWarningTag: false },
  { id: "TCM-MASTER-005", name: "吴鞠通三焦湿热传变风险", category: "底层名医知识规则类", scene: "湿热传变风险", status: "已启用", version: "v1", count: 390, cycle: "每日自动更新（T+1）", lastScan: "-", isWarningTag: true, warningLevel: "中危", warningType: "底层名医规则预警",
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
  { id: "TCM-MASTER-006", name: "孙思邈治未病调养适配", category: "底层名医知识规则类", scene: "调养建议生成", status: "已启用", version: "v1", count: 2300, cycle: "每月自动更新", lastScan: "-", isWarningTag: false },
  { id: "TCM-MASTER-007", name: "王清任血瘀证据增强", category: "底层名医知识规则类", scene: "血瘀证据增强", status: "已启用", version: "v1", count: 720, cycle: "每周自动更新", lastScan: "-", isWarningTag: false },
  { id: "TCM-MASTER-008", name: "张景岳肾阳亏虚辨识增强", category: "底层名医知识规则类", scene: "肾阳辨识增强", status: "草稿", version: "v1", count: 0, cycle: "每周自动更新", lastScan: "-", isWarningTag: false }
];

export const featureTagCategories = [
  { name: "全部专科特色标签", sort: 1 },
  { name: "妇产康复管理类", sort: 2 },
  { name: "慢病中医干预类", sort: 3 },
  { name: "老年治未病管理类", sort: 4 },
  { name: "呼吸专病管理类", sort: 5 },
  { name: "睡眠情志管理类", sort: 6 },
  { name: "中医药事随访类", sort: 7 },
];

export const featureMockTags = [
  { id: "TCM-COMP-001", code: "TCM-COMP-001", name: "产后阳虚质康复随访人群", category: "妇产康复管理类", scene: "产后康复随访", status: "已启用", version: "v1", count: 186, cycle: "每日", lastScan: "每日", isWarningTag: false, referencedTags: ["阳虚质", "肾阳不足", "张景岳肾阳亏虚辨识增强"], editorConfig: { rootLogic: "AND", conditions: [ { id: "c001_1", domain: "妇产专科记录", field: "产后天数", type: "纳入条件", operator: "小于等于", value: "42", unit: "天" }, { id: "c001_2", domain: "中医四诊摘要", field: "症状描述", type: "纳入条件", operator: "包含任一", value: "畏寒,乏力,腰膝酸软,少气懒言" }, { id: "c001_3", domain: "产后随访记录", field: "产后康复随访状态", type: "纳入条件", operator: "属于", value: "待随访,未完成" }, { id: "c001_4", domain: "产后随访记录", field: "康复评估完成状态", type: "排除条件", operator: "等于", value: "已完成" } ] } },
  { id: "TCM-COMP-002", code: "TCM-COMP-002", name: "围绝经期阴虚火旺调养人群", category: "妇产康复管理类", scene: "妇科调养管理", status: "已启用", version: "v1", count: 268, cycle: "每周", lastScan: "每周", isWarningTag: false, referencedTags: ["阴虚质", "朱丹溪阴虚火旺倾向", "温燥药慎用"], editorConfig: { rootLogic: "AND", timeRange: { type: "recent_days", days: 180, label: "近半年" }, conditions: [ { id: "c002_1", domain: "患者基本信息", field: "年龄", type: "纳入条件", operator: "介于", value: "45-60", unit: "岁" }, { id: "c002_2", domain: "中医四诊摘要", field: "症状描述", type: "纳入条件", operator: "包含任一", value: "潮热,盗汗,失眠" } ] } },
  { id: "TCM-COMP-003", code: "TCM-COMP-003", name: "痰湿湿热型糖代谢干预人群", category: "慢病中医干预类", scene: "糖代谢异常干预", status: "已启用", version: "v1", count: 394, cycle: "每日", lastScan: "每日", isWarningTag: true, warningLevel: "中危", referencedTags: ["痰湿质", "湿热质", "糖代谢异常体质风险", "吴鞠通三焦湿热传变风险"], editorConfig: { rootLogic: "AND", timeRange: { type: "recent_days", days: 180, label: "近180天" }, conditions: [ { id: "c003_1", domain: "检验检查", field: "空腹血糖", type: "纳入条件", operator: "大于等于", value: "7.0", unit: "mmol/L" }, { id: "c003_2", domain: "健康监测指标", field: "BMI", type: "纳入条件", operator: "大于等于", value: "24", unit: "" }, { id: "c003_3", domain: "慢病管理记录", field: "糖代谢管理状态", type: "纳入条件", operator: "属于", value: "未纳入,待干预,随访中断" }, { id: "c003_4", domain: "随访记录", field: "距上次随访天数", type: "纳入条件", operator: "大于", value: "30", unit: "天" } ] } },
  { id: "TCM-COMP-004", code: "TCM-COMP-004", name: "血瘀痰湿型卒中高危管理人群", category: "慢病中医干预类", scene: "卒中高危管理", status: "已启用", version: "v1", count: 126, cycle: "每日", lastScan: "每日", isWarningTag: true, warningLevel: "高危", referencedTags: ["血瘀质", "痰湿质", "脑卒中体质高危倾向", "王清任血瘀证据增强"], editorConfig: { rootLogic: "AND", timeRange: { type: "recent_days", days: 180, label: "近180天" }, conditions: [ { id: "c004_1", domain: "患者基本信息", field: "年龄", type: "纳入条件", operator: "大于等于", value: "60", unit: "岁" }, { id: "c004_2", domain: "慢病管理记录", field: "卒中危险因素", type: "纳入条件", operator: "包含任一", value: "高血压,血脂异常,短暂性脑缺血发作" }, { id: "c004_3", domain: "健康监测指标", field: "最近收缩压", type: "纳入条件", operator: "大于等于", value: "140", unit: "mmHg" }, { id: "c004_4", domain: "门诊记录", field: "距上次复诊天数", type: "纳入条件", operator: "大于", value: "90", unit: "天" }, { id: "c004_5", domain: "卒中随访记录", field: "卒中管理状态", type: "排除条件", operator: "等于", value: "已结案" } ] } },
  { id: "TCM-COMP-005", code: "TCM-COMP-005", name: "老年肾阳不足冬季调护人群", category: "老年治未病管理类", scene: "老年治未病调护", status: "已启用", version: "v1", count: 312, cycle: "每周", lastScan: "每周", isWarningTag: false, referencedTags: ["阳虚质", "肾阳不足", "张景岳肾阳亏虚辨识增强", "孙思邈治未病调养适配"], editorConfig: { rootLogic: "AND", timeRange: { type: "recent_days", days: 90, label: "近90天" }, conditions: [ { id: "c005_1", domain: "患者基本信息", field: "年龄", type: "纳入条件", operator: "大于等于", value: "65", unit: "岁" }, { id: "c005_2", domain: "中医四诊摘要", field: "症状描述", type: "纳入条件", operator: "包含任一", value: "畏寒,腰膝酸软,夜尿增多" } ] } },
  { id: "TCM-COMP-006", code: "TCM-COMP-006", name: "慢性咳喘易感随访人群", category: "呼吸专病管理类", scene: "呼吸专病随访", status: "已启用", version: "v1", count: 208, cycle: "每日", lastScan: "每日", isWarningTag: true, warningLevel: "中危", referencedTags: ["肺气不足", "特禀质", "慢性咳喘体质风险"], editorConfig: { rootLogic: "AND", timeRange: { type: "recent_days", days: 90, label: "近90天" }, conditions: [ { id: "c006_1", domain: "诊断", field: "呼吸专病类型", type: "纳入条件", operator: "属于", value: "慢性支气管炎,哮喘,慢性咳嗽" }, { id: "c006_2", domain: "门急诊记录", field: "近90天急性发作次数", type: "纳入条件", operator: "大于等于", value: "1", unit: "次" }, { id: "c006_3", domain: "随访记录", field: "呼吸专病随访状态", type: "纳入条件", operator: "属于", value: "待随访,超期未随访" }, { id: "c006_4", domain: "健康宣教记录", field: "中医呼吸调养宣教完成状态", type: "纳入条件", operator: "属于", value: "未完成,未触达" } ] } },
  { id: "TCM-COMP-007", code: "TCM-COMP-007", name: "气郁心脾两虚失眠干预人群", category: "睡眠情志管理类", scene: "睡眠情志干预", status: "草稿", version: "v1", count: 0, cycle: "每周", lastScan: "每周", isWarningTag: false, referencedTags: ["气郁质", "心脾两虚", "李东垣脾胃升降失调"], editorConfig: { rootLogic: "AND", timeRange: { type: "recent_days", days: 90, label: "近90天" }, conditions: [ { id: "c007_1", domain: "中医四诊摘要", field: "症状描述", type: "纳入条件", operator: "包含任一", value: "失眠,情绪低落,疲乏纳差" } ] } },
  { id: "TCM-COMP-008", code: "TCM-COMP-008", name: "中药调理断药需药师干预人群", category: "中医药事随访类", scene: "药事随访干预", status: "已启用", version: "v1", count: 74, cycle: "实时", lastScan: "实时", isWarningTag: true, warningLevel: "高危", referencedTags: ["断药风险", "断药失访体质患者预警", "寒凉药慎用", "温燥药慎用"], editorConfig: { rootLogic: "AND", timeRange: { type: "recent_days", days: 60, label: "近60天" }, conditions: [ { id: "c008_1", domain: "中医药事记录", field: "近60天中药处方数", type: "纳入条件", operator: "大于", value: "0", unit: "张" }, { id: "c008_2", domain: "中医药事记录", field: "中药用药执行状态", type: "纳入条件", operator: "属于", value: "中断,未执行,未续方" }, { id: "c008_3", domain: "药师干预记录", field: "药师干预状态", type: "纳入条件", operator: "属于", value: "待干预,干预中" } ] } }
];
