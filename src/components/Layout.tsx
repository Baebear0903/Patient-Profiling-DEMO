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
  {path: '/workbench', label: '画像工作台', icon: LayoutDashboard},
  {path: '/tags', label: '画像标签管理', icon: Tags},
  {path: '/population', label: '体质人群管理', icon: Users},
  {path: '/warning', label: '画像预警提醒', icon: AlertTriangle},
  {path: '/touchpoint', label: '患者运营管理', icon: Send},
  {path: '/dataservice', label: '画像开放服务', icon: Database},
  {path: '/analysis', label: '体质主题分析', icon: BarChart2},
];

function TcmPortraitLogo() {
  return (
    <img
      src={`${import.meta.env.BASE_URL}logo2.png`}
      alt="中医体质画像服务"
      className="h-8 w-8 object-contain"
      aria-hidden="true"
      fetchPriority="high"
    />
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
            <div className="shrink-0" aria-label="中医体质画像服务平台">
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
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full overflow-hidden bg-transparent">
                <img src={`${import.meta.env.BASE_URL}avatar.png`} alt="大数据演示2" className="h-full w-full object-cover scale-125 object-center" />
              </div>
              <div className="hidden leading-none sm:block">
                <div className="text-[13px] font-medium text-slate-700">
                  大数据演示2
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
