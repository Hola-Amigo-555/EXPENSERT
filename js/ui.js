
// UI related functions
const UI = {
  // DOM elements
  elements: {
    sidebar: document.getElementById('sidebar'),
    mobileMenuToggle: document.getElementById('mobile-menu-toggle'),
    navItems: document.querySelectorAll('.nav-item'),
    pages: document.querySelectorAll('.page'),
    
    // Dashboard
    totalIncome: document.getElementById('total-income'),
    totalExpenses: document.getElementById('total-expenses'),
    balance: document.getElementById('balance'),
    recentTransactionsList: document.getElementById('recent-transactions-list'),
    
    // Transactions
    addTransactionBtn: document.getElementById('add-transaction-btn'),
    addTransactionModalBtn: document.getElementById('add-transaction-modal-btn'),
    addTransactionEmptyBtn: document.getElementById('add-transaction-empty-btn'),
    transactionsTableBody: document.getElementById('transactions-table-body'),
    transactionsEmptyState: document.getElementById('transactions-empty-state'),
    transactionTypeFilter: document.getElementById('transaction-type-filter'),
    categoryFilter: document.getElementById('category-filter'),
    dateFrom: document.getElementById('date-from'),
    dateTo: document.getElementById('date-to'),
    applyFilters: document.getElementById('apply-filters'),
    
    // Categories
    addCategoryBtn: document.getElementById('add-category-btn'),
    incomeCategories: document.getElementById('income-categories'),
    expenseCategories: document.getElementById('expense-categories'),
    incomeCategoriesEmpty: document.getElementById('income-categories-empty'),
    expenseCategoriesEmpty: document.getElementById('expense-categories-empty'),
    
    // Budgets
    addBudgetBtn: document.getElementById('add-budget-btn'),
    addBudgetEmptyBtn: document.getElementById('add-budget-empty-btn'),
    budgetsContainer: document.getElementById('budgets-container'),
    budgetsEmptyState: document.getElementById('budgets-empty-state'),
    
    // Reports
    prevMonth: document.getElementById('prev-month'),
    nextMonth: document.getElementById('next-month'),
    currentMonth: document.getElementById('current-month'),
    exportReport: document.getElementById('export-report'),
    
    // Modals
    addTransactionModal: document.getElementById('add-transaction-modal'),
    addCategoryModal: document.getElementById('add-category-modal'),
    addBudgetModal: document.getElementById('add-budget-modal'),
    
    // Forms
    addTransactionForm: document.getElementById('add-transaction-form'),
    addCategoryForm: document.getElementById('add-category-form'),
    addBudgetForm: document.getElementById('add-budget-form'),
    
    // Toast
    toastContainer: document.getElementById('toast-container'),
    
    // User
    signOutBtn: document.getElementById('sign-out-btn'),
    headerAvatarImg: document.getElementById('header-avatar-img')
  },
  
  // Initialize UI
  init() {
    this.setupEventListeners();
    this.setupNavigation();
    this.setupModals();
    this.updateDashboard();
    this.renderTransactions();
    this.renderCategories();
    this.renderBudgets();
    this.initReports();
    this.updateUserInfo();
  },
  
  // Setup event listeners
  setupEventListeners() {
    // Mobile menu toggle
    this.elements.mobileMenuToggle.addEventListener('click', () => {
      this.elements.sidebar.classList.toggle('open');
    });
    
    // Navigation
    this.elements.navItems.forEach(item => {
      item.addEventListener('click', () => {
        // Close sidebar on mobile
        if (window.innerWidth < 768) {
          this.elements.sidebar.classList.remove('open');
        }
      });
    });
    
    // Add transaction buttons
    [
      this.elements.addTransactionBtn,
      this.elements.addTransactionModalBtn,
      this.elements.addTransactionEmptyBtn
    ].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => this.showModal(this.elements.addTransactionModal));
      }
    });
    
    // Add category button
    if (this.elements.addCategoryBtn) {
      this.elements.addCategoryBtn.addEventListener('click', () => this.showModal(this.elements.addCategoryModal));
    }
    
    // Add budget buttons
    [
      this.elements.addBudgetBtn,
      this.elements.addBudgetEmptyBtn
    ].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => this.showModal(this.elements.addBudgetModal));
      }
    });
    
    // Transaction filters
    if (this.elements.applyFilters) {
      this.elements.applyFilters.addEventListener('click', () => this.filterTransactions());
    }
    
    // Forms submission
    if (this.elements.addTransactionForm) {
      this.elements.addTransactionForm.addEventListener('submit', e => this.handleAddTransaction(e));
    }
    
    if (this.elements.addCategoryForm) {
      this.elements.addCategoryForm.addEventListener('submit', e => this.handleAddCategory(e));
    }
    
    if (this.elements.addBudgetForm) {
      this.elements.addBudgetForm.addEventListener('submit', e => this.handleAddBudget(e));
    }
    
    // Report navigation
    if (this.elements.prevMonth) {
      this.elements.prevMonth.addEventListener('click', () => this.navigateReportMonth(-1));
    }
    
    if (this.elements.nextMonth) {
      this.elements.nextMonth.addEventListener('click', () => this.navigateReportMonth(1));
    }
    
    if (this.elements.exportReport) {
      this.elements.exportReport.addEventListener('click', () => this.exportReportData());
    }
    
    // Tab selectors for transaction and category types
    document.querySelectorAll('.tab-selector').forEach(selector => {
      const tabs = selector.querySelectorAll('.tab');
      const hiddenInput = selector.nextElementSibling;
      
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          
          if (hiddenInput) {
            hiddenInput.value = tab.dataset.value;
          }
          
          // Update category dropdown if this is the transaction type selector
          if (selector.parentElement.querySelector('label').textContent === 'Type') {
            const transactionType = tab.dataset.value;
            this.updateCategoryDropdown(
              document.getElementById('transaction-category'),
              transactionType
            );
          }
        });
      });
    });
    
    // Icon selector
    const iconSelector = document.getElementById('icon-selector');
    if (iconSelector) {
      const iconOptions = iconSelector.querySelectorAll('.icon-option');
      const hiddenInput = document.getElementById('category-icon');
      
      iconOptions.forEach(option => {
        option.addEventListener('click', () => {
          iconOptions.forEach(o => o.classList.remove('selected'));
          option.classList.add('selected');
          
          if (hiddenInput) {
            hiddenInput.value = option.dataset.icon;
          }
        });
      });
    }
    
    // Sign Out button
    if (this.elements.signOutBtn) {
      this.elements.signOutBtn.addEventListener('click', () => {
        Auth.logout();
        window.location.href = 'login.html';
      });
    }
    
    // User avatar click for settings page
    if (this.elements.headerAvatarImg) {
      this.elements.headerAvatarImg.parentElement.addEventListener('click', () => {
        window.location.href = 'settings.html';
      });
    }
    
    // Close modals
    document.querySelectorAll('.close-modal, .cancel-modal').forEach(btn => {
      btn.addEventListener('click', () => this.closeAllModals());
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', e => {
      document.querySelectorAll('.modal').forEach(modal => {
        if (e.target === modal) {
          this.closeAllModals();
        }
      });
    });
  },
  
  // Update user information in the UI
  updateUserInfo() {
    const currentUser = Auth.getCurrentUser();
    if (!currentUser) return;
    
    // Update profile avatar
    if (currentUser.avatar && this.elements.headerAvatarImg) {
      this.elements.headerAvatarImg.src = currentUser.avatar;
    }
  },
  
  // Setup navigation
  setupNavigation() {
    // Handle navigation based on URL hash
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || 'dashboard';
      this.navigateTo(hash);
    };
    
    window.addEventListener('hashchange', handleHashChange);
    
    // Initialize with current hash
    handleHashChange();
  },
  
  // Navigate to a specific page
  navigateTo(pageName) {
    // Update active nav item
    this.elements.navItems.forEach(item => {
      item.classList.toggle('active', item.dataset.page === pageName);
    });
    
    // Show active page
    this.elements.pages.forEach(page => {
      const isActive = page.id === `${pageName}-page`;
      page.classList.toggle('active', isActive);
    });
    
    // Update content for the specific page
    if (pageName === 'dashboard') {
      this.updateDashboard();
    } else if (pageName === 'transactions') {
      this.renderTransactions();
    } else if (pageName === 'categories') {
      this.renderCategories();
    } else if (pageName === 'budgets') {
      this.renderBudgets();
    } else if (pageName === 'reports') {
      this.updateReports();
    }
  },
  
  // Setup modals
  setupModals() {
    // Populate transaction category dropdown
    this.updateCategoryDropdown(
      document.getElementById('transaction-category'),
      'income'
    );
    
    // Populate budget category dropdown
    this.updateCategoryDropdown(
      document.getElementById('budget-category'),
      'expense'
    );
    
    // Set default date for new transaction
    const transactionDateInput = document.getElementById('transaction-date');
    if (transactionDateInput) {
      transactionDateInput.value = new Date().toISOString().split('T')[0];
    }
    
    // Setup filter date inputs
    const today = new Date();
    if (this.elements.dateTo) {
      this.elements.dateTo.value = today.toISOString().split('T')[0];
    }
    
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    if (this.elements.dateFrom) {
      this.elements.dateFrom.value = firstDayOfMonth.toISOString().split('T')[0];
    }
    
    // Populate category filter
    if (this.elements.categoryFilter) {
      const categories = ExpenseTracker.getCategories();
      let html = '<option value="all">All Categories</option>';
      
      categories.forEach(category => {
        html += `<option value="${category.name}">${category.name}</option>`;
      });
      
      this.elements.categoryFilter.innerHTML = html;
    }
  },
  
  // Show modal
  showModal(modal) {
    if (modal) {
      modal.classList.add('show');
    }
  },
  
  // Close all modals
  closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.classList.remove('show');
    });
    
    // Reset forms
    document.querySelectorAll('form').forEach(form => {
      form.reset();
    });
    
    // Reset tab selectors
    document.querySelectorAll('.tab-selector').forEach(selector => {
      const tabs = selector.querySelectorAll('.tab');
      tabs.forEach((tab, index) => {
        tab.classList.toggle('active', index === 0);
      });
      
      const hiddenInput = selector.nextElementSibling;
      if (hiddenInput) {
        hiddenInput.value = tabs[0].dataset.value;
      }
      
      // Update transaction category dropdown to income
      this.updateCategoryDropdown(
        document.getElementById('transaction-category'),
        'income'
      );
    });
    
    // Reset icon selector
    const iconSelector = document.getElementById('icon-selector');
    if (iconSelector) {
      const iconOptions = iconSelector.querySelectorAll('.icon-option');
      iconOptions.forEach((option, index) => {
        option.classList.toggle('selected', index === 0);
      });
      
      const hiddenInput = document.getElementById('category-icon');
      if (hiddenInput) {
        hiddenInput.value = iconOptions[0].dataset.icon;
      }
    }
  },
  
  // Update category dropdown based on transaction type
  updateCategoryDropdown(dropdown, type) {
    if (!dropdown) return;
    
    const categories = ExpenseTracker.getCategoriesByType(type);
    let html = '';
    
    categories.forEach(category => {
      html += `<option value="${category.name}">${category.name}</option>`;
    });
    
    if (html === '') {
      html = '<option value="">No categories available</option>';
    }
    
    dropdown.innerHTML = html;
  },
  
  // Update dashboard
  updateDashboard() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Get currency symbol
    const currency = localStorage.getItem('currency') || '₹';
    
    // Update summary cards
    const totalIncome = ExpenseTracker.getTotalIncomeByMonth(currentMonth, currentYear);
    const totalExpenses = ExpenseTracker.getTotalExpensesByMonth(currentMonth, currentYear);
    const balance = totalIncome - totalExpenses;
    
    if (this.elements.totalIncome) {
      this.elements.totalIncome.textContent = `${currency}${totalIncome.toFixed(2)}`;
    }
    
    if (this.elements.totalExpenses) {
      this.elements.totalExpenses.textContent = `${currency}${totalExpenses.toFixed(2)}`;
    }
    
    if (this.elements.balance) {
      this.elements.balance.textContent = `${currency}${balance.toFixed(2)}`;
    }
    
    // Render recent transactions
    this.renderRecentTransactions();
    
    // Initialize charts
    Charts.initDashboardCharts();
  },
  
  // Render recent transactions
  renderRecentTransactions() {
    if (!this.elements.recentTransactionsList) return;
    
    // Get currency symbol
    const currency = localStorage.getItem('currency') || '₹';
    
    const transactions = ExpenseTracker.getTransactions();
    const recentTransactions = [...transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
    
    if (recentTransactions.length === 0) {
      this.elements.recentTransactionsList.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-receipt"></i>
          <p>No transactions yet</p>
          <button class="btn btn-primary" id="add-transaction-btn">Add Transaction</button>
        </div>
      `;
      
      const addBtn = this.elements.recentTransactionsList.querySelector('#add-transaction-btn');
      if (addBtn) {
        addBtn.addEventListener('click', () => this.showModal(this.elements.addTransactionModal));
      }
      
      return;
    }
    
    let html = '';
    
    recentTransactions.forEach(transaction => {
      const category = ExpenseTracker.getCategories().find(c => c.name === transaction.category);
      const categoryColor = category ? category.color : '#6366f1';
      const categoryIcon = category ? category.icon : 'question';
      
      const formattedDate = new Date(transaction.date).toLocaleDateString();
      
      html += `
        <div class="transaction-item">
          <div class="transaction-category" style="background-color: ${categoryColor}20; color: ${categoryColor}">
            <i class="fas fa-${categoryIcon}"></i>
          </div>
          <div class="transaction-details">
            <div class="transaction-title">${transaction.description || transaction.category}</div>
            <div class="transaction-date">${formattedDate}</div>
          </div>
          <div class="transaction-amount ${transaction.type === 'income' ? 'income-amount' : 'expense-amount'}">
            ${transaction.type === 'income' ? '+' : '-'}${currency}${Number(transaction.amount).toFixed(2)}
          </div>
        </div>
      `;
    });
    
    this.elements.recentTransactionsList.innerHTML = html;
    
    // Add event listener to new add transaction button
    const addBtn = document.getElementById('add-transaction-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.showModal(this.elements.addTransactionModal));
    }
  },
  
  // Render all transactions
  renderTransactions(filteredTransactions = null) {
    // Get currency symbol
    const currency = localStorage.getItem('currency') || '₹';
    
    const transactions = filteredTransactions || ExpenseTracker.getTransactions();
    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (!this.elements.transactionsTableBody || !this.elements.transactionsEmptyState) return;
    
    if (sortedTransactions.length === 0) {
      this.elements.transactionsTableBody.innerHTML = '';
      this.elements.transactionsEmptyState.style.display = 'flex';
      return;
    }
    
    this.elements.transactionsEmptyState.style.display = 'none';
    
    let html = '';
    
    sortedTransactions.forEach(transaction => {
      const formattedDate = new Date(transaction.date).toLocaleDateString();
      const typeClass = transaction.type === 'income' ? 'income-amount' : 'expense-amount';
      const amountPrefix = transaction.type === 'income' ? '+' : '-';
      
      html += `
        <tr data-id="${transaction.id}">
          <td>${formattedDate}</td>
          <td>${transaction.description || '-'}</td>
          <td>${transaction.category}</td>
          <td class="${typeClass}">${amountPrefix}${currency}${Number(transaction.amount).toFixed(2)}</td>
          <td>
            <span class="badge ${transaction.type === 'income' ? 'income' : 'expense'}">
              ${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
            </span>
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
        </tr>
      `;
    });
    
    this.elements.transactionsTableBody.innerHTML = html;
    
    // Add event listeners for edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        this.editTransaction(id);
      });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        this.deleteTransaction(id);
      });
    });
    
    // Add styles for badges
    const style = document.createElement('style');
    style.textContent = `
      .badge {
        display: inline-block;
        padding: 0.25rem 0.5rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 500;
      }
      
      .badge.income {
        background-color: rgba(16, 185, 129, 0.1);
        color: var(--income);
      }
      
      .badge.expense {
        background-color: rgba(239, 68, 68, 0.1);
        color: var(--expense);
      }
    `;
    document.head.appendChild(style);
  },
  
  // Filter transactions
  filterTransactions() {
    const typeFilter = this.elements.transactionTypeFilter.value;
    const categoryFilter = this.elements.categoryFilter.value;
    const dateFrom = this.elements.dateFrom.value;
    const dateTo = this.elements.dateTo.value;
    
    let filteredTransactions = ExpenseTracker.getTransactions();
    
    // Filter by type
    if (typeFilter !== 'all') {
      filteredTransactions = filteredTransactions.filter(t => t.type === typeFilter);
    }
    
    // Filter by category
    if (categoryFilter !== 'all') {
      filteredTransactions = filteredTransactions.filter(t => t.category === categoryFilter);
    }
    
    // Filter by date range
    if (dateFrom && dateTo) {
      filteredTransactions = ExpenseTracker.getTransactionsByDateRange(dateFrom, dateTo);
      
      // Re-apply type and category filters if needed
      if (typeFilter !== 'all') {
        filteredTransactions = filteredTransactions.filter(t => t.type === typeFilter);
      }
      
      if (categoryFilter !== 'all') {
        filteredTransactions = filteredTransactions.filter(t => t.category === categoryFilter);
      }
    }
    
    this.renderTransactions(filteredTransactions);
  },
  
  // Render categories
  renderCategories() {
    if (!this.elements.incomeCategories || !this.elements.expenseCategories) return;
    
    const incomeCategories = ExpenseTracker.getCategoriesByType('income');
    const expenseCategories = ExpenseTracker.getCategoriesByType('expense');
    
    // Render income categories
    if (incomeCategories.length === 0) {
      this.elements.incomeCategoriesEmpty.style.display = 'flex';
      this.elements.incomeCategories.innerHTML = '';
    } else {
      this.elements.incomeCategoriesEmpty.style.display = 'none';
      
      let html = '';
      incomeCategories.forEach(category => {
        html += this.createCategoryCard(category);
      });
      
      this.elements.incomeCategories.innerHTML = html;
    }
    
    // Render expense categories
    if (expenseCategories.length === 0) {
      this.elements.expenseCategoriesEmpty.style.display = 'flex';
      this.elements.expenseCategories.innerHTML = '';
    } else {
      this.elements.expenseCategoriesEmpty.style.display = 'none';
      
      let html = '';
      expenseCategories.forEach(category => {
        html += this.createCategoryCard(category);
      });
      
      this.elements.expenseCategories.innerHTML = html;
    }
    
    // Add event listeners
    document.querySelectorAll('.edit-category-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        this.editCategory(id);
      });
    });
    
    document.querySelectorAll('.delete-category-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        this.deleteCategory(id);
      });
    });
  },
  
  // Create category card HTML
  createCategoryCard(category) {
    return `
      <div class="category-card" data-id="${category.id}">
        <div class="category-icon" style="background-color: ${category.color}20; color: ${category.color}">
          <i class="fas fa-${category.icon}"></i>
        </div>
        <div class="category-name">${category.name}</div>
        <div class="category-actions">
          <button class="edit-category-btn" data-id="${category.id}">
            <i class="fas fa-edit"></i>
          </button>
          <button class="delete-category-btn" data-id="${category.id}">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  },
  
  // Render budgets
  renderBudgets() {
    if (!this.elements.budgetsContainer || !this.elements.budgetsEmptyState) return;
    
    // Get currency symbol
    const currency = localStorage.getItem('currency') || '₹';
    
    const budgets = ExpenseTracker.getBudgets();
    
    if (budgets.length === 0) {
      this.elements.budgetsContainer.innerHTML = '';
      this.elements.budgetsEmptyState.style.display = 'flex';
      return;
    }
    
    this.elements.budgetsEmptyState.style.display = 'none';
    
    let html = '';
    
    budgets.forEach(budget => {
      const progress = ExpenseTracker.calculateBudgetProgress(budget.id);
      if (!progress) return;
      
      const { spent, percentage, remaining, status } = progress;
      
      html += `
        <div class="budget-card" data-id="${budget.id}">
          <div class="budget-header">
            <div>
              <div class="budget-title">${budget.category}</div>
              <div class="budget-period">${budget.period.charAt(0).toUpperCase() + budget.period.slice(1)} budget</div>
            </div>
            <div class="category-actions">
              <button class="edit-budget-btn" data-id="${budget.id}">
                <i class="fas fa-edit"></i>
              </button>
              <button class="delete-budget-btn" data-id="${budget.id}">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          <div class="budget-content">
            <div class="budget-progress ${status}">
              <div class="progress-info">
                <span>${currency}${spent.toFixed(2)} of ${currency}${budget.amount.toFixed(2)}</span>
                <span>${percentage.toFixed(0)}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-value" style="width: ${Math.min(100, percentage)}%"></div>
              </div>
            </div>
          </div>
          <div class="budget-footer">
            <span class="remaining-label">Remaining</span>
            <span class="remaining-value ${status === 'danger' ? 'danger' : ''}">
              ${currency}${remaining.toFixed(2)}
            </span>
          </div>
          ${status === 'danger' ? `
            <div class="budget-alert">
              <i class="fas fa-exclamation-circle"></i>
              <span>Over budget limit</span>
            </div>
          ` : ''}
        </div>
      `;
    });
    
    this.elements.budgetsContainer.innerHTML = html;
    
    // Add event listeners
    document.querySelectorAll('.edit-budget-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        this.editBudget(id);
      });
    });
    
    document.querySelectorAll('.delete-budget-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        this.deleteBudget(id);
      });
    });
  },
  
  // Initialize reports page
  initReports() {
    this.currentReportMonth = new Date().getMonth();
    this.currentReportYear = new Date().getFullYear();
    this.updateReportMonthLabel();
  },
  
  // Update reports
  updateReports() {
    this.updateReportMonthLabel();
    Charts.initReportCharts(this.currentReportMonth, this.currentReportYear);
  },
  
  // Update report month label
  updateReportMonthLabel() {
    if (this.elements.currentMonth) {
      const monthName = new Date(this.currentReportYear, this.currentReportMonth, 1)
        .toLocaleString('default', { month: 'long' });
      this.elements.currentMonth.textContent = `${monthName} ${this.currentReportYear}`;
    }
  },
  
  // Navigate report month
  navigateReportMonth(change) {
    let newMonth = this.currentReportMonth + change;
    let newYear = this.currentReportYear;
    
    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }
    
    this.currentReportMonth = newMonth;
    this.currentReportYear = newYear;
    this.updateReports();
  },
  
  // Export report data
  exportReportData() {
    const monthName = new Date(this.currentReportYear, this.currentReportMonth, 1)
      .toLocaleString('default', { month: 'long' });
    
    const transactions = ExpenseTracker.getTransactionsByMonth(
      this.currentReportMonth,
      this.currentReportYear
    );
    
    if (transactions.length === 0) {
      this.showToast('No data to export', 'error');
      return;
    }
    
    // Format data for CSV
    let csvContent = 'Date,Description,Category,Amount,Type\n';
    
    transactions.forEach(t => {
      csvContent += `${t.date},"${t.description || ''}",${t.category},${t.amount},${t.type}\n`;
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `expense-report-${monthName}-${this.currentReportYear}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    this.showToast('Report exported successfully', 'success');
  },
  
  // Handle add transaction
  handleAddTransaction(e) {
    e.preventDefault();
    
    // Get currency symbol
    const currency = localStorage.getItem('currency') || '₹';
    
    const type = document.getElementById('transaction-type').value;
    const amount = parseFloat(document.getElementById('transaction-amount').value);
    const date = document.getElementById('transaction-date').value;
    const category = document.getElementById('transaction-category').value;
    const description = document.getElementById('transaction-description').value;
    const notes = document.getElementById('transaction-notes').value;
    
    if (!amount || !date || !category) {
      this.showToast('Please fill all required fields', 'error');
      return;
    }
    
    const transaction = {
      type,
      amount,
      date,
      category,
      description,
      notes
    };
    
    ExpenseTracker.addTransaction(transaction);
    this.closeAllModals();
    this.updateDashboard();
    
    if (window.location.hash === '#transactions') {
      this.renderTransactions();
    }
    
    this.showToast('Transaction added successfully', 'success');
  },
  
  // Handle add category
  handleAddCategory(e) {
    e.preventDefault();
    
    const type = document.getElementById('category-type').value;
    const name = document.getElementById('category-name').value;
    const color = document.getElementById('category-color').value;
    const icon = document.getElementById('category-icon').value;
    
    if (!name) {
      this.showToast('Please enter a category name', 'error');
      return;
    }
    
    // Check if category already exists
    const categories = ExpenseTracker.getCategories();
    const categoryExists = categories.some(c => 
      c.name.toLowerCase() === name.toLowerCase() && c.type === type
    );
    
    if (categoryExists) {
      this.showToast('A category with this name already exists', 'error');
      return;
    }
    
    const category = {
      type,
      name,
      color,
      icon
    };
    
    ExpenseTracker.addCategory(category);
    this.closeAllModals();
    this.renderCategories();
    this.setupModals(); // Update category dropdowns
    
    this.showToast('Category added successfully', 'success');
  },
  
  // Handle add budget
  handleAddBudget(e) {
    e.preventDefault();
    
    // Get currency symbol
    const currency = localStorage.getItem('currency') || '₹';
    
    const category = document.getElementById('budget-category').value;
    const amount = parseFloat(document.getElementById('budget-amount').value);
    const period = document.getElementById('budget-period').value;
    
    if (!category || !amount) {
      this.showToast('Please fill all required fields', 'error');
      return;
    }
    
    const budget = {
      category,
      amount,
      period
    };
    
    const result = ExpenseTracker.addBudget(budget);
    
    if (result.error) {
      this.showToast(result.error, 'error');
      return;
    }
    
    this.closeAllModals();
    this.renderBudgets();
    
    this.showToast('Budget added successfully', 'success');
  },
  
  // Edit transaction
  editTransaction(id) {
    // This is a placeholder for edit functionality
    this.showToast('Edit functionality coming soon', 'info');
  },
  
  // Delete transaction
  deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
      ExpenseTracker.deleteTransaction(id);
      this.renderTransactions();
      this.updateDashboard();
      this.showToast('Transaction deleted successfully', 'success');
    }
  },
  
  // Edit category
  editCategory(id) {
    // This is a placeholder for edit functionality
    this.showToast('Edit functionality coming soon', 'info');
  },
  
  // Delete category
  deleteCategory(id) {
    if (confirm('Are you sure you want to delete this category?')) {
      const result = ExpenseTracker.deleteCategory(id);
      
      if (result && result.error) {
        this.showToast(result.error, 'error');
        return;
      }
      
      this.renderCategories();
      this.setupModals(); // Update category dropdowns
      this.showToast('Category deleted successfully', 'success');
    }
  },
  
  // Edit budget
  editBudget(id) {
    // This is a placeholder for edit functionality
    this.showToast('Edit functionality coming soon', 'info');
  },
  
  // Delete budget
  deleteBudget(id) {
    if (confirm('Are you sure you want to delete this budget?')) {
      ExpenseTracker.deleteBudget(id);
      this.renderBudgets();
      this.showToast('Budget deleted successfully', 'success');
    }
  },
  
  // Show toast notification
  showToast(message, type = 'info') {
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
};
