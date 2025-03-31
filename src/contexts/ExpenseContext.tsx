
import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Types
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  type: TransactionType;
  paymentMethod?: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color?: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  period: 'monthly' | 'yearly';
}

interface ExpenseContextType {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  paymentMethods: string[];
  currencySymbol: string;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (budget: Budget) => void;
  deleteBudget: (id: string) => void;
  updatePaymentMethods: (methods: string[]) => void;
  getTransactionsByMonth: (month: number, year: number) => Transaction[];
  getTotalIncome: (transactions?: Transaction[]) => number;
  getTotalExpenses: (transactions?: Transaction[]) => number;
  getTotalSavings: (transactions?: Transaction[]) => number;
}

// Default categories
const defaultCategories: Category[] = [
  { id: '1', name: 'Salary', type: 'income', color: '#0EA5E9' },
  { id: '2', name: 'Freelance', type: 'income', color: '#8B5CF6' },
  { id: '3', name: 'Investments', type: 'income', color: '#10B981' },
  { id: '4', name: 'Food', type: 'expense', color: '#F97316' },
  { id: '5', name: 'Housing', type: 'expense', color: '#F43F5E' },
  { id: '6', name: 'Transportation', type: 'expense', color: '#8B5CF6' },
  { id: '7', name: 'Entertainment', type: 'expense', color: '#EC4899' },
  { id: '8', name: 'Utilities', type: 'expense', color: '#6366F1' },
  { id: '9', name: 'Healthcare', type: 'expense', color: '#14B8A6' },
  { id: '10', name: 'Shopping', type: 'expense', color: '#0EA5E9' },
];

// Default payment methods
const defaultPaymentMethods = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'Digital Wallet',
  'Check',
  'Other'
];

// Sample data for initial state
const sampleTransactions: Transaction[] = [
  {
    id: '1',
    amount: 2500,
    category: 'Salary',
    description: 'Monthly salary',
    date: '2023-11-01',
    type: 'income',
    paymentMethod: 'Bank Transfer'
  },
  {
    id: '2',
    amount: 500,
    category: 'Freelance',
    description: 'Website project',
    date: '2023-11-05',
    type: 'income',
    paymentMethod: 'Digital Wallet'
  },
  {
    id: '3',
    amount: 120,
    category: 'Food',
    description: 'Grocery shopping',
    date: '2023-11-07',
    type: 'expense',
    paymentMethod: 'Credit Card'
  },
  {
    id: '4',
    amount: 1200,
    category: 'Housing',
    description: 'Rent',
    date: '2023-11-01',
    type: 'expense',
    paymentMethod: 'Bank Transfer'
  },
  {
    id: '5',
    amount: 60,
    category: 'Entertainment',
    description: 'Movie tickets',
    date: '2023-11-12',
    type: 'expense',
    paymentMethod: 'Cash'
  }
];

const sampleBudgets: Budget[] = [
  { id: '1', category: 'Food', amount: 500, period: 'monthly' },
  { id: '2', category: 'Housing', amount: 1500, period: 'monthly' },
  { id: '3', category: 'Transportation', amount: 300, period: 'monthly' },
];

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : sampleTransactions;
  });
  
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('categories');
    return saved ? JSON.parse(saved) : defaultCategories;
  });
  
  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('budgets');
    return saved ? JSON.parse(saved) : sampleBudgets;
  });
  
  const [currencySymbol, setCurrencySymbol] = useState(() => {
    return localStorage.getItem('currency') || '₹';
  });

  const [paymentMethods, setPaymentMethods] = useState<string[]>(() => {
    const saved = localStorage.getItem('paymentMethods');
    return saved ? JSON.parse(saved) : defaultPaymentMethods;
  });

  useEffect(() => {
    const handleCurrencyChange = () => {
      const currency = localStorage.getItem('currency') || '₹';
      setCurrencySymbol(currency);
    };

    window.addEventListener('storage', handleCurrencyChange);
    
    return () => {
      window.removeEventListener('storage', handleCurrencyChange);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);
  
  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);
  
  useEffect(() => {
    localStorage.setItem('budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('paymentMethods', JSON.stringify(paymentMethods));
  }, [paymentMethods]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, id: uuidv4() };
    setTransactions([...transactions, newTransaction]);
  };

  const updateTransaction = (transaction: Transaction) => {
    setTransactions(transactions.map(t => t.id === transaction.id ? transaction : t));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory = { ...category, id: uuidv4() };
    setCategories([...categories, newCategory]);
  };

  const updateCategory = (category: Category) => {
    setCategories(categories.map(c => c.id === category.id ? category : c));
  };

  const deleteCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  const updatePaymentMethods = (methods: string[]) => {
    setPaymentMethods(methods);
  };

  const addBudget = (budget: Omit<Budget, 'id'>) => {
    const newBudget = { ...budget, id: uuidv4() };
    setBudgets([...budgets, newBudget]);
  };

  const updateBudget = (budget: Budget) => {
    setBudgets(budgets.map(b => b.id === budget.id ? budget : b));
  };

  const deleteBudget = (id: string) => {
    setBudgets(budgets.filter(b => b.id !== id));
  };

  const getTransactionsByMonth = (month: number, year: number) => {
    return transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === month && date.getFullYear() === year;
    });
  };

  const getTotalIncome = (txs?: Transaction[]) => {
    const transactionsToCalculate = txs || transactions;
    return transactionsToCalculate
      .filter(t => t.type === 'income')
      .reduce((total, t) => total + t.amount, 0);
  };

  const getTotalExpenses = (txs?: Transaction[]) => {
    const transactionsToCalculate = txs || transactions;
    return transactionsToCalculate
      .filter(t => t.type === 'expense')
      .reduce((total, t) => total + t.amount, 0);
  };

  const getTotalSavings = (txs?: Transaction[]) => {
    const transactionsToCalculate = txs || transactions;
    return getTotalIncome(transactionsToCalculate) - getTotalExpenses(transactionsToCalculate);
  };

  return (
    <ExpenseContext.Provider value={{
      transactions,
      categories,
      budgets,
      paymentMethods,
      currencySymbol,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addCategory,
      updateCategory,
      deleteCategory,
      addBudget,
      updateBudget,
      deleteBudget,
      updatePaymentMethods,
      getTransactionsByMonth,
      getTotalIncome,
      getTotalExpenses,
      getTotalSavings,
    }}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
};

export const getPaymentMethods = () => {
  const saved = localStorage.getItem('paymentMethods');
  return saved ? JSON.parse(saved) : defaultPaymentMethods;
};
