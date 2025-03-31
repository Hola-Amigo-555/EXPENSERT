
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { User, Edit } from "lucide-react";

const Settings = () => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [currency, setCurrency] = useState("₹");
  const [darkMode, setDarkMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Get user data on component mount
  useEffect(() => {
    const userDataJSON = localStorage.getItem('expenseTrackerUser');
    if (userDataJSON) {
      const userData = JSON.parse(userDataJSON);
      setName(userData.name || "");
      setEmail(userData.email || "");
      setAvatar(userData.avatar || null);
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

  const handleProfileUpdate = () => {
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
    
    const userData = JSON.parse(userDataJSON);
    const updatedUser = { ...userData, name, email, avatar };
    
    // Update user in localStorage
    localStorage.setItem('expenseTrackerUser', JSON.stringify(updatedUser));
    
    // Update user in users array
    const usersJSON = localStorage.getItem('expenseTrackerUsers');
    if (usersJSON) {
      const users = JSON.parse(usersJSON);
      const userIndex = users.findIndex((u: any) => u.id === userData.id);
      
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], name, email, avatar };
        localStorage.setItem('expenseTrackerUsers', JSON.stringify(users));
      }
    }
    
    setIsEditing(false);
    
    toast({
      title: "Success",
      description: "Profile updated successfully",
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
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
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Manage your personal information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                  {avatar ? (
                    <img 
                      src={avatar} 
                      alt={name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <User size={40} />
                  )}
                </div>
                {isEditing && (
                  <div className="absolute bottom-0 right-0">
                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                      <div className="bg-primary text-white p-2 rounded-full">
                        <Edit size={16} />
                      </div>
                    </Label>
                    <Input 
                      id="avatar-upload" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleAvatarChange}
                    />
                  </div>
                )}
              </div>
              
              {isEditing ? (
                <div className="w-full space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input 
                      id="name" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleProfileUpdate}>Save Changes</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="w-full space-y-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{email}</p>
                  </div>
                  <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Preferences Section */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>
              Customize your application settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="currency">Currency</Label>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred currency
                </p>
              </div>
              <Select value={currency} onValueChange={handleCurrencyChange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="₹">₹ (INR)</SelectItem>
                  <SelectItem value="$">$ (USD)</SelectItem>
                  <SelectItem value="€">€ (EUR)</SelectItem>
                  <SelectItem value="£">£ (GBP)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Enable dark theme for the application
                </p>
              </div>
              <Switch 
                id="dark-mode" 
                checked={darkMode} 
                onCheckedChange={handleDarkModeToggle} 
              />
            </div>

            <Separator />
            
            <div className="pt-4">
              <Button variant="outline" onClick={handleExportData} className="w-full">
                Export Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
