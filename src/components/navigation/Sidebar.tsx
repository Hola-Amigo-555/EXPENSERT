
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ListOrdered,
  Folder,
  PieChart,
  LineChart,
  CreditCard,
  Settings,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  closeSidebar?: () => void;
}

const Sidebar = ({ closeSidebar }: SidebarProps) => {
  const location = useLocation();

  const navItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      name: "Transactions",
      href: "/transactions",
      icon: ListOrdered,
    },
    {
      name: "Categories",
      href: "/categories",
      icon: Folder,
    },
    {
      name: "Budgets",
      href: "/budgets",
      icon: CreditCard,
    },
    {
      name: "Reports",
      href: "/reports",
      icon: LineChart,
    },
  ];

  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      <div className="flex items-center justify-center h-16 border-b border-sidebar-border">
        <Link to="/" className="text-xl font-bold text-primary">
          ExpenseTracker
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-2 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-md group transition-colors hover:bg-sidebar-accent",
                  isActive
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "text-sidebar-foreground"
                )}
                onClick={closeSidebar}
              >
                <item.icon
                  className={cn(
                    "flex-shrink-0 w-5 h-5 mr-3",
                    isActive
                      ? "text-white"
                      : "text-sidebar-foreground group-hover:text-sidebar-foreground"
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex flex-col space-y-2">
          <button className="flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-sidebar-accent text-sidebar-foreground">
            <Settings className="flex-shrink-0 w-5 h-5 mr-3 text-sidebar-foreground" />
            Settings
          </button>
          <button className="flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-sidebar-accent text-sidebar-foreground">
            <LogOut className="flex-shrink-0 w-5 h-5 mr-3 text-sidebar-foreground" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
