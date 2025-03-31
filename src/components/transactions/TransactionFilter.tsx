
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Filter, Check } from "lucide-react";
import { Category } from "@/contexts/ExpenseContext";

export type SortOption = "newest" | "oldest" | "amount-high" | "amount-low";
export type FilterCriteria = {
  sort: SortOption;
  categories: string[];
  paymentMethods: string[];
};

interface TransactionFilterProps {
  categories: Category[];
  paymentMethods: string[];
  onFilterChange: (filters: FilterCriteria) => void;
  activeFilters: FilterCriteria;
}

const TransactionFilter = ({ 
  categories, 
  paymentMethods, 
  onFilterChange,
  activeFilters 
}: TransactionFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSortChange = (sort: SortOption) => {
    onFilterChange({ ...activeFilters, sort });
  };

  const toggleCategoryFilter = (category: string) => {
    const newCategories = activeFilters.categories.includes(category)
      ? activeFilters.categories.filter(c => c !== category)
      : [...activeFilters.categories, category];
    
    onFilterChange({ ...activeFilters, categories: newCategories });
  };

  const togglePaymentMethodFilter = (method: string) => {
    const newMethods = activeFilters.paymentMethods.includes(method)
      ? activeFilters.paymentMethods.filter(m => m !== method)
      : [...activeFilters.paymentMethods, method];
    
    onFilterChange({ ...activeFilters, paymentMethods: newMethods });
  };

  // Calculate if any filters are active
  const hasActiveFilters = 
    activeFilters.categories.length > 0 || 
    activeFilters.paymentMethods.length > 0 || 
    activeFilters.sort !== "newest";

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={hasActiveFilters ? "default" : "outline"} 
          size="icon"
          className="relative"
        >
          <Filter className="h-4 w-4" />
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Sort By</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => handleSortChange("newest")}>
            <Check className={`h-4 w-4 mr-2 ${activeFilters.sort === "newest" ? "opacity-100" : "opacity-0"}`} />
            Newest First
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSortChange("oldest")}>
            <Check className={`h-4 w-4 mr-2 ${activeFilters.sort === "oldest" ? "opacity-100" : "opacity-0"}`} />
            Oldest First
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSortChange("amount-high")}>
            <Check className={`h-4 w-4 mr-2 ${activeFilters.sort === "amount-high" ? "opacity-100" : "opacity-0"}`} />
            Amount (High to Low)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSortChange("amount-low")}>
            <Check className={`h-4 w-4 mr-2 ${activeFilters.sort === "amount-low" ? "opacity-100" : "opacity-0"}`} />
            Amount (Low to High)
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
        <DropdownMenuGroup className="max-h-40 overflow-y-auto">
          {categories.map(category => (
            <DropdownMenuItem 
              key={category.id}
              onClick={() => toggleCategoryFilter(category.name)}
            >
              <Check 
                className={`h-4 w-4 mr-2 ${
                  activeFilters.categories.includes(category.name) ? "opacity-100" : "opacity-0"
                }`} 
              />
              <span 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: category.color || "#808080" }}
              />
              {category.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel>Filter by Payment Method</DropdownMenuLabel>
        <DropdownMenuGroup className="max-h-40 overflow-y-auto">
          {paymentMethods.map((method, index) => (
            <DropdownMenuItem 
              key={index}
              onClick={() => togglePaymentMethodFilter(method)}
            >
              <Check 
                className={`h-4 w-4 mr-2 ${
                  activeFilters.paymentMethods.includes(method) ? "opacity-100" : "opacity-0"
                }`} 
              />
              {method}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TransactionFilter;
