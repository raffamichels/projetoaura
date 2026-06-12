import { Sidebar } from '@/components/dashboard/Sidebar';
import { HeaderWrapper } from '@/components/dashboard/HeaderWrapper';
import { InstallPWA } from '@/components/pwa/InstallPWA';
import { Toaster } from 'sonner';
import { NotificationProvider } from '@/contexts/NotificationContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NotificationProvider>
      <div className="h-screen flex flex-col overflow-hidden bg-background text-ink">
        {/* Topbar full-width */}
        <HeaderWrapper />

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar - Desktop */}
          <Sidebar />

          {/* Page Content */}
          <main className="flex-1 overflow-auto scroll-container">
            {children}
          </main>
        </div>

        {/* Toast Notifications */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--surface)',
              color: 'var(--ink)',
              border: '1px solid var(--border)',
            },
            className: 'sonner-toast',
          }}
          richColors
        />

        {/* PWA Install Prompt */}
        <InstallPWA />
      </div>
    </NotificationProvider>
  );
}
