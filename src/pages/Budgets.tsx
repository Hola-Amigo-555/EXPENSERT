
import { useState } from "react";
import { useExpense, Budget } from "@/contexts/ExpenseContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  PlusCircle, 
  Edit, 
  Trash, 
  AlertCircle
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";

const Budgets = () => {
  const { toast } = useToast();
  const { 
    budgets, 
    categories, 
    transactions, 
    addBudget, 
    updateBudget, 
    deleteBudget,
    getTransactionsByMonth,
    currencySymbol
  } = useExpense();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);
  const [newBudget, setNewBudget] = useState<Omit<Budget, "id">>({
    category: "",
    amount: 0,
    period: "monthly"
  });

  // Get the expense categories
  const expenseCategories = categories.filter(c => c.type === "expense");

  // Calculate current month's spending for each budget
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const currentMonthTransactions = getTransactionsByMonth(currentMonth, currentYear);

  const budgetWithProgress = budgets.map(budget => {
    const spent = currentMonthTransactions
      .filter(t => t.type === "expense" && t.category === budget.category)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const percentage = (spent / budget.amount) * 100;
    const status = percentage <= 50 ? "normal" : percentage <= 80 ? "warning" : "danger";
    const remaining = budget.amount - spent;
    
    return {
      ...budget,
      spent,
      percentage,
      remaining,
      status
    };
  });

  const handleAddBudget = () => {
    if (!newBudget.category || !newBudget.amount) {
      toast({
        title: "Missing fields",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    
    // Check if budget already exists for this category
    if (budgets.some(b => b.category === newBudget.category)) {
      toast({
        title: "Budget exists",
        description: "A budget for this category already exists",
        variant: "destructive"
      });
      return;
    }
    
    addBudget(newBudget);
    setIsAddDialogOpen(false);
    setNewBudget({
      category: "",
      amount: 0,
      period: "monthly"
    });
    
    toast({
      title: "Budget added",
      description: "Your budget has been added successfully",
    });
  };

  const handleEditBudget = () => {
    if (!currentBudget) return;
    
    if (!currentBudget.category || !currentBudget.amount) {
      toast({
        title: "Missing fields",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    
    // Check if budget already exists for this category (excluding current one)
    if (budgets.some(b => 
      b.id !== currentBudget.id && b.category === currentBudget.category
    )) {
      toast({
        title: "Budget exists",
        description: "A budget for this category already exists",
        variant: "destructive"
      });
      return;
    }
    
    updateBudget(currentBudget);
    setIsEditDialogOpen(false);
    setCurrentBudget(null);
    
    toast({
      title: "Budget updated",
      description: "Your budget has been updated successfully",
    });
  };

  const handleDeleteBudget = (id: string) => {
    deleteBudget(id);
    
    toast({
      title: "Budget deleted",
      description: "Your budget has been deleted successfully",
    });
  };

  const handleEdit = (budget: Budget) => {
    setCurrentBudget(budget);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Budgets</h1>
          <p className="text-muted-foreground">
            Manage your spending limits
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle size={16} />
              Add Budget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Budget</DialogTitle>
              <DialogDescription>
                Set a spending limit for a category
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">
                  Category
                </label>
                <Select
                  onValueChange={(value) => 
                    setNewBudget({...newBudget, category: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map(category => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="amount" className="text-sm font-medium">
                  Budget Amount ({currencySymbol})
                </label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={newBudget.amount || ""}
                  onChange={(e) => 
                    setNewBudget({
                      ...newBudget, 
                      amount: parseFloat(e.target.value) || 0
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="period" className="text-sm font-medium">
                  Period
                </label>
                <Select
                  defaultValue="monthly"
                  onValueChange={(value: "monthly" | "yearly") => 
                    setNewBudget({...newBudget, period: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddBudget}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {budgetWithProgress.map((budget) => (
          <Card key={budget.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle>{budget.category}</CardTitle>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEdit(budget)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDeleteBudget(budget.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)} budget
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>
                    {currencySymbol}{budget.spent.toFixed(2)} of {currencySymbol}{budget.amount.toFixed(2)}
                  </span>
                  <span className="font-medium">
                    {budget.percentage.toFixed(0)}%
                  </span>
                </div>
                <Progress 
                  value={budget.percentage} 
                  max={100} 
                  className={
                    budget.status === "normal" 
                      ? "bg-muted" 
                      : budget.status === "warning" 
                        ? "bg-amber-100" 
                        : "bg-red-100"
                  }
                  indicatorClassName={
                    budget.status === "normal" 
                      ? "bg-primary" 
                      : budget.status === "warning" 
                        ? "bg-amber-500" 
                        : "bg-red-500"
                  }
                />
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <div className="w-full flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Remaining</span>
                <span className={`font-medium ${
                  budget.status === "danger" ? "text-red-500" : ""
                }`}>
                  {currencySymbol}{budget.remaining.toFixed(2)}
                </span>
              </div>
            </CardFooter>
            {budget.status === "danger" && (
              <div className="bg-red-50 px-4 py-2 border-t flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-xs text-red-500">Over budget limit</span>
              </div>
            )}
          </Card>
        ))}
        
        {budgetWithProgress.length === 0 && (
          <Card className="col-span-full flex items-center justify-center p-8">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                No budgets found. Create your first budget to track spending limits.
              </p>
              <Button 
                variant="outline" 
                onClick={() => setIsAddDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <PlusCircle size={16} />
                Add Budget
              </Button>
            </div>
          </Card>
        )}
      </div>
      
      {/* Edit Budget Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Budget</DialogTitle>
            <DialogDescription>
              Update your spending limit
            </DialogDescription>
          </DialogHeader>
          {currentBudget && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label htmlFor="edit-category" className="text-sm font-medium">
                  Category
                </label>
                <Select
                  defaultValue={currentBudget.category}
                  onValueChange={(value) => 
                    setCurrentBudget({...currentBudget, category: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map(category => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-amount" className="text-sm font-medium">
                  Budget Amount ({currencySymbol})
                </label>
                <Input
                  id="edit-amount"
                  type="number"
                  placeholder="0.00"
                  value={currentBudget.amount || ""}
                  onChange={(e) => 
                    setCurrentBudget({
                      ...currentBudget, 
                      amount: parseFloat(e.target.value) || 0
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-period" className="text-sm font-medium">
                  Period
                </label>
                <Select
                  defaultValue={currentBudget.period}
                  onValueChange={(value: "monthly" | "yearly") => 
                    setCurrentBudget({...currentBudget, period: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditBudget}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Budgets;
