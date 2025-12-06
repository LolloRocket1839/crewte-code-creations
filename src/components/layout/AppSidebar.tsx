import { LayoutDashboard, FolderKanban, Calendar, FileBarChart, LogOut } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/hooks/useAuth';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Projects', url: '/projects', icon: FolderKanban },
  { title: 'Calendar', url: '/calendar', icon: Calendar },
  { title: 'Reports', url: '/reports', icon: FileBarChart },
];

export function AppSidebar() {
  const { signOut, user } = useAuth();

  return (
    <Sidebar className="border-r-2 border-sidebar-border">
      <SidebarHeader className="p-6 border-b-2 border-sidebar-border">
        <h1 className="text-xl font-bold uppercase tracking-wider text-sidebar-foreground">TaskFlow</h1>
        <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">Expense Tracker</p>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 text-sidebar-foreground",
                        "border-2 border-transparent",
                        "transition-all duration-100",
                        "hover:border-sidebar-border hover:bg-sidebar-accent",
                        "active:translate-x-0.5 active:translate-y-0.5",
                        "touch-target"
                      )}
                      activeClassName="border-sidebar-border bg-sidebar-accent font-bold shadow-brutal-sm"
                    >
                      <item.icon className="h-5 w-5" strokeWidth={2.5} />
                      <span className="uppercase tracking-wide text-sm">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t-2 border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="h-10 w-10 border-2 border-foreground bg-secondary flex items-center justify-center">
            <span className="text-sm font-bold uppercase">
              {user?.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-sidebar-foreground truncate uppercase tracking-wide">
              {user?.email?.split('@')[0]}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={signOut}
            className="h-10 w-10 border-2 border-transparent hover:border-foreground"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
