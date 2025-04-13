
// ExpenseTracker module for handling data
const ExpenseTracker = (function() {
  // Storage keys
  const TRANSACTIONS_KEY = 'expenseTracker_transactions';
  const CATEGORIES_KEY = 'expenseTracker_categories';
  const BUDGETS_KEY = 'expenseTracker_budgets';
  
  // Default categories
  const DEFAULT_CATEGORIES = [
    {
      id: 'cat_income_salary',
      type: 'income',
      name: 'Salary',
      color: '#10b981',
      icon: 'fas fa-briefcase'
    },
    {
      id: 'cat_income_freelance',
      type: 'income',
      name: 'Freelance',
      color: '#3b82f6',
      icon: 'fas fa-laptop'
    },
    {
      id: 'cat_income_gifts',
      type: 'income',
      name: 'Gifts',
      color: '#8b5cf6',
      icon: 'fas fa-gift'
    },
    {
      id: 'cat_income_investments',
      type: 'income',
      name: 'Investments',
      color: '#6366f1',
      icon: 'fas fa-chart-line'
    },
    {
      id: 'cat_expense_food',
      type: 'expense',
      name: 'Food',
      color: '#ef4444',
      icon: 'fas fa-utensils'
    },
    {
      id: 'cat_expense_transport',
      type: 'expense',
      name: 'Transport',
      color: '#f59e0b',
      icon: 'fas fa-car'
    },
    {
      id: 'cat_expense_housing',
      type: 'expense',
      name: 'Housing',
      color: '#0ea5e9',
      icon: 'fas fa-home'
    },
    {
      id: 'cat_expense_shopping',
      type: 'expense',
      name: 'Shopping',
      color: '#ec4899',
      icon: 'fas fa-shopping-cart'
    },
    {
      id: 'cat_expense_entertainment',
      type: 'expense',
      name: 'Entertainment',
      color: '#8b5cf6',
      icon: 'fas fa-gamepad'
    }
  ];
  
  // Initialize data
  function initializeData() {
    // If no categories exist, add default categories
    if (!localStorage.getItem(CATEGORIES_KEY)) {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(DEFAULT_CATEGORIES));
    }
    
    // Initialize transactions if not exists
    if (!localStorage.getItem(TRANSACTIONS_KEY)) {
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify([]));
    }
    
    // Initialize budgets if not exists
    if (!localStorage.getItem(BUDGETS_KEY)) {
      localStorage.setItem(BUDGETS_KEY, JSON.stringify([]));
    }
  }
  
  // Call initialize on load
  initializeData();
  
  // Get all transactions
  function getTransactions() {
    return JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
  }
  
  // Get transaction by ID
  function getTransactionById(id) {
    const transactions = getTransactions();
    return transactions.find(t => t.id === id) || null;
  }
  
  // Get transactions by month
  function getTransactionsByMonth(month, year) {
    const transactions = getTransactions();
    return transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === month && date.getFullYear() === year;
    });
  }
  
  // Get transactions by week (current week)
  function getTransactionsByWeek() {
    const transactions = getTransactions();
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + (6 - now.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);
    
    return transactions.filter(t => {
      const date = new Date(t.date);
      return date >= startOfWeek && date <= endOfWeek;
    });
  }
  
  // Get transactions by category
  function getTransactionsByCategory(categoryId) {
    const transactions = getTransactions();
    return transactions.filter(t => t.category === categoryId);
  }
  
  // Get recent transactions
  function getRecentTransactions(limit = 5) {
    const transactions = getTransactions();
    
    // Sort by date (newest first)
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Return limited number of transactions
    return transactions.slice(0, limit);
  }
  
  // Add transaction
  function addTransaction(transaction) {
    const transactions = getTransactions();
    transactions.push(transaction);
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  }
  
  // Update transaction
  function updateTransaction(transaction) {
    const transactions = getTransactions();
    const index = transactions.findIndex(t => t.id === transaction.id);
    
    if (index !== -1) {
      transactions[index] = transaction;
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
      return true;
    }
    
    return false;
  }
  
  // Delete transaction
  function deleteTransaction(id) {
    const transactions = getTransactions();
    const newTransactions = transactions.filter(t => t.id !== id);
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(newTransactions));
  }
  
  // Get total income by month
  function getTotalIncomeByMonth(month, year) {
    const transactions = getTransactionsByMonth(month, year);
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }
  
  // Get total expenses by month
  function getTotalExpensesByMonth(month, year) {
    const transactions = getTransactionsByMonth(month, year);
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }
  
  // Get all categories
  function getCategories() {
    return JSON.parse(localStorage.getItem(CATEGORIES_KEY) || '[]');
  }
  
  // Get categories by type
  function getCategoriesByType(type) {
    const categories = getCategories();
    return categories.filter(c => c.type === type);
  }
  
  // Get category by ID
  function getCategoryById(id) {
    const categories = getCategories();
    return categories.find(c => c.id === id) || null;
  }
  
  // Add category
  function addCategory(category) {
    const categories = getCategories();
    categories.push(category);
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  }
  
  // Update category
  function updateCategory(category) {
    const categories = getCategories();
    const index = categories.findIndex(c => c.id === category.id);
    
    if (index !== -1) {
      categories[index] = category;
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
      return true;
    }
    
    return false;
  }
  
  // Delete category
  function deleteCategory(id) {
    // Delete category from categories
    const categories = getCategories();
    const newCategories = categories.filter(c => c.id !== id);
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(newCategories));
    
    // Update transactions with this category
    const transactions = getTransactions();
    const updatedTransactions = transactions.map(t => {
      if (t.category === id) {
        // Find a default category of the same type
        const defaultCategory = newCategories.find(c => c.type === t.type);
        
        if (defaultCategory) {
          return { ...t, category: defaultCategory.id };
        }
      }
      return t;
    });
    
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updatedTransactions));
    
    // Delete budgets for this category
    const budgets = getBudgets();
    const newBudgets = budgets.filter(b => b.category !== id);
    localStorage.setItem(BUDGETS_KEY, JSON.stringify(newBudgets));
  }
  
  // Get category expenses by month
  function getCategoryExpensesByMonth(categoryId, month, year) {
    const transactions = getTransactionsByMonth(month, year);
    return transactions
      .filter(t => t.type === 'expense' && t.category === categoryId)
      .reduce((sum, t) => sum + t.amount, 0);
  }
  
  // Get category expenses by week
  function getCategoryExpensesByWeek(categoryId) {
    const transactions = getTransactionsByWeek();
    return transactions
      .filter(t => t.type === 'expense' && t.category === categoryId)
      .reduce((sum, t) => sum + t.amount, 0);
  }
  
  // Get category expenses by year
  function getCategoryExpensesByYear(categoryId, year) {
    const transactions = getTransactions();
    return transactions
      .filter(t => {
        const date = new Date(t.date);
        return t.type === 'expense' && t.category === categoryId && date.getFullYear() === year;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }
  
  // Get all budgets
  function getBudgets() {
    return JSON.parse(localStorage.getItem(BUDGETS_KEY) || '[]');
  }
  
  // Get budget by ID
  function getBudgetById(id) {
    const budgets = getBudgets();
    return budgets.find(b => b.id === id) || null;
  }
  
  // Get budget by category
  function getBudgetByCategory(categoryId) {
    const budgets = getBudgets();
    return budgets.find(b => b.category === categoryId) || null;
  }
  
  // Add budget
  function addBudget(budget) {
    const budgets = getBudgets();
    
    // Check if budget for this category already exists
    const existingBudget = budgets.find(b => b.category === budget.category);
    
    if (existingBudget) {
      // Update existing budget
      existingBudget.amount = budget.amount;
      existingBudget.period = budget.period;
      localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
    } else {
      // Add new budget
      budgets.push(budget);
      localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
    }
  }
  
  // Update budget
  function updateBudget(budget) {
    const budgets = getBudgets();
    const index = budgets.findIndex(b => b.id === budget.id);
    
    if (index !== -1) {
      budgets[index] = budget;
      localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
      return true;
    }
    
    return false;
  }
  
  // Delete budget
  function deleteBudget(id) {
    const budgets = getBudgets();
    const newBudgets = budgets.filter(b => b.id !== id);
    localStorage.setItem(BUDGETS_KEY, JSON.stringify(newBudgets));
  }
  
  // Import data
  function importData(data) {
    if (data.transactions) {
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(data.transactions));
    }
    
    if (data.categories) {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(data.categories));
    }
    
    if (data.budgets) {
      localStorage.setItem(BUDGETS_KEY, JSON.stringify(data.budgets));
    }
  }
  
  // Clear all data
  function clearData() {
    localStorage.removeItem(TRANSACTIONS_KEY);
    localStorage.removeItem(CATEGORIES_KEY);
    localStorage.removeItem(BUDGETS_KEY);
    
    // Re-initialize with default data
    initializeData();
  }
  
  // Public API
  return {
    getTransactions,
    getTransactionById,
    getTransactionsByMonth,
    getTransactionsByWeek,
    getTransactionsByCategory,
    getRecentTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTotalIncomeByMonth,
    getTotalExpensesByMonth,
    
    getCategories,
    getCategoriesByType,
    getCategoryById,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryExpensesByMonth,
    getCategoryExpensesByWeek,
    getCategoryExpensesByYear,
    
    getBudgets,
    getBudgetById,
    getBudgetByCategory,
    addBudget,
    updateBudget,
    deleteBudget,
    
    importData,
    clearData
  };
})();

// Auth module for user authentication
const Auth = (function() {
  // Storage key
  const USER_KEY = 'expenseTrackerUser';
  
  // Get current user
  function getCurrentUser() {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  }
  
  // Register user
  function register(name, email, password) {
    // Check if email already exists
    const existingUsers = JSON.parse(localStorage.getItem('expenseTrackerUsers') || '[]');
    const emailExists = existingUsers.some(user => user.email === email);
    
    if (emailExists) {
      return {
        success: false,
        error: 'Email already registered'
      };
    }
    
    // Create user object
    const user = {
      id: Date.now().toString(),
      name,
      email,
      password: hashPassword(password),
      avatar: null,
      createdAt: new Date().toISOString()
    };
    
    // Add user to users array
    existingUsers.push(user);
    localStorage.setItem('expenseTrackerUsers', JSON.stringify(existingUsers));
    
    return {
      success: true,
      user: { ...user, password: undefined }
    };
  }
  
  // Login user
  function login(email, password) {
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('expenseTrackerUsers') || '[]');
    
    // Find user by email
    const user = users.find(u => u.email === email);
    
    // Check if user exists and password is correct
    if (!user || user.password !== hashPassword(password)) {
      return {
        success: false,
        error: 'Invalid email or password'
      };
    }
    
    // Set current user in localStorage
    const userData = { ...user, password: undefined };
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    
    return {
      success: true,
      user: userData
    };
  }
  
  // Logout user
  function logout() {
    localStorage.removeItem(USER_KEY);
  }
  
  // Update user data
  function updateUser(userData) {
    // Update current user
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    
    // Update user in users array
    const users = JSON.parse(localStorage.getItem('expenseTrackerUsers') || '[]');
    const index = users.findIndex(u => u.id === userData.id);
    
    if (index !== -1) {
      // Preserve password
      const password = users[index].password;
      users[index] = { ...userData, password };
      localStorage.setItem('expenseTrackerUsers', JSON.stringify(users));
    }
  }
  
  // Verify password
  function verifyPassword(password) {
    const user = getCurrentUser();
    if (!user) return false;
    
    // Get full user data including password
    const users = JSON.parse(localStorage.getItem('expenseTrackerUsers') || '[]');
    const fullUser = users.find(u => u.id === user.id);
    
    return fullUser && fullUser.password === hashPassword(password);
  }
  
  // Change password
  function changePassword(newPassword) {
    const user = getCurrentUser();
    if (!user) return false;
    
    // Update user in users array
    const users = JSON.parse(localStorage.getItem('expenseTrackerUsers') || '[]');
    const index = users.findIndex(u => u.id === user.id);
    
    if (index !== -1) {
      users[index].password = hashPassword(newPassword);
      localStorage.setItem('expenseTrackerUsers', JSON.stringify(users));
      return true;
    }
    
    return false;
  }
  
  // Simple password hashing (not secure for production)
  function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }
  
  // Public API
  return {
    getCurrentUser,
    register,
    login,
    logout,
    updateUser,
    verifyPassword,
    changePassword
  };
})();

// UI module for handling UI interactions
const UI = (function() {
  function init() {
    console.log('UI module initialized');
  }
  
  return {
    init
  };
})();
