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
        <div className="h-11 w-11 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-lg shrink-0">
          <DollarSign className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <span className="font-display text-lg font-bold text-white whitespace-nowrap block leading-tight">
              Money Manager
            </span>
            <span className="text-[11px] text-white/60 font-medium tracking-wide uppercase">
              Candy 2.0
            </span>
          </div>
        )}
      </div>

      <Separator className="mx-4 bg-white/15" />

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                isActive
                  ? "bg-white/20 text-white shadow-lg backdrop-blur-md border border-white/25"
                  : "text-white/75 hover:bg-white/10 hover:text-white border border-transparent"
              } ${collapsed ? "justify-center" : ""}`
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <Separator className="mx-4 bg-white/15" />

      {/* User section */}
      <div className={`p-4 flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
        <button
          onClick={() => { navigate("/profile"); setMobileOpen(false); }}
          className={`flex items-center gap-3 ${collapsed ? "justify-center" : "flex-1 min-w-0"} group`}
        >
          <Avatar className="h-10 w-10 shrink-0 ring-2 ring-white/40">
            <AvatarFallback className="text-xs bg-white/20 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-bold text-white truncate group-hover:text-primary-200 transition-colors">
                {user?.username}
              </p>
              <p className="text-xs text-white/60 truncate">{user?.email}</p>
            </div>
          )}
          {!collapsed && (
            <User className="h-4 w-4 text-white/60 group-hover:text-primary-200 transition-colors shrink-0" />
          )}
        </button>
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="shrink-0 text-white/70 hover:text-white hover:bg-white/10"
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
        className={`fixed top-0 left-0 z-[60] h-full w-64 transition-transform duration-300 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="sidebar-gradient h-full shadow-2xl">{sidebarContent}</div>
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed top-0 left-0 h-screen transition-all duration-300 z-[60] ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="sidebar-gradient h-full shadow-2xl">
          {sidebarContent}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-7 h-6 w-6 rounded-full bg-white border border-white/50 shadow-md flex items-center justify-center text-secondary hover:text-primary transition-colors"
          >
            <Menu className="h-3 w-3" />
          </button>
        </div>
      </aside>
    </>
  );
}
