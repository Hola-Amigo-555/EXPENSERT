
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, ListOrdered, CreditCard } from "lucide-react";

const Index = () => {
  console.log('Index page rendering');
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Index page mounted');
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome to ExpenseTracker</h1>
        <p className="text-muted-foreground">
          Manage your finances with ease
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LayoutDashboard className="mr-2 h-5 w-5" />
              Dashboard
            </CardTitle>
            <CardDescription>
              View your financial overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Get a quick summary of your income, expenses, and budget progress.</p>
            <Button onClick={() => navigate('/dashboard')} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ListOrdered className="mr-2 h-5 w-5" />
              Transactions
            </CardTitle>
            <CardDescription>
              Manage your transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Add, edit, and categorize your income and expense transactions.</p>
            <Button onClick={() => navigate('/transactions')} className="w-full" variant="outline">
              View Transactions
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5" />
              Budgets
            </CardTitle>
            <CardDescription>
              Set up and track budgets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Create budgets for different categories and monitor your spending.</p>
            <Button onClick={() => navigate('/budgets')} className="w-full" variant="outline">
              Manage Budgets
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Follow these steps to start tracking your expenses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Add your income sources in the Transactions page</li>
            <li>Set up expense categories that match your spending habits</li>
            <li>Create budgets to help control spending in each category</li>
            <li>Record your expenses regularly to stay on track</li>
            <li>Check the Dashboard and Reports to analyze your financial patterns</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
