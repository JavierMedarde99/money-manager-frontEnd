import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  ArrowRightLeft,
  FolderOpen,
  CreditCard,
  LogOut,
  Menu,
  X,
  DollarSign,
  User,
} from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/transactions", label: "Transacciones", icon: ArrowRightLeft },
  { to: "/categories", label: "Categorías", icon: FolderOpen },
  { to: "/debts", label: "Deudas", icon: CreditCard },
];

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "U";

  const sidebarContent = (
    <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-5">
        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center shadow-primary shrink-0">
          <DollarSign className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold text-primary whitespace-nowrap">
            Money Manager
          </span>
        )}
      </div>

      <Separator className="mx-4" />

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                isActive
                  ? "bg-primary text-white shadow-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-card-foreground"
              } ${collapsed ? "justify-center" : ""}`
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <Separator className="mx-4" />

      {/* User section */}
      <div className={`p-4 flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
        <button
          onClick={() => { navigate("/profile"); setMobileOpen(false); }}
          className={`flex items-center gap-3 ${collapsed ? "justify-center" : "flex-1 min-w-0"} group`}
        >
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{user?.username}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          )}
          {!collapsed && (
            <User className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
          )}
        </button>
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="shrink-0 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-[60] lg:hidden h-10 w-10 rounded-full bg-card border border-border shadow-lg flex items-center justify-center"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-[55] lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed top-0 left-0 z-[60] h-full w-64 bg-card border-r border-border transition-transform duration-300 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed top-0 left-0 h-screen bg-card border-r border-border transition-all duration-300 z-[60] ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {sidebarContent}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-7 h-6 w-6 rounded-full bg-card border border-border shadow-md flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
        >
          <Menu className="h-3 w-3" />
        </button>
      </aside>
    </>
  );
}
