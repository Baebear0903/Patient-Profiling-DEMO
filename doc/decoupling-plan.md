# 核心页面解耦技术方案

## 1. 背景与目标

经过对项目代码目录和文件的分析，当前项目中部分核心页面代码量庞大（超过1000行），页面内部状态（`useState`）繁多，存在严重的视图与逻辑耦合、组件未拆分等过度耦合现象。本计划旨在将这些巨型单体页面组件进行重构，拆分为职责单一、易于维护、可复用的子组件和自定义 Hooks。

## 2. 核心页面现状分析与解耦方案

### 2.1 标签管理页面 (`src/views/TagManagementView.tsx`)
- **现状**: 代码量达 1800+ 行，包含多达 25 个状态（`useState`）。页面内包含了标签列表、抽屉弹窗、患者预览列表展示、表单及其验证等大量的混合逻辑。
- **解耦方案**:
  - **状态与逻辑管理拆分**: 引入 Custom Hooks（如 `useTagManagement`）提取标签增删改查、弹窗控制及分页状态，实现视图与逻辑分离。
  - **视图层组件提取**: 
    - 拆分 `TagTable`：负责展示标签主列表及操作列。
    - 拆分 `TagFormDrawer`：负责新增/编辑标签的表单及验证逻辑。
    - 拆分 `TagDetailDrawer`：负责标签的详细信息展示。
    - 拆分页面内聚组件 `PatientPreviewTable` 等。

### 2.2 人群管理页面 (`src/views/PopulationView.tsx`)
- **现状**: 代码量达 1400+ 行，约 20 个状态，囊括了人群列表、复杂筛选条件选择、图表展示等功能。
- **解耦方案**:
  - **状态与逻辑管理拆分**: 提取 `usePopulation` 等 Hook，分离查询条件、列表数据请求等逻辑。
  - **视图层组件提取**:
    - 拆分 `PopulationFilterBar`：负责处理复杂的筛选器UI和逻辑。
    - 拆分 `PopulationTable`：负责列表展示及基础行级操作。
    - 拆分 `PopulationChart`：负责图表数据的展示与渲染。
    - 拆分弹窗及抽屉：如人群创建/编辑等独立流程。

### 2.3 分析服务页面 (`src/views/AnalysisView.tsx`)
- **现状**: 代码量 1300+ 行，内部硬编码了多个复杂的自定义图表组件（如 `CustomSankeyTooltip`、`CustomSankeyNode`、`CustomPieLabel` 等）。
- **解耦方案**:
  - **图表组件拆分**: 在 `src/components/charts/` 下单独建立业务图表组件，如 `SankeyChart`、`ConstitutionPieChart` 等。
  - **局部组件拆分**: 将 `ConstitutionDropdown` 等下拉选择器提炼为独立组件。
  - **业务逻辑分离**: 抽离图表数据处理和格式化逻辑到外部 utils 文件。

### 2.4 数据服务配置页面 (`src/views/DataServiceView.tsx`)
- **现状**: 1100+ 行代码，涉及快照读取、服务列表展示、接口编辑配置、凭据输入等。
- **解耦方案**:
  - **组件提取**: 
    - 提取 `CredentialInput` 等独立且通用的输入组件。
    - 提取 `DataServiceForm` 表单组件。
    - 提取快照选择器及 `IconAction` 图标操作栏组件。
  - **逻辑分离**: 将数据快照的读取（如 `readSavedSnapshots`）与保存逻辑提炼至工具类或自定义 Hook 中。

### 2.5 预警管理页面 (`src/views/WarningManagementView.tsx`)
- **现状**: 1000+ 行代码，包含预警严重程度样式判定、指标获取、预警列表展示等。
- **解耦方案**:
  - **分离工具函数**: 将内部纯函数如 `getSeverityColor`、`getStableWarningMetric`、`toEditableTag` 等提取至专门的辅助文件。
  - **组件提取**:
    - 提取核心的主体 `WarningTable` 列表组件。
    - 抽取并复用公共的分页或过滤栏组件。

## 3. 实施步骤建议

本解耦方案推荐按照以下渐进式步骤进行分步实施，以降低重构带来的风险：

1. **第一阶段（纯逻辑剥离）**:
   - 为各个巨型页面抽取内部独立的工具函数、常量和类型定义，放入对应目录（如 `src/lib/` 或 `src/types.ts`）。
2. **第二阶段（局部 UI 组件提取）**:
   - 将页面内的独立小组件（如下拉框、输入框、Tooltip、图表项等）和弹窗/抽屉抽取为单独的文件，放置在与 View 对应的 components 目录下（例如 `src/components/views/TagManagement/`）。
3. **第三阶段（状态抽离）**:
   - 提取业务逻辑和 State 管理，建立自定义 Hooks（如 `hooks/useTags.ts`），以瘦身 View 文件。
4. **第四阶段（核心拆解与组装）**:
   - 彻底拆分主表格和主表单，原有的 View 组件仅作为容器（Container）负责组装各个子组件和注入状态。
5. **回归测试**:
   - 每一阶段/单个页面重构后，需运行 `lint` 并确保页面核心功能无损失。
