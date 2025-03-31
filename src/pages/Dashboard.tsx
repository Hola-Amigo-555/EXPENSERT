
import { useState, useEffect } from "react";
import { useExpense } from "@/contexts/ExpenseContext";
import FinancialSummary from "@/components/dashboard/FinancialSummary";
import { ArrowUpRight, ArrowDownRight, DollarSign, PiggyBank, Wallet } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useToast } from "@/components/ui/use-toast";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";

const Dashboard = () => {
  console.log("Dashboard component rendering");
  const { toast } = useToast();
  
  try {
    console.log("Accessing useExpense hook");
    const { 
      transactions, 
      categories,
      budgets,
      getTotalIncome, 
      getTotalExpenses,
      getTransactionsByMonth,
      currencySymbol
    } = useExpense();
    console.log("useExpense hook successfully accessed");
    
    // Get the current date
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Get transactions for the current month
    const currentMonthTransactions = getTransactionsByMonth(
      currentMonth,
      currentYear
    );
    
    // Calculate monthly income and expenses
    const monthlyIncome = getTotalIncome(currentMonthTransactions);
    const monthlyExpenses = getTotalExpenses(currentMonthTransactions);
    
    // Get the current month's data
    const thisMonthTransactions = getTransactionsByMonth(currentMonth, currentYear);
    console.log("This month's transactions:", thisMonthTransactions.length);
    
    const balance = monthlyIncome - monthlyExpenses;
    const totalSavings = balance > 0 ? balance : 0; // Calculate savings as positive balance
    
    // Prepare data for expense breakdown chart
    const expenseCategories = categories.filter(c => c.type === 'expense');
    
    const expenseChartData = expenseCategories.map(category => {
      const categoryTotal = thisMonthTransactions
        .filter(t => t.type === 'expense' && t.category === category.name)
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        name: category.name,
        value: categoryTotal,
        color: category.color,
      };
    }).filter(item => item.value > 0);
    
    // Budget progress data
    const budgetProgressData = budgets.map(budget => {
      const spent = thisMonthTransactions
        .filter(t => t.type === 'expense' && t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0);
      
      const percentage = (spent / budget.amount) * 100;
      const status = percentage <= 50 ? 'good' : percentage <= 80 ? 'warning' : 'danger';
      
      return {
        category: budget.category,
        spent,
        budget: budget.amount,
        percentage,
        remaining: budget.amount - spent,
        status,
      };
    });
    
    // Recent transactions
    const recentTransactions = [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your financial activity
          </p>
        </div>

        {/* Financial Summary Cards */}
        <FinancialSummary
          monthlyIncome={monthlyIncome}
          monthlyExpenses={monthlyExpenses}
        />

        {/* Charts and Lists */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Expense Breakdown */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
              <CardDescription>
                Where your money went this month
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {expenseChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {expenseChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${currencySymbol}${value}`, 'Amount']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No expense data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Budget Progress */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Budget Progress</CardTitle>
              <CardDescription>
                Your spending against budget limits
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {budgetProgressData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={budgetProgressData}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tickFormatter={(value) => `${currencySymbol}${value}`} />
                    <YAxis type="category" dataKey="category" width={80} />
                    <Tooltip 
                      formatter={(value) => [`${currencySymbol}${value}`, 'Amount']}
                      labelFormatter={(label) => `Category: ${label}`}
                    />
                    <Legend />
                    <Bar 
                      dataKey="spent" 
                      name="Spent" 
                      fill="#FF5A5F" 
                      radius={[0, 4, 4, 0]} 
                    />
                    <Bar 
                      dataKey="remaining" 
                      name="Remaining" 
                      fill="#0EA5E9" 
                      radius={[0, 4, 4, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No budget data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Your latest financial activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'income' ? 'bg-income-light' : 'bg-expense-light'
                      }`}>
                        {transaction.type === 'income' ? (
                          <PiggyBank className="h-5 w-5 text-income" />
                        ) : (
                          <Wallet className="h-5 w-5 text-expense" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.category}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.description}
                        </p>
                        {transaction.paymentMethod && (
                          <p className="text-xs text-muted-foreground">
                            Payment Method: {transaction.paymentMethod}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${
                        transaction.type === 'income' ? 'text-income' : 'text-expense'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{currencySymbol}{transaction.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground">No transactions yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error("Error in Dashboard component:", error);
    
    // Fallback UI in case of error
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p>There was an error loading the dashboard data. Please try refreshing the page.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Error details: {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
};

export default Dashboard;
