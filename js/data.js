
// Authentication System
const Auth = (function() {
  // Private variables
  const userStorageKey = 'expenseTrackerUser';
  const usersStorageKey = 'expenseTrackerUsers';
  
  // Private methods
  const getUsers = function() {
    const usersJSON = localStorage.getItem(usersStorageKey);
    return usersJSON ? JSON.parse(usersJSON) : [];
  };
  
  const saveUsers = function(users) {
    localStorage.setItem(usersStorageKey, JSON.stringify(users));
  };
  
  const findUserByEmail = function(email) {
    const users = getUsers();
    return users.find(user => user.email.toLowerCase() === email.toLowerCase());
  };
  
  // Public methods
  return {
    register: function(name, email, password) {
      // Check if user already exists
      if (findUserByEmail(email)) {
        return { success: false, error: 'Email already in use' };
      }
      
      // Create new user
      const newUser = {
        id: crypto.randomUUID(),
        name,
        email,
        password,
        avatar: null,
        createdAt: new Date().toISOString()
      };
      
      // Add to users array
      const users = getUsers();
      users.push(newUser);
      saveUsers(users);
      
      // Set current user
      const userToStore = { ...newUser };
      delete userToStore.password; // Don't store password in session
      localStorage.setItem(userStorageKey, JSON.stringify(userToStore));
      
      return { success: true };
    },
    
    login: function(email, password) {
      // Find user
      const user = findUserByEmail(email);
      
      if (!user) {
        return { success: false, error: 'User not found' };
      }
      
      if (user.password !== password) {
        return { success: false, error: 'Invalid password' };
      }
      
      // Set current user
      const userToStore = { ...user };
      delete userToStore.password; // Don't store password in session
      localStorage.setItem(userStorageKey, JSON.stringify(userToStore));
      
      return { success: true };
    },
    
    logout: function() {
      localStorage.removeItem(userStorageKey);
    },
    
    getCurrentUser: function() {
      const userJSON = localStorage.getItem(userStorageKey);
      return userJSON ? JSON.parse(userJSON) : null;
    },
    
    updateUserProfile: function(name, email) {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'Not logged in' };
      }
      
      // Get users array
      const users = getUsers();
      const userIndex = users.findIndex(u => u.id === currentUser.id);
      
      if (userIndex === -1) {
        return { success: false, error: 'User not found' };
      }
      
      // Check if new email is already in use
      if (email !== currentUser.email) {
        const emailExists = users.some(u => 
          u.id !== currentUser.id && u.email.toLowerCase() === email.toLowerCase()
        );
        
        if (emailExists) {
          return { success: false, error: 'Email already in use' };
        }
      }
      
      // Update user in users array
      users[userIndex].name = name;
      users[userIndex].email = email;
      saveUsers(users);
      
      // Update current user
      currentUser.name = name;
      currentUser.email = email;
      localStorage.setItem(userStorageKey, JSON.stringify(currentUser));
      
      return { success: true };
    },
    
    updateUserAvatar: function(avatarUrl) {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'Not logged in' };
      }
      
      // Get users array
      const users = getUsers();
      const userIndex = users.findIndex(u => u.id === currentUser.id);
      
      if (userIndex === -1) {
        return { success: false, error: 'User not found' };
      }
      
      // Update user in users array
      users[userIndex].avatar = avatarUrl;
      saveUsers(users);
      
      // Update current user
      currentUser.avatar = avatarUrl;
      localStorage.setItem(userStorageKey, JSON.stringify(currentUser));
      
      return { success: true };
    },
    
    changePassword: function(currentPassword, newPassword) {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'Not logged in' };
      }
      
      // Get users array
      const users = getUsers();
      const userIndex = users.findIndex(u => u.id === currentUser.id);
      
      if (userIndex === -1) {
        return { success: false, error: 'User not found' };
      }
      
      // Verify current password
      if (users[userIndex].password !== currentPassword) {
        return { success: false, error: 'Current password is incorrect' };
      }
      
      // Update password
      users[userIndex].password = newPassword;
      saveUsers(users);
      
      return { success: true };
    }
  };
})();

// Expense Tracker System
const ExpenseTracker = (function() {
  // Private variables
  const transactionsStorageKey = 'expenseTrackerTransactions';
  const categoriesStorageKey = 'expenseTrackerCategories';
  const budgetsStorageKey = 'expenseTrackerBudgets';
  
  // Get user ID suffix for storage keys
  const getUserIdSuffix = function() {
    const currentUser = Auth.getCurrentUser();
    return currentUser ? `-${currentUser.id}` : '';
  };
  
  // Private methods
  const getUserTransactionsKey = function() {
    return transactionsStorageKey + getUserIdSuffix();
  };
  
  const getUserCategoriesKey = function() {
    return categoriesStorageKey + getUserIdSuffix();
  };
  
  const getUserBudgetsKey = function() {
    return budgetsStorageKey + getUserIdSuffix();
  };
  
  // Initialize with default data if needed
  const initializeDefaultData = function() {
    // Check if categories exist
    const categoriesJSON = localStorage.getItem(getUserCategoriesKey());
    
    if (!categoriesJSON) {
      // Default income categories
      const defaultIncomeCategories = [
        { id: '1', type: 'income', name: 'Salary', color: '#10b981', icon: 'money-bill-wave' },
        { id: '2', type: 'income', name: 'Freelance', color: '#3b82f6', icon: 'laptop-code' },
        { id: '3', type: 'income', name: 'Investments', color: '#f59e0b', icon: 'chart-line' }
      ];
      
      // Default expense categories
      const defaultExpenseCategories = [
        { id: '4', type: 'expense', name: 'Food', color: '#ef4444', icon: 'utensils' },
        { id: '5', type: 'expense', name: 'Transportation', color: '#6366f1', icon: 'car' },
        { id: '6', type: 'expense', name: 'Housing', color: '#8b5cf6', icon: 'home' },
        { id: '7', type: 'expense', name: 'Entertainment', color: '#ec4899', icon: 'film' },
        { id: '8', type: 'expense', name: 'Shopping', color: '#f97316', icon: 'shopping-bag' },
        { id: '9', type: 'expense', name: 'Utilities', color: '#14b8a6', icon: 'bolt' }
      ];
      
      // Save default categories
      localStorage.setItem(
        getUserCategoriesKey(),
        JSON.stringify([...defaultIncomeCategories, ...defaultExpenseCategories])
      );
    }
  };
  
  // Public methods
  return {
    init: function() {
      const currentUser = Auth.getCurrentUser();
      if (currentUser) {
        initializeDefaultData();
      }
    },
    
    // Transactions methods
    getTransactions: function() {
      const transactionsJSON = localStorage.getItem(getUserTransactionsKey());
      return transactionsJSON ? JSON.parse(transactionsJSON) : [];
    },
    
    addTransaction: function(transaction) {
      const transactions = this.getTransactions();
      const newTransaction = {
        ...transaction,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString()
      };
      
      transactions.push(newTransaction);
      localStorage.setItem(getUserTransactionsKey(), JSON.stringify(transactions));
      
      return newTransaction;
    },
    
    updateTransaction: function(id, updatedTransaction) {
      const transactions = this.getTransactions();
      const index = transactions.findIndex(t => t.id === id);
      
      if (index !== -1) {
        transactions[index] = { 
          ...transactions[index], 
          ...updatedTransaction,
          updatedAt: new Date().toISOString()
        };
        
        localStorage.setItem(getUserTransactionsKey(), JSON.stringify(transactions));
        return transactions[index];
      }
      
      return null;
    },
    
    deleteTransaction: function(id) {
      const transactions = this.getTransactions();
      const filteredTransactions = transactions.filter(t => t.id !== id);
      
      localStorage.setItem(getUserTransactionsKey(), JSON.stringify(filteredTransactions));
      
      return { success: true };
    },
    
    getTransactionsByMonth: function(month, year) {
      const transactions = this.getTransactions();
      
      return transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate.getMonth() === month && transactionDate.getFullYear() === year;
      });
    },
    
    getTransactionsByDateRange: function(from, to) {
      const transactions = this.getTransactions();
      const fromDate = new Date(from);
      const toDate = new Date(to);
      
      return transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= fromDate && transactionDate <= toDate;
      });
    },
    
    // Categories methods
    getCategories: function() {
      const categoriesJSON = localStorage.getItem(getUserCategoriesKey());
      return categoriesJSON ? JSON.parse(categoriesJSON) : [];
    },
    
    getCategoriesByType: function(type) {
      const categories = this.getCategories();
      return categories.filter(category => category.type === type);
    },
    
    addCategory: function(category) {
      const categories = this.getCategories();
      const newCategory = {
        ...category,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString()
      };
      
      categories.push(newCategory);
      localStorage.setItem(getUserCategoriesKey(), JSON.stringify(categories));
      
      return newCategory;
    },
    
    deleteCategory: function(id) {
      const categories = this.getCategories();
      const categoryToDelete = categories.find(c => c.id === id);
      
      if (!categoryToDelete) {
        return { success: false, error: 'Category not found' };
      }
      
      // Check if category is in use
      const transactions = this.getTransactions();
      const isInUse = transactions.some(t => t.category === categoryToDelete.name);
      
      if (isInUse) {
        return { 
          success: false, 
          error: 'Cannot delete category that is in use by transactions' 
        };
      }
      
      const filteredCategories = categories.filter(c => c.id !== id);
      localStorage.setItem(getUserCategoriesKey(), JSON.stringify(filteredCategories));
      
      return { success: true };
    },
    
    // Budgets methods
    getBudgets: function() {
      const budgetsJSON = localStorage.getItem(getUserBudgetsKey());
      return budgetsJSON ? JSON.parse(budgetsJSON) : [];
    },
    
    addBudget: function(budget) {
      // Check if budget for this category already exists
      const budgets = this.getBudgets();
      const exists = budgets.some(b => 
        b.category === budget.category && b.period === budget.period
      );
      
      if (exists) {
        return { 
          success: false, 
          error: `Budget for ${budget.category} already exists for ${budget.period} period` 
        };
      }
      
      const newBudget = {
        ...budget,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString()
      };
      
      budgets.push(newBudget);
      localStorage.setItem(getUserBudgetsKey(), JSON.stringify(budgets));
      
      return { success: true, budget: newBudget };
    },
    
    deleteBudget: function(id) {
      const budgets = this.getBudgets();
      const filteredBudgets = budgets.filter(b => b.id !== id);
      
      localStorage.setItem(getUserBudgetsKey(), JSON.stringify(filteredBudgets));
      
      return { success: true };
    },
    
    calculateBudgetProgress: function(budgetId) {
      const budgets = this.getBudgets();
      const budget = budgets.find(b => b.id === budgetId);
      
      if (!budget) return null;
      
      let transactions = this.getTransactions();
      
      // Filter transactions by category
      transactions = transactions.filter(t => 
        t.type === 'expense' && t.category === budget.category
      );
      
      // Filter by period
      const today = new Date();
      
      if (budget.period === 'monthly') {
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        transactions = transactions.filter(t => {
          const date = new Date(t.date);
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });
      } else if (budget.period === 'yearly') {
        const currentYear = today.getFullYear();
        
        transactions = transactions.filter(t => {
          const date = new Date(t.date);
          return date.getFullYear() === currentYear;
        });
      } else if (budget.period === 'weekly') {
        // Calculate the start of the current week (Sunday)
        const currentWeekStart = new Date(today);
        currentWeekStart.setDate(today.getDate() - today.getDay());
        currentWeekStart.setHours(0, 0, 0, 0);
        
        // Calculate the end of the current week (Saturday)
        const currentWeekEnd = new Date(currentWeekStart);
        currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
        currentWeekEnd.setHours(23, 59, 59, 999);
        
        transactions = transactions.filter(t => {
          const date = new Date(t.date);
          return date >= currentWeekStart && date <= currentWeekEnd;
        });
      }
      
      // Calculate total spent
      const spent = transactions.reduce((total, t) => total + t.amount, 0);
      
      // Calculate percentage
      const percentage = (spent / budget.amount) * 100;
      
      // Calculate remaining amount
      const remaining = budget.amount - spent;
      
      // Determine status
      let status = 'safe';
      if (percentage >= 80) {
        status = 'danger';
      } else if (percentage >= 50) {
        status = 'warning';
      }
      
      return {
        spent,
        percentage,
        remaining,
        status
      };
    },
    
    getTotalIncomeByMonth: function(month, year) {
      const transactions = this.getTransactionsByMonth(month, year);
      return transactions
        .filter(t => t.type === 'income')
        .reduce((total, t) => total + t.amount, 0);
    },
    
    getTotalExpensesByMonth: function(month, year) {
      const transactions = this.getTransactionsByMonth(month, year);
      return transactions
        .filter(t => t.type === 'expense')
        .reduce((total, t) => total + t.amount, 0);
    },
    
    importTransactions: function(transactions) {
      localStorage.setItem(getUserTransactionsKey(), JSON.stringify(transactions));
    },
    
    importCategories: function(categories) {
      localStorage.setItem(getUserCategoriesKey(), JSON.stringify(categories));
    },
    
    importBudgets: function(budgets) {
      localStorage.setItem(getUserBudgetsKey(), JSON.stringify(budgets));
    },
    
    clearAllData: function() {
      localStorage.removeItem(getUserTransactionsKey());
      localStorage.removeItem(getUserCategoriesKey());
      localStorage.removeItem(getUserBudgetsKey());
      
      // Reinitialize defaults
      initializeDefaultData();
    }
  };
})();

// Initialize ExpenseTracker when page loads
document.addEventListener('DOMContentLoaded', function() {
  // Check if user is logged in first
  const currentUser = Auth.getCurrentUser();
  
  // Redirect to login if not logged in (except on login/register pages)
  if (!currentUser && 
      !window.location.pathname.includes('login.html') && 
      !window.location.pathname.includes('register.html')) {
    window.location.href = 'login.html';
    return;
  }
  
  // Initialize if user is logged in
  if (currentUser) {
    ExpenseTracker.init();
  }
});
