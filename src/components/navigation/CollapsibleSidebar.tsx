
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
  User,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navigationItems = [
  { name: "Dashboard", path: "/dashboard", icon: Home },
  { name: "Transactions", path: "/transactions", icon: Receipt },
  { name: "Categories", path: "/categories", icon: Tag },
  { name: "Budgets", path: "/budgets", icon: Wallet },
  { name: "Reports", path: "/reports", icon: PieChart },
  { name: "Settings", path: "/settings", icon: Settings },
];

interface CollapsibleSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const CollapsibleSidebar = ({ isCollapsed, setIsCollapsed }: CollapsibleSidebarProps) => {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem("sidebarCollapsed", isCollapsed.toString());
    }
  }, [isCollapsed, isMobile]);

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
    localStorage.removeItem('expenseTrackerUser');
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    window.location.href = '/login';
  };

  const userDataJSON = localStorage.getItem('expenseTrackerUser');
  const userData = userDataJSON ? JSON.parse(userDataJSON) : null;
  const userName = userData?.name || 'User';
  const userEmail = userData?.email || 'user@example.com';

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

      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={sidebarClasses}>
        <div className="p-4 flex items-center justify-between border-b">
          <h1
            className={cn("font-bold text-lg transition-opacity duration-300", {
              "opacity-0 w-0": isCollapsed,
              "opacity-100": !isCollapsed,
            })}
          >
            ExTrack
          </h1>
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapse}
              className="shrink-0 cursor-pointer"
            >
              <ChevronLeft
                className={cn("h-4 w-4 transition-transform cursor-pointer", {
                  "rotate-180": isCollapsed,
                })}
                onClick={(e) => {
                  // Ensure the click event still triggers even when clicking directly on the icon
                  e.stopPropagation();
                  toggleCollapse();
                }}
              />
            </Button>
          )}
        </div>
        
        <div className={cn("p-4 border-b", {
          "flex justify-center": isCollapsed,
          "": !isCollapsed
        })}>
          {isCollapsed ? (
            <Avatar className="h-9 w-9">
              <AvatarImage src={userData?.avatar} alt={userName} />
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="flex items-center space-x-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={userData?.avatar} alt={userName} />
                <AvatarFallback>
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{userName}</p>
                <p className="text-xs text-muted-foreground">{userEmail}</p>
              </div>
            </div>
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
