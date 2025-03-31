import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import {
  LayoutDashboard,
  ListOrdered,
  Folder,
  LineChart,
  CreditCard,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SidebarProps {
  closeSidebar?: () => void;
}

const Sidebar = ({ closeSidebar }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = () => {
    localStorage.removeItem('expenseTrackerUser');
    
    toast({
      title: "Success",
      description: "Signed out successfully",
    });
    
    window.location.href = "/login";
  };

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
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
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  const userDataJSON = localStorage.getItem('expenseTrackerUser');
  const userData = userDataJSON ? JSON.parse(userDataJSON) : null;
  const userName = userData?.name || 'User';

  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      <div className="flex items-center justify-center h-16 border-b border-sidebar-border">
        <Link to="/dashboard" className="text-xl font-bold text-primary">
          ExTrack
        </Link>
      </div>
      
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
            {userData?.avatar ? (
              <img src={userData.avatar} alt={userName} className="w-full h-full rounded-full object-cover" />
            ) : (
              <User size={20} />
            )}
          </div>
          <div>
            <p className="font-medium text-sidebar-foreground">{userName}</p>
            <p className="text-xs text-muted-foreground">{userData?.email || 'user@example.com'}</p>
          </div>
        </div>
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
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button 
                className="flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-sidebar-accent text-sidebar-foreground"
              >
                <LogOut className="flex-shrink-0 w-5 h-5 mr-3 text-sidebar-foreground" />
                Sign Out
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Sign Out</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to sign out? Any unsaved changes will be lost.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleSignOut}>Sign Out</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
