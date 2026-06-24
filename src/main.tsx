import {StrictMode, useState, useEffect, type CSSProperties} from 'react';
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

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Ignore ResizeObserver errors and generic cross-origin "Script error."
      if (
        event.message === 'Script error.' ||
        event.message.includes('ResizeObserver loop limit exceeded') ||
        event.message.includes('ResizeObserver loop completed with undelivered notifications.')
      ) {
        // Prevent it from surfacing to the console as an Uncaught Error
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }

      console.error('Unhandled Error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
      });
    };
    
    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled Promise Rejection:', event.reason);
    };

    window.addEventListener('error', handleError, { capture: true });
    window.addEventListener('unhandledrejection', handleRejection, { capture: true });

    // Also override console.error to catch string errors if necessary
    const originalConsoleError = console.error;
    console.error = (...args) => {
      if (
        typeof args[0] === 'string' && 
        (args[0].includes('Script error.') || 
         args[0].includes('ResizeObserver loop'))
      ) {
        return;
      }
      originalConsoleError.apply(console, args);
    };

    return () => {
      window.removeEventListener('error', handleError, { capture: true });
      window.removeEventListener('unhandledrejection', handleRejection, { capture: true });
      console.error = originalConsoleError;
    };
  }, []);

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
