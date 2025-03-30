
// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Check if user is logged in
  const currentUser = Auth.getCurrentUser();
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }
  
  // Initialize UI elements
  initSettings();
  
  // Initialize event listeners
  setupEventListeners();
});

// Initialize settings page UI
function initSettings() {
  const currentUser = Auth.getCurrentUser();
  
  // Update profile info
  updateProfileInfo(currentUser);
  
  // Load user preferences
  loadUserPreferences();
}

// Update profile information in the UI
function updateProfileInfo(user) {
  // Update name and email
  document.getElementById('profile-name').textContent = user.name;
  document.getElementById('profile-email').textContent = user.email;
  
  // Update avatar if exists
  if (user.avatar) {
    document.getElementById('profile-avatar-img').src = user.avatar;
    document.getElementById('header-avatar-img').src = user.avatar;
  }
}

// Load user preferences from localStorage
function loadUserPreferences() {
  // Load dark mode setting
  const darkMode = localStorage.getItem('darkMode') === 'true';
  document.getElementById('dark-mode-toggle').checked = darkMode;
  document.body.classList.toggle('dark-mode', darkMode);
  
  // Load currency setting
  const currency = localStorage.getItem('currency') || '₹';
  document.getElementById('currency-selector').value = currency;
  
  // Load date format setting
  const dateFormat = localStorage.getItem('dateFormat') || 'DD/MM/YYYY';
  document.getElementById('date-format-selector').value = dateFormat;
}

// Setup event listeners
function setupEventListeners() {
  // Dark mode toggle
  document.getElementById('dark-mode-toggle').addEventListener('change', function(e) {
    const isDarkMode = e.target.checked;
    document.body.classList.toggle('dark-mode', isDarkMode);
    localStorage.setItem('darkMode', isDarkMode);
  });
  
  // Currency selector
  document.getElementById('currency-selector').addEventListener('change', function(e) {
    const currency = e.target.value;
    localStorage.setItem('currency', currency);
    showToast('Currency setting updated', 'success');
  });
  
  // Date format selector
  document.getElementById('date-format-selector').addEventListener('change', function(e) {
    const dateFormat = e.target.value;
    localStorage.setItem('dateFormat', dateFormat);
    showToast('Date format updated', 'success');
  });
  
  // Profile picture upload
  document.getElementById('avatar-upload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        const avatarUrl = event.target.result;
        document.getElementById('profile-avatar-img').src = avatarUrl;
        document.getElementById('header-avatar-img').src = avatarUrl;
        
        // Save avatar to user profile
        Auth.updateUserAvatar(avatarUrl);
        showToast('Profile picture updated', 'success');
      };
      reader.readAsDataURL(file);
    }
  });
  
  // Edit profile button
  document.getElementById('edit-profile-btn').addEventListener('click', function() {
    const user = Auth.getCurrentUser();
    document.getElementById('edit-name').value = user.name;
    document.getElementById('edit-email').value = user.email;
    
    // Show the modal
    document.getElementById('edit-profile-modal').classList.add('show');
  });
  
  // Edit profile form submission
  document.getElementById('edit-profile-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('edit-name').value;
    const email = document.getElementById('edit-email').value;
    
    const result = Auth.updateUserProfile(name, email);
    
    if (result.success) {
      updateProfileInfo(Auth.getCurrentUser());
      document.getElementById('edit-profile-modal').classList.remove('show');
      showToast('Profile updated successfully', 'success');
    } else {
      showToast(result.error, 'error');
    }
  });
  
  // Change password button
  document.getElementById('change-password-btn').addEventListener('click', function() {
    document.getElementById('change-password-modal').classList.add('show');
  });
  
  // Change password form submission
  document.getElementById('change-password-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmNewPassword = document.getElementById('confirm-new-password').value;
    
    if (newPassword !== confirmNewPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    
    const result = Auth.changePassword(currentPassword, newPassword);
    
    if (result.success) {
      document.getElementById('change-password-modal').classList.remove('show');
      document.getElementById('change-password-form').reset();
      showToast('Password changed successfully', 'success');
    } else {
      showToast(result.error, 'error');
    }
  });
  
  // Export data button
  document.getElementById('export-data-btn').addEventListener('click', function() {
    const exportData = {
      transactions: ExpenseTracker.getTransactions(),
      categories: ExpenseTracker.getCategories(),
      budgets: ExpenseTracker.getBudgets()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'expense-tracker-data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showToast('Data exported successfully', 'success');
  });
  
  // Import data button
  document.getElementById('import-data-btn').addEventListener('click', function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    
    input.onchange = e => {
      const file = e.target.files[0];
      
      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');
      
      reader.onload = readerEvent => {
        try {
          const content = readerEvent.target.result;
          const data = JSON.parse(content);
          
          // Import data
          if (data.transactions) ExpenseTracker.importTransactions(data.transactions);
          if (data.categories) ExpenseTracker.importCategories(data.categories);
          if (data.budgets) ExpenseTracker.importBudgets(data.budgets);
          
          showToast('Data imported successfully', 'success');
        } catch (error) {
          showToast('Error importing data: ' + error.message, 'error');
        }
      };
    };
    
    input.click();
  });
  
  // Clear data button
  document.getElementById('clear-data-btn').addEventListener('click', function() {
    if (confirm('Are you sure you want to clear all your financial data? This action cannot be undone.')) {
      ExpenseTracker.clearAllData();
      showToast('All data has been cleared', 'success');
    }
  });
  
  // Sign out button
  document.getElementById('sign-out-btn').addEventListener('click', function() {
    Auth.logout();
    window.location.href = 'login.html';
  });
  
  // Mobile menu toggle
  document.getElementById('mobile-menu-toggle').addEventListener('click', function() {
    document.getElementById('sidebar').classList.toggle('open');
  });
  
  // Close modals
  document.querySelectorAll('.close-modal, .cancel-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('show');
      });
      
      // Reset forms
      document.querySelectorAll('form').forEach(form => {
        form.reset();
      });
    });
  });
  
  // Close modal when clicking outside
  window.addEventListener('click', e => {
    document.querySelectorAll('.modal').forEach(modal => {
      if (e.target === modal) {
        modal.classList.remove('show');
      }
    });
  });
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
