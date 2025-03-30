
// Data management with localStorage
const ExpenseTracker = {
  // Data structure
  data: {
    transactions: [],
    categories: [],
    budgets: []
  },
  
  // Initialize data from localStorage
  init() {
    // Load data from localStorage or set default values
    this.data.transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    this.data.categories = JSON.parse(localStorage.getItem('categories')) || this._getDefaultCategories();
    this.data.budgets = JSON.parse(localStorage.getItem('budgets')) || [];
    
    // Generate IDs for old data if needed
    this._ensureIds();
  },
  
  // Default categories
  _getDefaultCategories() {
    return [
      { id: this._generateId(), name: 'Salary', type: 'income', color: '#10b981', icon: 'money-bill' },
      { id: this._generateId(), name: 'Freelance', type: 'income', color: '#3b82f6', icon: 'laptop' },
      { id: this._generateId(), name: 'Investment', type: 'income', color: '#6366f1', icon: 'chart-line' },
      { id: this._generateId(), name: 'Groceries', type: 'expense', color: '#ef4444', icon: 'shopping-cart' },
      { id: this._generateId(), name: 'Dining', type: 'expense', color: '#f59e0b', icon: 'utensils' },
      { id: this._generateId(), name: 'Transport', type: 'expense', color: '#8b5cf6', icon: 'car' },
      { id: this._generateId(), name: 'Housing', type: 'expense', color: '#10b981', icon: 'house' },
      { id: this._generateId(), name: 'Utilities', type: 'expense', color: '#3b82f6', icon: 'bolt' },
      { id: this._generateId(), name: 'Healthcare', type: 'expense', color: '#ec4899', icon: 'medkit' }
    ];
  },
  
  // Ensure all records have IDs
  _ensureIds() {
    this.data.transactions.forEach(item => {
      if (!item.id) item.id = this._generateId();
    });
    
    this.data.categories.forEach(item => {
      if (!item.id) item.id = this._generateId();
    });
    
    this.data.budgets.forEach(item => {
      if (!item.id) item.id = this._generateId();
    });
  },
  
  // Save data to localStorage
  _saveData() {
    localStorage.setItem('transactions', JSON.stringify(this.data.transactions));
    localStorage.setItem('categories', JSON.stringify(this.data.categories));
    localStorage.setItem('budgets', JSON.stringify(this.data.budgets));
  },
  
  // Helper to generate unique IDs
  _generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  },
  
  // Get all transactions
  getTransactions() {
    return this.data.transactions;
  },
  
  // Add a new transaction
  addTransaction(transaction) {
    const newTransaction = {
      id: this._generateId(),
      ...transaction,
      date: transaction.date || new Date().toISOString().split('T')[0]
    };
    
    this.data.transactions.push(newTransaction);
    this._saveData();
    return newTransaction;
  },
  
  // Update a transaction
  updateTransaction(id, updatedData) {
    const index = this.data.transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      this.data.transactions[index] = {
        ...this.data.transactions[index],
        ...updatedData
      };
      this._saveData();
      return this.data.transactions[index];
    }
    return null;
  },
  
  // Delete a transaction
  deleteTransaction(id) {
    const index = this.data.transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      const deleted = this.data.transactions.splice(index, 1)[0];
      this._saveData();
      return deleted;
    }
    return null;
  },
  
  // Get all categories
  getCategories() {
    return this.data.categories;
  },
  
  // Get categories by type
  getCategoriesByType(type) {
    return this.data.categories.filter(c => c.type === type);
  },
  
  // Add a new category
  addCategory(category) {
    const newCategory = {
      id: this._generateId(),
      ...category
    };
    
    this.data.categories.push(newCategory);
    this._saveData();
    return newCategory;
  },
  
  // Update a category
  updateCategory(id, updatedData) {
    const index = this.data.categories.findIndex(c => c.id === id);
    if (index !== -1) {
      this.data.categories[index] = {
        ...this.data.categories[index],
        ...updatedData
      };
      this._saveData();
      return this.data.categories[index];
    }
    return null;
  },
  
  // Delete a category
  deleteCategory(id) {
    const index = this.data.categories.findIndex(c => c.id === id);
    if (index !== -1) {
      // Check if category is used in transactions
      const isUsed = this.data.transactions.some(t => t.category === this.data.categories[index].name);
      if (isUsed) {
        return { error: 'Category is used in transactions and cannot be deleted' };
      }
      
      // Check if category is used in budgets
      const isUsedInBudget = this.data.budgets.some(b => b.category === this.data.categories[index].name);
      if (isUsedInBudget) {
        return { error: 'Category is used in budgets and cannot be deleted' };
      }
      
      const deleted = this.data.categories.splice(index, 1)[0];
      this._saveData();
      return deleted;
    }
    return null;
  },
  
  // Get all budgets
  getBudgets() {
    return this.data.budgets;
  },
  
  // Add a new budget
  addBudget(budget) {
    // Check if budget already exists for this category
    const existingBudget = this.data.budgets.find(b => b.category === budget.category);
    if (existingBudget) {
      return { error: 'A budget for this category already exists' };
    }
    
    const newBudget = {
      id: this._generateId(),
      ...budget
    };
    
    this.data.budgets.push(newBudget);
    this._saveData();
    return newBudget;
  },
  
  // Update a budget
  updateBudget(id, updatedData) {
    const index = this.data.budgets.findIndex(b => b.id === id);
    if (index !== -1) {
      // Check if updating to a category that already has a budget
      if (updatedData.category && updatedData.category !== this.data.budgets[index].category) {
        const existingBudget = this.data.budgets.find(b => 
          b.id !== id && b.category === updatedData.category
        );
        if (existingBudget) {
          return { error: 'A budget for this category already exists' };
        }
      }
      
      this.data.budgets[index] = {
        ...this.data.budgets[index],
        ...updatedData
      };
      this._saveData();
      return this.data.budgets[index];
    }
    return null;
  },
  
  // Delete a budget
  deleteBudget(id) {
    const index = this.data.budgets.findIndex(b => b.id === id);
    if (index !== -1) {
      const deleted = this.data.budgets.splice(index, 1)[0];
      this._saveData();
      return deleted;
    }
    return null;
  },
  
  // Get transactions by month
  getTransactionsByMonth(month, year) {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    
    return this.data.transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  },
  
  // Get transactions by date range
  getTransactionsByDateRange(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return this.data.transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= start && transactionDate <= end;
    });
  },
  
  // Get total income for a specific month
  getTotalIncomeByMonth(month, year) {
    const transactions = this.getTransactionsByMonth(month, year);
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
  },
  
  // Get total expenses for a specific month
  getTotalExpensesByMonth(month, year) {
    const transactions = this.getTransactionsByMonth(month, year);
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
  },
  
  // Get expenses by category for a specific month
  getExpensesByCategory(month, year) {
    const transactions = this.getTransactionsByMonth(month, year);
    const expensesByCategory = {};
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        if (!expensesByCategory[transaction.category]) {
          expensesByCategory[transaction.category] = 0;
        }
        expensesByCategory[transaction.category] += Number(transaction.amount);
      });
    
    return expensesByCategory;
  },
  
  // Get income by category for a specific month
  getIncomeByCategory(month, year) {
    const transactions = this.getTransactionsByMonth(month, year);
    const incomeByCategory = {};
    
    transactions
      .filter(t => t.type === 'income')
      .forEach(transaction => {
        if (!incomeByCategory[transaction.category]) {
          incomeByCategory[transaction.category] = 0;
        }
        incomeByCategory[transaction.category] += Number(transaction.amount);
      });
    
    return incomeByCategory;
  },
  
  // Calculate budget progress
  calculateBudgetProgress(budgetId) {
    const budget = this.data.budgets.find(b => b.id === budgetId);
    if (!budget) return null;
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const transactions = this.getTransactionsByMonth(currentMonth, currentYear);
    const spent = transactions
      .filter(t => t.type === 'expense' && t.category === budget.category)
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const percentage = (spent / budget.amount) * 100;
    const status = percentage <= 50 ? 'normal' : percentage <= 80 ? 'warning' : 'danger';
    const remaining = budget.amount - spent;
    
    return {
      spent,
      percentage,
      remaining,
      status
    };
  },
  
  // Get monthly spending trend
  getMonthlySpendingTrend(months = 6) {
    const result = [];
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    for (let i = 0; i < months; i++) {
      const targetMonth = (currentMonth - i + 12) % 12;
      const targetYear = currentYear - Math.floor((i - currentMonth) / 12);
      
      const monthName = new Date(targetYear, targetMonth, 1).toLocaleString('default', { month: 'short' });
      const income = this.getTotalIncomeByMonth(targetMonth, targetYear);
      const expenses = this.getTotalExpensesByMonth(targetMonth, targetYear);
      
      result.unshift({
        month: monthName,
        income,
        expenses
      });
    }
    
    return result;
  }
};

// Initialize the data
ExpenseTracker.init();
