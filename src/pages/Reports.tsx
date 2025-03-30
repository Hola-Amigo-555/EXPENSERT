
import { useState } from "react";
import { useExpense } from "@/contexts/ExpenseContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Download, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Reports = () => {
  const { transactions, categories, getTransactionsByMonth } = useExpense();
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Prepare period options
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  // Current year and 5 years back
  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = 0; i < 5; i++) {
    years.push(currentYear - i);
  }

  // Filter transactions by selected period
  const filteredTransactions = getTransactionsByMonth(selectedMonth, selectedYear);
  
  // Expense breakdown data
  const expenseCategories = categories.filter(c => c.type === "expense");
  
  const expenseData = expenseCategories.map(category => {
    const amount = filteredTransactions
      .filter(t => t.type === "expense" && t.category === category.name)
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      name: category.name,
      value: amount,
      color: category.color
    };
  }).filter(item => item.value > 0);
  
  // Income breakdown data
  const incomeCategories = categories.filter(c => c.type === "income");
  
  const incomeData = incomeCategories.map(category => {
    const amount = filteredTransactions
      .filter(t => t.type === "income" && t.category === category.name)
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      name: category.name,
      value: amount,
      color: category.color
    };
  }).filter(item => item.value > 0);
  
  // Daily spending data (for the selected month)
  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  
  const dailyData = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(selectedYear, selectedMonth, day);
    const dateString = date.toISOString().split('T')[0];
    
    const expenses = filteredTransactions
      .filter(t => t.type === "expense" && t.date === dateString)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const income = filteredTransactions
      .filter(t => t.type === "income" && t.date === dateString)
      .reduce((sum, t) => sum + t.amount, 0);
    
    dailyData.push({
      day,
      date: dateString,
      expenses,
      income
    });
  }
  
  // Income vs. Expense Monthly Comparison
  const monthlyData = [];
  for (let i = 0; i < 6; i++) {
    let month = selectedMonth - i;
    let year = selectedYear;
    
    if (month < 0) {
      month += 12;
      year -= 1;
    }
    
    const monthTransactions = getTransactionsByMonth(month, year);
    
    const expenses = monthTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const income = monthTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = income - expenses;
    
    monthlyData.unshift({
      month: months[month],
      expenses,
      income,
      balance
    });
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground">
          Analyze your financial data with visual reports
        </p>
      </div>

      {/* Period selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="space-y-2">
                <label htmlFor="month" className="text-sm font-medium">
                  Month
                </label>
                <Select
                  value={selectedMonth.toString()}
                  onValueChange={(value) => setSelectedMonth(parseInt(value))}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month, index) => (
                      <SelectItem key={month} value={index.toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="year" className="text-sm font-medium">
                  Year
                </label>
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(value) => setSelectedYear(parseInt(value))}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Download size={16} />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 size={16} />
            Overview
          </TabsTrigger>
          <TabsTrigger value="expenses" className="flex items-center gap-2">
            <PieChartIcon size={16} />
            Category Analysis
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <LineChartIcon size={16} />
            Trends
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Income vs Expenses */}
            <Card>
              <CardHeader>
                <CardTitle>Income vs Expenses</CardTitle>
                <CardDescription>
                  Monthly comparison for {months[selectedMonth]} {selectedYear}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[{
                      name: "Income",
                      value: filteredTransactions
                        .filter(t => t.type === "income")
                        .reduce((sum, t) => sum + t.amount, 0),
                      color: "#0EA5E9"
                    }, {
                      name: "Expenses",
                      value: filteredTransactions
                        .filter(t => t.type === "expense")
                        .reduce((sum, t) => sum + t.amount, 0),
                      color: "#FF5A5F"
                    }]}
                    margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis 
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      formatter={(value) => [`$${value}`, 'Amount']}
                    />
                    <Bar 
                      dataKey="value" 
                      radius={[8, 8, 0, 0]} 
                      minPointSize={5}
                    >
                      {[{name: "Income", color: "#0EA5E9"}, {name: "Expenses", color: "#FF5A5F"}].map(
                        (entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        )
                      )}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Daily Spending */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Activity</CardTitle>
                <CardDescription>
                  Daily income and expense tracking
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dailyData}
                    margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis 
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      formatter={(value) => [`$${value}`, 'Amount']}
                      labelFormatter={(label) => `Day ${label}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="income" 
                      stroke="#0EA5E9" 
                      activeDot={{ r: 8 }} 
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="expenses" 
                      stroke="#FF5A5F" 
                      activeDot={{ r: 8 }} 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Expense Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>
                  Where your money went this month
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {expenseData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={false}
                      >
                        {expenseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`$${value}`, 'Amount']}
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
            
            {/* Income Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Income Breakdown</CardTitle>
                <CardDescription>
                  Your income sources this month
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {incomeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={incomeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={false}
                      >
                        {incomeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`$${value}`, 'Amount']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No income data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>6-Month Comparison</CardTitle>
              <CardDescription>
                Your financial trend over the past 6 months
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    formatter={(value) => [`$${value}`, 'Amount']}
                  />
                  <Legend />
                  <Bar dataKey="income" fill="#0EA5E9" name="Income" />
                  <Bar dataKey="expenses" fill="#FF5A5F" name="Expenses" />
                  <Bar dataKey="balance" fill="#10B981" name="Balance" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
