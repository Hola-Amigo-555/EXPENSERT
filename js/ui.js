// UI utilities and common functions
const UI = (function() {
  // Initialize UI components
  function init() {
    setupNavigationEvents();
    setupTransactionModal();
    setupCategoryModal();
    setupBudgetModal();
    setupMobileMenu();
    
    console.log('UI initialized');
  }
  
  // Set up navigation events
  function setupNavigationEvents() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', function(e) {
        e.preventDefault();
        
        const page = this.getAttribute('data-page');
        window.location.hash = page;
      });
    });
  }
  
  // Setup mobile menu toggle
  function setupMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const sidebar = document.getElementById('sidebar');
    
    if (mobileMenuToggle && sidebar) {
      mobileMenuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('open');
      });
      
      // Close sidebar when clicking outside on mobile
      document.addEventListener('click', function(e) {
        if (sidebar.classList.contains('open') && 
            !sidebar.contains(e.target) && 
            e.target !== mobileMenuToggle) {
          sidebar.classList.remove('open');
        }
      });
    }
  }
  
  // Set up transaction modal events
  function setupTransactionModal() {
    const addTransactionBtns = document.querySelectorAll('#add-transaction-btn, #add-transaction-btn-2');
    const transactionModal = document.getElementById('transaction-modal');
    const closeModalBtns = document.querySelectorAll('.close-modal, .close-modal-btn');
    
    if (addTransactionBtns.length && transactionModal) {
      // Open modal
      addTransactionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
          openModal('transaction-modal');
          populateTransactionCategories();
          
          // Set default date to today
          const dateInput = document.getElementById('transaction-date');
          if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.value = today;
          }
        });
      });
      
      // Tab switching
      const tabButtons = transactionModal.querySelectorAll('.tab');
      tabButtons.forEach(tab => {
        tab.addEventListener('click', function() {
          const type = this.getAttribute('data-type');
          
          // Update active tab
          tabButtons.forEach(t => t.classList.remove('active'));
          this.classList.add('active');
          
          // Update category dropdown based on type
          populateTransactionCategories(type);
        });
      });
      
      // Form submission
      const transactionForm = document.getElementById('transaction-form');
      if (transactionForm) {
        transactionForm.addEventListener('submit', handleTransactionSubmit);
      }
    }
    
    // Close buttons
    closeModalBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const modalId = this.closest('.modal').id;
        closeModal(modalId);
      });
    });
  }
  
  // Handle transaction form submission
  function handleTransactionSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const id = document.getElementById('transaction-id').value;
    const date = document.getElementById('transaction-date').value;
    const amount = parseFloat(document.getElementById('transaction-amount').value);
    const category = document.getElementById('transaction-category').value;
    const description = document.getElementById('transaction-description').value;
    const notes = document.getElementById('transaction-notes').value;
    const type = form.querySelector('.tab.active').getAttribute('data-type');
    
    const transaction = {
      date,
      amount,
      category,
      description,
      notes,
      type
    };
    
    // Add or update transaction
    if (id) {
      transaction.id = id;
      ExpenseTracker.updateTransaction(id, transaction);
      showToast('Transaction updated successfully', 'success');
    } else {
      ExpenseTracker.addTransaction(transaction);
      showToast('Transaction added successfully', 'success');
    }
    
    // Reset form and close modal
    form.reset();
    document.getElementById('transaction-id').value = '';
    closeModal('transaction-modal');
    
    // Refresh dashboard and transaction tables
    Charts.initDashboardCharts();
    const transactionsTable = document.getElementById('transactions-table-body');
    if (transactionsTable) {
      populateTransactionsTable();
    }
    
    const recentTransactions = document.getElementById('recent-transactions-list');
    if (recentTransactions) {
      populateRecentTransactions();
    }
  }
  
  // Populate transaction categories
  function populateTransactionCategories(type = 'expense') {
    const categorySelect = document.getElementById('transaction-category');
    if (!categorySelect) return;
    
    // Clear existing options
    categorySelect.innerHTML = '';
    
    // Get categories by type
    const categories = ExpenseTracker.getCategoriesByType(type);
    
    // Add options
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.name;
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });
  }
  
  // Set up category modal events
  function setupCategoryModal() {
    const addCategoryBtn = document.getElementById('add-category-btn');
    const categoryModal = document.getElementById('category-modal');
    
    if (addCategoryBtn && categoryModal) {
      // Open modal
      addCategoryBtn.addEventListener('click', function() {
        openModal('category-modal');
        populateIconSelector();
      });
      
      // Tab switching
      const tabButtons = categoryModal.querySelectorAll('.tab');
      tabButtons.forEach(tab => {
        tab.addEventListener('click', function() {
          tabButtons.forEach(t => t.classList.remove('active'));
          this.classList.add('active');
        });
      });
      
      // Form submission
      const categoryForm = document.getElementById('category-form');
      if (categoryForm) {
        categoryForm.addEventListener('submit', handleCategorySubmit);
      }
    }
  }
  
  // Populate icon selector in category modal
  function populateIconSelector() {
    const iconSelector = document.getElementById('icon-selector');
    if (!iconSelector) return;
    
    // Clear existing icons
    iconSelector.innerHTML = '';
    
    // Common icons
    const icons = [
      'home', 'car', 'utensils', 'shopping-cart', 'medical-kit', 'graduation-cap',
      'gamepad', 'plane', 'tshirt', 'coffee', 'gas-pump', 'film', 'gift', 'bus',
      'subway', 'taxi', 'book', 'dumbbell', 'guitar', 'paw', 'baby', 'cut',
      'paint-brush', 'hammer', 'wrench', 'laptop', 'mobile-alt', 'tv', 'headphones',
      'lightbulb', 'wallet', 'money-bill-wave', 'credit-card', 'briefcase', 'bank',
      'chart-line', 'piggy-bank', 'dollar-sign', 'coins'
    ];
    
    // Add icon options
    icons.forEach(icon => {
      const iconDiv = document.createElement('div');
      iconDiv.className = 'icon-option';
      iconDiv.innerHTML = `<i class="fas fa-${icon}"></i>`;
      iconDiv.setAttribute('data-icon', icon);
      
      iconDiv.addEventListener('click', function() {
        // Remove active class from all icons
        iconSelector.querySelectorAll('.icon-option').forEach(i => {
          i.classList.remove('active');
        });
        
        // Add active class to selected icon
        this.classList.add('active');
      });
      
      iconSelector.appendChild(iconDiv);
    });
  }
  
  // Handle category form submission
  function handleCategorySubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const id = document.getElementById('category-id').value;
    const name = document.getElementById('category-name').value;
    const color = document.getElementById('category-color').value;
    const type = form.querySelector('.tab.active').getAttribute('data-type');
    
    // Get selected icon
    const activeIcon = document.querySelector('#icon-selector .icon-option.active');
    const icon = activeIcon ? activeIcon.getAttribute('data-icon') : 'tag';
    
    const category = {
      name,
      color,
      icon,
      type
    };
    
    // Add or update category
    if (id) {
      category.id = id;
      ExpenseTracker.updateCategory(id, category);
      showToast('Category updated successfully', 'success');
    } else {
      ExpenseTracker.addCategory(category);
      showToast('Category added successfully', 'success');
    }
    
    // Reset form and close modal
    form.reset();
    document.getElementById('category-id').value = '';
    closeModal('category-modal');
    
    // Refresh categories display
    const incomeGrid = document.getElementById('income-categories-grid');
    const expenseGrid = document.getElementById('expense-categories-grid');
    
    if (incomeGrid && expenseGrid) {
      populateCategoriesGrids();
    }
  }
  
  // Set up budget modal events
  function setupBudgetModal() {
    const addBudgetBtn = document.getElementById('add-budget-btn');
    const budgetModal = document.getElementById('budget-modal');
    
    if (addBudgetBtn && budgetModal) {
      // Open modal
      addBudgetBtn.addEventListener('click', function() {
        openModal('budget-modal');
        populateBudgetCategories();
      });
      
      // Form submission
      const budgetForm = document.getElementById('budget-form');
      if (budgetForm) {
        budgetForm.addEventListener('submit', handleBudgetSubmit);
      }
    }
  }
  
  // Populate budget categories
  function populateBudgetCategories() {
    const categorySelect = document.getElementById('budget-category');
    if (!categorySelect) return;
    
    // Clear existing options
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
  
  // Handle budget form submission
  function handleBudgetSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const id = document.getElementById('budget-id').value;
    const category = document.getElementById('budget-category').value;
    const amount = parseFloat(document.getElementById('budget-amount').value);
    const period = document.getElementById('budget-period').value;
    
    const budget = {
      category,
      amount,
      period
    };
    
    // Add or update budget
    if (id) {
      budget.id = id;
      const result = ExpenseTracker.updateBudget(id, budget);
      if (result.success) {
        showToast('Budget updated successfully', 'success');
      } else {
        showToast(result.error, 'error');
        return;
      }
    } else {
      const result = ExpenseTracker.addBudget(budget);
      if (result.success) {
        showToast('Budget added successfully', 'success');
      } else {
        showToast(result.error, 'error');
        return;
      }
    }
    
    // Reset form and close modal
    form.reset();
    document.getElementById('budget-id').value = '';
    closeModal('budget-modal');
    
    // Refresh budgets display
    const budgetsContainer = document.getElementById('budgets-container');
    if (budgetsContainer) {
      populateBudgets();
    }
  }
  
  // Toast notification function
  function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
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
    
    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-content">
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close">&times;</button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove toast
    setTimeout(() => {
      if (toast.parentNode) {
        toastContainer.removeChild(toast);
      }
    }, 3000);
    
    // Close toast on button click
    toast.querySelector('.toast-close').addEventListener('click', () => {
      toastContainer.removeChild(toast);
    });
  }
  
  // Modal handling
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'block';
    }
  }
  
  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'none';
    }
  }
  
  // Confirm dialog
  function showConfirmDialog(message, onConfirm, onCancel) {
    const confirmModal = document.getElementById('confirm-modal');
    if (confirmModal) {
      document.getElementById('confirm-message').textContent = message;
      document.getElementById('confirm-title').textContent = 'Confirm Action';
      
      const confirmBtn = document.getElementById('confirm-action-btn');
      
      // Remove previous event listeners
      const newConfirmBtn = confirmBtn.cloneNode(true);
      confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
      
      // Add new confirm action
      newConfirmBtn.addEventListener('click', function() {
        onConfirm();
        closeModal('confirm-modal');
      });
      
      // Show the modal
      openModal('confirm-modal');
    }
  }
  
  return {
    init,
    showToast,
    openModal,
    closeModal,
    showConfirmDialog,
    populateCategoriesGrids: function() {
      // This function will be defined later
      console.log('populateCategoriesGrids called but not yet implemented');
    },
    populateTransactionsTable: function() {
      // This function will be defined later
      console.log('populateTransactionsTable called but not yet implemented');
    },
    populateRecentTransactions: function() {
      // This function will be defined later
      console.log('populateRecentTransactions called but not yet implemented');
    },
    populateBudgets: function() {
      // This function will be defined later
      console.log('populateBudgets called but not yet implemented');
    }
  };
})();
