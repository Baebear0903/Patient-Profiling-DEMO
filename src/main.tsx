import {StrictMode, useState, type CSSProperties} from 'react';
import {createRoot} from 'react-dom/client';
import {HashRouter} from 'react-router-dom';
import App from './App.tsx';
import {SidebarProvider} from './components/ui/sidebar';
import {Toaster} from './components/ui/sonner';
import {TooltipProvider} from './components/ui/tooltip';
import './index.css';

const sidebarStyle = {
  '--sidebar-width': '13rem',
  '--sidebar-width-icon': '3.5rem',
} as CSSProperties;

function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <HashRouter
      future={{
        v7_relativeSplatPath: true,
        v7_startTransition: true,
      }}
    >
      <TooltipProvider delayDuration={250}>
        <SidebarProvider
          defaultOpen
          open={sidebarOpen}
          onOpenChange={setSidebarOpen}
          persistCookie={false}
          style={sidebarStyle}
        >
          <App />
          <Toaster position="top-center" />
        </SidebarProvider>
      </TooltipProvider>
    </HashRouter>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppShell />
  </StrictMode>,
);
