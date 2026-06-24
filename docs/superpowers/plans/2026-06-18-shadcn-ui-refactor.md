# shadcn/ui Full Component Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将患者画像 React 演示系统的全部交互控件迁移到 shadcn/ui，并以 HashRouter 替代全局事件导航，同时保持现有业务数据、桌面布局和有效交互。

**Architecture:** 先建立 shadcn/ui、测试与主题基础设施，再完成 HashRouter 和 Sidebar 应用外壳；随后建立少量稳定业务通用组件，并按工作台、标签中心、人群运营、预警管理、触达运营、数据服务、主题分析的顺序逐页迁移。页面内部继续使用现有 `useState` 和 mock 数据，跨模块可恢复状态使用查询参数，临时创建数据使用 `location.state`。

**Tech Stack:** React 19、TypeScript 5.8、Vite 6、Tailwind CSS 4、shadcn/ui New York、Radix UI、React Router、Vitest、React Testing Library、Recharts

---

## 执行前约束

- 当前工作树位于 detached HEAD。开始实施前从当前提交创建分支：

```bash
git switch -c codex/shadcn-ui-refactor
```

- 保留未跟踪的 `.superpowers/` 可视化辅助文件，不暂存、不删除。
- 每个任务完成后只提交该任务相关文件。
- shadcn/ui CLI 生成代码后必须审查 diff，删除未使用组件，不手工改写 Radix 交互逻辑。
- 所有页面迁移均遵循“先失败测试、再最小实现、再验证、再提交”。

## 文件结构

### 新增配置与测试基础设施

- `components.json`：shadcn/ui New York、Radix、CSS Variables 和 alias 配置。
- `src/test/setup.ts`：jest-dom、浏览器 API polyfill 和测试清理。
- `src/test/render-app.tsx`：统一渲染完整 HashRouter 应用。
- `src/**/*.test.tsx`：靠近被测模块放置测试。

### 新增 shadcn/ui 基础组件

由 CLI 生成到 `src/components/ui/`：

- `alert-dialog.tsx`
- `badge.tsx`
- `button.tsx`
- `checkbox.tsx`
- `dialog.tsx`
- `input.tsx`
- `label.tsx`
- `pagination.tsx`
- `radio-group.tsx`
- `select.tsx`
- `sheet.tsx`
- `sidebar.tsx`
- `sonner.tsx`
- `switch.tsx`
- `table.tsx`
- `tabs.tsx`
- `textarea.tsx`
- `tooltip.tsx`

Sidebar 生成代码若自动依赖 `separator`、`skeleton` 或 `use-mobile`，保留这些直接依赖文件，但应用本身不实现移动端布局。

### 新增业务通用组件

- `src/components/common/PageHeader.tsx`
- `src/components/common/StatusBadge.tsx`
- `src/components/common/CompactPagination.tsx`
- `src/components/common/DataTableShell.tsx`
- `src/components/common/ConfirmAction.tsx`

### 修改应用与页面

- `src/main.tsx`：挂载 HashRouter、TooltipProvider、SidebarProvider 和 Toaster。
- `src/App.tsx`：声明顶层路由和默认重定向。
- `src/components/Layout.tsx`：迁移为 shadcn Sidebar 和路由驱动的面包屑。
- `src/views/*.tsx`：逐页迁移交互控件。
- `src/index.css`：shadcn 主题变量、紧凑尺寸和基础样式。
- `src/lib/utils.ts`：保留 `cn`，不增加业务逻辑。
- `vite.config.ts`、`tsconfig.json`：将 `@/*` 指向 `src/*`，加入 Vitest 配置。
- `package.json`、`package-lock.json`：增加路由、Radix、Sonner 和测试依赖及测试脚本。

---

### Task 1: 建立测试环境、alias 和 shadcn/ui 基础层

**Files:**
- Create: `components.json`
- Create: `src/test/setup.ts`
- Create: `src/components/ui/button.test.tsx`
- Create: `src/components/ui/*.tsx`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `tsconfig.json`
- Modify: `vite.config.ts`
- Modify: `src/index.css`
- Modify: `src/lib/utils.ts`

- [ ] **Step 1: 创建实施分支并确认工作区**

Run:

```bash
git switch -c codex/shadcn-ui-refactor
git status --short
```

Expected:

```text
?? .superpowers/
```

- [ ] **Step 2: 安装测试依赖并增加脚本**

Run:

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

将 `package.json` 的 scripts 调整为：

```json
{
  "scripts": {
    "dev": "vite --port=3000 --host=0.0.0.0",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "check:analysis": "node scripts/check-analysis-view.mjs",
    "check:logo": "node scripts/check-logo.mjs",
    "clean": "rm -rf dist server.js",
    "lint": "tsc --noEmit"
  }
}
```

- [ ] **Step 3: 配置 alias 和 Vitest**

将 `tsconfig.json` 的 alias 改为：

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

在 `vite.config.ts` 使用：

```ts
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    hmr: process.env.DISABLE_HMR !== "true",
    watch: process.env.DISABLE_HMR === "true" ? null : {},
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: true,
  },
});
```

- [ ] **Step 4: 写测试环境文件**

创建 `src/test/setup.ts`：

```ts
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => cleanup());

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal("ResizeObserver", ResizeObserverMock);
```

- [ ] **Step 5: 写 Button 失败测试**

创建 `src/components/ui/button.test.tsx`：

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders the compact small variant", () => {
    render(<Button size="sm">保存</Button>);

    expect(screen.getByRole("button", { name: "保存" })).toHaveClass("h-8");
  });
});
```

- [ ] **Step 6: 运行测试确认失败**

Run:

```bash
npm test -- src/components/ui/button.test.tsx
```

Expected: FAIL，提示 `@/components/ui/button` 不存在。

- [ ] **Step 7: 初始化 shadcn/ui**

Run:

```bash
npx shadcn@latest init
```

交互选择：

```text
framework: Vite
style/preset: New York
base library: Radix
base color: Slate
CSS variables: yes
component alias: @/components
utility alias: @/lib/utils
RTL: no
```

随后一次性添加实际使用组件：

```bash
npx shadcn@latest add alert-dialog badge button checkbox dialog input label pagination radio-group select sheet sidebar sonner switch table tabs textarea tooltip
```

- [ ] **Step 8: 集中调整 Button 紧凑尺寸**

在 `src/components/ui/button.tsx` 的 size variants 使用：

```ts
size: {
  default: "h-8 px-3 py-1.5",
  xs: "h-6 gap-1 rounded px-2 text-[11px]",
  sm: "h-8 gap-1.5 rounded-md px-3 text-xs",
  lg: "h-9 rounded-md px-4",
  icon: "size-8",
  "icon-xs": "size-6 rounded",
  "icon-sm": "size-7 rounded-md",
},
```

- [ ] **Step 9: 配置浅色青色主题**

保留 CLI 生成的 Tailwind CSS 4 结构，在 `src/index.css` 的 `:root` 使用青色 primary，并保留现有字体：

```css
:root {
  --radius: 0.375rem;
  --background: oklch(0.985 0.002 247.839);
  --foreground: oklch(0.21 0.034 264.665);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.21 0.034 264.665);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.21 0.034 264.665);
  --primary: oklch(0.609 0.126 221.723);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.968 0.007 247.896);
  --secondary-foreground: oklch(0.279 0.041 260.031);
  --muted: oklch(0.968 0.007 247.896);
  --muted-foreground: oklch(0.554 0.046 257.417);
  --accent: oklch(0.957 0.021 215.789);
  --accent-foreground: oklch(0.398 0.07 227.392);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.929 0.013 255.508);
  --input: oklch(0.929 0.013 255.508);
  --ring: oklch(0.609 0.126 221.723);
}

body {
  margin: 0;
  min-width: 1280px;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
    "Microsoft YaHei", Arial, sans-serif;
  font-size: 14px;
}
```

不要添加 `.dark` 主题。

- [ ] **Step 10: 运行基础验证**

Run:

```bash
npm test -- src/components/ui/button.test.tsx
npm run lint
npm run build
```

Expected: 三条命令均成功。

- [ ] **Step 11: 提交基础设施**

```bash
git add components.json package.json package-lock.json tsconfig.json vite.config.ts src/index.css src/lib/utils.ts src/test src/components/ui
git commit -m "chore: initialize shadcn ui and test tooling"
```

---

### Task 2: 引入 HashRouter 和 shadcn Sidebar 应用外壳

**Files:**
- Create: `src/App.test.tsx`
- Create: `src/test/render-app.tsx`
- Modify: `src/main.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/Layout.tsx`

- [ ] **Step 1: 写路由和侧栏失败测试**

创建 `src/test/render-app.tsx`：

```tsx
import { render } from "@testing-library/react";
import { HashRouter } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import App from "@/App";

export function renderApp(path = "/workbench") {
  window.location.hash = `#${path}`;

  return render(
    <HashRouter>
      <TooltipProvider>
        <SidebarProvider defaultOpen>
          <App />
          <Toaster richColors position="top-center" />
        </SidebarProvider>
      </TooltipProvider>
    </HashRouter>,
  );
}
```

创建 `src/App.test.tsx`：

```tsx
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderApp } from "@/test/render-app";

describe("application routing", () => {
  it("redirects an unknown route to workbench", async () => {
    renderApp("/missing");

    expect(await screen.findByRole("heading", { name: "运营概览" })).toBeVisible();
    expect(window.location.hash).toBe("#/workbench");
  });

  it("navigates with sidebar links and marks the current item", async () => {
    const user = userEvent.setup();
    renderApp("/workbench");

    await user.click(screen.getByRole("link", { name: "标签中心" }));

    expect(await screen.findByRole("heading", { name: "标签清单" })).toBeVisible();
    expect(screen.getByRole("link", { name: "标签中心" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run:

```bash
npm test -- src/App.test.tsx
```

Expected: FAIL，原因是 `react-router-dom` 未安装且当前菜单不是 link。

- [ ] **Step 3: 安装 React Router**

Run:

```bash
npm install react-router-dom
```

- [ ] **Step 4: 将 App 改为路由表**

`src/App.tsx` 使用：

```tsx
import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { AnalysisView } from "@/views/AnalysisView";
import { DataServiceView } from "@/views/DataServiceView";
import { PopulationView } from "@/views/PopulationView";
import { TagManagementView } from "@/views/TagManagementView";
import { TouchpointView } from "@/views/TouchpointView";
import { WarningManagementView } from "@/views/WarningManagementView";
import { WorkbenchView } from "@/views/WorkbenchView";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/workbench" element={<WorkbenchView />} />
        <Route path="/tags" element={<TagManagementView />} />
        <Route path="/population" element={<PopulationView />} />
        <Route path="/warning" element={<WarningManagementView />} />
        <Route path="/touchpoint" element={<TouchpointView />} />
        <Route path="/dataservice" element={<DataServiceView />} />
        <Route path="/analysis" element={<AnalysisView />} />
      </Route>
      <Route path="*" element={<Navigate to="/workbench" replace />} />
    </Routes>
  );
}
```

- [ ] **Step 5: 在 main 挂载全局 Provider**

`src/main.tsx` 使用：

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "@/App";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "@/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <TooltipProvider delayDuration={250}>
        <SidebarProvider defaultOpen>
          <App />
          <Toaster richColors position="top-center" />
        </SidebarProvider>
      </TooltipProvider>
    </HashRouter>
  </StrictMode>,
);
```

- [ ] **Step 6: 重构 Layout**

将 `Layout` props 移除，使用 `Outlet`、`NavLink` 和 `useLocation`：

```tsx
const menuItems = [
  { path: "/workbench", label: "工作台", icon: LayoutDashboard },
  { path: "/tags", label: "标签中心", icon: Tags },
  { path: "/population", label: "人群运营", icon: Users },
  { path: "/warning", label: "预警管理", icon: AlertTriangle },
  { path: "/touchpoint", label: "触达运营", icon: Send },
  { path: "/dataservice", label: "数据服务", icon: Database },
  { path: "/analysis", label: "主题分析", icon: BarChart2 },
] as const;

const location = useLocation();
const currentMenuLabel =
  menuItems.find((item) => item.path === location.pathname)?.label ?? "工作台";
```

菜单项使用：

```tsx
<SidebarMenuButton asChild tooltip={item.label}>
  <NavLink to={item.path}>
    <Icon />
    <span>{item.label}</span>
  </NavLink>
</SidebarMenuButton>
```

内容区使用：

```tsx
<SidebarInset>
  <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-6">
    <div className="flex items-center gap-3">
      <SidebarTrigger />
      <span className="text-muted-foreground">画像服务</span>
      <span className="text-border">/</span>
      <span className="font-medium">{currentMenuLabel}</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="flex size-7 items-center justify-center rounded-full bg-cyan-50 text-[10px] font-bold text-cyan-700">
        AD
      </div>
      <div>
        <div className="text-xs font-semibold">管理员</div>
        <div className="text-[9px] uppercase text-muted-foreground">Admin</div>
      </div>
    </div>
  </header>
  <main className="min-w-0 flex-1 overflow-auto p-6">
    <Outlet />
  </main>
</SidebarInset>
```

折叠按钮使用 `SidebarTrigger`。不向 `localStorage` 写入侧栏状态。

- [ ] **Step 7: 运行测试与构建**

Run:

```bash
npm test -- src/App.test.tsx
npm run lint
npm run build
```

Expected: PASS，且构建无路由错误。

- [ ] **Step 8: 提交路由外壳**

```bash
git add package.json package-lock.json src/main.tsx src/App.tsx src/components/Layout.tsx src/App.test.tsx src/test/render-app.tsx
git commit -m "feat: add hash routing and shadcn sidebar"
```

---

### Task 3: 建立业务通用组件

**Files:**
- Create: `src/components/common/PageHeader.tsx`
- Create: `src/components/common/StatusBadge.tsx`
- Create: `src/components/common/CompactPagination.tsx`
- Create: `src/components/common/DataTableShell.tsx`
- Create: `src/components/common/ConfirmAction.tsx`
- Create: `src/components/common/common-components.test.tsx`

- [ ] **Step 1: 写失败测试**

创建 `src/components/common/common-components.test.tsx`：

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CompactPagination } from "@/components/common/CompactPagination";
import { ConfirmAction } from "@/components/common/ConfirmAction";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";

describe("common components", () => {
  it("renders page heading and actions", () => {
    render(
      <PageHeader title="标签清单" description="共 30 个标签">
        <button>新增标签</button>
      </PageHeader>,
    );

    expect(screen.getByRole("heading", { name: "标签清单" })).toBeVisible();
    expect(screen.getByRole("button", { name: "新增标签" })).toBeVisible();
  });

  it("maps business status to a readable badge", () => {
    render(<StatusBadge status="已发布" />);
    expect(screen.getByText("已发布")).toHaveClass("text-emerald-700");
  });

  it("changes page with compact pagination", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <CompactPagination page={1} pageSize={10} total={30} onPageChange={onPageChange} />,
    );

    await user.click(screen.getByRole("button", { name: "下一页" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("requires confirmation before destructive action", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <ConfirmAction
        trigger="删除"
        title="确认删除标签？"
        description="删除后不可恢复。"
        onConfirm={onConfirm}
      />,
    );

    await user.click(screen.getByRole("button", { name: "删除" }));
    await user.click(screen.getByRole("button", { name: "确认删除" }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run:

```bash
npm test -- src/components/common/common-components.test.tsx
```

Expected: FAIL，提示 common 组件不存在。

- [ ] **Step 3: 实现 PageHeader 与 StatusBadge**

`PageHeader` 接口：

```tsx
type PageHeaderProps = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
};
```

`StatusBadge` 至少映射：

```ts
const statusStyles: Record<string, string> = {
  已发布: "border-emerald-200 bg-emerald-50 text-emerald-700",
  已启用: "border-emerald-200 bg-emerald-50 text-emerald-700",
  运行中: "border-blue-200 bg-blue-50 text-blue-700",
  草稿: "border-slate-200 bg-slate-50 text-slate-600",
  已停用: "border-slate-200 bg-slate-100 text-slate-500",
  待处理: "border-red-200 bg-red-50 text-red-700",
  处理中: "border-amber-200 bg-amber-50 text-amber-700",
  已处理: "border-emerald-200 bg-emerald-50 text-emerald-700",
};
```

- [ ] **Step 4: 实现 CompactPagination**

组件必须：

- 根据 `Math.ceil(total / pageSize)` 计算页数。
- 页数为 1 时仍显示总数，不显示无效翻页。
- 前后按钮提供 `aria-label="上一页"` 和 `aria-label="下一页"`。
- 不改变页面自己的数据切片逻辑。

- [ ] **Step 5: 实现 DataTableShell 与 ConfirmAction**

`DataTableShell` 只负责标题、工具栏、滚动区、空状态和 footer slots，不接管数据。

`ConfirmAction` 使用 `AlertDialog`，接口：

```tsx
type ConfirmActionProps = {
  trigger: React.ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
};
```

默认 `confirmLabel="确认删除"`。

- [ ] **Step 6: 运行测试**

Run:

```bash
npm test -- src/components/common/common-components.test.tsx
npm run lint
```

Expected: PASS。

- [ ] **Step 7: 提交通用组件**

```bash
git add src/components/common
git commit -m "feat: add shared shadcn business components"
```

---

### Task 4: 迁移工作台并建立路由入口测试

**Files:**
- Create: `src/views/WorkbenchView.test.tsx`
- Modify: `src/views/WorkbenchView.tsx`

- [ ] **Step 1: 写失败测试**

```tsx
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderApp } from "@/test/render-app";

describe("WorkbenchView", () => {
  it("opens the tag module from the real create action", async () => {
    const user = userEvent.setup();
    renderApp("/workbench");

    await user.click(screen.getByRole("button", { name: "新建标签" }));

    expect(window.location.hash).toBe("#/tags?mode=create");
    expect(await screen.findByRole("heading", { name: "新增业务标签" })).toBeVisible();
  });

  it("keeps placeholder quick actions inert", async () => {
    const user = userEvent.setup();
    renderApp("/workbench");
    const before = window.location.hash;

    await user.click(screen.getByRole("button", { name: "发起体质宣教" }));

    expect(window.location.hash).toBe(before);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run:

```bash
npm test -- src/views/WorkbenchView.test.tsx
```

Expected: FAIL，当前“新建标签”没有路由行为。

- [ ] **Step 3: 迁移工作台控件**

- 页面标题使用 `PageHeader`。
- 所有 `<button>` 替换为 `Button`。
- 真正有效的“新建标签”使用 `useNavigate()` 跳转到 `/tags?mode=create`。
- “发起体质宣教”等既有占位按钮不添加 `onClick`。
- 状态小标签使用 `Badge` 或 `StatusBadge`。
- 近期规则扫描表使用 shadcn `Table`。
- 保留 Recharts 数据和现有布局。

有效入口代码：

```tsx
const navigate = useNavigate();

<Button size="sm" onClick={() => navigate("/tags?mode=create")}>
  <Plus className="size-3.5" />
  新建标签
</Button>
```

- [ ] **Step 4: 运行测试与现有脚本**

Run:

```bash
npm test -- src/views/WorkbenchView.test.tsx
npm run check:logo
npm run lint
```

Expected: PASS。

- [ ] **Step 5: 提交工作台**

```bash
git add src/views/WorkbenchView.tsx src/views/WorkbenchView.test.tsx
git commit -m "refactor: migrate workbench to shadcn ui"
```

---

### Task 5: 迁移标签中心的列表、编辑器、校验和危险操作

**Files:**
- Create: `src/views/TagManagementView.test.tsx`
- Modify: `src/views/TagManagementView.tsx`

- [ ] **Step 1: 写新增与校验失败测试**

```tsx
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderApp } from "@/test/render-app";

describe("TagManagementView", () => {
  it("opens create mode from the query string", async () => {
    renderApp("/tags?mode=create");
    expect(await screen.findByRole("heading", { name: "新增业务标签" })).toBeVisible();
  });

  it("shows field errors and a toast when publishing an invalid tag", async () => {
    const user = userEvent.setup();
    renderApp("/tags?mode=create");

    await user.click(screen.getByRole("button", { name: "保存并发布" }));

    expect(await screen.findByText("请输入标签名称")).toBeVisible();
    expect(screen.getByText("请选择所属分类")).toBeVisible();
    expect(screen.getByText("请输入适用场景/业务用途")).toBeVisible();
    expect(screen.getByText("请完善必填信息后再提交")).toBeVisible();
  });

  it("creates and publishes a valid tag", async () => {
    const user = userEvent.setup();
    renderApp("/tags?mode=create");

    await user.type(screen.getByLabelText("标签名称"), "脾虚湿困重点人群");
    await user.click(screen.getByRole("combobox", { name: "所属分类" }));
    await user.click(screen.getByRole("option", { name: "九种体质倾向类" }));
    await user.type(screen.getByLabelText("适用场景 / 业务用途"), "随访管理");
    await user.click(screen.getByRole("button", { name: "保存并发布" }));

    expect(await screen.findByRole("heading", { name: "标签清单" })).toBeVisible();
    expect(screen.getByText("脾虚湿困重点人群")).toBeVisible();
    expect(screen.getByText("标签已发布")).toBeVisible();
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run:

```bash
npm test -- src/views/TagManagementView.test.tsx
```

Expected: FAIL，当前查询参数未驱动 create mode，校验使用浏览器 alert。

- [ ] **Step 3: 用查询参数驱动创建模式**

使用：

```tsx
type EditableTag = {
  id?: string;
  name?: string;
  category?: string;
  scene?: string;
  cycle?: string;
  description?: string;
  isWarningTag?: boolean;
};

function createEmptyTag(): EditableTag {
  return {
    name: "",
    category: "",
    scene: "",
    cycle: "每日",
    description: "",
    isWarningTag: false,
  };
}

const [searchParams, setSearchParams] = useSearchParams();

useEffect(() => {
  if (searchParams.get("mode") === "create") {
    setEditingTag(createEmptyTag());
    setViewMode("editor");
  }
}, [searchParams]);
```

退出编辑器时清除参数：

```tsx
setSearchParams({}, { replace: true });
setViewMode("list");
```

- [ ] **Step 4: 将校验改为字段错误和 Toast**

新增：

```ts
type TagFormErrors = {
  name?: string;
  category?: string;
  scene?: string;
};

const [formErrors, setFormErrors] = useState<TagFormErrors>({});
```

校验函数：

```ts
function validateTag(tag: EditableTag): TagFormErrors {
  return {
    ...(!tag.name?.trim() && { name: "请输入标签名称" }),
    ...(!tag.category && { category: "请选择所属分类" }),
    ...(!tag.scene?.trim() && { scene: "请输入适用场景/业务用途" }),
  };
}
```

提交失败：

```ts
const errors = validateTag(currentTag);
if (Object.keys(errors).length > 0) {
  setFormErrors(errors);
  toast.error("请完善必填信息后再提交");
  return;
}
```

将 `handleSave` 参数类型从 `"启用中" | "草稿"` 改为 `"已发布" | "草稿"`，函数体保留当前新增和更新逻辑。“保存并发布”调用 `handleSave("已发布")`，“保存草稿”调用 `handleSave("草稿")`。

- [ ] **Step 5: 迁移列表控件**

- 搜索框使用 `Input`。
- 分类新增/编辑使用 `Dialog`。
- 分类与标签删除使用 `ConfirmAction`。
- 标签列表使用 `DataTableShell`、`Table`、`StatusBadge`、`CompactPagination`。
- 预览患者详情使用 `Sheet`。
- 纯图标筛选按钮使用 `Button variant="outline" size="icon-sm"` 和 Tooltip；保持无行为。

- [ ] **Step 6: 迁移编辑器控件**

- tab 使用 `Tabs`。
- 文本字段使用 `Input`、`Textarea` 和真实 `<label htmlFor>`。
- 所有原生 select 使用受控 `Select`。
- 预警开关使用 `Switch`。
- 保存成功使用 `toast.success("标签已发布")` 或 `toast.success("草稿已保存")`。
- 不引入 React Hook Form 或 Zod。

- [ ] **Step 7: 写并验证危险操作测试**

补充：

```tsx
it("confirms before deleting a draft tag", async () => {
  const user = userEvent.setup();
  renderApp("/tags");

  const row = screen.getByRole("row", { name: /心脾两虚/ });
  await user.click(within(row).getByRole("button", { name: "删除" }));
  expect(screen.getByRole("alertdialog")).toBeVisible();

  await user.click(screen.getByRole("button", { name: "确认删除" }));
  expect(screen.queryByText("心脾两虚")).not.toBeInTheDocument();
});
```

Run:

```bash
npm test -- src/views/TagManagementView.test.tsx
npm run lint
```

Expected: PASS。

- [ ] **Step 8: 提交标签中心**

```bash
git add src/views/TagManagementView.tsx src/views/TagManagementView.test.tsx
git commit -m "refactor: migrate tag management to shadcn ui"
```

---

### Task 6: 迁移人群运营并实现路由联动

**Files:**
- Create: `src/views/PopulationView.test.tsx`
- Modify: `src/views/PopulationView.tsx`
- Modify: `src/views/TouchpointView.tsx`
- Modify: `src/views/DataServiceView.tsx`

- [ ] **Step 1: 写跨模块联动失败测试**

```tsx
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderApp } from "@/test/render-app";

describe("PopulationView routing", () => {
  it("passes a snapshot to touchpoint creation through location state", async () => {
    const user = userEvent.setup();
    renderApp("/population");

    await user.click(await screen.findByRole("tab", { name: "人群快照管理" }));
    await user.click(screen.getByRole("button", { name: "新建触达" }));

    expect(window.location.hash).toBe("#/touchpoint");
    expect(
      await screen.findByRole("dialog", { name: "新建触达运营任务" }),
    ).toBeVisible();
    expect(screen.getByLabelText("目标人群快照")).toHaveValue(
      expect.stringContaining("快照"),
    );
  });

  it("passes service data to data service creation through location state", async () => {
    const user = userEvent.setup();
    renderApp("/population");

    await user.click(await screen.findByRole("tab", { name: "人群快照管理" }));
    await user.click(screen.getByRole("button", { name: "数据开放" }));
    await user.click(screen.getByRole("button", { name: "确认保存配置" }));

    expect(window.location.hash).toBe("#/dataservice");
    expect(await screen.findByText("数据服务已创建")).toBeVisible();
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run:

```bash
npm test -- src/views/PopulationView.test.tsx
```

Expected: FAIL，当前仍 dispatch `appNavigate`。

- [ ] **Step 3: 用 navigate 替换全局事件**

触达联动：

```tsx
navigate("/touchpoint", {
  state: {
    action: "create_task",
    snapshotName: snap.name,
    patientCount: snap.count,
  },
});
```

数据服务联动：

```tsx
navigate("/dataservice", {
  state: {
    action: "insert_service",
    serviceData: dataServiceConfig,
  },
});
```

- [ ] **Step 4: 在目标页消费并清除 state**

`TouchpointView`：

```tsx
type TouchpointRouteState = {
  action: "create_task";
  snapshotName: string;
  patientCount: number;
};

const location = useLocation();
const navigate = useNavigate();

useEffect(() => {
  const state = location.state as TouchpointRouteState | null;
  if (state?.action !== "create_task") return;

  setNewTask({
    name: `${state.snapshotName} 触达计划`,
    snapshotName: state.snapshotName,
    patientCount: state.patientCount,
    channel: "SMS",
  });
  setIsCreateModalOpen(true);
  navigate(location.pathname, { replace: true, state: null });
}, [location.pathname, location.state, navigate]);
```

`DataServiceView` 使用明确的 route state：

```tsx
type DataServiceRouteState = {
  action: "insert_service";
  serviceData: Omit<DataService, "id" | "createdAt">;
};

const location = useLocation();
const navigate = useNavigate();

useEffect(() => {
  const state = location.state as DataServiceRouteState | null;
  if (state?.action !== "insert_service") return;

  const newService: DataService = {
    ...state.serviceData,
    id: `DS-${Date.now()}`,
    createdAt: new Date().toLocaleString("zh-CN", { hour12: false }),
  };

  setActiveTab("services");
  setServices((current) => [newService, ...current]);
  toast.success("数据服务已创建");
  navigate(location.pathname, { replace: true, state: null });
}, [location.pathname, location.state, navigate]);
```

- [ ] **Step 5: 迁移人群页面组件**

- 文本输入使用 `Input`。
- 规则 select 使用 `Select`。
- 详情右侧面板使用 `Sheet`。
- 快照和数据服务创建使用 `Dialog`。
- 返回字段使用 `Checkbox`。
- 服务启停使用 `Switch`。
- 删除快照使用 `ConfirmAction`。
- 表格使用 shadcn `Table`。
- 页码按钮使用 `CompactPagination` 或不可翻页的只读页码展示。

- [ ] **Step 6: 运行测试**

Run:

```bash
npm test -- src/views/PopulationView.test.tsx
npm test -- src/App.test.tsx
npm run lint
```

Expected: PASS，且不存在 `appNavigate` 新调用。

- [ ] **Step 7: 提交人群联动**

```bash
git add src/views/PopulationView.tsx src/views/PopulationView.test.tsx src/views/TouchpointView.tsx src/views/DataServiceView.tsx
git commit -m "refactor: migrate population workflows and routing"
```

---

### Task 7: 迁移预警管理、查询参数和详情 Sheet

**Files:**
- Create: `src/views/WarningManagementView.test.tsx`
- Modify: `src/views/WarningManagementView.tsx`

- [ ] **Step 1: 写查询参数和详情失败测试**

```tsx
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderApp } from "@/test/render-app";

describe("WarningManagementView", () => {
  it("restores tab and search from the URL", async () => {
    renderApp("/warning?tab=records&q=气虚质");

    expect(await screen.findByRole("tab", { name: /预警记录/ })).toHaveAttribute(
      "data-state",
      "active",
    );
    expect(screen.getByPlaceholderText("搜索患者/ID/标签")).toHaveValue("气虚质");
  });

  it("opens record details in a sheet", async () => {
    const user = userEvent.setup();
    renderApp("/warning?tab=records");

    await user.click(await screen.findByRole("button", { name: "详情" }));

    expect(screen.getByRole("dialog", { name: "预警记录详情" })).toBeVisible();
  });

  it("navigates to matching tag rules", async () => {
    const user = userEvent.setup();
    renderApp("/warning");

    await user.click(await screen.findByRole("button", { name: "规则" }));

    expect(window.location.hash).toContain("#/tags?");
    expect(window.location.hash).toContain("q=");
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run:

```bash
npm test -- src/views/WarningManagementView.test.tsx
```

Expected: FAIL，当前 tab/search 由组件状态和事件驱动。

- [ ] **Step 3: 迁移 URL 状态**

使用 `useSearchParams`：

```tsx
const [searchParams, setSearchParams] = useSearchParams();
const activeTab = searchParams.get("tab") === "records" ? "records" : "tags";
const recordsSearchKw = searchParams.get("q") ?? "";
```

tab 或查询变化时更新：

```tsx
setSearchParams(nextParams, { replace: true });
```

规则跳转：

```tsx
navigate(`/tags?q=${encodeURIComponent(tag.name)}`);
```

- [ ] **Step 4: 迁移页面组件**

- 顶部 tab 使用 `Tabs`。
- 搜索输入使用 `Input`。
- 快捷状态筛选使用 `Button`，保持现有实际过滤行为。
- 两张表使用 `DataTableShell` 和 `Table`。
- 详情面板使用右侧 `Sheet`。
- 风险等级和处理状态使用 `StatusBadge`。
- 筛选、导出、处置等无行为占位按钮只迁移为 `Button`，不增加 Toast。

- [ ] **Step 5: 运行测试**

Run:

```bash
npm test -- src/views/WarningManagementView.test.tsx
npm run lint
```

Expected: PASS。

- [ ] **Step 6: 提交预警管理**

```bash
git add src/views/WarningManagementView.tsx src/views/WarningManagementView.test.tsx
git commit -m "refactor: migrate warning management to shadcn ui"
```

---

### Task 8: 完成触达运营 Dialog、RadioGroup 和状态展示迁移

**Files:**
- Create: `src/views/TouchpointView.test.tsx`
- Modify: `src/views/TouchpointView.tsx`

- [ ] **Step 1: 写创建任务失败测试**

```tsx
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderApp } from "@/test/render-app";

describe("TouchpointView", () => {
  it("creates a task with the selected channel", async () => {
    const user = userEvent.setup();
    renderApp("/touchpoint");

    await user.click(screen.getByRole("button", { name: "创建触达任务" }));
    await user.type(screen.getByLabelText("任务名称"), "气虚质复诊提醒");
    await user.type(screen.getByLabelText("目标人群快照"), "气虚质快照");
    await user.click(screen.getByRole("radio", { name: "微信服务号" }));
    await user.click(screen.getByRole("button", { name: "确认创建" }));

    expect(screen.getByText("气虚质复诊提醒")).toBeVisible();
    expect(screen.getByText("任务创建成功")).toBeVisible();
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run:

```bash
npm test -- src/views/TouchpointView.test.tsx
```

Expected: FAIL，原生 radio 和自定义 modal 不满足目标语义。

- [ ] **Step 3: 迁移触达页面**

- 页面标题使用 `PageHeader`。
- 搜索使用 `Input`。
- 列表使用 `Table` 和 `StatusBadge`。
- 创建弹层使用 `Dialog`。
- 渠道使用受控 `RadioGroup`：

```tsx
<RadioGroup
  value={newTask.channel ?? "SMS"}
  onValueChange={(channel) =>
    setNewTask((task) => ({ ...task, channel: channel as TouchpointTask["channel"] }))
  }
  className="grid grid-cols-3 gap-2"
>
  {[
    { value: "SMS", label: "短信" },
    { value: "WeChat", label: "微信服务号" },
    { value: "AppPush", label: "院内APP/小程序" },
  ].map((option) => (
    <Label
      key={option.value}
      className="flex cursor-pointer items-center gap-2 rounded-md border p-2"
    >
      <RadioGroupItem value={option.value} />
      <span>{option.label}</span>
    </Label>
  ))}
</RadioGroup>
```

- 成功后 `toast.success("任务创建成功")`。
- 概览、去发布、中止、效果报告和筛选任务保持现有无行为状态，只迁移 Button。

- [ ] **Step 4: 运行测试**

Run:

```bash
npm test -- src/views/TouchpointView.test.tsx
npm test -- src/views/PopulationView.test.tsx
npm run lint
```

Expected: PASS。

- [ ] **Step 5: 提交触达运营**

```bash
git add src/views/TouchpointView.tsx src/views/TouchpointView.test.tsx
git commit -m "refactor: migrate touchpoint management to shadcn ui"
```

---

### Task 9: 完成数据服务 Dialog、Select、Checkbox、Switch 和危险确认迁移

**Files:**
- Create: `src/views/DataServiceView.test.tsx`
- Modify: `src/views/DataServiceView.tsx`

- [ ] **Step 1: 写创建与删除失败测试**

```tsx
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderApp } from "@/test/render-app";

describe("DataServiceView", () => {
  it("creates a service with selected fields", async () => {
    const user = userEvent.setup();
    renderApp("/dataservice");

    await user.click(screen.getByRole("button", { name: "创建服务" }));
    await user.type(screen.getByLabelText("服务名称"), "体质随访名单服务");
    await user.type(screen.getByLabelText("调用方"), "随访系统");
    await user.click(screen.getByRole("checkbox", { name: "患者唯一标识" }));
    await user.click(screen.getByRole("button", { name: "保存配置" }));

    expect(screen.getByText("体质随访名单服务")).toBeVisible();
    expect(screen.getByText("服务已创建")).toBeVisible();
  });

  it("requires confirmation before deleting a disabled service", async () => {
    const user = userEvent.setup();
    renderApp("/dataservice");

    const row = screen.getByRole("row", { name: /已停用/ });
    await user.click(within(row).getByRole("button", { name: "删除服务" }));
    expect(screen.getByRole("alertdialog")).toBeVisible();
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run:

```bash
npm test -- src/views/DataServiceView.test.tsx
```

Expected: FAIL，自定义弹层与原生控件尚未迁移。

- [ ] **Step 3: 迁移服务和调用记录 tab**

- tab 使用 `Tabs`。
- 搜索使用 `Input`。
- 表格使用 `Table`。
- 状态使用 `StatusBadge`。
- 刷新按钮保持占位无行为。
- 将可恢复 tab/search 同步到 `?tab=records&q=...`。

- [ ] **Step 4: 迁移服务编辑 Dialog**

- `Dialog` 管理创建/编辑。
- 快照、认证方式、格式使用 `Select`。
- 返回字段使用 `Checkbox`。
- 启停状态使用 `Switch`。
- 保存成功区分：

```ts
toast.success(editService.id ? "服务已更新" : "服务已创建");
```

- [ ] **Step 5: 迁移凭证 Dialog 和危险确认**

- 凭证信息使用 `Dialog`。
- Copy、显示/隐藏等图标按钮使用 Tooltip 和 `aria-label`；现有无行为按钮保持无行为。
- 删除使用 `ConfirmAction`。
- 停用/启用若当前已有真实状态变化，则用 AlertDialog 确认后更新；没有行为的入口不得新增状态变化。

- [ ] **Step 6: 运行测试**

Run:

```bash
npm test -- src/views/DataServiceView.test.tsx
npm test -- src/views/PopulationView.test.tsx
npm run lint
```

Expected: PASS。

- [ ] **Step 7: 提交数据服务**

```bash
git add src/views/DataServiceView.tsx src/views/DataServiceView.test.tsx
git commit -m "refactor: migrate data service to shadcn ui"
```

---

### Task 10: 迁移主题分析 Tabs、Select、Table 和图表容器

**Files:**
- Create: `src/views/AnalysisView.test.tsx`
- Modify: `src/views/AnalysisView.tsx`
- Modify: `scripts/check-analysis-view.mjs`

- [ ] **Step 1: 写 tab、select 和图表警告失败测试**

```tsx
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderApp } from "@/test/render-app";

describe("AnalysisView", () => {
  it("switches analysis tabs with shadcn tabs", async () => {
    const user = userEvent.setup();
    renderApp("/analysis");

    await user.click(screen.getByRole("tab", { name: "重点病种干预效果" }));

    expect(
      screen.getByRole("heading", { name: "重点病种干预转化效果分析" }),
    ).toBeVisible();
  });

  it("changes the visible trend metric with a select", async () => {
    const user = userEvent.setup();
    renderApp("/analysis");

    await user.click(screen.getByRole("combobox", { name: "趋势指标" }));
    await user.click(screen.getByRole("option", { name: "改善率" }));

    expect(screen.getByRole("combobox", { name: "趋势指标" })).toHaveTextContent(
      "改善率",
    );
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run:

```bash
npm test -- src/views/AnalysisView.test.tsx
```

Expected: FAIL，当前 tab 是 button，趋势指标是无 label 原生 select。

- [ ] **Step 3: 迁移分析交互控件**

- 顶部三类分析切换使用 `Tabs`。
- 原生 select 使用 `Select` 并提供 `aria-label="趋势指标"`。
- 日期和全局筛选占位按钮使用 `Button variant="outline" size="xs"`，不新增行为。
- 排行表使用 `Table` 和 `CompactPagination`。
- 指标卡保持布局，只统一基础颜色变量和边框。

- [ ] **Step 4: 修复 Recharts 容器尺寸警告**

所有 `ResponsiveContainer` 的直接父容器必须同时具备：

```tsx
className="min-h-0 min-w-0 flex-1"
```

有固定高度的图表区使用：

```tsx
<div className="h-[260px] min-h-[260px] min-w-0">
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={constitutionTrendData}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="平和质" stroke="#0891b2" />
    </LineChart>
  </ResponsiveContainer>
</div>
```

不要通过屏蔽 `console.warn` 处理。

- [ ] **Step 5: 更新静态检查脚本**

在 `scripts/check-analysis-view.mjs` 保留现有业务断言，并新增：

```js
assert.match(source, /from ["']@\\/components\\/ui\\/tabs["']/);
assert.match(source, /from ["']@\\/components\\/ui\\/select["']/);
assert.doesNotMatch(source, /<select\\b/);
```

- [ ] **Step 6: 运行测试和分析检查**

Run:

```bash
npm test -- src/views/AnalysisView.test.tsx
npm run check:analysis
npm run lint
```

Expected: PASS。

- [ ] **Step 7: 提交主题分析**

```bash
git add src/views/AnalysisView.tsx src/views/AnalysisView.test.tsx scripts/check-analysis-view.mjs
git commit -m "refactor: migrate analysis view to shadcn ui"
```

---

### Task 11: 全局清理、组件迁移守卫和完整自动化回归

**Files:**
- Create: `scripts/check-shadcn-migration.mjs`
- Create: `src/integration/navigation-flows.test.tsx`
- Modify: `package.json`
- Modify: affected files found by the guard

- [ ] **Step 1: 写迁移守卫脚本**

创建 `scripts/check-shadcn-migration.mjs`：

```js
import fs from "node:fs";
import path from "node:path";

const roots = ["src/views", "src/components"];
const files = roots.flatMap((root) =>
  fs
    .readdirSync(root, { recursive: true })
    .filter((file) => file.endsWith(".tsx"))
    .map((file) => path.join(root, file)),
);

const violations = [];

for (const file of files) {
  if (file.includes(`${path.sep}ui${path.sep}`)) continue;
  const source = fs.readFileSync(file, "utf8");
  for (const tag of ["button", "input", "select", "textarea", "table"]) {
    if (new RegExp(`<${tag}\\\\b`).test(source)) {
      violations.push(`${file}: native <${tag}> remains`);
    }
  }
  if (source.includes("appNavigate")) {
    violations.push(`${file}: appNavigate remains`);
  }
}

if (violations.length > 0) {
  console.error(violations.join("\\n"));
  process.exit(1);
}

console.log("shadcn migration guard passed");
```

允许的例外必须显式列为文件和原因，不得用宽泛正则跳过整个页面。

- [ ] **Step 2: 将守卫加入 package scripts**

```json
{
  "scripts": {
    "check:shadcn": "node scripts/check-shadcn-migration.mjs"
  }
}
```

- [ ] **Step 3: 运行守卫并修复剩余项**

Run:

```bash
npm run check:shadcn
```

Expected: 初次可能 FAIL，逐项迁移剩余原生交互标签和 `appNavigate`；最终输出：

```text
shadcn migration guard passed
```

- [ ] **Step 4: 写完整导航流程测试**

创建 `src/integration/navigation-flows.test.tsx`：

```tsx
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderApp } from "@/test/render-app";

describe("top-level navigation flows", () => {
  it.each([
    ["工作台", "运营概览"],
    ["标签中心", "标签清单"],
    ["人群运营", "动态结果清单"],
    ["预警管理", "预警管理"],
    ["触达运营", "触达运营中心"],
    ["数据服务", "数据开放服务"],
    ["主题分析", "中医体质分布与演变分析"],
  ])("opens %s", async (linkName, headingName) => {
    const user = userEvent.setup();
    renderApp("/workbench");

    await user.click(screen.getByRole("link", { name: linkName }));

    expect(await screen.findByRole("heading", { name: headingName })).toBeVisible();
  });
});
```

- [ ] **Step 5: 运行完整自动化验证**

Run:

```bash
npm test
npm run check:shadcn
npm run check:analysis
npm run check:logo
npm run lint
npm run build
```

Expected: 全部通过，无跳过测试。

- [ ] **Step 6: 检查依赖和 diff**

Run:

```bash
npm ls --depth=0
git diff --check
git status --short
```

Expected:

- 无 extraneous 或 invalid dependency。
- `git diff --check` 无输出。
- `.superpowers/` 仍未跟踪且未暂存。

- [ ] **Step 7: 提交全局清理**

```bash
git add package.json package-lock.json scripts/check-shadcn-migration.mjs src/integration src
git commit -m "test: enforce complete shadcn migration"
```

---

### Task 12: Chrome 1280×720 视觉与交互验收

**Files:**
- Create: `docs/superpowers/verification/2026-06-18-shadcn-ui-refactor-verification.md`
- Modify: files required to fix verified migration regressions only

- [ ] **Step 1: 启动开发服务**

Run:

```bash
npm run dev
```

Expected: Vite 在 `http://localhost:3000/` 启动。

- [ ] **Step 2: 设置 1280×720 并逐路由检查**

在最新版 Chrome / Edge 依次打开：

```text
http://localhost:3000/#/workbench
http://localhost:3000/#/tags
http://localhost:3000/#/population
http://localhost:3000/#/warning
http://localhost:3000/#/touchpoint
http://localhost:3000/#/dataservice
http://localhost:3000/#/analysis
```

每页检查：

- 无水平页面溢出；表格自身横向滚动除外。
- 标题、工具栏和首屏核心内容未被遮挡。
- 侧栏展开与收起后图标居中，菜单激活正确。
- Button、Input、Select、Tabs、Table 密度一致。
- 控制台无 error 或 Recharts 尺寸 warning。

- [ ] **Step 3: 实点关键流程**

按顺序验证：

1. 工作台“新建标签”进入标签编辑器。
2. 空表单发布显示字段错误和 Toast。
3. 填写必填项后保存并返回列表。
4. 打开并关闭标签预览 Sheet。
5. 删除草稿先出现 AlertDialog。
6. 从动态人群快照进入触达创建 Dialog，字段预填。
7. 从动态人群创建数据服务并进入数据服务页。
8. 预警详情 Sheet 可打开、Escape 可关闭。
9. 浏览器前进、后退和刷新保持顶层路由。
10. 占位按钮点击后不改变 URL、数据或弹层状态。

- [ ] **Step 4: 验证键盘和焦点**

使用 Tab、Shift+Tab、Enter、Space 和 Escape 验证：

- 侧栏链接可聚焦并打开。
- 表单字段和主要操作顺序合理。
- Select、RadioGroup、Checkbox、Switch 可键盘操作。
- Dialog、Sheet、AlertDialog 打开后焦点位于内部。
- 弹层关闭后焦点返回触发按钮。

- [ ] **Step 5: 记录验收结果**

创建 `docs/superpowers/verification/2026-06-18-shadcn-ui-refactor-verification.md`：

```markdown
# shadcn/ui 重构验收记录

日期：2026-06-18
环境：Chrome latest，1280×720

## 自动化

- `npm test`：通过
- `npm run check:shadcn`：通过
- `npm run check:analysis`：通过
- `npm run check:logo`：通过
- `npm run lint`：通过
- `npm run build`：通过

## 路由与页面

| 路由 | 布局 | 控制台 | 关键交互 |
| --- | --- | --- | --- |
| `/workbench` | 通过 | 通过 | 通过 |
| `/tags` | 通过 | 通过 | 通过 |
| `/population` | 通过 | 通过 | 通过 |
| `/warning` | 通过 | 通过 | 通过 |
| `/touchpoint` | 通过 | 通过 | 通过 |
| `/dataservice` | 通过 | 通过 | 通过 |
| `/analysis` | 通过 | 通过 | 通过 |

## 已知既有占位功能

- 列出仍无行为的按钮；确认其行为与重构前一致。

## 剩余风险

- 无
```

如果验收发现剩余风险，用实际风险、影响和未处理原因替换“无”。

- [ ] **Step 6: 修复验收发现的迁移回归并重跑**

只修复由本次迁移直接导致的问题。每次修复后运行对应页面测试；例如修复标签中心时执行：

```bash
npm test -- src/views/TagManagementView.test.tsx
npm run lint
```

所有修复完成后重新执行：

```bash
npm test
npm run check:shadcn
npm run lint
npm run build
```

Expected: 全部通过。

- [ ] **Step 7: 提交验收结果**

```bash
git add docs/superpowers/verification src
git commit -m "docs: record shadcn ui refactor verification"
```

---

## 最终完成检查

实施完成后执行：

```bash
git status --short
git log --oneline --decorate -12
npm test
npm run check:shadcn
npm run check:analysis
npm run check:logo
npm run lint
npm run build
```

完成条件：

- `.superpowers/` 之外没有未跟踪或未提交文件。
- 七个路由可直达、刷新、前进和后退。
- 全部业务页面不再直接使用原生 `button/input/select/textarea/table`。
- `appNavigate`、`activeMenu` 和 `menuParams` 已移除。
- 关键流程测试通过。
- 1280×720 Chrome 验收通过。
- 控制台无新增错误和 Recharts 尺寸警告。
- 既有占位按钮保持无行为，未被误补功能。
