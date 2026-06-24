import {useLocalStorage} from '@/hooks/use-local-storage';
import {Shield, Plus, Search, ChevronRight, ChevronDown} from 'lucide-react';
import {DataTableShell} from '@/components/common/DataTableShell';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';

const PERMISSION_TREE = {
  frontend: [
    {
      id: 'f_workbench',
      label: '工作台',
      children: [
        { id: 'f_workbench_view', label: '查看工作台' },
        { id: 'f_workbench_focus', label: '关注患者/取消关注' },
        { id: 'f_workbench_search', label: '患者搜索' }
      ]
    },
    {
      id: 'f_tags',
      label: '标签中心',
      children: [
        { id: 'f_tags_view', label: '查看标签列表' },
        { id: 'f_tags_create', label: '新增标签' },
        { id: 'f_tags_edit', label: '编辑标签/配置运算规则' },
        { id: 'f_tags_status', label: '发布/停用标签' },
        { id: 'f_tags_preview', label: '预览标签数据集' },
        { id: 'f_tags_delete', label: '删除标签' }
      ]
    },
    {
      id: 'f_population',
      label: '人群运营',
      children: [
        { id: 'f_population_view', label: '查看人群列表' },
        { id: 'f_population_create', label: '新增分群' },
        { id: 'f_population_analysis', label: '人群画像分析' },
      ]
    },
    {
      id: 'f_warning',
      label: '预警管理',
      children: [
        { id: 'f_warning_view', label: '查看预警列表' },
        { id: 'f_warning_process', label: '处理预警' },
        { id: 'f_warning_ignore', label: '忽略预警' }
      ]
    },
    {
      id: 'f_touchpoint',
      label: '触达运营',
      children: [
        { id: 'f_touchpoint_view', label: '查看触达任务' },
        { id: 'f_touchpoint_create', label: '新建触达任务' }
      ]
    },
    {
      id: 'f_dataservice',
      label: '数据服务',
      children: [
        { id: 'f_dataservice_view', label: '查看数据看板' },
        { id: 'f_dataservice_export', label: '导出数据' }
      ]
    },
    {
      id: 'f_analysis',
      label: '主题分析',
      children: [
        { id: 'f_analysis_view', label: '查看分析图表' },
        { id: 'f_analysis_export', label: '导出分析数据' }
      ]
    }
  ],
  backend: [
    {
      id: 'b_tags',
      label: '标签管理',
      children: [
        { id: 'b_tags_view', label: '查看标签列表' },
        { id: 'b_tags_create', label: '新增标签' },
        { id: 'b_tags_edit', label: '编辑标签/配置运算规则' },
        { id: 'b_tags_status', label: '发布/停用标签' },
        { id: 'b_tags_preview', label: '预览标签数据集' },
        { id: 'b_tags_delete', label: '删除标签' }
      ]
    },
    {
      id: 'b_operation',
      label: '运营配置',
      children: [
        { id: 'b_operation_view', label: '查看配置' },
        { id: 'b_operation_edit', label: '修改配置' }
      ]
    },
    {
      id: 'b_personnel',
      label: '人员管理',
      children: [
        { id: 'b_personnel_view', label: '查看人员列表' },
        { id: 'b_personnel_edit', label: '添加人员/修改数据范围' }
      ]
    },
    {
      id: 'b_role',
      label: '角色配置',
      children: [
        { id: 'b_role_view', label: '查看角色列表' },
        { id: 'b_role_create', label: '新增角色' },
        { id: 'b_role_edit', label: '配置权限' },
        { id: 'b_role_members', label: '人员管理' }
      ]
    }
  ]
};

const ALL_FRONTEND_IDS = PERMISSION_TREE.frontend.flatMap(p => [p.id, ...p.children.map(c => c.id)]);
const ALL_BACKEND_IDS = PERMISSION_TREE.backend.flatMap(p => [p.id, ...p.children.map(c => c.id)]);

const ADMIN_ROLES = [
  {id: 'R01', name: '系统管理员', desc: '拥有系统所有前后台菜单及按钮权限', count: 2, permissions: [...ALL_FRONTEND_IDS, ...ALL_BACKEND_IDS]},
  {id: 'R02', name: '临床医生', desc: '仅拥有前台所有操作权限', count: 120, permissions: ALL_FRONTEND_IDS},
  {id: 'R03', name: '健康管家', desc: '仅拥有前台所有操作权限', count: 15, permissions: ALL_FRONTEND_IDS},
];

export function AdminRoleView() {
  const [roles, setRoles] = useLocalStorage('admin_roles_v3', ADMIN_ROLES);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [permissionsDialog, setPermissionsDialog] = useState<{open: boolean, role: any}>({
    open: false,
    role: null
  });
  const [currentPermissions, setCurrentPermissions] = useState<string[]>([]);
  
  const handleOpenPermissions = (role: any) => {
    setPermissionsDialog({ open: true, role });
    setCurrentPermissions(role.permissions || []);
  };
  
  const handleSavePermissions = () => {
    if (permissionsDialog.role) {
      setRoles(roles.map((r: any) => 
        r.id === permissionsDialog.role.id 
          ? { ...r, permissions: currentPermissions } 
          : r
      ));
      toast.success(`已保存「${permissionsDialog.role.name}」的权限配置`);
    }
    setPermissionsDialog({ open: false, role: null });
  };
  
  const togglePermission = (id: string, childrenIds?: string[]) => {
    let newPerms = [...currentPermissions];
    
    // Toggle parent
    if (newPerms.includes(id)) {
      newPerms = newPerms.filter(p => p !== id && (!childrenIds || !childrenIds.includes(p)));
    } else {
      newPerms.push(id);
      if (childrenIds) {
        childrenIds.forEach(cid => {
          if (!newPerms.includes(cid)) newPerms.push(cid);
        });
      }
    }
    
    // Auto check/uncheck parent based on children
    PERMISSION_TREE.frontend.concat(PERMISSION_TREE.backend).forEach(parent => {
      const childIds = parent.children.map(c => c.id);
      if (childrenIds && childIds.includes(id)) {
        // We clicked a child
        const isChecking = !currentPermissions.includes(id);
        if (isChecking) {
          // If checking, maybe need to check parent
          if (!newPerms.includes(parent.id)) newPerms.push(parent.id);
        } else {
          // If unchecking, and no children left, uncheck parent? 
          // Usually parent stays checked if any child is checked
          const anyChildChecked = childIds.some(cid => newPerms.includes(cid));
          if (!anyChildChecked) {
            newPerms = newPerms.filter(p => p !== parent.id);
          }
        }
      }
    });

    setCurrentPermissions(newPerms);
  };
  
  const filteredRoles = useMemo(() => {
    return roles.filter((role: any) => role.name.includes(searchTerm));
  }, [roles, searchTerm]);
  
  // TreeNode Component
  const TreeNode: React.FC<{ node: any }> = ({ node }) => {
    const isChecked = currentPermissions.includes(node.id);
    const childIds = node.children?.map((c: any) => c.id);
    const isIndeterminate = node.children && childIds.some((id: string) => currentPermissions.includes(id)) && !childIds.every((id: string) => currentPermissions.includes(id));
    
    return (
      <div className="mb-2">
        <div className="flex items-center space-x-2 py-1.5">
          <Checkbox 
            id={node.id} 
            checked={isChecked || (isIndeterminate ? 'indeterminate' as any : false)}
            onCheckedChange={() => togglePermission(node.id, childIds)}
          />
          <label htmlFor={node.id} className="text-sm font-medium leading-none cursor-pointer">
            {node.label}
          </label>
        </div>
        
        {node.children && (
          <div className="ml-6 space-y-1.5 mt-1 border-l border-slate-200 pl-4 py-1">
            {node.children.map((child: any) => (
              <div key={child.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={child.id} 
                  checked={currentPermissions.includes(child.id)}
                  onCheckedChange={() => togglePermission(child.id)}
                />
                <label htmlFor={child.id} className="text-sm text-slate-600 cursor-pointer">
                  {child.label}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <DataTableShell
      title="角色配置"
      description="管理不同角色的前台菜单、按钮可见性及数据权限"
      toolbar={
        <>
          <Button className="mr-2 bg-[#0092B9] hover:bg-[#0081a4]" size="sm">
            <Plus className="mr-1 h-4 w-4" /> 新增角色
          </Button>
          <div className="relative">
            <Input 
              className="h-8 w-64 bg-white pl-8 text-xs" 
              placeholder="搜索角色名称..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
          </div>
        </>
      }
    >
      <div className="h-full min-h-0 flex-1 overflow-auto rounded-md border border-slate-200 bg-white">
        <Table className="min-w-[800px] table-fixed text-left">
          <TableHeader>
            <TableRow>
              <TableHead className="sticky top-0 z-10 w-[15%] bg-slate-50 p-3 text-[11px] text-slate-500">角色ID</TableHead>
              <TableHead className="sticky top-0 z-10 w-[20%] bg-slate-50 p-3 text-[11px] text-slate-500">角色名称</TableHead>
              <TableHead className="sticky top-0 z-10 w-[30%] bg-slate-50 p-3 text-[11px] text-slate-500">权限描述</TableHead>
              <TableHead className="sticky top-0 z-10 w-[15%] bg-slate-50 p-3 text-[11px] text-slate-500">关联人数</TableHead>
              <TableHead className="sticky right-0 top-0 z-20 w-[20%] bg-slate-50 p-3 text-[11px] text-slate-500">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRoles.map((role: any) => (
              <TableRow key={role.id} className="group">
                <TableCell className="p-3 font-mono text-xs text-slate-500">{role.id}</TableCell>
                <TableCell className="p-3 font-semibold text-xs text-slate-800">{role.name}</TableCell>
                <TableCell className="p-3 text-xs text-slate-500">{role.desc}</TableCell>
                <TableCell className="p-3 text-xs">{role.count} 人</TableCell>
                <TableCell className="sticky right-0 z-10 bg-white p-3 group-hover:bg-slate-50">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="xs" onClick={() => handleOpenPermissions(role)}>配置权限</Button>
                    <Button variant="ghost" size="xs">人员管理</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredRoles.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-sm text-slate-500">
                  没有找到符合条件的角色
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={permissionsDialog.open} onOpenChange={(open) => !open && setPermissionsDialog({ open: false, role: null })}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-6">
          <DialogHeader>
            <DialogTitle className="text-xl">
              配置权限 - {permissionsDialog.role?.name}
            </DialogTitle>
            <DialogDescription>
              配置该角色可以访问的前后台菜单及操作按钮
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto py-4 min-h-[400px]">
            <Tabs defaultValue="frontend" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 bg-slate-100">
                <TabsTrigger value="frontend" className="data-[state=active]:bg-white data-[state=active]:text-[#0092B9] data-[state=active]:shadow-sm">前台系统</TabsTrigger>
                <TabsTrigger value="backend" className="data-[state=active]:bg-white data-[state=active]:text-[#0092B9] data-[state=active]:shadow-sm">后台系统</TabsTrigger>
              </TabsList>
              
              <TabsContent value="frontend" className="mt-0">
                <div className="border border-slate-200 rounded-md p-4 bg-slate-50/50">
                  {PERMISSION_TREE.frontend.map(node => (
                    <TreeNode key={node.id} node={node} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="backend" className="mt-0">
                <div className="border border-slate-200 rounded-md p-4 bg-slate-50/50">
                  {PERMISSION_TREE.backend.map(node => (
                    <TreeNode key={node.id} node={node} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <DialogFooter className="pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setPermissionsDialog({ open: false, role: null })}>取消</Button>
            <Button className="bg-[#0092B9] hover:bg-[#0081a4]" onClick={handleSavePermissions}>保存修改</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DataTableShell>
  );
}
