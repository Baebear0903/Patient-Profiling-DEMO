import {
  AlertTriangle,
  BarChart2,
  Bell,
  Database,
  LayoutDashboard,
  Send,
  Tags,
  Users,
} from 'lucide-react';
import {NavLink, Outlet, useLocation, useNavigate} from 'react-router-dom';
import {Button} from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

const menuItems = [
  {path: '/workbench', label: '工作台', icon: LayoutDashboard},
  {path: '/tags', label: '标签中心', icon: Tags},
  {path: '/population', label: '人群运营', icon: Users},
  {path: '/warning', label: '预警管理', icon: AlertTriangle},
  {path: '/touchpoint', label: '触达运营', icon: Send},
  {path: '/dataservice', label: '数据服务', icon: Database},
  {path: '/analysis', label: '主题分析', icon: BarChart2},
];

const brandLogoColor = '#0080A2';

function TcmPortraitLogo() {
  return (
    <svg
      viewBox="0 0 32 32"
      className="h-8 w-8"
      aria-hidden="true"
      focusable="false"
    >
      <title id="tcm-portrait-logo-title">中医体质画像平台</title>
      <rect width="32" height="32" rx="8" fill={brandLogoColor} />
      <path
        d="M17.2 7.2c-4 0-7.1 3.1-7.1 7.3 0 2.6 1.1 4.7 3.1 6.1.8.6 1.1 1.2 1.1 2.1v1.8h6.1v-2.1c0-.8.4-1.4 1.1-1.9 1.7-1.3 2.7-3.2 2.7-5.6 0-4.4-3-7.7-7-7.7Z"
        fill="white"
        opacity="0.96"
      />
      <path
        d="M17 10.1c-1.7 1.7-2.6 3.7-2.6 5.9 0 2 .7 3.7 2.2 5.1"
        fill="none"
        stroke={brandLogoColor}
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <path
        d="M18.4 13.1c2.9-1.7 5.3-1.4 6.8.1-1 2.6-3.4 3.8-6.8 3.4-.2-1.2-.2-2.3 0-3.5Z"
        fill="#CDEFF4"
      />
      <path
        d="M18.7 16.2c1.9-.7 3.8-1.6 5.6-2.8M19.7 14.3l.9 1.3M21.7 13.8l.7 1.1"
        fill="none"
        stroke={brandLogoColor}
        strokeWidth="0.85"
        strokeLinecap="round"
      />
      <path
        d="M7.7 10.3V8.1h2.2M24.3 21.7v2.2h-2.2M9.1 23.9H7.7v-2.2M22.1 8.1h2.2v2.2"
        fill="none"
        stroke="white"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Layout() {
  const {pathname} = useLocation();
  const navigate = useNavigate();
  const {state} = useSidebar();
  const currentMenu =
    menuItems.find((item) => item.path === pathname)?.label ?? '概览';

  return (
    <>
      <Sidebar
        collapsible="icon"
        className="border-r border-slate-200 bg-white"
      >
        <SidebarHeader className="h-14 justify-center border-b border-slate-200 p-2">
          <div className="flex min-w-0 items-center gap-2.5 px-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
            <div className="shrink-0" aria-label="中医体质画像平台">
              <TcmPortraitLogo />
            </div>
            <span className="truncate text-[15px] font-semibold text-slate-900 group-data-[collapsible=icon]:hidden">
              中医体质画像平台
            </span>
          </div>
        </SidebarHeader>

        <SidebarContent className="py-2">
          <nav aria-label="主导航">
            <SidebarGroup>
              <SidebarMenu>
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.path === pathname;

                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.label}
                        className="h-10 text-slate-600 hover:bg-slate-50 hover:text-slate-900 data-[active=true]:border data-[active=true]:border-cyan-100 data-[active=true]:bg-cyan-50 data-[active=true]:text-cyan-700 group-data-[collapsible=icon]:mx-auto"
                      >
                        <NavLink to={item.path} aria-label={item.label}>
                          <Icon className="size-[18px]" />
                          <span>{item.label}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          </nav>
        </SidebarContent>

        <SidebarFooter className="mt-auto items-center border-t border-slate-200 bg-white p-2">
          <SidebarTrigger
            aria-label={state === 'expanded' ? '折叠侧边栏' : '展开侧边栏'}
            className="h-9 w-full text-slate-500 hover:bg-slate-50 hover:text-cyan-700 group-data-[collapsible=icon]:w-9"
          />
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="h-svh min-w-0 overflow-hidden bg-[#F5F7FA] text-[#1F2329]">
        <header className="z-10 flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
          <div className="flex items-center gap-4 text-sm">
            <div className="hidden items-center gap-2 sm:flex">
              <span className="text-slate-400">画像服务</span>
              <span className="text-slate-300">/</span>
              <span className="font-medium text-slate-800">{currentMenu}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mr-2 h-8 text-slate-600 hover:text-cyan-700"
              onClick={() => navigate('/admin/tags')}
            >
              管理配置
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="通知"
              className="relative rounded-full text-slate-500 hover:bg-slate-100"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-red-500" />
            </Button>
            <div className="ml-2 flex cursor-pointer items-center gap-2 border-l border-slate-200 pl-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-[10px] font-bold text-cyan-700">
                AD
              </div>
              <div className="hidden leading-none sm:block">
                <div className="text-[11px] font-semibold text-slate-800">
                  管理员
                </div>
                <div className="mt-0.5 text-[9px] uppercase text-slate-400">
                  Admin
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </>
  );
}
