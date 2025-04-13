
// UI related functions
const UI = {
  // Initialize UI
  init: function() {
    this.initSidebar();
    this.initModals();
    this.initDashboard();
    this.initTransactionsPage();
    this.initCategoriesPage();
    this.initBudgetsPage();
    this.initReportsPage();
    this.initSettingsPage();
    
    // Show active page based on URL hash
    this.showActivePage();
    
    // Listen for hash changes to show the correct page
    window.addEventListener('hashchange', () => this.showActivePage());
  },
  
  // Initialize sidebar
  initSidebar: function() {
    const navItems = document.querySelectorAll('.nav-item');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const sidebar = document.getElementById('sidebar');
    
    // Add click event to nav items
    navItems.forEach(item => {
      item.addEventListener('click', function() {
        // Remove active class from all nav items
        navItems.forEach(navItem => navItem.classList.remove('active'));
        
        // Add active class to clicked item
        this.classList.add('active');
        
        // Close sidebar on mobile
        if (window.innerWidth < 768) {
          sidebar.classList.remove('open');
        }
      });
    });
    
    // Toggle sidebar on mobile
    mobileMenuToggle.addEventListener('click', function() {
      sidebar.classList.toggle('open');
    });
    
    // Handle logout
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
      logoutButton.addEventListener('click', function(e) {
        e.preventDefault();
        showConfirmModal(
          'Confirm Logout', 
          'Are you sure you want to log out?', 
          function() {
            Auth.logout();
            window.location.href = 'login.html';
          }
        );
      });
    }
    
    // Update user info in sidebar
    this.updateUserInfo();
  },
  
  // Update user info
  updateUserInfo: function() {
    const currentUser = Auth.getCurrentUser();
    
    if (currentUser) {
      const userAvatar = document.getElementById('user-avatar');
      const userName = document.getElementById('user-name');
      const userEmail = document.getElementById('user-email');
      
      if (userAvatar) {
        userAvatar.src = currentUser.avatar || 'images/default-avatar.png';
      }
      
      if (userName) {
        userName.textContent = currentUser.name;
      }
      
      if (userEmail) {
        userEmail.textContent = currentUser.email;
      }
    }
  },
  
  // Show active page based on URL hash
  showActivePage: function() {
    const pages = document.querySelectorAll('.page');
    const navItems = document.querySelectorAll('.nav-item');
    
    // Get page from hash, default to dashboard
    let activePage = window.location.hash.substring(1) || 'dashboard';
    
    // Hide all pages
    pages.forEach(page => page.classList.remove('active'));
    
    // Show active page
    const currentPage = document.getElementById(activePage + '-page');
    if (currentPage) {
      currentPage.classList.add('active');
    } else {
      // If page doesn't exist, show dashboard
      document.getElementById('dashboard-page').classList.add('active');
      activePage = 'dashboard';
    }
    
    // Update active nav item
    navItems.forEach(item => {
      if (item.dataset.page === activePage) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
    
    // Update page title
    document.title = activePage.charAt(0).toUpperCase() + activePage.slice(1) + ' - Expense Tracker';
  },
  
  // Initialize modals
  initModals: function() {
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close-modal, .close-modal-btn');
    
    // Close modal when clicking close button
    closeButtons.forEach(button => {
      button.addEventListener('click', function() {
        const modal = this.closest('.modal');
        closeModal(modal);
      });
    });
    
    // Close modal when clicking outside modal content
    modals.forEach(modal => {
      modal.addEventListener('click', function(e) {
        if (e.target === this) {
          closeModal(this);
        }
      });
    });
    
    // Initialize transaction modal
    this.initTransactionModal();
    
    // Initialize category modal
    this.initCategoryModal();
    
    // Initialize budget modal
    this.initBudgetModal();
  },
  
  // Initialize transaction modal
  initTransactionModal: function() {
    const addButtons = document.querySelectorAll('#add-transaction-btn, #add-transaction-btn-2');
    const modal = document.getElementById('transaction-modal');
    const form = document.getElementById('transaction-form');
    const typeButtons = form.querySelectorAll('.tab');
    const categorySelect = document.getElementById('transaction-category');
    
    // Show modal when clicking add button
    addButtons.forEach(button => {
      button.addEventListener('click', function() {
        // Reset form
        form.reset();
        document.getElementById('transaction-id').value = '';
        document.getElementById('transaction-modal-title').textContent = 'Add Transaction';
        
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('transaction-date').value = today;
        
        // Set default type to expense
        typeButtons.forEach(btn => btn.classList.remove('active'));
        typeButtons[0].classList.add('active');
        
        // Update categories based on type
        updateTransactionCategories('expense');
        
        // Show modal
        openModal(modal);
      });
    });
    
    // Toggle transaction type
    typeButtons.forEach(button => {
      button.addEventListener('click', function() {
        typeButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        
        const type = this.dataset.type;
        updateTransactionCategories(type);
      });
    });
    
    // Submit form
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const id = document.getElementById('transaction-id').value;
      const type = document.querySelector('.tab.active').dataset.type;
      const date = document.getElementById('transaction-date').value;
      const amount = parseFloat(document.getElementById('transaction-amount').value);
      const category = document.getElementById('transaction-category').value;
      const description = document.getElementById('transaction-description').value;
      const notes = document.getElementById('transaction-notes').value;
      
      const transactionData = {
        type,
        date,
        amount,
        category,
        description,
        notes
      };
      
      if (id) {
        // Update existing transaction
        ExpenseTracker.updateTransaction(id, transactionData);
        showToast('Transaction updated successfully', 'success');
      } else {
        // Add new transaction
        ExpenseTracker.addTransaction(transactionData);
        showToast('Transaction added successfully', 'success');
      }
      
      // Close modal
      closeModal(modal);
      
      // Refresh UI
      UI.refreshTransactionsList();
      UI.refreshDashboardData();
      
      // If on Reports page, refresh charts
      if (document.getElementById('reports-page').classList.contains('active')) {
        Charts.initReportCharts(currentReportMonth, currentReportYear);
      }
    });
    
    // Function to update categories based on type
    function updateTransactionCategories(type) {
      // Clear current options
      categorySelect.innerHTML = '';
      
      // Get categories for selected type
      const categories = ExpenseTracker.getCategoriesByType(type);
      
      // Add options
      categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        categorySelect.appendChild(option);
      });
    }
  },
  
  // Initialize category modal
  initCategoryModal: function() {
    const addButton = document.getElementById('add-category-btn');
    const modal = document.getElementById('category-modal');
    const form = document.getElementById('category-form');
    const typeButtons = form.querySelectorAll('.tab');
    const iconSelector = document.getElementById('icon-selector');
    
    // Populate icon selector
    const icons = [
      'home', 'utensils', 'car', 'shopping-bag', 'film',
      'plane', 'graduation-cap', 'heartbeat', 'gift', 'coffee',
      'money-bill-wave', 'chart-line', 'laptop-code', 'briefcase', 'piggy-bank'
    ];
    
    icons.forEach(icon => {
      const iconOption = document.createElement('div');
      iconOption.className = 'icon-option';
      iconOption.dataset.icon = icon;
      iconOption.innerHTML = `<i class="fas fa-${icon}"></i>`;
      
      iconOption.addEventListener('click', function() {
        // Remove selected class from all icons
        document.querySelectorAll('.icon-option').forEach(option => {
          option.classList.remove('selected');
        });
        
        // Add selected class to clicked icon
        this.classList.add('selected');
      });
      
      iconSelector.appendChild(iconOption);
    });
    
    // Show modal when clicking add button
    addButton.addEventListener('click', function() {
      // Reset form
      form.reset();
      document.getElementById('category-id').value = '';
      document.getElementById('category-modal-title').textContent = 'Add Category';
      
      // Set default type to expense
      typeButtons.forEach(btn => btn.classList.remove('active'));
      typeButtons[0].classList.add('active');
      
      // Clear icon selection
      document.querySelectorAll('.icon-option').forEach(option => {
        option.classList.remove('selected');
      });
      
      // Select first icon by default
      document.querySelector('.icon-option').classList.add('selected');
      
      // Show modal
      openModal(modal);
    });
    
    // Toggle category type
    typeButtons.forEach(button => {
      button.addEventListener('click', function() {
        typeButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
      });
    });
    
    // Submit form
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const id = document.getElementById('category-id').value;
      const type = document.querySelector('.tab.active').dataset.type;
      const name = document.getElementById('category-name').value;
      const color = document.getElementById('category-color').value;
      const iconElement = document.querySelector('.icon-option.selected');
      const icon = iconElement ? iconElement.dataset.icon : 'question';
      
      const categoryData = {
        type,
        name,
        color,
        icon
      };
      
      if (id) {
        // Update logic would go here
        showToast('Updating categories is not supported', 'error');
      } else {
        // Add new category
        const result = ExpenseTracker.addCategory(categoryData);
        
        if (result) {
          showToast('Category added successfully', 'success');
          
          // Refresh categories UI
          UI.refreshCategoriesGrid();
          
          // Update transaction category dropdowns
          UI.initTransactionModal();
          UI.initBudgetModal();
        }
      }
      
      // Close modal
      closeModal(modal);
    });
  },
  
  // Initialize budget modal
  initBudgetModal: function() {
    const addButton = document.getElementById('add-budget-btn');
    const modal = document.getElementById('budget-modal');
    const form = document.getElementById('budget-form');
    const categorySelect = document.getElementById('budget-category');
    
    // Update expense categories
    function updateExpenseCategories() {
      // Clear current options
      categorySelect.innerHTML = '';
      
      // Get expense categories
      const categories = ExpenseTracker.getCategoriesByType('expense');
      
      // Add options
      categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        categorySelect.appendChild(option);
      });
    }
    
    // Show modal when clicking add button
    addButton.addEventListener('click', function() {
      // Reset form
      form.reset();
      document.getElementById('budget-id').value = '';
      document.getElementById('budget-modal-title').textContent = 'Add Budget';
      
      // Update categories
      updateExpenseCategories();
      
      // Show modal
      openModal(modal);
    });
    
    // Submit form
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const id = document.getElementById('budget-id').value;
      const category = document.getElementById('budget-category').value;
      const amount = parseFloat(document.getElementById('budget-amount').value);
      const period = document.getElementById('budget-period').value;
      
      const budgetData = {
        category,
        amount,
        period
      };
      
      if (id) {
        // Update logic would go here
        showToast('Updating budgets is not supported', 'error');
      } else {
        // Add new budget
        const result = ExpenseTracker.addBudget(budgetData);
        
        if (result.success) {
          showToast('Budget added successfully', 'success');
          
          // Refresh budgets UI
          UI.refreshBudgetsList();
        } else {
          showToast(result.error, 'error');
        }
      }
      
      // Close modal
      closeModal(modal);
    });
  },
  
  // Initialize dashboard
  initDashboard: function() {
    // Add transaction button
    const addTransactionBtn = document.getElementById('add-transaction-btn');
    addTransactionBtn.addEventListener('click', function() {
      openModal(document.getElementById('transaction-modal'));
    });
    
    // Initial data load
    this.refreshDashboardData();
  },
  
  // Refresh dashboard data
  refreshDashboardData: function() {
    // Get current month and year
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Get monthly totals
    const totalIncome = ExpenseTracker.getTotalIncomeByMonth(currentMonth, currentYear);
    const totalExpenses = ExpenseTracker.getTotalExpensesByMonth(currentMonth, currentYear);
    const balance = totalIncome - totalExpenses;
    
    // Update summary cards
    document.getElementById('total-income').textContent = ExpenseTracker.getCurrencySymbol() + totalIncome.toFixed(2);
    document.getElementById('total-expenses').textContent = ExpenseTracker.getCurrencySymbol() + totalExpenses.toFixed(2);
    document.getElementById('balance').textContent = ExpenseTracker.getCurrencySymbol() + balance.toFixed(2);
    
    // Update charts
    Charts.initDashboardCharts();
    
    // Update recent transactions list
    this.refreshRecentTransactions();
  },
  
  // Refresh recent transactions
  refreshRecentTransactions: function() {
    const transactionsList = document.getElementById('recent-transactions-list');
    
    // Clear current list
    transactionsList.innerHTML = '';
    
    // Get all transactions
    const transactions = ExpenseTracker.getTransactions();
    
    // Sort by date (newest first)
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Take only the first 5
    const recentTransactions = transactions.slice(0, 5);
    
    if (recentTransactions.length === 0) {
      transactionsList.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-receipt"></i>
          <p>No transactions yet</p>
          <button class="btn btn-primary" id="empty-add-transaction">Add Transaction</button>
        </div>
      `;
      
      document.getElementById('empty-add-transaction').addEventListener('click', function() {
        openModal(document.getElementById('transaction-modal'));
      });
      
      return;
    }
    
    // Create transaction items
    recentTransactions.forEach(transaction => {
      const item = document.createElement('div');
      item.className = 'transaction-item';
      
      // Format date
      const date = new Date(transaction.date);
      const formattedDate = date.toLocaleDateString();
      
      // Get category
      const categories = ExpenseTracker.getCategories();
      const category = categories.find(c => c.name === transaction.category);
      
      item.innerHTML = `
        <div class="transaction-category" style="background-color: ${category ? category.color + '1a' : '#6366f11a'}; color: ${category ? category.color : '#6366f1'}">
          <i class="fas fa-${category ? category.icon : 'question'}"></i>
        </div>
        <div class="transaction-details">
          <div class="transaction-title">${transaction.description}</div>
          <div class="transaction-date">${formattedDate}</div>
        </div>
        <div class="transaction-amount ${transaction.type === 'income' ? 'income-amount' : 'expense-amount'}">
          ${transaction.type === 'income' ? '+' : '-'} ${ExpenseTracker.getCurrencySymbol()}${transaction.amount.toFixed(2)}
        </div>
      `;
      
      transactionsList.appendChild(item);
    });
  },
  
  // Initialize transactions page
  initTransactionsPage: function() {
    // Add transaction button
    const addTransactionBtn = document.getElementById('add-transaction-btn-2');
    addTransactionBtn.addEventListener('click', function() {
      openModal(document.getElementById('transaction-modal'));
    });
    
    // Initialize filters
    this.initTransactionFilters();
    
    // Initial data load
    this.refreshTransactionsList();
  },
  
  // Initialize transaction filters
  initTransactionFilters: function() {
    const filterType = document.getElementById('filter-type');
    const filterCategory = document.getElementById('filter-category');
    const filterDateFrom = document.getElementById('filter-date-from');
    const filterDateTo = document.getElementById('filter-date-to');
    const filterAmountMin = document.getElementById('filter-amount-min');
    const filterAmountMax = document.getElementById('filter-amount-max');
    
    // Update categories filter
    function updateCategoryFilter() {
      // Clear current options except "All Categories"
      filterCategory.innerHTML = '<option value="all">All Categories</option>';
      
      // Get categories based on type
      let categories;
      if (filterType.value === 'all') {
        categories = ExpenseTracker.getCategories();
      } else {
        categories = ExpenseTracker.getCategoriesByType(filterType.value);
      }
      
      // Add options
      categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        filterCategory.appendChild(option);
      });
    }
    
    // Set default dates (current month)
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    
    filterDateFrom.value = firstDayOfMonth;
    filterDateTo.value = lastDayOfMonth;
    
    // Add event listeners
    filterType.addEventListener('change', function() {
      updateCategoryFilter();
      UI.refreshTransactionsList();
    });
    
    filterCategory.addEventListener('change', function() {
      UI.refreshTransactionsList();
    });
    
    filterDateFrom.addEventListener('change', function() {
      UI.refreshTransactionsList();
    });
    
    filterDateTo.addEventListener('change', function() {
      UI.refreshTransactionsList();
    });
    
    filterAmountMin.addEventListener('input', function() {
      UI.refreshTransactionsList();
    });
    
    filterAmountMax.addEventListener('input', function() {
      UI.refreshTransactionsList();
    });
    
    // Initial categories load
    updateCategoryFilter();
  },
  
  // Refresh transactions list
  refreshTransactionsList: function() {
    const tableBody = document.getElementById('transactions-table-body');
    
    // Clear current list
    tableBody.innerHTML = '';
    
    // Get filter values
    const filterType = document.getElementById('filter-type').value;
    const filterCategory = document.getElementById('filter-category').value;
    const filterDateFrom = document.getElementById('filter-date-from').value;
    const filterDateTo = document.getElementById('filter-date-to').value;
    const filterAmountMin = document.getElementById('filter-amount-min').value;
    const filterAmountMax = document.getElementById('filter-amount-max').value;
    
    // Get all transactions
    let transactions = ExpenseTracker.getTransactions();
    
    // Apply type filter
    if (filterType !== 'all') {
      transactions = transactions.filter(t => t.type === filterType);
    }
    
    // Apply category filter
    if (filterCategory !== 'all') {
      transactions = transactions.filter(t => t.category === filterCategory);
    }
    
    // Apply date filters
    if (filterDateFrom) {
      const fromDate = new Date(filterDateFrom);
      transactions = transactions.filter(t => new Date(t.date) >= fromDate);
    }
    
    if (filterDateTo) {
      const toDate = new Date(filterDateTo);
      // Set to end of day
      toDate.setHours(23, 59, 59, 999);
      transactions = transactions.filter(t => new Date(t.date) <= toDate);
    }
    
    // Apply amount filters
    if (filterAmountMin) {
      const min = parseFloat(filterAmountMin);
      transactions = transactions.filter(t => t.amount >= min);
    }
    
    if (filterAmountMax) {
      const max = parseFloat(filterAmountMax);
      transactions = transactions.filter(t => t.amount <= max);
    }
    
    // Sort by date (newest first)
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (transactions.length === 0) {
      const emptyRow = document.createElement('tr');
      emptyRow.innerHTML = `
        <td colspan="5" class="text-center">
          <div class="empty-state">
            <i class="fas fa-receipt"></i>
            <p>No transactions found</p>
            <p class="empty-description">Try adjusting your filters or add a new transaction</p>
            <button class="btn btn-primary" id="empty-add-transaction-2">Add Transaction</button>
          </div>
        </td>
      `;
      
      tableBody.appendChild(emptyRow);
      
      document.getElementById('empty-add-transaction-2').addEventListener('click', function() {
        openModal(document.getElementById('transaction-modal'));
      });
      
      return;
    }
    
    // Create table rows
    transactions.forEach(transaction => {
      const row = document.createElement('tr');
      
      // Format date
      const date = new Date(transaction.date);
      const formattedDate = date.toLocaleDateString();
      
      // Get category
      const categories = ExpenseTracker.getCategories();
      const category = categories.find(c => c.name === transaction.category);
      
      row.innerHTML = `
        <td>${formattedDate}</td>
        <td>${transaction.description}</td>
        <td>
          <span class="badge" style="background-color: ${category ? category.color + '1a' : '#6366f11a'}; color: ${category ? category.color : '#6366f1'}">
            <i class="fas fa-${category ? category.icon : 'question'}"></i> ${transaction.category}
          </span>
        </td>
        <td class="${transaction.type === 'income' ? 'income-amount' : 'expense-amount'}">
          ${transaction.type === 'income' ? '+' : '-'} ${ExpenseTracker.getCurrencySymbol()}${transaction.amount.toFixed(2)}
        </td>
        <td>
          <div class="transaction-actions">
            <button class="action-btn edit-btn" data-id="${transaction.id}">
              <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn delete-btn" data-id="${transaction.id}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      `;
      
      tableBody.appendChild(row);
    });
    
    // Add edit button event listeners
    document.querySelectorAll('.edit-btn').forEach(button => {
      button.addEventListener('click', function() {
        const id = this.dataset.id;
        UI.editTransaction(id);
      });
    });
    
    // Add delete button event listeners
    document.querySelectorAll('.delete-btn').forEach(button => {
      button.addEventListener('click', function() {
        const id = this.dataset.id;
        UI.deleteTransaction(id);
      });
    });
  },
  
  // Edit transaction
  editTransaction: function(id) {
    const transactions = ExpenseTracker.getTransactions();
    const transaction = transactions.find(t => t.id === id);
    
    if (!transaction) {
      showToast('Transaction not found', 'error');
      return;
    }
    
    const modal = document.getElementById('transaction-modal');
    const form = document.getElementById('transaction-form');
    const typeButtons = form.querySelectorAll('.tab');
    
    // Set form values
    document.getElementById('transaction-id').value = transaction.id;
    document.getElementById('transaction-modal-title').textContent = 'Edit Transaction';
    document.getElementById('transaction-date').value = transaction.date;
    document.getElementById('transaction-amount').value = transaction.amount;
    document.getElementById('transaction-description').value = transaction.description;
    document.getElementById('transaction-notes').value = transaction.notes || '';
    
    // Set transaction type
    typeButtons.forEach(btn => {
      if (btn.dataset.type === transaction.type) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    
    // Update categories based on type
    const categorySelect = document.getElementById('transaction-category');
    categorySelect.innerHTML = '';
    
    const categories = ExpenseTracker.getCategoriesByType(transaction.type);
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.name;
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });
    
    // Set selected category
    categorySelect.value = transaction.category;
    
    // Show modal
    openModal(modal);
  },
  
  // Delete transaction
  deleteTransaction: function(id) {
    showConfirmModal(
      'Delete Transaction', 
      'Are you sure you want to delete this transaction?', 
      function() {
        const result = ExpenseTracker.deleteTransaction(id);
        
        if (result.success) {
          showToast('Transaction deleted successfully', 'success');
          
          // Refresh UI
          UI.refreshTransactionsList();
          UI.refreshDashboardData();
          
          // If on Reports page, refresh charts
          if (document.getElementById('reports-page').classList.contains('active')) {
            Charts.initReportCharts(currentReportMonth, currentReportYear);
          }
        } else {
          showToast('Error deleting transaction', 'error');
        }
      }
    );
  },
  
  // Initialize categories page
  initCategoriesPage: function() {
    // Add category button
    const addCategoryBtn = document.getElementById('add-category-btn');
    addCategoryBtn.addEventListener('click', function() {
      openModal(document.getElementById('category-modal'));
    });
    
    // Initial data load
    this.refreshCategoriesGrid();
  },
  
  // Refresh categories grid
  refreshCategoriesGrid: function() {
    const incomeGrid = document.getElementById('income-categories-grid');
    const expenseGrid = document.getElementById('expense-categories-grid');
    
    // Clear current grids
    incomeGrid.innerHTML = '';
    expenseGrid.innerHTML = '';
    
    // Get categories
    const categories = ExpenseTracker.getCategories();
    
    // Create category cards
    categories.forEach(category => {
      const card = document.createElement('div');
      card.className = 'category-card';
      
      card.innerHTML = `
        <div class="category-icon" style="background-color: ${category.color}1a; color: ${category.color}">
          <i class="fas fa-${category.icon}"></i>
        </div>
        <div class="category-name">${category.name}</div>
        <div class="category-actions">
          <button class="delete-category-btn" data-id="${category.id}">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;
      
      if (category.type === 'income') {
        incomeGrid.appendChild(card);
      } else {
        expenseGrid.appendChild(card);
      }
    });
    
    // Add delete button event listeners
    document.querySelectorAll('.delete-category-btn').forEach(button => {
      button.addEventListener('click', function() {
        const id = this.dataset.id;
        UI.deleteCategory(id);
      });
    });
    
    // Add empty card with add button if no categories
    if (incomeGrid.children.length === 0) {
      const emptyCard = document.createElement('div');
      emptyCard.className = 'category-card empty-card';
      
      emptyCard.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-plus-circle"></i>
          <p>Add Income Category</p>
          <button class="btn btn-primary add-income-category-btn">Add Category</button>
        </div>
      `;
      
      incomeGrid.appendChild(emptyCard);
      
      document.querySelector('.add-income-category-btn').addEventListener('click', function() {
        // Set category type to income
        const typeButtons = document.querySelectorAll('#category-form .tab');
        typeButtons.forEach(btn => btn.classList.remove('active'));
        typeButtons[1].classList.add('active');
        
        openModal(document.getElementById('category-modal'));
      });
    }
    
    if (expenseGrid.children.length === 0) {
      const emptyCard = document.createElement('div');
      emptyCard.className = 'category-card empty-card';
      
      emptyCard.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-plus-circle"></i>
          <p>Add Expense Category</p>
          <button class="btn btn-primary add-expense-category-btn">Add Category</button>
        </div>
      `;
      
      expenseGrid.appendChild(emptyCard);
      
      document.querySelector('.add-expense-category-btn').addEventListener('click', function() {
        // Set category type to expense
        const typeButtons = document.querySelectorAll('#category-form .tab');
        typeButtons.forEach(btn => btn.classList.remove('active'));
        typeButtons[0].classList.add('active');
        
        openModal(document.getElementById('category-modal'));
      });
    }
  },
  
  // Delete category
  deleteCategory: function(id) {
    showConfirmModal(
      'Delete Category', 
      'Are you sure you want to delete this category? This will not affect existing transactions.', 
      function() {
        const result = ExpenseTracker.deleteCategory(id);
        
        if (result.success) {
          showToast('Category deleted successfully', 'success');
          
          // Refresh categories UI
          UI.refreshCategoriesGrid();
          
          // Update transaction category dropdowns
          UI.initTransactionModal();
          UI.initBudgetModal();
        } else {
          showToast(result.error, 'error');
        }
      }
    );
  },
  
  // Initialize budgets page
  initBudgetsPage: function() {
    // Add budget button
    const addBudgetBtn = document.getElementById('add-budget-btn');
    addBudgetBtn.addEventListener('click', function() {
      openModal(document.getElementById('budget-modal'));
    });
    
    // Initial data load
    this.refreshBudgetsList();
  },
  
  // Refresh budgets list
  refreshBudgetsList: function() {
    const budgetsContainer = document.getElementById('budgets-container');
    
    // Clear current list
    budgetsContainer.innerHTML = '';
    
    // Get budgets
    const budgets = ExpenseTracker.getBudgets();
    
    if (budgets.length === 0) {
      budgetsContainer.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-wallet"></i>
          <p>No budgets yet</p>
          <p class="empty-description">Create a budget to help you control your spending</p>
          <button class="btn btn-primary" id="empty-add-budget">Add Budget</button>
        </div>
      `;
      
      document.getElementById('empty-add-budget').addEventListener('click', function() {
        openModal(document.getElementById('budget-modal'));
      });
      
      return;
    }
    
    // Get categories for icon and color
    const categories = ExpenseTracker.getCategories();
    
    // Create budget cards
    budgets.forEach(budget => {
      const progress = ExpenseTracker.calculateBudgetProgress(budget.id);
      
      if (!progress) return; // Skip if no progress info
      
      const category = categories.find(c => c.name === budget.category);
      
      const card = document.createElement('div');
      card.className = 'budget-card';
      
      // Format period
      const periodText = budget.period.charAt(0).toUpperCase() + budget.period.slice(1);
      
      card.innerHTML = `
        <div class="budget-header">
          <div>
            <div class="budget-title">
              <span class="category-icon" style="background-color: ${category ? category.color + '1a' : '#6366f11a'}; color: ${category ? category.color : '#6366f1'}">
                <i class="fas fa-${category ? category.icon : 'question'}"></i>
              </span>
              ${budget.category}
            </div>
            <div class="budget-period">${periodText} Budget</div>
          </div>
          <div class="budget-actions">
            <button class="delete-budget-btn" data-id="${budget.id}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        
        <div class="budget-content">
          <div class="budget-progress ${progress.status}">
            <div class="progress-info">
              <div>
                ${ExpenseTracker.getCurrencySymbol()}${progress.spent.toFixed(2)} of ${ExpenseTracker.getCurrencySymbol()}${budget.amount.toFixed(2)}
              </div>
              <div>${progress.percentage.toFixed(1)}%</div>
            </div>
            <div class="progress-bar">
              <div class="progress-value" style="width: ${Math.min(progress.percentage, 100)}%"></div>
            </div>
          </div>
        </div>
        
        <div class="budget-footer">
          <div class="remaining-label">Remaining:</div>
          <div class="remaining-value ${progress.status === 'danger' ? 'danger' : ''}">
            ${ExpenseTracker.getCurrencySymbol()}${progress.remaining.toFixed(2)}
          </div>
        </div>
        
        ${progress.percentage >= 100 ? `
          <div class="budget-alert">
            <i class="fas fa-exclamation-triangle"></i>
            You've exceeded your budget!
          </div>
        ` : ''}
      `;
      
      budgetsContainer.appendChild(card);
    });
    
    // Add delete button event listeners
    document.querySelectorAll('.delete-budget-btn').forEach(button => {
      button.addEventListener('click', function() {
        const id = this.dataset.id;
        UI.deleteBudget(id);
      });
    });
  },
  
  // Delete budget
  deleteBudget: function(id) {
    showConfirmModal(
      'Delete Budget', 
      'Are you sure you want to delete this budget?', 
      function() {
        const result = ExpenseTracker.deleteBudget(id);
        
        if (result.success) {
          showToast('Budget deleted successfully', 'success');
          
          // Refresh budgets UI
          UI.refreshBudgetsList();
        } else {
          showToast('Error deleting budget', 'error');
        }
      }
    );
  },
  
  // Current report month and year
  currentReportMonth: new Date().getMonth(),
  currentReportYear: new Date().getFullYear(),
  
  // Initialize reports page
  initReportsPage: function() {
    const currentMonthElement = document.getElementById('current-month');
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');
    const exportReportButton = document.getElementById('export-report-btn');
    
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // Update month display
    function updateMonth() {
      currentMonthElement.textContent = `${months[UI.currentReportMonth]} ${UI.currentReportYear}`;
      
      // Update charts
      Charts.initReportCharts(UI.currentReportMonth, UI.currentReportYear);
    }
    
    // Previous month
    prevMonthButton.addEventListener('click', function() {
      UI.currentReportMonth--;
      if (UI.currentReportMonth < 0) {
        UI.currentReportMonth = 11;
        UI.currentReportYear--;
      }
      updateMonth();
    });
    
    // Next month
    nextMonthButton.addEventListener('click', function() {
      UI.currentReportMonth++;
      if (UI.currentReportMonth > 11) {
        UI.currentReportMonth = 0;
        UI.currentReportYear++;
      }
      updateMonth();
    });
    
    // Export report
    exportReportButton.addEventListener('click', function() {
      // Get transactions for the month
      const transactions = ExpenseTracker.getTransactionsByMonth(UI.currentReportMonth, UI.currentReportYear);
      
      // Create report object
      const report = {
        month: months[UI.currentReportMonth],
        year: UI.currentReportYear,
        generated: new Date().toISOString(),
        income: transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
        expenses: transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
        transactions: transactions
      };
      
      // Convert to JSON
      const reportData = JSON.stringify(report, null, 2);
      
      // Create and trigger download
      const blob = new Blob([reportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `financial-report-${months[UI.currentReportMonth]}-${UI.currentReportYear}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast('Report exported successfully', 'success');
    });
    
    // Initial load
    updateMonth();
  },
  
  // Initialize settings page
  initSettingsPage: function() {
    const currentUser = Auth.getCurrentUser();
    
    if (!currentUser) return;
    
    // Profile info
    const profileImage = document.getElementById('profile-image');
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    
    // Profile form
    const profileForm = document.getElementById('profile-form');
    const settingsName = document.getElementById('settings-name');
    const settingsEmail = document.getElementById('settings-email');
    
    // Password form
    const passwordForm = document.getElementById('password-form');
    
    // Avatar upload
    const avatarUpload = document.getElementById('avatar-upload');
    
    // Dark mode toggle
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    
    // Data management
    const exportDataBtn = document.getElementById('export-data-btn');
    const importDataBtn = document.getElementById('import-data-btn');
    const clearDataBtn = document.getElementById('clear-data-btn');
    const importFile = document.getElementById('import-file');
    
    // Update profile info
    profileImage.src = currentUser.avatar || 'images/default-avatar.png';
    profileName.textContent = currentUser.name;
    profileEmail.textContent = currentUser.email;
    
    // Set form values
    settingsName.value = currentUser.name;
    settingsEmail.value = currentUser.email;
    
    // Handle profile form submission
    profileForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const name = settingsName.value;
      const email = settingsEmail.value;
      
      const result = Auth.updateUserProfile(name, email);
      
      if (result.success) {
        // Update UI
        profileName.textContent = name;
        profileEmail.textContent = email;
        
        // Update sidebar
        UI.updateUserInfo();
        
        showToast('Profile updated successfully', 'success');
      } else {
        showToast(result.error, 'error');
      }
    });
    
    // Handle password form submission
    passwordForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const currentPassword = document.getElementById('current-password').value;
      const newPassword = document.getElementById('new-password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      
      if (newPassword !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
      }
      
      const result = Auth.changePassword(currentPassword, newPassword);
      
      if (result.success) {
        // Clear form
        passwordForm.reset();
        
        showToast('Password changed successfully', 'success');
      } else {
        showToast(result.error, 'error');
      }
    });
    
    // Handle avatar upload
    avatarUpload.addEventListener('change', function(e) {
      const file = e.target.files[0];
      
      if (!file) return;
      
      const reader = new FileReader();
      
      reader.onload = function(event) {
        const imageDataUrl = event.target.result;
        
        // Update avatar
        profileImage.src = imageDataUrl;
        
        // Save to user profile
        const result = Auth.updateUserAvatar(imageDataUrl);
        
        if (result.success) {
          // Update sidebar
          UI.updateUserInfo();
          
          showToast('Avatar updated successfully', 'success');
        } else {
          showToast(result.error, 'error');
        }
      };
      
      reader.readAsDataURL(file);
    });
    
    // Handle dark mode toggle
    darkModeToggle.checked = localStorage.getItem('darkMode') === 'true';
    
    darkModeToggle.addEventListener('change', function() {
      const isDarkMode = this.checked;
      
      // Update localStorage
      localStorage.setItem('darkMode', isDarkMode);
      
      // Update document classes
      document.documentElement.classList.toggle('dark', isDarkMode);
      document.body.classList.toggle('dark-mode', isDarkMode);
    });
    
    // Handle export data
    exportDataBtn.addEventListener('click', function() {
      // Get all data
      const data = {
        transactions: ExpenseTracker.getTransactions(),
        categories: ExpenseTracker.getCategories(),
        budgets: ExpenseTracker.getBudgets()
      };
      
      // Convert to JSON
      const exportData = JSON.stringify(data, null, 2);
      
      // Create and trigger download
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'expense-tracker-data.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast('Data exported successfully', 'success');
    });
    
    // Handle import data
    importDataBtn.addEventListener('click', function() {
      importFile.click();
    });
    
    importFile.addEventListener('change', function(e) {
      const file = e.target.files[0];
      
      if (!file) return;
      
      const reader = new FileReader();
      
      reader.onload = function(event) {
        try {
          const data = JSON.parse(event.target.result);
          
          // Validate data structure
          if (!data.transactions || !data.categories || !data.budgets) {
            throw new Error('Invalid data format');
          }
          
          // Confirm import
          showConfirmModal(
            'Import Data', 
            'Are you sure you want to import this data? Your current data will be replaced.', 
            function() {
              // Import data
              ExpenseTracker.importTransactions(data.transactions);
              ExpenseTracker.importCategories(data.categories);
              ExpenseTracker.importBudgets(data.budgets);
              
              // Refresh UI
              UI.refreshDashboardData();
              UI.refreshTransactionsList();
              UI.refreshCategoriesGrid();
              UI.refreshBudgetsList();
              
              showToast('Data imported successfully', 'success');
            }
          );
        } catch (error) {
          showToast('Error importing data: ' + error.message, 'error');
        }
        
        // Reset input
        importFile.value = '';
      };
      
      reader.readAsText(file);
    });
    
    // Handle clear data
    clearDataBtn.addEventListener('click', function() {
      showConfirmModal(
        'Clear All Data', 
        'Are you sure you want to clear all your data? This action cannot be undone.', 
        function() {
          // Clear data
          ExpenseTracker.clearAllData();
          
          // Refresh UI
          UI.refreshDashboardData();
          UI.refreshTransactionsList();
          UI.refreshCategoriesGrid();
          UI.refreshBudgetsList();
          
          showToast('All data cleared successfully', 'success');
        }
      );
    });
  }
};

// Helper functions for modals
function openModal(modal) {
  modal.classList.add('show');
}

function closeModal(modal) {
  modal.classList.remove('show');
}

function showConfirmModal(title, message, callback) {
  const modal = document.getElementById('confirm-modal');
  const confirmTitle = document.getElementById('confirm-title');
  const confirmMessage = document.getElementById('confirm-message');
  const confirmButton = document.getElementById('confirm-action-btn');
  
  // Set modal content
  confirmTitle.textContent = title;
  confirmMessage.textContent = message;
  
  // Add confirm button event listener
  const oldConfirmButton = confirmButton.cloneNode(true);
  confirmButton.parentNode.replaceChild(oldConfirmButton, confirmButton);
  
  oldConfirmButton.addEventListener('click', function() {
    callback();
    closeModal(modal);
  });
  
  // Show modal
  openModal(modal);
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
