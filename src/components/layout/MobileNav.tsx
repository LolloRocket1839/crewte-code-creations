import { LayoutDashboard, FolderKanban, Calendar, FileBarChart, Settings } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { cn } from '@/lib/utils';

const navItems = [
  { title: 'Home', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Progetti', url: '/projects', icon: FolderKanban },
  { title: 'Calendario', url: '/calendar', icon: Calendar },
  { title: 'Report', url: '/reports', icon: FileBarChart },
  { title: 'Altro', url: '/settings', icon: Settings },
];

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-background border-t-2 border-foreground z-50 pb-safe-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full py-2 px-2",
              "text-muted-foreground transition-all duration-100",
              "active:scale-95 active:bg-secondary",
              "touch-target"
            )}
            activeClassName="text-foreground bg-secondary border-t-2 border-foreground -mt-0.5"
          >
            <item.icon className="h-5 w-5 mb-1" strokeWidth={2.5} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.title}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
