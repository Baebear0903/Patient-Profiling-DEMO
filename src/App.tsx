import {Navigate, Route, Routes} from 'react-router-dom';
import {Layout} from './components/Layout';
import {AdminLayout} from './components/AdminLayout';
import {AnalysisView} from './views/AnalysisView';
import {DataServiceView} from './views/DataServiceView';
import {PopulationView} from './views/PopulationView';
import {TagManagementView} from './views/TagManagementView';
import {TouchpointView} from './views/TouchpointView';
import {WarningManagementView} from './views/WarningManagementView';
import {WorkbenchView} from './views/WorkbenchView';
import {AdminPersonnelView} from './views/AdminPersonnelView';
import {AdminRoleView} from './views/AdminRoleView';
import {AdminOperationView} from './views/AdminOperationView';

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
      <Route element={<AdminLayout />}>
        <Route path="/admin/tags" element={<TagManagementView theme="admin" />} />
        <Route path="/admin/operation" element={<AdminOperationView />} />
        <Route path="/admin/personnel" element={<AdminPersonnelView />} />
        <Route path="/admin/role" element={<AdminRoleView />} />
      </Route>
      <Route path="*" element={<Navigate to="/workbench" replace />} />
    </Routes>
  );
}
