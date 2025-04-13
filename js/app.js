
// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize UI
  UI.init();
  
  // Check if user is logged in
  const currentUser = Auth.getCurrentUser();
  if (!currentUser && !window.location.pathname.includes('login.html') && 
      !window.location.pathname.includes('register.html')) {
    // Redirect to login if not logged in
    window.location.href = 'login.html';
    return;
  }
  
  // Update user info in sidebar
  if (currentUser) {
    document.getElementById('user-name').textContent = currentUser.name;
    document.getElementById('user-email').textContent = currentUser.email;
    
    if (currentUser.avatar) {
      document.getElementById('user-avatar').src = currentUser.avatar;
    }
  }
  
  // Initialize UI components
  initNavigation();
  initModals();
  initDarkMode();
  initLogout();
  
  // Load dashboard data if on dashboard page
  if (document.getElementById('dashboard-page') && 
      document.getElementById('dashboard-page').classList.contains('active')) {
    loadDashboardData();
    // Initialize dashboard charts
    Charts.initDashboardCharts();
    loadRecentTransactions();
  }
  
  // Load transactions data if on transactions page
  if (document.getElementById('transactions-page') && 
      document.getElementById('transactions-page').classList.contains('active')) {
    loadTransactionsData();
  }
  
  // Load categories data if on categories page
  if (document.getElementById('categories-page') && 
      document.getElementById('categories-page').classList.contains('active')) {
    loadCategoriesData();
  }
  
  // Load budgets data if on budgets page
  if (document.getElementById('budgets-page') && 
      document.getElementById('budgets-page').classList.contains('active')) {
    loadBudgetsData();
  }
  
  // Load reports data if on reports page
  if (document.getElementById('reports-page') && 
      document.getElementById('reports-page').classList.contains('active')) {
    initReportsPage();
  }
  
  // Load settings data if on settings page
  if (document.getElementById('settings-page') && 
      document.getElementById('settings-page').classList.contains('active')) {
    loadSettingsData();
  }
  
  // Log init message
  console.log('Expense Tracker initialized');
});

// Initialize navigation
function initNavigation() {
  // Get all nav items
  const navItems = document.querySelectorAll('.nav-item');
  
  // Add click event to each nav item
  navItems.forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Get page ID from data attribute
      const pageId = this.getAttribute('data-page');
      
      // Hide all pages
      document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
      });
      
      // Show selected page
      document.getElementById(pageId + '-page').classList.add('active');
      
      // Update active nav item
      navItems.forEach(navItem => {
        navItem.classList.remove('active');
      });
      this.classList.add('active');
      
      // Close sidebar on mobile
      if (window.innerWidth < 768) {
        document.getElementById('sidebar').classList.remove('open');
      }
      
      // Initialize page data based on which page is active
      if (pageId === 'dashboard') {
        loadDashboardData();
        Charts.initDashboardCharts();
        loadRecentTransactions();
      } else if (pageId === 'transactions') {
        loadTransactionsData();
      } else if (pageId === 'categories') {
        loadCategoriesData();
      } else if (pageId === 'budgets') {
        loadBudgetsData();
      } else if (pageId === 'reports') {
        initReportsPage();
      } else if (pageId === 'settings') {
        loadSettingsData();
      }
      
      // Update URL hash
      window.location.hash = pageId;
    });
  });
  
  // Check URL hash on load
  if (window.location.hash) {
    const hash = window.location.hash.substring(1);
    const navItem = document.querySelector(`.nav-item[data-page="${hash}"]`);
    if (navItem) {
      navItem.click();
    }
  }
  
  // Mobile menu toggle
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', function() {
      document.getElementById('sidebar').classList.toggle('open');
    });
  }
}

// Initialize modals
function initModals() {
  // Get all modal close buttons
  const closeButtons = document.querySelectorAll('.close-modal, .close-modal-btn');
  
  // Add click event to each close button
  closeButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Find parent modal
      const modal = this.closest('.modal');
      if (modal) {
        modal.classList.remove('show');
      }
    });
  });
  
  // Close modal when clicking outside modal content
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        this.classList.remove('show');
      }
    });
  });
  
  // Transaction modal
  const addTransactionBtns = document.querySelectorAll('#add-transaction-btn, #add-transaction-btn-2');
  addTransactionBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      openTransactionModal();
    });
  });
  
  // Category modal
  const addCategoryBtn = document.getElementById('add-category-btn');
  if (addCategoryBtn) {
    addCategoryBtn.addEventListener('click', function() {
      openCategoryModal();
    });
  }
  
  // Budget modal
  const addBudgetBtn = document.getElementById('add-budget-btn');
  if (addBudgetBtn) {
    addBudgetBtn.addEventListener('click', function() {
      openBudgetModal();
    });
  }
  
  // Initialize transaction form
  initTransactionForm();
  
  // Initialize category form
  initCategoryForm();
  
  // Initialize budget form
  initBudgetForm();
}

// Initialize transaction form
function initTransactionForm() {
  const form = document.getElementById('transaction-form');
  if (!form) return;
  
  // Get form elements
  const typeSelector = form.querySelectorAll('.tab');
  const categorySelect = document.getElementById('transaction-category');
  
  // Tab selector for income/expense
  typeSelector.forEach(tab => {
    tab.addEventListener('click', function() {
      // Update active tab
      typeSelector.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      // Update category options based on type
      const type = this.getAttribute('data-type');
      populateCategorySelect(categorySelect, type);
    });
  });
  
  // Form submission
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const id = document.getElementById('transaction-id').value;
    const type = form.querySelector('.tab.active').getAttribute('data-type');
    const date = document.getElementById('transaction-date').value;
    const amount = parseFloat(document.getElementById('transaction-amount').value);
    const category = document.getElementById('transaction-category').value;
    const description = document.getElementById('transaction-description').value;
    const notes = document.getElementById('transaction-notes').value;
    
    // Create transaction object
    const transaction = {
      id: id || generateId(),
      type,
      date,
      amount,
      category,
      description,
      notes
    };
    
    // Save transaction
    if (id) {
      // Update existing
      ExpenseTracker.updateTransaction(transaction);
      showToast('Transaction updated successfully', 'success');
    } else {
      // Add new
      ExpenseTracker.addTransaction(transaction);
      showToast('Transaction added successfully', 'success');
    }
    
    // Close modal
    document.getElementById('transaction-modal').classList.remove('show');
    
    // Reload data
    if (document.getElementById('dashboard-page').classList.contains('active')) {
      loadDashboardData();
      Charts.initDashboardCharts();
      loadRecentTransactions();
    } else if (document.getElementById('transactions-page').classList.contains('active')) {
      loadTransactionsData();
    }
  });
}

// Initialize category form
function initCategoryForm() {
  const form = document.getElementById('category-form');
  if (!form) return;
  
  // Get form elements
  const typeSelector = form.querySelectorAll('.tab');
  const iconSelector = document.getElementById('icon-selector');
  
  // Populate icon selector
  populateIconSelector(iconSelector);
  
  // Tab selector for income/expense
  typeSelector.forEach(tab => {
    tab.addEventListener('click', function() {
      // Update active tab
      typeSelector.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
    });
  });
  
  // Form submission
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const id = document.getElementById('category-id').value;
    const type = form.querySelector('.tab.active').getAttribute('data-type');
    const name = document.getElementById('category-name').value;
    const color = document.getElementById('category-color').value;
    const icon = iconSelector.querySelector('.selected').querySelector('i').className;
    
    // Create category object
    const category = {
      id: id || generateId(),
      type,
      name,
      color,
      icon
    };
    
    // Save category
    if (id) {
      // Update existing
      ExpenseTracker.updateCategory(category);
      showToast('Category updated successfully', 'success');
    } else {
      // Add new
      ExpenseTracker.addCategory(category);
      showToast('Category added successfully', 'success');
    }
    
    // Close modal
    document.getElementById('category-modal').classList.remove('show');
    
    // Reload categories
    loadCategoriesData();
    
    // Also reload transactions if on transactions page to update category dropdowns
    if (document.getElementById('transactions-page').classList.contains('active')) {
      loadTransactionsData();
    }
  });
}

// Initialize budget form
function initBudgetForm() {
  const form = document.getElementById('budget-form');
  if (!form) return;
  
  // Get form elements
  const categorySelect = document.getElementById('budget-category');
  
  // Populate category select with expense categories
  populateCategorySelect(categorySelect, 'expense');
  
  // Form submission
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const id = document.getElementById('budget-id').value;
    const category = document.getElementById('budget-category').value;
    const amount = parseFloat(document.getElementById('budget-amount').value);
    const period = document.getElementById('budget-period').value;
    
    // Create budget object
    const budget = {
      id: id || generateId(),
      category,
      amount,
      period
    };
    
    // Save budget
    if (id) {
      // Update existing
      ExpenseTracker.updateBudget(budget);
      showToast('Budget updated successfully', 'success');
    } else {
      // Add new
      ExpenseTracker.addBudget(budget);
      showToast('Budget added successfully', 'success');
    }
    
    // Close modal
    document.getElementById('budget-modal').classList.remove('show');
    
    // Reload budgets
    loadBudgetsData();
  });
}

// Initialize dark mode
function initDarkMode() {
  // Check localStorage for user preference
  const darkModeEnabled = localStorage.getItem('darkMode') === 'true';
  
  // Apply dark mode class to document element
  document.documentElement.classList.toggle('dark', darkModeEnabled);
  
  // Also apply traditional class for backward compatibility
  if (darkModeEnabled) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
  
  // Set dark mode toggle checkbox
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  if (darkModeToggle) {
    darkModeToggle.checked = darkModeEnabled;
    
    // Add event listener to toggle
    darkModeToggle.addEventListener('change', function() {
      // Toggle dark mode class
      document.documentElement.classList.toggle('dark', this.checked);
      document.body.classList.toggle('dark-mode', this.checked);
      
      // Save preference to localStorage
      localStorage.setItem('darkMode', this.checked);
      
      // Reinitialize charts if visible
      if (document.getElementById('dashboard-page').classList.contains('active')) {
        Charts.initDashboardCharts();
      }
      if (document.getElementById('reports-page').classList.contains('active')) {
        const now = new Date();
        Charts.initReportCharts(now.getMonth(), now.getFullYear());
      }
    });
  }
  
  // Listen for storage events to update theme in real-time across tabs
  window.addEventListener('storage', function(e) {
    if (e.key === 'darkMode') {
      const isDarkMode = e.newValue === 'true';
      document.documentElement.classList.toggle('dark', isDarkMode);
      document.body.classList.toggle('dark-mode', isDarkMode);
      
      // Update toggle checkbox
      if (darkModeToggle) {
        darkModeToggle.checked = isDarkMode;
      }
    }
  });
  
  console.log('Dark mode initialized, current state:', darkModeEnabled);
}

// Initialize logout
function initLogout() {
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Confirm logout
      const confirmModal = document.getElementById('confirm-modal');
      const confirmTitle = document.getElementById('confirm-title');
      const confirmMessage = document.getElementById('confirm-message');
      const confirmAction = document.getElementById('confirm-action-btn');
      
      confirmTitle.textContent = 'Confirm Logout';
      confirmMessage.textContent = 'Are you sure you want to log out?';
      
      // Set confirm button action
      confirmAction.onclick = function() {
        // Log out user
        Auth.logout();
        
        // Redirect to login page
        window.location.href = 'login.html';
      };
      
      // Show confirm modal
      confirmModal.classList.add('show');
    });
  }
}

// Load dashboard data
function loadDashboardData() {
  // Get current month and year
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Get total income and expenses for current month
  const totalIncome = ExpenseTracker.getTotalIncomeByMonth(currentMonth, currentYear);
  const totalExpenses = ExpenseTracker.getTotalExpensesByMonth(currentMonth, currentYear);
  const balance = totalIncome - totalExpenses;
  
  // Update summary cards
  document.getElementById('total-income').textContent = formatCurrency(totalIncome);
  document.getElementById('total-expenses').textContent = formatCurrency(totalExpenses);
  document.getElementById('balance').textContent = formatCurrency(balance);
}

// Load recent transactions
function loadRecentTransactions() {
  const container = document.getElementById('recent-transactions-list');
  if (!container) return;
  
  // Clear container
  container.innerHTML = '';
  
  // Get recent transactions (last 5)
  const transactions = ExpenseTracker.getRecentTransactions(5);
  
  // Check if there are any transactions
  if (transactions.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-receipt"></i>
        <p>No transactions yet</p>
        <button class="btn btn-primary" id="add-transaction-btn-empty">
          <i class="fas fa-plus"></i> Add Transaction
        </button>
      </div>
    `;
    
    // Add event listener to button
    const addBtn = document.getElementById('add-transaction-btn-empty');
    if (addBtn) {
      addBtn.addEventListener('click', function() {
        openTransactionModal();
      });
    }
    
    return;
  }
  
  // Add each transaction to container
  transactions.forEach(transaction => {
    const transactionEl = createTransactionElement(transaction);
    container.appendChild(transactionEl);
  });
}

// Create transaction element
function createTransactionElement(transaction) {
  // Get category
  const category = ExpenseTracker.getCategoryById(transaction.category);
  
  // Create element
  const element = document.createElement('div');
  element.className = 'transaction-item';
  
  // Set element content
  element.innerHTML = `
    <div class="transaction-category" style="background-color: ${category?.color || '#6366f1'}">
      <i class="${category?.icon || 'fas fa-tag'}"></i>
    </div>
    <div class="transaction-details">
      <div class="transaction-title">${transaction.description}</div>
      <div class="transaction-date">${formatDate(transaction.date)}</div>
    </div>
    <div class="transaction-amount ${transaction.type === 'income' ? 'income-amount' : 'expense-amount'}">
      ${transaction.type === 'income' ? '+' : '-'} ${formatCurrency(transaction.amount)}
    </div>
  `;
  
  // Add click event to view/edit transaction
  element.addEventListener('click', function() {
    openTransactionModal(transaction);
  });
  
  return element;
}

// Load transactions data
function loadTransactionsData() {
  // Get filter elements
  const filterType = document.getElementById('filter-type');
  const filterCategory = document.getElementById('filter-category');
  const filterDateFrom = document.getElementById('filter-date-from');
  const filterDateTo = document.getElementById('filter-date-to');
  const filterAmountMin = document.getElementById('filter-amount-min');
  const filterAmountMax = document.getElementById('filter-amount-max');
  
  // Populate category filter
  populateCategoryFilter(filterCategory);
  
  // Add filter change event listeners
  [filterType, filterCategory, filterDateFrom, filterDateTo, filterAmountMin, filterAmountMax].forEach(filter => {
    if (filter) {
      filter.addEventListener('change', filterTransactions);
    }
  });
  
  // Initial load of transactions
  filterTransactions();
}

// Filter transactions based on filter values
function filterTransactions() {
  // Get filter values
  const filterType = document.getElementById('filter-type').value;
  const filterCategory = document.getElementById('filter-category').value;
  const filterDateFrom = document.getElementById('filter-date-from').value;
  const filterDateTo = document.getElementById('filter-date-to').value;
  const filterAmountMin = document.getElementById('filter-amount-min').value;
  const filterAmountMax = document.getElementById('filter-amount-max').value;
  
  // Get all transactions
  let transactions = ExpenseTracker.getTransactions();
  
  // Apply filters
  if (filterType !== 'all') {
    transactions = transactions.filter(t => t.type === filterType);
  }
  
  if (filterCategory !== 'all') {
    transactions = transactions.filter(t => t.category === filterCategory);
  }
  
  if (filterDateFrom) {
    transactions = transactions.filter(t => new Date(t.date) >= new Date(filterDateFrom));
  }
  
  if (filterDateTo) {
    transactions = transactions.filter(t => new Date(t.date) <= new Date(filterDateTo));
  }
  
  if (filterAmountMin) {
    transactions = transactions.filter(t => t.amount >= parseFloat(filterAmountMin));
  }
  
  if (filterAmountMax) {
    transactions = transactions.filter(t => t.amount <= parseFloat(filterAmountMax));
  }
  
  // Sort transactions by date (newest first)
  transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Get table body
  const tableBody = document.getElementById('transactions-table-body');
  if (!tableBody) return;
  
  // Clear table body
  tableBody.innerHTML = '';
  
  // Check if there are any transactions
  if (transactions.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5">
          <div class="empty-state">
            <i class="fas fa-search"></i>
            <p>No transactions found</p>
            <p class="empty-description">Try adjusting your filters to see more results</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }
  
  // Add each transaction to table
  transactions.forEach(transaction => {
    // Get category
    const category = ExpenseTracker.getCategoryById(transaction.category);
    
    // Create row
    const row = document.createElement('tr');
    
    // Set row content
    row.innerHTML = `
      <td>${formatDate(transaction.date)}</td>
      <td>${transaction.description}</td>
      <td>
        <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${category?.color || '#6366f1'}; margin-right: 5px;"></span>
        ${category?.name || 'Uncategorized'}
      </td>
      <td class="${transaction.type === 'income' ? 'income-amount' : 'expense-amount'}">
        ${transaction.type === 'income' ? '+' : '-'} ${formatCurrency(transaction.amount)}
      </td>
      <td>
        <div class="transaction-actions">
          <button class="action-btn edit-btn" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="action-btn delete-btn" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    `;
    
    // Add edit button event
    row.querySelector('.edit-btn').addEventListener('click', function(e) {
      e.stopPropagation();
      openTransactionModal(transaction);
    });
    
    // Add delete button event
    row.querySelector('.delete-btn').addEventListener('click', function(e) {
      e.stopPropagation();
      confirmDeleteTransaction(transaction);
    });
    
    // Add row to table
    tableBody.appendChild(row);
  });
}

// Load categories data
function loadCategoriesData() {
  // Get category grids
  const incomeGrid = document.getElementById('income-categories-grid');
  const expenseGrid = document.getElementById('expense-categories-grid');
  
  if (!incomeGrid || !expenseGrid) return;
  
  // Clear grids
  incomeGrid.innerHTML = '';
  expenseGrid.innerHTML = '';
  
  // Get categories
  const categories = ExpenseTracker.getCategories();
  
  // Separate categories by type
  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');
  
  // Check if there are any income categories
  if (incomeCategories.length === 0) {
    incomeGrid.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-tags"></i>
        <p>No income categories yet</p>
        <button class="btn btn-primary add-category-btn-empty" data-type="income">
          <i class="fas fa-plus"></i> Add Income Category
        </button>
      </div>
    `;
  } else {
    // Add each income category to grid
    incomeCategories.forEach(category => {
      const categoryEl = createCategoryElement(category);
      incomeGrid.appendChild(categoryEl);
    });
  }
  
  // Check if there are any expense categories
  if (expenseCategories.length === 0) {
    expenseGrid.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-tags"></i>
        <p>No expense categories yet</p>
        <button class="btn btn-primary add-category-btn-empty" data-type="expense">
          <i class="fas fa-plus"></i> Add Expense Category
        </button>
      </div>
    `;
  } else {
    // Add each expense category to grid
    expenseCategories.forEach(category => {
      const categoryEl = createCategoryElement(category);
      expenseGrid.appendChild(categoryEl);
    });
  }
  
  // Add event listeners to empty state buttons
  document.querySelectorAll('.add-category-btn-empty').forEach(btn => {
    btn.addEventListener('click', function() {
      const type = this.getAttribute('data-type');
      openCategoryModal(null, type);
    });
  });
}

// Create category element
function createCategoryElement(category) {
  // Create element
  const element = document.createElement('div');
  element.className = 'category-card';
  
  // Set element content
  element.innerHTML = `
    <div class="category-icon" style="background-color: ${category.color}">
      <i class="${category.icon}"></i>
    </div>
    <div class="category-name">${category.name}</div>
    <div class="category-actions">
      <button class="edit-btn" title="Edit">
        <i class="fas fa-edit"></i>
      </button>
      <button class="delete-btn" title="Delete">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `;
  
  // Add edit button event
  element.querySelector('.edit-btn').addEventListener('click', function(e) {
    e.stopPropagation();
    openCategoryModal(category);
  });
  
  // Add delete button event
  element.querySelector('.delete-btn').addEventListener('click', function(e) {
    e.stopPropagation();
    confirmDeleteCategory(category);
  });
  
  return element;
}

// Load budgets data
function loadBudgetsData() {
  // Get budgets container
  const container = document.getElementById('budgets-container');
  if (!container) return;
  
  // Clear container
  container.innerHTML = '';
  
  // Get budgets
  const budgets = ExpenseTracker.getBudgets();
  
  // Check if there are any budgets
  if (budgets.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-wallet"></i>
        <p>No budgets yet</p>
        <p class="empty-description">Set up budgets to track your spending limits</p>
        <button class="btn btn-primary" id="add-budget-btn-empty">
          <i class="fas fa-plus"></i> Add Budget
        </button>
      </div>
    `;
    
    // Add event listener to button
    const addBtn = document.getElementById('add-budget-btn-empty');
    if (addBtn) {
      addBtn.addEventListener('click', function() {
        openBudgetModal();
      });
    }
    
    return;
  }
  
  // Get current date
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Add each budget to container
  budgets.forEach(budget => {
    // Get category
    const category = ExpenseTracker.getCategoryById(budget.category);
    if (!category) return;
    
    // Calculate spending for current period
    let totalSpent = 0;
    if (budget.period === 'monthly') {
      totalSpent = ExpenseTracker.getCategoryExpensesByMonth(budget.category, currentMonth, currentYear);
    } else if (budget.period === 'weekly') {
      totalSpent = ExpenseTracker.getCategoryExpensesByWeek(budget.category);
    } else if (budget.period === 'yearly') {
      totalSpent = ExpenseTracker.getCategoryExpensesByYear(budget.category, currentYear);
    }
    
    // Calculate progress percentage
    const progressPercentage = (totalSpent / budget.amount) * 100;
    
    // Determine progress status
    let progressStatus = '';
    if (progressPercentage >= 100) {
      progressStatus = 'danger';
    } else if (progressPercentage >= 75) {
      progressStatus = 'warning';
    }
    
    // Calculate remaining amount
    const remainingAmount = budget.amount - totalSpent;
    
    // Create element
    const element = document.createElement('div');
    element.className = 'budget-card';
    
    // Set element content
    element.innerHTML = `
      <div class="budget-header">
        <div>
          <div class="budget-title">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${category.color}; margin-right: 5px;"></span>
            ${category.name}
          </div>
          <div class="budget-period">${budget.period.charAt(0).toUpperCase() + budget.period.slice(1)} Budget</div>
        </div>
        <div class="transaction-actions">
          <button class="action-btn edit-btn" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="action-btn delete-btn" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      
      <div class="budget-content">
        <div class="budget-amount">${formatCurrency(budget.amount)}</div>
        
        <div class="budget-progress ${progressStatus}">
          <div class="progress-info">
            <div>${formatCurrency(totalSpent)} spent</div>
            <div>${progressPercentage.toFixed(0)}%</div>
          </div>
          <div class="progress-bar">
            <div class="progress-value" style="width: ${Math.min(progressPercentage, 100)}%"></div>
          </div>
        </div>
      </div>
      
      <div class="budget-footer">
        <div class="remaining-label">Remaining</div>
        <div class="remaining-value ${remainingAmount < 0 ? 'danger' : ''}">${formatCurrency(remainingAmount)}</div>
      </div>
      
      ${progressPercentage >= 100 ? `
        <div class="budget-alert">
          <i class="fas fa-exclamation-circle"></i>
          <span>Budget exceeded by ${formatCurrency(Math.abs(remainingAmount))}</span>
        </div>
      ` : ''}
    `;
    
    // Add edit button event
    element.querySelector('.edit-btn').addEventListener('click', function(e) {
      e.stopPropagation();
      openBudgetModal(budget);
    });
    
    // Add delete button event
    element.querySelector('.delete-btn').addEventListener('click', function(e) {
      e.stopPropagation();
      confirmDeleteBudget(budget);
    });
    
    // Add element to container
    container.appendChild(element);
  });
}

// Initialize reports page
function initReportsPage() {
  // Get current date
  const now = new Date();
  let currentMonth = now.getMonth();
  let currentYear = now.getFullYear();
  
  // Update current month text
  updateCurrentMonthText(currentMonth, currentYear);
  
  // Initialize report charts
  Charts.initReportCharts(currentMonth, currentYear);
  
  // Add month navigation events
  document.getElementById('prev-month').addEventListener('click', function() {
    // Go to previous month
    if (currentMonth === 0) {
      currentMonth = 11;
      currentYear--;
    } else {
      currentMonth--;
    }
    
    // Update current month text
    updateCurrentMonthText(currentMonth, currentYear);
    
    // Reinitialize charts
    Charts.initReportCharts(currentMonth, currentYear);
  });
  
  document.getElementById('next-month').addEventListener('click', function() {
    // Go to next month
    if (currentMonth === 11) {
      currentMonth = 0;
      currentYear++;
    } else {
      currentMonth++;
    }
    
    // Update current month text
    updateCurrentMonthText(currentMonth, currentYear);
    
    // Reinitialize charts
    Charts.initReportCharts(currentMonth, currentYear);
  });
  
  // Add export button event
  document.getElementById('export-report-btn').addEventListener('click', function() {
    exportReport(currentMonth, currentYear);
  });
}

// Update current month text
function updateCurrentMonthText(month, year) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  document.getElementById('current-month').textContent = `${monthNames[month]} ${year}`;
}

// Export report data
function exportReport(month, year) {
  // Get month name
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Get transactions for the month
  const transactions = ExpenseTracker.getTransactionsByMonth(month, year);
  
  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Group expenses by category
  const expensesByCategory = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(transaction => {
      const category = ExpenseTracker.getCategoryById(transaction.category);
      const categoryName = category ? category.name : 'Uncategorized';
      
      if (expensesByCategory[categoryName]) {
        expensesByCategory[categoryName] += transaction.amount;
      } else {
        expensesByCategory[categoryName] = transaction.amount;
      }
    });
  
  // Group income by category
  const incomeByCategory = {};
  transactions
    .filter(t => t.type === 'income')
    .forEach(transaction => {
      const category = ExpenseTracker.getCategoryById(transaction.category);
      const categoryName = category ? category.name : 'Uncategorized';
      
      if (incomeByCategory[categoryName]) {
        incomeByCategory[categoryName] += transaction.amount;
      } else {
        incomeByCategory[categoryName] = transaction.amount;
      }
    });
  
  // Create report data
  const reportData = {
    period: `${monthNames[month]} ${year}`,
    summary: {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses
    },
    expensesByCategory,
    incomeByCategory,
    transactions
  };
  
  // Convert to JSON
  const jsonData = JSON.stringify(reportData, null, 2);
  
  // Create download link
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `financial_report_${monthNames[month]}_${year}.json`;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  // Show success toast
  showToast('Report exported successfully', 'success');
}

// Load settings data
function loadSettingsData() {
  // Get current user
  const currentUser = Auth.getCurrentUser();
  if (!currentUser) return;
  
  // Update profile fields
  document.getElementById('profile-name').textContent = currentUser.name;
  document.getElementById('profile-email').textContent = currentUser.email;
  document.getElementById('settings-name').value = currentUser.name;
  document.getElementById('settings-email').value = currentUser.email;
  
  if (currentUser.avatar) {
    document.getElementById('profile-image').src = currentUser.avatar;
  }
  
  // Avatar upload
  const avatarUpload = document.getElementById('avatar-upload');
  if (avatarUpload) {
    avatarUpload.addEventListener('change', function(e) {
      if (this.files && this.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
          const imageData = e.target.result;
          
          // Update avatar
          document.getElementById('profile-image').src = imageData;
          document.getElementById('user-avatar').src = imageData;
          
          // Update user data
          const userData = Auth.getCurrentUser();
          userData.avatar = imageData;
          Auth.updateUser(userData);
          
          // Show success toast
          showToast('Profile picture updated', 'success');
        };
        
        reader.readAsDataURL(this.files[0]);
      }
    });
  }
  
  // Profile form
  const profileForm = document.getElementById('profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get form values
      const name = document.getElementById('settings-name').value;
      const email = document.getElementById('settings-email').value;
      
      // Update user data
      const userData = Auth.getCurrentUser();
      userData.name = name;
      userData.email = email;
      Auth.updateUser(userData);
      
      // Update displayed name and email
      document.getElementById('profile-name').textContent = name;
      document.getElementById('profile-email').textContent = email;
      document.getElementById('user-name').textContent = name;
      document.getElementById('user-email').textContent = email;
      
      // Show success toast
      showToast('Profile updated successfully', 'success');
    });
  }
  
  // Password form
  const passwordForm = document.getElementById('password-form');
  if (passwordForm) {
    passwordForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get form values
      const currentPassword = document.getElementById('current-password').value;
      const newPassword = document.getElementById('new-password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      
      // Validate current password
      if (!Auth.verifyPassword(currentPassword)) {
        showToast('Current password is incorrect', 'error');
        return;
      }
      
      // Validate new password
      if (newPassword.length < 6) {
        showToast('New password must be at least 6 characters', 'error');
        return;
      }
      
      // Validate confirm password
      if (newPassword !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
      }
      
      // Update password
      Auth.changePassword(newPassword);
      
      // Reset form
      passwordForm.reset();
      
      // Show success toast
      showToast('Password changed successfully', 'success');
    });
  }
  
  // Data management
  const exportDataBtn = document.getElementById('export-data-btn');
  if (exportDataBtn) {
    exportDataBtn.addEventListener('click', function() {
      exportAllData();
    });
  }
  
  const importDataBtn = document.getElementById('import-data-btn');
  const importFile = document.getElementById('import-file');
  if (importDataBtn && importFile) {
    importDataBtn.addEventListener('click', function() {
      importFile.click();
    });
    
    importFile.addEventListener('change', function(e) {
      if (this.files && this.files[0]) {
        importAllData(this.files[0]);
      }
    });
  }
  
  const clearDataBtn = document.getElementById('clear-data-btn');
  if (clearDataBtn) {
    clearDataBtn.addEventListener('click', function() {
      confirmClearData();
    });
  }
  
  // Currency select
  const currencySelect = document.getElementById('currency-select');
  if (currencySelect) {
    // Set current currency
    const currentCurrency = localStorage.getItem('currency') || 'INR';
    currencySelect.value = currentCurrency;
    
    // Add change event
    currencySelect.addEventListener('change', function() {
      // Save currency to localStorage
      localStorage.setItem('currency', this.value);
      
      // Reload page to update all currency displays
      window.location.reload();
    });
  }
  
  // Notifications toggle
  const notificationsToggle = document.getElementById('notifications-toggle');
  if (notificationsToggle) {
    // Set current state
    const notificationsEnabled = localStorage.getItem('notifications') !== 'false';
    notificationsToggle.checked = notificationsEnabled;
    
    // Add change event
    notificationsToggle.addEventListener('change', function() {
      // Save preference to localStorage
      localStorage.setItem('notifications', this.checked);
    });
  }
}

// Export all data
function exportAllData() {
  // Get all data
  const data = {
    transactions: ExpenseTracker.getTransactions(),
    categories: ExpenseTracker.getCategories(),
    budgets: ExpenseTracker.getBudgets()
  };
  
  // Convert to JSON
  const jsonData = JSON.stringify(data, null, 2);
  
  // Create download link
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'expense_tracker_data.json';
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  // Show success toast
  showToast('Data exported successfully', 'success');
}

// Import all data
function importAllData(file) {
  const reader = new FileReader();
  
  reader.onload = function(e) {
    try {
      // Parse JSON data
      const data = JSON.parse(e.target.result);
      
      // Validate data structure
      if (!data.transactions || !data.categories || !data.budgets) {
        throw new Error('Invalid data format');
      }
      
      // Confirm import
      const confirmModal = document.getElementById('confirm-modal');
      const confirmTitle = document.getElementById('confirm-title');
      const confirmMessage = document.getElementById('confirm-message');
      const confirmAction = document.getElementById('confirm-action-btn');
      
      confirmTitle.textContent = 'Confirm Import';
      confirmMessage.innerHTML = `
        <p>Are you sure you want to import this data? This will replace all your current data.</p>
        <p><strong>Summary:</strong></p>
        <ul>
          <li>Transactions: ${data.transactions.length}</li>
          <li>Categories: ${data.categories.length}</li>
          <li>Budgets: ${data.budgets.length}</li>
        </ul>
      `;
      
      // Set confirm button action
      confirmAction.onclick = function() {
        // Import data
        ExpenseTracker.importData(data);
        
        // Close modal
        confirmModal.classList.remove('show');
        
        // Reset file input
        document.getElementById('import-file').value = '';
        
        // Show success toast
        showToast('Data imported successfully', 'success');
        
        // Reload page to update all data
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      };
      
      // Show confirm modal
      confirmModal.classList.add('show');
    } catch (error) {
      showToast('Error importing data: ' + error.message, 'error');
    }
  };
  
  reader.readAsText(file);
}

// Confirm clear data
function confirmClearData() {
  const confirmModal = document.getElementById('confirm-modal');
  const confirmTitle = document.getElementById('confirm-title');
  const confirmMessage = document.getElementById('confirm-message');
  const confirmAction = document.getElementById('confirm-action-btn');
  
  confirmTitle.textContent = 'Confirm Clear Data';
  confirmMessage.textContent = 'Are you sure you want to clear all your data? This action cannot be undone.';
  
  // Set confirm button action
  confirmAction.onclick = function() {
    // Clear data
    ExpenseTracker.clearData();
    
    // Close modal
    confirmModal.classList.remove('show');
    
    // Show success toast
    showToast('All data cleared successfully', 'success');
    
    // Reload page to update UI
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };
  
  // Show confirm modal
  confirmModal.classList.add('show');
}

// Open transaction modal
function openTransactionModal(transaction = null) {
  // Get form elements
  const form = document.getElementById('transaction-form');
  const modalTitle = document.getElementById('transaction-modal-title');
  const typeSelector = form.querySelectorAll('.tab');
  const idInput = document.getElementById('transaction-id');
  const dateInput = document.getElementById('transaction-date');
  const amountInput = document.getElementById('transaction-amount');
  const categorySelect = document.getElementById('transaction-category');
  const descriptionInput = document.getElementById('transaction-description');
  const notesInput = document.getElementById('transaction-notes');
  
  // Set modal title
  modalTitle.textContent = transaction ? 'Edit Transaction' : 'Add Transaction';
  
  // Reset form
  form.reset();
  
  if (transaction) {
    // Fill form with transaction data
    idInput.value = transaction.id;
    dateInput.value = transaction.date;
    amountInput.value = transaction.amount;
    descriptionInput.value = transaction.description;
    notesInput.value = transaction.notes || '';
    
    // Set active tab
    typeSelector.forEach(tab => {
      if (tab.getAttribute('data-type') === transaction.type) {
        tab.click();
      }
    });
    
    // Populate category select based on type
    populateCategorySelect(categorySelect, transaction.type);
    
    // Set selected category
    categorySelect.value = transaction.category;
  } else {
    // Set default values
    idInput.value = '';
    dateInput.value = new Date().toISOString().slice(0, 10);
    
    // Set expense as default type
    typeSelector.forEach(tab => {
      if (tab.getAttribute('data-type') === 'expense') {
        tab.click();
      }
    });
    
    // Populate category select for expenses
    populateCategorySelect(categorySelect, 'expense');
  }
  
  // Show modal
  document.getElementById('transaction-modal').classList.add('show');
}

// Open category modal
function openCategoryModal(category = null, defaultType = null) {
  // Get form elements
  const form = document.getElementById('category-form');
  const modalTitle = document.getElementById('category-modal-title');
  const typeSelector = form.querySelectorAll('.tab');
  const idInput = document.getElementById('category-id');
  const nameInput = document.getElementById('category-name');
  const colorInput = document.getElementById('category-color');
  const iconSelector = document.getElementById('icon-selector');
  
  // Set modal title
  modalTitle.textContent = category ? 'Edit Category' : 'Add Category';
  
  // Reset form
  form.reset();
  
  // Populate icon selector
  populateIconSelector(iconSelector);
  
  if (category) {
    // Fill form with category data
    idInput.value = category.id;
    nameInput.value = category.name;
    colorInput.value = category.color;
    
    // Set active tab
    typeSelector.forEach(tab => {
      if (tab.getAttribute('data-type') === category.type) {
        tab.click();
      }
    });
    
    // Set selected icon
    const icons = iconSelector.querySelectorAll('.icon-option');
    icons.forEach(icon => {
      const iconClass = icon.querySelector('i').className;
      if (iconClass === category.icon) {
        icon.classList.add('selected');
      } else {
        icon.classList.remove('selected');
      }
    });
  } else {
    // Set default values
    idInput.value = '';
    
    // Set type based on defaultType or default to expense
    typeSelector.forEach(tab => {
      if (tab.getAttribute('data-type') === (defaultType || 'expense')) {
        tab.click();
      }
    });
    
    // Set default icon
    const defaultIcon = iconSelector.querySelector('.icon-option');
    if (defaultIcon) {
      defaultIcon.classList.add('selected');
    }
  }
  
  // Show modal
  document.getElementById('category-modal').classList.add('show');
}

// Open budget modal
function openBudgetModal(budget = null) {
  // Get form elements
  const form = document.getElementById('budget-form');
  const modalTitle = document.getElementById('budget-modal-title');
  const idInput = document.getElementById('budget-id');
  const categorySelect = document.getElementById('budget-category');
  const amountInput = document.getElementById('budget-amount');
  const periodSelect = document.getElementById('budget-period');
  
  // Set modal title
  modalTitle.textContent = budget ? 'Edit Budget' : 'Add Budget';
  
  // Reset form
  form.reset();
  
  // Populate category select
  populateCategorySelect(categorySelect, 'expense');
  
  if (budget) {
    // Fill form with budget data
    idInput.value = budget.id;
    categorySelect.value = budget.category;
    amountInput.value = budget.amount;
    periodSelect.value = budget.period;
  } else {
    // Set default values
    idInput.value = '';
    periodSelect.value = 'monthly';
  }
  
  // Show modal
  document.getElementById('budget-modal').classList.add('show');
}

// Confirm delete transaction
function confirmDeleteTransaction(transaction) {
  const confirmModal = document.getElementById('confirm-modal');
  const confirmTitle = document.getElementById('confirm-title');
  const confirmMessage = document.getElementById('confirm-message');
  const confirmAction = document.getElementById('confirm-action-btn');
  
  confirmTitle.textContent = 'Delete Transaction';
  confirmMessage.textContent = `Are you sure you want to delete the transaction "${transaction.description}"?`;
  
  // Set confirm button action
  confirmAction.onclick = function() {
    // Delete transaction
    ExpenseTracker.deleteTransaction(transaction.id);
    
    // Close modal
    confirmModal.classList.remove('show');
    
    // Show success toast
    showToast('Transaction deleted successfully', 'success');
    
    // Reload data
    if (document.getElementById('dashboard-page').classList.contains('active')) {
      loadDashboardData();
      Charts.initDashboardCharts();
      loadRecentTransactions();
    } else if (document.getElementById('transactions-page').classList.contains('active')) {
      loadTransactionsData();
    }
  };
  
  // Show confirm modal
  confirmModal.classList.add('show');
}

// Confirm delete category
function confirmDeleteCategory(category) {
  // Check if category is used in transactions
  const transactions = ExpenseTracker.getTransactionsByCategory(category.id);
  
  const confirmModal = document.getElementById('confirm-modal');
  const confirmTitle = document.getElementById('confirm-title');
  const confirmMessage = document.getElementById('confirm-message');
  const confirmAction = document.getElementById('confirm-action-btn');
  
  confirmTitle.textContent = 'Delete Category';
  
  if (transactions.length > 0) {
    confirmMessage.innerHTML = `
      <p>The category "${category.name}" is used in ${transactions.length} transactions.</p>
      <p>Deleting this category will remove it from all associated transactions.</p>
      <p>Are you sure you want to proceed?</p>
    `;
  } else {
    confirmMessage.textContent = `Are you sure you want to delete the category "${category.name}"?`;
  }
  
  // Set confirm button action
  confirmAction.onclick = function() {
    // Delete category
    ExpenseTracker.deleteCategory(category.id);
    
    // Close modal
    confirmModal.classList.remove('show');
    
    // Show success toast
    showToast('Category deleted successfully', 'success');
    
    // Reload categories
    loadCategoriesData();
    
    // Reload transactions if on transactions page
    if (document.getElementById('transactions-page').classList.contains('active')) {
      loadTransactionsData();
    }
  };
  
  // Show confirm modal
  confirmModal.classList.add('show');
}

// Confirm delete budget
function confirmDeleteBudget(budget) {
  // Get category name
  const category = ExpenseTracker.getCategoryById(budget.category);
  const categoryName = category ? category.name : 'Unknown Category';
  
  const confirmModal = document.getElementById('confirm-modal');
  const confirmTitle = document.getElementById('confirm-title');
  const confirmMessage = document.getElementById('confirm-message');
  const confirmAction = document.getElementById('confirm-action-btn');
  
  confirmTitle.textContent = 'Delete Budget';
  confirmMessage.textContent = `Are you sure you want to delete the budget for "${categoryName}"?`;
  
  // Set confirm button action
  confirmAction.onclick = function() {
    // Delete budget
    ExpenseTracker.deleteBudget(budget.id);
    
    // Close modal
    confirmModal.classList.remove('show');
    
    // Show success toast
    showToast('Budget deleted successfully', 'success');
    
    // Reload budgets
    loadBudgetsData();
  };
  
  // Show confirm modal
  confirmModal.classList.add('show');
}

// Populate category select
function populateCategorySelect(select, type) {
  if (!select) return;
  
  // Clear select
  select.innerHTML = '';
  
  // Get categories by type
  const categories = ExpenseTracker.getCategoriesByType(type);
  
  // Check if there are any categories
  if (categories.length === 0) {
    // Add default option
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'No categories available';
    option.disabled = true;
    option.selected = true;
    select.appendChild(option);
    
    // Add link to create category
    const createOption = document.createElement('option');
    createOption.value = 'create';
    createOption.textContent = '+ Create new category';
    select.appendChild(createOption);
    
    // Add change event to redirect to category creation
    select.addEventListener('change', function() {
      if (this.value === 'create') {
        // Reset select
        this.value = '';
        
        // Open category modal
        openCategoryModal(null, type);
      }
    });
    
    return;
  }
  
  // Add each category to select
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category.id;
    option.textContent = category.name;
    select.appendChild(option);
  });
  
  // Add option to create new category
  const createOption = document.createElement('option');
  createOption.value = 'create';
  createOption.textContent = '+ Create new category';
  select.appendChild(createOption);
  
  // Add change event to redirect to category creation
  select.addEventListener('change', function() {
    if (this.value === 'create') {
      // Store current value
      const currentValue = select.getAttribute('data-current-value') || '';
      
      // Reset select
      this.value = currentValue;
      
      // Open category modal
      openCategoryModal(null, type);
    } else {
      // Store current value
      select.setAttribute('data-current-value', this.value);
    }
  });
}

// Populate category filter
function populateCategoryFilter(select) {
  if (!select) return;
  
  // Clear select
  select.innerHTML = '';
  
  // Add "All Categories" option
  const allOption = document.createElement('option');
  allOption.value = 'all';
  allOption.textContent = 'All Categories';
  select.appendChild(allOption);
  
  // Get all categories
  const categories = ExpenseTracker.getCategories();
  
  // Add each category to select
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category.id;
    option.textContent = category.name;
    select.appendChild(option);
  });
}

// Populate icon selector
function populateIconSelector(container) {
  if (!container) return;
  
  // Clear container
  container.innerHTML = '';
  
  // Define available icons
  const icons = [
    'fas fa-home', 'fas fa-utensils', 'fas fa-shopping-cart', 'fas fa-car',
    'fas fa-plane', 'fas fa-gamepad', 'fas fa-tshirt', 'fas fa-pills',
    'fas fa-graduation-cap', 'fas fa-book', 'fas fa-tv', 'fas fa-coffee',
    'fas fa-cocktail', 'fas fa-gift', 'fas fa-gas-pump', 'fas fa-shuttle-van',
    'fas fa-bus', 'fas fa-train', 'fas fa-taxi', 'fas fa-subway',
    'fas fa-briefcase', 'fas fa-coins', 'fas fa-credit-card', 'fas fa-wallet',
    'fas fa-piggy-bank', 'fas fa-money-bill-wave', 'fas fa-hand-holding-usd', 'fas fa-donate',
    'fas fa-chart-line', 'fas fa-chart-bar', 'fas fa-chart-pie', 'fas fa-percentage'
  ];
  
  // Add each icon to container
  icons.forEach(icon => {
    const iconOption = document.createElement('div');
    iconOption.className = 'icon-option';
    iconOption.innerHTML = `<i class="${icon}"></i>`;
    
    // Add click event to select icon
    iconOption.addEventListener('click', function() {
      // Remove selected class from all icons
      container.querySelectorAll('.icon-option').forEach(i => {
        i.classList.remove('selected');
      });
      
      // Add selected class to clicked icon
      this.classList.add('selected');
    });
    
    // Add icon to container
    container.appendChild(iconOption);
  });
}

// Format currency
function formatCurrency(amount) {
  // Get currency from localStorage
  const currency = localStorage.getItem('currency') || 'INR';
  
  // Format based on currency
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

// Format date
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Show toast notification
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = '';
  switch (type) {
    case 'success':
      icon = '<i class="fas fa-check-circle"></i>';
      break;
    case 'error':
      icon = '<i class="fas fa-exclamation-circle"></i>';
      break;
    default:
      icon = '<i class="fas fa-info-circle"></i>';
  }
  
  let title = '';
  switch (type) {
    case 'success':
      title = 'Success';
      break;
    case 'error':
      title = 'Error';
      break;
    default:
      title = 'Information';
  }
  
  toast.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close">&times;</button>
  `;
  
  const toastContainer = document.getElementById('toast-container');
  toastContainer.appendChild(toast);
  
  // Add event listener for close button
  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.remove();
  });
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }
  }, 5000);
}
