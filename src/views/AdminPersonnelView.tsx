import {useLocalStorage} from '@/hooks/use-local-storage';
import {Users, Shield, Filter, Plus, Search} from 'lucide-react';
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

const ADMIN_USERS = [
  {id: 'U01', name: '王医生', role: '门诊医生', dept: '中医内科', status: '正常'},
  {id: 'U02', name: '李主任', role: '系统管理员', dept: '信息科', status: '正常'},
  {id: 'U03', name: '赵护士', role: '健康管家', dept: '治未病科', status: '正常'},
];

export function AdminPersonnelView() {
  const [users, setUsers] = useLocalStorage('admin_users', ADMIN_USERS);
  return (
    <DataTableShell
      title="人员管理"
      description="管理可登录该系统的用户账号"
      toolbar={
        <>
          <Button className="mr-2 bg-[#0092B9] hover:bg-[#0081a4]" size="sm">
            <Plus className="mr-1 h-4 w-4" /> 新增人员
          </Button>
          <div className="relative">
            <Input className="h-8 w-64 bg-white pl-8 text-xs" placeholder="搜索人员姓名/ID..." />
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
          </div>
          <Button size="icon-sm" variant="outline" className="ml-2">
            <Filter className="h-4 w-4" />
          </Button>
        </>
      }
    >
      <div className="h-full min-h-0 flex-1 overflow-auto rounded-md border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">用户ID</TableHead>
              <TableHead>姓名</TableHead>
              <TableHead>所属科室</TableHead>
              <TableHead>关联角色</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user: any) => (
              <TableRow key={user.id}>
                <TableCell className="font-mono text-slate-500">{user.id}</TableCell>
                <TableCell className="font-semibold">{user.name}</TableCell>
                <TableCell>{user.dept}</TableCell>
                <TableCell>
                  <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600 border border-slate-200">
                    {user.role}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-emerald-600">{user.status}</span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="text-[#0092B9] h-8">编辑</Button>
                  <Button variant="ghost" size="sm" className="text-red-600 h-8">停用</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DataTableShell>
  );
}
