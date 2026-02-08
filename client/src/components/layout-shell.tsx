import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  FileText, 
  GraduationCap, 
  Calendar, 
  Settings, 
  LogOut,
  Menu,
  X,
  CreditCard,
  Building2
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Document Requests", href: "/requests", icon: FileText },
    { label: "Grade Petitions", href: "/petitions", icon: GraduationCap },
    { label: "Major Declaration", href: "/majors", icon: Building2 },
    { label: "Academic Calendar", href: "/calendar", icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
        <div className="font-display font-bold text-lg flex items-center gap-2">
          <Building2 className="w-6 h-6 text-secondary" />
          LUMS Registrar
        </div>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="text-primary-foreground hover:bg-primary/80">
          {sidebarOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Sidebar Navigation */}
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
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}>
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
              <p className="text-sm font-semibold truncate">{user?.fullName}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role || "User"}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2 border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
            onClick={() => logout()}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-background/50 relative">
        <div className="max-w-7xl mx-auto p-4 md:p-8 animate-slide-in">
          {children}
        </div>
      </main>
    </div>
  );
}
