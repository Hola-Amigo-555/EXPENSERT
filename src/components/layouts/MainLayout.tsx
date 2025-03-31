
import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import CollapsibleSidebar from "@/components/navigation/CollapsibleSidebar";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function MainLayout() {
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load collapsed state from local storage
  useEffect(() => {
    if (!isMobile) {
      const savedState = localStorage.getItem("sidebarCollapsed");
      if (savedState !== null) {
        setIsCollapsed(savedState === "true");
      } else {
        setIsCollapsed(false); // Default to expanded
      }
    }
  }, [isMobile]);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <CollapsibleSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
      <main 
        className={cn(
          "flex-1 overflow-y-auto p-4 md:p-6 transition-all duration-300", 
          {
            "ml-0": isMobile,
            "ml-[60px]": isCollapsed && !isMobile,
            "ml-[240px]": !isCollapsed && !isMobile,
          }
        )}
      >
        <Outlet />
      </main>
      
      <Toaster />
    </div>
  );
}
