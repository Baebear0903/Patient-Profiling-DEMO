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
  { name: "高脂血症", count: 1600 },
  { name: "慢性支气管炎", count: 1500 },
  { name: "颈椎病", count: 1300 },
  { name: "脂肪肝", count: 1100 },
  { name: "慢性咽炎", count: 900 },
  { name: "过敏性鼻炎", count: 700 },
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
  { name: "骨伤科", count: 1500 },
  { name: "妇科", count: 1200 },
  { name: "儿科", count: 1000 },
  { name: "神经内科", count: 800 },
  { name: "皮肤科", count: 600 },
  { name: "针灸推拿科", count: 500 },
];
