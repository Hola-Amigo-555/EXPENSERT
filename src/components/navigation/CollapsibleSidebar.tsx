
import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  PieChart,
  Receipt,
  Tag,
  Wallet,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const navigationItems = [
  { name: "Dashboard", path: "/dashboard", icon: Home },
  { name: "Transactions", path: "/transactions", icon: Receipt },
  { name: "Categories", path: "/categories", icon: Tag },
  { name: "Budgets", path: "/budgets", icon: Wallet },
  { name: "Reports", path: "/reports", icon: PieChart },
  { name: "Settings", path: "/settings", icon: Settings },
];

const CollapsibleSidebar = () => {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  // Load collapsed state from local storage
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    if (savedState !== null) {
      setIsCollapsed(savedState === "true");
    }
  }, []);

  // Save collapsed state to local storage
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", isCollapsed.toString());
  }, [isCollapsed]);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [location.pathname, isMobile]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    // Clear user data from local storage
    localStorage.removeItem('expenseTrackerUser');
    
    // Show toast
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    
    // Redirect to login page
    window.location.href = '/login';
  };

  const sidebarClasses = cn(
    "flex flex-col h-screen bg-background border-r transition-all duration-300 z-20",
    {
      "w-[240px]": !isCollapsed,
      "w-[60px]": isCollapsed,
      "fixed left-0 top-0": isMobile,
      "translate-x-0": isOpen && isMobile,
      "-translate-x-full": !isOpen && isMobile,
    }
  );

  const sidebarContentClasses = cn("flex flex-col flex-1 overflow-y-auto", {
    "items-center": isCollapsed,
    "items-start": !isCollapsed,
  });

  return (
    <>
      {/* Mobile Menu Toggle */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-30"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {/* Sidebar Backdrop (Mobile) */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div 
        className={sidebarClasses}
        onMouseEnter={() => !isMobile && setIsCollapsed(false)}
        onMouseLeave={() => !isMobile && setIsCollapsed(true)}
      >
        <div className="p-4 flex items-center justify-between border-b">
          <h1
            className={cn("font-bold text-lg transition-opacity duration-300", {
              "opacity-0 w-0": isCollapsed,
              "opacity-100": !isCollapsed,
            })}
          >
            Expense Tracker
          </h1>
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapse}
              className="shrink-0"
            >
              <ChevronLeft
                className={cn("h-4 w-4 transition-transform", {
                  "rotate-180": isCollapsed,
                })}
              />
            </Button>
          )}
        </div>

        <nav className={sidebarContentClasses}>
          <ul className="space-y-1 w-full px-2 pt-4">
            {navigationItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                      {
                        "justify-center": isCollapsed,
                        "bg-primary/10 text-primary": isActive,
                        "hover:bg-muted": !isActive,
                      }
                    )
                  }
                  title={isCollapsed ? item.name : undefined}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span
                    className={cn("transition-opacity duration-300", {
                      "opacity-0 w-0 overflow-hidden": isCollapsed,
                      "opacity-100": !isCollapsed,
                    })}
                  >
                    {item.name}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div
          className={cn("p-4 border-t mt-auto", {
            "flex justify-center": isCollapsed,
          })}
        >
          <Button
            variant="outline"
            className={cn("w-full", {
              "p-2 w-auto": isCollapsed,
            })}
            onClick={() => setIsLogoutDialogOpen(true)}
          >
            <LogOut className={cn("h-4 w-4", { "mr-2": !isCollapsed })} />
            <span
              className={cn("transition-opacity duration-300", {
                "opacity-0 w-0 overflow-hidden": isCollapsed,
                "opacity-100": !isCollapsed,
              })}
            >
              Sign Out
            </span>
          </Button>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog
        open={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be logged out of your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>Log Out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CollapsibleSidebar;
