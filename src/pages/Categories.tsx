
import { useState } from "react";
import { useExpense, Category, TransactionType } from "@/contexts/ExpenseContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
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
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
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
  ArrowUpRight, 
  ArrowDownRight, 
  Palette 
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const categoryColors = [
  "#0EA5E9", // Blue
  "#8B5CF6", // Purple
  "#F43F5E", // Pink
  "#10B981", // Emerald
  "#F97316", // Orange
  "#EC4899", // Magenta
  "#14B8A6", // Teal
  "#6366F1", // Indigo
  "#EF4444", // Red
  "#F59E0B", // Amber
];

const Categories = () => {
  const { toast } = useToast();
  const { categories, addCategory, updateCategory, deleteCategory, transactions } = useExpense();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TransactionType | "all">("all");
  
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState<Omit<Category, "id">>({
    name: "",
    type: "expense",
    color: categoryColors[0]
  });

  // Filter categories based on tab
  const filteredCategories = categories.filter(category => 
    activeTab === "all" || category.type === activeTab
  );

  const handleAddCategory = () => {
    if (!newCategory.name) {
      toast({
        title: "Missing name",
        description: "Please enter a category name",
        variant: "destructive"
      });
      return;
    }
    
    // Check if category already exists
    if (categories.some(c => c.name.toLowerCase() === newCategory.name.toLowerCase() && c.type === newCategory.type)) {
      toast({
        title: "Category exists",
        description: "A category with this name already exists",
        variant: "destructive"
      });
      return;
    }
    
    addCategory(newCategory);
    setIsAddDialogOpen(false);
    setNewCategory({
      name: "",
      type: "expense",
      color: categoryColors[0]
    });
    
    toast({
      title: "Category added",
      description: "Your category has been added successfully",
    });
  };

  const handleEditCategory = () => {
    if (!currentCategory) return;
    
    if (!currentCategory.name) {
      toast({
        title: "Missing name",
        description: "Please enter a category name",
        variant: "destructive"
      });
      return;
    }
    
    // Check if category already exists (excluding current one)
    if (categories.some(c => 
      c.id !== currentCategory.id && 
      c.name.toLowerCase() === currentCategory.name.toLowerCase() && 
      c.type === currentCategory.type
    )) {
      toast({
        title: "Category exists",
        description: "A category with this name already exists",
        variant: "destructive"
      });
      return;
    }
    
    updateCategory(currentCategory);
    setIsEditDialogOpen(false);
    setCurrentCategory(null);
    
    toast({
      title: "Category updated",
      description: "Your category has been updated successfully",
    });
  };

  const handleDeleteCategory = (categoryId: string) => {
    // Check if category is used in any transactions
    const categoryToDelete = categories.find(c => c.id === categoryId);
    if (!categoryToDelete) return;
    
    const isUsed = transactions.some(t => t.category === categoryToDelete.name);
    
    if (isUsed) {
      toast({
        title: "Cannot delete",
        description: "This category is used in transactions. Update the transactions first.",
        variant: "destructive"
      });
      return;
    }
    
    deleteCategory(categoryId);
    
    toast({
      title: "Category deleted",
      description: "Your category has been deleted successfully",
    });
  };

  const handleEdit = (category: Category) => {
    setCurrentCategory(category);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground">
            Manage your income and expense categories
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle size={16} />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>
                Create a new category for organizing your transactions
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Category Name
                </label>
                <Input
                  id="name"
                  placeholder="e.g., Groceries, Rent, Salary"
                  value={newCategory.name}
                  onChange={(e) => 
                    setNewCategory({...newCategory, name: e.target.value})
                  }
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="type" className="text-sm font-medium">
                  Type
                </label>
                <Select
                  defaultValue="expense"
                  onValueChange={(value: TransactionType) => 
                    setNewCategory({...newCategory, type: value})
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
                <label className="text-sm font-medium">
                  Color
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {categoryColors.map((color) => (
                    <div
                      key={color}
                      className={`w-8 h-8 rounded-full cursor-pointer border-2 ${
                        newCategory.color === color ? 'border-primary' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewCategory({...newCategory, color})}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCategory}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <Tabs defaultValue="all" className="w-full" value={activeTab} onValueChange={(value) => setActiveTab(value as TransactionType | "all")}>
            <TabsList className="grid grid-cols-3 w-full max-w-[400px]">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="income">Income</TabsTrigger>
              <TabsTrigger value="expense">Expenses</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {category.type === "income" ? (
                            <ArrowUpRight className="h-4 w-4 mr-1 text-green-500" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 mr-1 text-red-500" />
                          )}
                          <span
                            className={
                              category.type === "income" ? "text-green-500" : "text-red-500"
                            }
                          >
                            {category.type.charAt(0).toUpperCase() + category.type.slice(1)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6">
                      No categories found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update category details
            </DialogDescription>
          </DialogHeader>
          {currentCategory && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label htmlFor="edit-name" className="text-sm font-medium">
                  Category Name
                </label>
                <Input
                  id="edit-name"
                  placeholder="e.g., Groceries, Rent, Salary"
                  value={currentCategory.name}
                  onChange={(e) => 
                    setCurrentCategory({...currentCategory, name: e.target.value})
                  }
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-type" className="text-sm font-medium">
                  Type
                </label>
                <Select
                  defaultValue={currentCategory.type}
                  onValueChange={(value: TransactionType) => 
                    setCurrentCategory({...currentCategory, type: value})
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
                <label className="text-sm font-medium">
                  Color
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {categoryColors.map((color) => (
                    <div
                      key={color}
                      className={`w-8 h-8 rounded-full cursor-pointer border-2 ${
                        currentCategory.color === color ? 'border-primary' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setCurrentCategory({...currentCategory, color})}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditCategory}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Categories;
