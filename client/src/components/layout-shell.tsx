import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  FileText, 
  GraduationCap, 
  Calendar, 
  LogOut,
  Menu,
  X,
  Building2
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const allNavItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard, roles: ["student", "instructor", "admin"] },
    { label: "Document Requests", href: "/requests", icon: FileText, roles: ["student", "admin"] },
    { label: "Grade Petitions", href: "/petitions", icon: GraduationCap, roles: ["instructor", "admin"] },
    { label: "Major Declaration", href: "/majors", icon: Building2, roles: ["student", "admin"] },
    { label: "Academic Calendar", href: "/calendar", icon: Calendar, roles: ["student", "instructor", "admin"] },
  ];

  const navItems = allNavItems.filter(item => user?.role && item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans">
      <div className="md:hidden flex items-center justify-between p-4 bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
        <div className="font-display font-bold text-lg flex items-center gap-2">
          <Building2 className="w-6 h-6 text-secondary" />
          LUMS Registrar
        </div>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="text-primary-foreground hover:bg-primary/80" data-testid="button-mobile-menu">
          {sidebarOpen ? <X /> : <Menu />}
        </Button>
      </div>

      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen flex flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3 font-display font-bold text-2xl text-primary">
            <Building2 className="w-8 h-8 text-secondary" />
            <span>RO Portal</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2 font-medium">Registrar Office Management</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 group font-medium",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                  : "text-muted-foreground hover-elevate"
              )} data-testid={`link-nav-${item.href.replace('/', '') || 'dashboard'}`}>
                <item.icon className={cn("w-5 h-5", isActive ? "text-secondary" : "group-hover:text-primary")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border bg-muted/20">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {user?.fullName?.charAt(0) || "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate" data-testid="text-user-name">{user?.fullName}</p>
              <p className="text-xs text-muted-foreground capitalize" data-testid="text-user-role">{user?.role || "User"}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2 border-destructive/20 text-destructive"
            onClick={() => logout()}
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 overflow-y-auto bg-background/50 relative">
        <div className="max-w-7xl mx-auto p-4 md:p-8 animate-slide-in">
          {children}
        </div>
      </main>
    </div>
  );
}
