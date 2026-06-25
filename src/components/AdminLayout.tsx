import {
  Settings,
  Tags,
  Users,
  UserCog,
  Bell,
  LogOut,
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
  {path: '/admin/tags', label: '标签管理', icon: Tags},
  {path: '/admin/operation', label: '运营配置', icon: Settings},
  {path: '/admin/personnel', label: '人员管理', icon: Users},
  {path: '/admin/role', label: '角色配置', icon: UserCog},
];

function AdminLogo() {
  return (
    <img
      src={`${import.meta.env.BASE_URL}logo1.png`}
      alt="中医体质画像后台"
      className="h-8 w-8 object-contain"
      aria-hidden="true"
      fetchPriority="high"
    />
  );
}

export function AdminLayout() {
  const {pathname} = useLocation();
  const navigate = useNavigate();
  const {state} = useSidebar();
  const currentMenu =
    menuItems.find((item) => pathname.startsWith(item.path))?.label ?? '概览';

  return (
    <div className="flex w-full min-h-svh bg-[#1a1f33]">
      <Sidebar
        collapsible="icon"
        className="border-r-0 !bg-[#1a1f33] border-none text-slate-300 [&_[data-sidebar=sidebar]]:!bg-[#1a1f33] [&_[data-slot=sidebar-container-inner]]:!bg-[#1a1f33]"
      >
        <SidebarHeader className="h-14 justify-center border-b border-[#2a3045] p-2">
          <div className="flex min-w-0 items-center gap-2.5 px-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
            <div className="shrink-0" aria-label="中医体质画像后台">
              <AdminLogo />
            </div>
            <span className="truncate text-[15px] font-semibold text-white group-data-[collapsible=icon]:hidden">
              中医体质画像后台
            </span>
          </div>
        </SidebarHeader>

        <SidebarContent className="py-2">
          <nav aria-label="后台主导航">
            <SidebarGroup>
              <SidebarMenu>
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname.startsWith(item.path);

                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.label}
                        className="h-10 text-slate-400 hover:bg-[#2a3045] hover:text-white data-[active=true]:!bg-[#0092B9] data-[active=true]:!text-white data-[active=true]:border-transparent group-data-[collapsible=icon]:mx-auto"
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

        <SidebarFooter className="mt-auto items-center border-t border-[#2a3045] p-2">
          <SidebarTrigger
            aria-label={state === 'expanded' ? '折叠侧边栏' : '展开侧边栏'}
            className="h-9 w-full text-slate-500 hover:bg-[#2a3045] hover:text-[#0092B9] group-data-[collapsible=icon]:w-9"
          />
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex min-w-0 flex-1 flex-col overflow-hidden bg-transparent">
        <header className="z-10 flex h-14 shrink-0 items-center justify-between px-6 text-white">
          <div className="flex items-center gap-4 text-sm">
            <div className="hidden items-center gap-2 sm:flex">
              <span className="text-slate-400">后台管理</span>
              <span className="text-slate-500">/</span>
              <span className="font-medium text-slate-200">{currentMenu}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="default"
              size="sm"
              className="mr-2 h-8 bg-cyan-700 text-white hover:bg-cyan-600 focus:bg-cyan-600"
              onClick={() => navigate('/workbench')}
            >
              <LogOut className="mr-2 h-4 w-4" />
              跳转前台
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="通知"
              className="relative rounded-full text-slate-400 hover:text-white hover:bg-white/10"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-red-500" />
            </Button>
            <div className="ml-2 flex cursor-pointer items-center gap-2 border-l border-slate-700 pl-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full overflow-hidden bg-transparent">
                <img src={`${import.meta.env.BASE_URL}avatar.png`} alt="大数据演示2" className="h-full w-full object-cover scale-125 object-center" />
              </div>
              <div className="hidden leading-none sm:block">
                <div className="text-[13px] font-medium text-slate-200">
                  大数据演示2
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden p-2 pt-0 pb-2 pr-2">
          <div className="h-full rounded-2xl bg-[#F5F7FA] overflow-auto shadow-sm ring-1 ring-black/5">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </div>
  );
}
