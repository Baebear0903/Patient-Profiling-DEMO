import {Settings, AlertCircle, Database, RefreshCcw, Trash2, CheckCircle2} from 'lucide-react';
import {DataTableShell} from '@/components/common/DataTableShell';
import {Button} from '@/components/ui/button';
import {storage} from '@/lib/storage';
import {useLocalStorage} from '@/hooks/use-local-storage';
import {toast} from 'sonner';
import {useState} from 'react';

export function AdminOperationView() {
  const [globalScanTime, setGlobalScanTime] = useLocalStorage('admin_operation_scanTime', '次日 02:00 AM');
  const [warningScanFreq, setWarningScanFreq] = useLocalStorage('admin_operation_warnFreq', '每小时 1 次');
  const [smsStatus, setSmsStatus] = useLocalStorage('admin_operation_smsStatus', '已连接');

  const [isEditingScanTime, setIsEditingScanTime] = useState(false);
  const [tempScanTime, setTempScanTime] = useState(globalScanTime);

  const [isEditingWarnFreq, setIsEditingWarnFreq] = useState(false);
  const [tempWarnFreq, setTempWarnFreq] = useState(warningScanFreq);

  const handleClearData = () => {
    // Explicitly set array states to empty so they don't fallback to default data
    storage.set('ds_services', []);
    storage.set('ds_snapshots', []);
    storage.set('wm_recordsData', []);
    storage.set('tag_mgmt_basicTags_v2', []);
    storage.set('tag_mgmt_featureTags_v2', []);
    storage.set('tag_mgmt_basicCategories', []);
    storage.set('tag_mgmt_featureCategories', []);
    storage.set('pop_savedSnapshots', []);
    storage.set('pop_patients', []);
    storage.set('touchpoint_tasks', []);
    storage.set('admin_users', []);
    storage.set('admin_roles', []);
    
    toast.success('数据已清空！');
    setTimeout(() => window.location.reload(), 800);
  };

  const handleResetData = () => {
    storage.clear(); // 清空，然后读取时会自动 fallback 到默认数据
    toast.success('已恢复系统默认演示数据！');
    setTimeout(() => window.location.reload(), 800);
  };

  return (
    <DataTableShell
      title="运营配置"
      description="系统全局运营参数与定时任务配置"
    >
      <div className="h-full min-h-0 flex-1 overflow-auto rounded-md border border-slate-200 bg-white p-8">
        <div className="max-w-2xl space-y-8">
          <div>
            <h3 className="text-lg font-medium text-slate-900 border-b pb-2 mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-slate-500" />
              <span>初始数据配置</span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-800">恢复默认数据</p>
                  <p className="text-sm text-slate-500">恢复系统初始的数据状态</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline"
                    size="sm" 
                    onClick={handleResetData}
                  >
                    <RefreshCcw className="w-4 h-4 mr-1" /> 
                    恢复默认
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-800">清空系统数据</p>
                  <p className="text-sm text-slate-500">完全清空当前浏览器的所有数据缓存与修改</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline"
                    size="sm" 
                    onClick={handleClearData} 
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> 
                    清空数据
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-slate-900 border-b pb-2 mb-4">定时任务配置</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-800">全局标签计算周期</p>
                  <p className="text-sm text-slate-500">所有 [每日更新] 的标签默认执行时间</p>
                </div>
                <div className="flex items-center gap-2">
                  {isEditingScanTime ? (
                    <div className="flex items-center gap-1">
                      <input 
                        type="text" 
                        value={tempScanTime} 
                        onChange={e => setTempScanTime(e.target.value)} 
                        className="text-sm border rounded px-2 py-1 w-32"
                        autoFocus
                      />
                      <Button variant="ghost" size="icon-sm" onClick={() => {
                        setGlobalScanTime(tempScanTime);
                        setIsEditingScanTime(false);
                      }}><CheckCircle2 className="w-4 h-4 text-emerald-600"/></Button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm text-slate-600 border p-1 rounded bg-slate-50">{globalScanTime}</span>
                      <Button variant="outline" size="sm" onClick={() => {
                        setTempScanTime(globalScanTime);
                        setIsEditingScanTime(true);
                      }}>修改</Button>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-800">体质预警扫描</p>
                  <p className="text-sm text-slate-500">检测并生成工作台的待干预预警</p>
                </div>
                <div className="flex items-center gap-2">
                  {isEditingWarnFreq ? (
                    <div className="flex items-center gap-1">
                      <input 
                        type="text" 
                        value={tempWarnFreq} 
                        onChange={e => setTempWarnFreq(e.target.value)} 
                        className="text-sm border rounded px-2 py-1 w-32"
                        autoFocus
                      />
                      <Button variant="ghost" size="icon-sm" onClick={() => {
                        setWarningScanFreq(tempWarnFreq);
                        setIsEditingWarnFreq(false);
                      }}><CheckCircle2 className="w-4 h-4 text-emerald-600"/></Button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm text-slate-600 border p-1 rounded bg-slate-50">{warningScanFreq}</span>
                      <Button variant="outline" size="sm" onClick={() => {
                        setTempWarnFreq(warningScanFreq);
                        setIsEditingWarnFreq(true);
                      }}>修改</Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-slate-900 border-b pb-2 mb-4">短信/消息触达配置</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-800">短信网关状态</p>
                  <p className="text-sm text-slate-500">用于随访运营的消息推送</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs ${smsStatus === '已连接' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{smsStatus}</span>
                  <Button variant="outline" size="sm" onClick={() => {
                    setSmsStatus(smsStatus === '已连接' ? '已断开' : '已连接');
                    toast.success(`网关状态已更新为: ${smsStatus === '已连接' ? '已断开' : '已连接'}`);
                  }}>检测</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DataTableShell>
  );
}
