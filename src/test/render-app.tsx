import {render} from '@testing-library/react';
import {useState, type CSSProperties, type ReactNode} from 'react';
import {HashRouter} from 'react-router-dom';
import App from '@/App';
import {SidebarProvider} from '@/components/ui/sidebar';
import {Toaster} from '@/components/ui/sonner';
import {TooltipProvider} from '@/components/ui/tooltip';

const sidebarStyle = {
  '--sidebar-width': '13rem',
  '--sidebar-width-icon': '3.5rem',
} as CSSProperties;

function AppProviders({children}: {children: ReactNode}) {
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
          {children}
          <Toaster position="top-center" />
        </SidebarProvider>
      </TooltipProvider>
    </HashRouter>
  );
}

export function renderApp(initialHash = '/workbench') {
  window.location.hash = initialHash;

  return render(<App />, {wrapper: AppProviders});
}
