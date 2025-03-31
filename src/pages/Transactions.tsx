
import { useState, useMemo } from "react";
import { useExpense, Transaction, TransactionType } from "@/contexts/ExpenseContext";
import { 
  Card, 
  CardContent, 
  CardHeader
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
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  PlusCircle, 
  Search, 
  Edit, 
  Trash, 
  ArrowUpRight, 
  ArrowDownRight,
  CreditCard
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TransactionFilter, { FilterCriteria, SortOption } from "@/components/transactions/TransactionFilter";

const Transactions = () => {
  const { toast } = useToast();
  const { 
    transactions, 
    categories, 
    paymentMethods, 
    addTransaction, 
    updateTransaction, 
    deleteTransaction,
    currencySymbol
  } = useExpense();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TransactionType | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterCriteria>({
    sort: "newest",
    categories: [],
    paymentMethods: []
  });
  
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    amount: 0,
    category: "",
    description: "",
    date: new Date().toISOString().substring(0, 10),
    type: "expense",
    paymentMethod: ""
  });

  // Filter transactions based on search, tab, and filter criteria
  const filteredTransactions = useMemo(() => {
    let result = transactions.filter(transaction => {
      // Filter by tab
      const matchesTab = activeTab === "all" || transaction.type === activeTab;
      
      // Filter by search term
      const matchesSearch = 
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by categories
      const matchesCategory = 
        filters.categories.length === 0 || 
        filters.categories.includes(transaction.category);
      
      // Filter by payment methods
      const matchesPaymentMethod = 
        filters.paymentMethods.length === 0 || 
        (transaction.paymentMethod && filters.paymentMethods.includes(transaction.paymentMethod));
      
      return matchesTab && matchesSearch && matchesCategory && matchesPaymentMethod;
    });

    // Sort the transactions
    result = [...result].sort((a, b) => {
      switch (filters.sort) {
        case "newest":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "amount-high":
          return b.amount - a.amount;
        case "amount-low":
          return a.amount - b.amount;
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

    return result;
  }, [transactions, activeTab, searchTerm, filters]);

  const handleAddTransaction = () => {
    if (!newTransaction.category || !newTransaction.amount) {
      toast({
        title: "Missing fields",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    
    addTransaction(newTransaction as Omit<Transaction, "id">);
    setIsAddDialogOpen(false);
    setNewTransaction({
      amount: 0,
      category: "",
      description: "",
      date: new Date().toISOString().substring(0, 10),
      type: "expense",
      paymentMethod: ""
    });
    
    toast({
      title: "Transaction added",
      description: "Your transaction has been added successfully",
    });
  };

  const handleEditTransaction = () => {
    if (!currentTransaction) return;
    
    updateTransaction(currentTransaction);
    setIsEditDialogOpen(false);
    setCurrentTransaction(null);
    
    toast({
      title: "Transaction updated",
      description: "Your transaction has been updated successfully",
    });
  };

  const handleDeleteTransaction = (id: string) => {
    deleteTransaction(id);
    
    toast({
      title: "Transaction deleted",
      description: "Your transaction has been deleted successfully",
    });
  };

  const handleEdit = (transaction: Transaction) => {
    setCurrentTransaction(transaction);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">
            Manage your financial transactions
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle size={16} />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Transaction</DialogTitle>
              <DialogDescription>
                Enter the details of your transaction
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="type" className="text-sm font-medium">
                    Type
                  </label>
                  <Select
                    defaultValue="expense"
                    onValueChange={(value: TransactionType) => 
                      setNewTransaction({...newTransaction, type: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="amount" className="text-sm font-medium">
                    Amount ({currencySymbol})
                  </label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={newTransaction.amount || ""}
                    onChange={(e) => 
                      setNewTransaction({
                        ...newTransaction, 
                        amount: parseFloat(e.target.value) || 0
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">
                  Category
                </label>
                <Select
                  onValueChange={(value) => 
                    setNewTransaction({...newTransaction, category: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter(c => c.type === newTransaction.type)
                      .map(category => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Input
                  id="description"
                  placeholder="Transaction description"
                  value={newTransaction.description || ""}
                  onChange={(e) => 
                    setNewTransaction({...newTransaction, description: e.target.value})
                  }
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="paymentMethod" className="text-sm font-medium">
                  Payment Method
                </label>
                <Select
                  onValueChange={(value) => 
                    setNewTransaction({...newTransaction, paymentMethod: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method, index) => (
                      <SelectItem key={index} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="date" className="text-sm font-medium">
                  Date
                </label>
                <Input
                  id="date"
                  type="date"
                  value={newTransaction.date || ""}
                  onChange={(e) => 
                    setNewTransaction({...newTransaction, date: e.target.value})
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTransaction}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search transactions..."
                  className="pl-8 w-[200px] sm:w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <TransactionFilter 
                categories={categories} 
                paymentMethods={paymentMethods}
                onFilterChange={setFilters}
                activeFilters={filters}
              />
            </div>
            <Tabs defaultValue="all" className="w-full sm:w-auto" value={activeTab} onValueChange={(value) => setActiveTab(value as TransactionType | "all")}>
              <TabsList className="grid grid-cols-3 w-full sm:w-[360px]">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="income">Income</TabsTrigger>
                <TabsTrigger value="expense">Expenses</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {new Date(transaction.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>{transaction.category}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <CreditCard className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span>{transaction.paymentMethod || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          {transaction.type === "income" ? (
                            <ArrowUpRight className="h-4 w-4 mr-1 text-green-500" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 mr-1 text-red-500" />
                          )}
                          <span
                            className={
                              transaction.type === "income" ? "text-green-500" : "text-red-500"
                            }
                          >
                            {currencySymbol}{transaction.amount.toFixed(2)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(transaction)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteTransaction(transaction.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      No transactions found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>
              Update the details of your transaction
            </DialogDescription>
          </DialogHeader>
          {currentTransaction && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="edit-type" className="text-sm font-medium">
                    Type
                  </label>
                  <Select
                    defaultValue={currentTransaction.type}
                    onValueChange={(value: TransactionType) => 
                      setCurrentTransaction({...currentTransaction, type: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-amount" className="text-sm font-medium">
                    Amount ({currencySymbol})
                  </label>
                  <Input
                    id="edit-amount"
                    type="number"
                    placeholder="0.00"
                    value={currentTransaction.amount || ""}
                    onChange={(e) => 
                      setCurrentTransaction({
                        ...currentTransaction, 
                        amount: parseFloat(e.target.value) || 0
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-category" className="text-sm font-medium">
                  Category
                </label>
                <Select
                  defaultValue={currentTransaction.category}
                  onValueChange={(value) => 
                    setCurrentTransaction({...currentTransaction, category: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter(c => c.type === currentTransaction.type)
                      .map(category => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-description" className="text-sm font-medium">
                  Description
                </label>
                <Input
                  id="edit-description"
                  placeholder="Transaction description"
                  value={currentTransaction.description || ""}
                  onChange={(e) => 
                    setCurrentTransaction({...currentTransaction, description: e.target.value})
                  }
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-paymentMethod" className="text-sm font-medium">
                  Payment Method
                </label>
                <Select
                  defaultValue={currentTransaction.paymentMethod}
                  onValueChange={(value) => 
                    setCurrentTransaction({...currentTransaction, paymentMethod: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method, index) => (
                      <SelectItem key={index} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-date" className="text-sm font-medium">
                  Date
                </label>
                <Input
                  id="edit-date"
                  type="date"
                  value={currentTransaction.date || ""}
                  onChange={(e) => 
                    setCurrentTransaction({...currentTransaction, date: e.target.value})
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditTransaction}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Transactions;
