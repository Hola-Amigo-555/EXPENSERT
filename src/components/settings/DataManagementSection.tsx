
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { Download, Upload, AlertTriangle } from "lucide-react";

interface DataManagementSectionProps {
  onExportData: () => void;
}

const DataManagementSection = ({ onExportData }: DataManagementSectionProps) => {
  const { toast } = useToast();
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    
    input.onchange = e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');
      
      reader.onload = readerEvent => {
        try {
          const content = (readerEvent.target?.result as string);
          const data = JSON.parse(content);
          
          // Import data
          if (data.transactions) 
            localStorage.setItem('expenseTrackerTransactions', JSON.stringify(data.transactions));
          if (data.categories) 
            localStorage.setItem('expenseTrackerCategories', JSON.stringify(data.categories));
          if (data.budgets) 
            localStorage.setItem('expenseTrackerBudgets', JSON.stringify(data.budgets));
          
          toast({
            title: "Success",
            description: "Data imported successfully",
          });
        } catch (error: any) {
          toast({
            variant: "destructive",
            title: "Error",
            description: `Error importing data: ${error.message}`,
          });
        }
      };
    };
    
    input.click();
  };

  const handleClearData = () => {
    // Clear all data
    localStorage.removeItem('expenseTrackerTransactions');
    localStorage.removeItem('expenseTrackerCategories');
    localStorage.removeItem('expenseTrackerBudgets');
    
    // Reinitialize with default categories
    const defaultIncomeCategories = [
      { id: '1', type: 'income', name: 'Salary', color: '#10b981', icon: 'money-bill-wave' },
      { id: '2', type: 'income', name: 'Freelance', color: '#3b82f6', icon: 'laptop-code' },
      { id: '3', type: 'income', name: 'Investments', color: '#f59e0b', icon: 'chart-line' }
    ];
    
    const defaultExpenseCategories = [
      { id: '4', type: 'expense', name: 'Food', color: '#ef4444', icon: 'utensils' },
      { id: '5', type: 'expense', name: 'Transportation', color: '#6366f1', icon: 'car' },
      { id: '6', type: 'expense', name: 'Housing', color: '#8b5cf6', icon: 'home' },
      { id: '7', type: 'expense', name: 'Entertainment', color: '#ec4899', icon: 'film' },
      { id: '8', type: 'expense', name: 'Shopping', color: '#f97316', icon: 'shopping-bag' },
      { id: '9', type: 'expense', name: 'Utilities', color: '#14b8a6', icon: 'bolt' }
    ];
    
    localStorage.setItem(
      'expenseTrackerCategories',
      JSON.stringify([...defaultIncomeCategories, ...defaultExpenseCategories])
    );
    
    setIsAlertOpen(false);
    
    toast({
      title: "Data Cleared",
      description: "All data has been cleared successfully",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Management</CardTitle>
        <CardDescription>
          Import, export, or clear your financial data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={onExportData}
          >
            <Download size={16} />
            Export Data
          </Button>
          
          <Button 
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleImportData}
          >
            <Upload size={16} />
            Import Data
          </Button>
        </div>
        
        <div className="pt-4 border-t border-border">
          <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                className="w-full flex items-center gap-2"
              >
                <AlertTriangle size={16} />
                Clear All Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all your 
                  transactions, categories, and budget data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearData}>
                  Yes, clear all data
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataManagementSection;
