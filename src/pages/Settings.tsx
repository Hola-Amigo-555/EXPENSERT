
import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import ProfileSection from "@/components/settings/ProfileSection";
import PreferencesSection from "@/components/settings/PreferencesSection";
import DataManagementSection from "@/components/settings/DataManagementSection";
import SecuritySection from "@/components/settings/SecuritySection";
import { useToast } from "@/components/ui/use-toast";

const Settings = () => {
  const { toast } = useToast();
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    avatar: null as string | null
  });
  const [currency, setCurrency] = useState("₹");
  const [darkMode, setDarkMode] = useState(false);

  // Get user data on component mount
  useEffect(() => {
    const userDataJSON = localStorage.getItem('expenseTrackerUser');
    if (userDataJSON) {
      const userData = JSON.parse(userDataJSON);
      setUserData({
        name: userData.name || "",
        email: userData.email || "",
        avatar: userData.avatar || null
      });
    }
    
    // Get currency preference
    const savedCurrency = localStorage.getItem('currency');
    if (savedCurrency) {
      setCurrency(savedCurrency);
    }
    
    // Get dark mode preference
    const darkModePreference = localStorage.getItem('darkMode') === 'true';
    setDarkMode(darkModePreference);
  }, []);

  const handleProfileUpdate = (updatedUserData) => {
    // Get current user data
    const userDataJSON = localStorage.getItem('expenseTrackerUser');
    if (!userDataJSON) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User data not found",
      });
      return;
    }
    
    const currentUserData = JSON.parse(userDataJSON);
    const updatedUser = { ...currentUserData, ...updatedUserData };
    
    // Update user in localStorage
    localStorage.setItem('expenseTrackerUser', JSON.stringify(updatedUser));
    
    // Update user in users array
    const usersJSON = localStorage.getItem('expenseTrackerUsers');
    if (usersJSON) {
      const users = JSON.parse(usersJSON);
      const userIndex = users.findIndex((u) => u.id === currentUserData.id);
      
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updatedUserData };
        localStorage.setItem('expenseTrackerUsers', JSON.stringify(users));
      }
    }
    
    setUserData(prevData => ({ ...prevData, ...updatedUserData }));
    
    toast({
      title: "Success",
      description: "Profile updated successfully",
    });
  };

  const handleCurrencyChange = (value: string) => {
    setCurrency(value);
    localStorage.setItem('currency', value);
    toast({
      title: "Currency Updated",
      description: `Currency set to ${value}`,
    });
  };

  const handleDarkModeToggle = (checked: boolean) => {
    setDarkMode(checked);
    localStorage.setItem('darkMode', checked.toString());
    document.body.classList.toggle('dark-mode', checked);
    toast({
      title: checked ? "Dark Mode Enabled" : "Light Mode Enabled",
      description: checked ? "Dark mode has been activated" : "Light mode has been activated",
    });
  };

  const handleExportData = () => {
    const exportData = {
      transactions: localStorage.getItem('expenseTrackerTransactions') ? 
        JSON.parse(localStorage.getItem('expenseTrackerTransactions')!) : [],
      categories: localStorage.getItem('expenseTrackerCategories') ? 
        JSON.parse(localStorage.getItem('expenseTrackerCategories')!) : [],
      budgets: localStorage.getItem('expenseTrackerBudgets') ? 
        JSON.parse(localStorage.getItem('expenseTrackerBudgets')!) : [],
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'expense-tracker-data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Data Exported",
      description: "Your data has been exported successfully",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ProfileSection userData={userData} onProfileUpdate={handleProfileUpdate} />
        
        <div className="space-y-6">
          <PreferencesSection 
            currency={currency}
            darkMode={darkMode}
            onCurrencyChange={handleCurrencyChange}
            onDarkModeToggle={handleDarkModeToggle}
            onExportData={handleExportData}
          />
          
          <Separator className="my-4" />
          
          <SecuritySection />
          
          <Separator className="my-4" />
          
          <DataManagementSection 
            onExportData={handleExportData}
          />
        </div>
      </div>
    </div>
  );
};

export default Settings;
