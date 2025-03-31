
import { useExpense } from "@/contexts/ExpenseContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon, WalletIcon } from "lucide-react";

interface FinancialSummaryProps {
  monthlyIncome: number;
  monthlyExpenses: number;
}

const FinancialSummary = ({ monthlyIncome, monthlyExpenses }: FinancialSummaryProps) => {
  const { currencySymbol } = useExpense();
  const balance = monthlyIncome - monthlyExpenses;
  
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <ArrowUpIcon className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-500">
            {currencySymbol}{monthlyIncome.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            Money coming in this month
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <ArrowDownIcon className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500">
            {currencySymbol}{monthlyExpenses.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            Money going out this month
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          <WalletIcon className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
            {currencySymbol}{balance.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            Net balance this month
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialSummary;
