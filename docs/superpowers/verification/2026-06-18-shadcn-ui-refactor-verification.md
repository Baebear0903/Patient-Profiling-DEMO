# shadcn/ui 重构验收记录

日期：2026-06-22
环境：Chrome 兼容 Chromium，1280×720，桌面端

## 自动化

- `npm test`：通过，13 个测试文件、104 项测试
- `npm run check:shadcn`：通过
- `npm run check:analysis`：通过
- `npm run check:logo`：通过
- `npm run lint`：通过
- `npm run build`：通过
- `npm ls --depth=0`：通过，无 extraneous 或 invalid 依赖

## 路由与页面

| 路由 | 布局 | 控制台 | 关键交互 |
| --- | --- | --- | --- |
| `/workbench` | 通过 | 通过 | 新建标签、侧栏收起/展开、占位按钮无副作用 |
| `/tags` | 通过 | 通过 | 必填校验、发布、预览 Sheet、草稿删除确认 |
| `/population` | 通过 | 通过 | 快照页签、触达预填、数据服务预填 |
| `/warning` | 通过 | 通过 | 记录页签、详情 Sheet、Escape 与焦点返回 |
| `/touchpoint` | 通过 | 通过 | 路由状态预填、Dialog 焦点、RadioGroup |
| `/dataservice` | 通过 | 通过 | 跨模块创建、服务列表、配置 Dialog |
| `/analysis` | 通过 | 通过 | 三个分析页签、趋势指标 Select、表格与图表 |

七个页面均无 body 或 main 水平溢出；表格和矩阵按组件自身范围横向滚动。控制台无应用 error 或 Recharts 尺寸 warning。

## 导航与可访问性

- 浏览器后退、前进和刷新可保持顶层 HashRouter 路由及当前菜单激活状态。
- 侧栏收起后菜单按钮宽 32px，图标中心偏差约 1px。
- Dialog、Sheet、AlertDialog 打开后焦点进入弹层；预警详情通过 Escape 关闭后焦点返回触发按钮。
- Tabs、Select、RadioGroup、Checkbox、Switch 的键盘交互由浏览器抽查和 RTL 测试共同覆盖。

## 已知既有占位功能

以下控件按重构前行为保持无副作用，未补充新业务逻辑：

- 工作台：查看详情、新建动态人群、发起体质宣教、待办“处理”。
- 触达运营：概览、效果报告、中止等演示操作。
- 数据服务：复制凭证、重新生成凭证。
- 主题分析：近半年、全局筛选。

## 剩余风险

- 生产构建主 JavaScript chunk 约 1.02 MB，Vite 提示超过 500 kB。该问题不影响本次构建与功能验收，代码拆分不在本次 shadcn/ui 重构范围。
