import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { MobileNav } from './MobileNav';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
}

export function AppLayout({ children, title }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <AppSidebar />
        </div>
        
        <main className="flex-1 flex flex-col pb-20 md:pb-0">
          {/* Header */}
          <header className="h-14 md:h-16 border-b-2 border-foreground flex items-center px-4 md:px-6 bg-card sticky top-0 z-40">
            <SidebarTrigger className="mr-4 hidden md:flex border-2 border-foreground p-2 hover:bg-foreground hover:text-background transition-colors touch-target" />
            {title && (
              <h1 className="text-base md:text-xl font-bold uppercase tracking-wide text-foreground truncate">
                {title}
              </h1>
            )}
          </header>
          
          {/* Content */}
          <div className="flex-1 p-4 md:p-6 overflow-auto page-enter">
            {children}
          </div>
        </main>
        
        {/* Mobile Bottom Navigation */}
        <MobileNav />
      </div>
    </SidebarProvider>
  );
}
