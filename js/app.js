
// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize UI
  UI.init();
  
  // Enable dark mode toggle with system preference
  initDarkMode();
  
  // Initialize ExpenseTracker if user is logged in
  const currentUser = Auth.getCurrentUser();
  if (currentUser) {
    ExpenseTracker.init();
    
    // Update user info in the sidebar
    const userName = document.getElementById('user-name');
    const userEmail = document.getElementById('user-email');
    const userAvatar = document.getElementById('user-avatar');
    
    if (userName) userName.textContent = currentUser.name || 'User';
    if (userEmail) userEmail.textContent = currentUser.email || 'user@example.com';
    if (userAvatar && currentUser.avatar) userAvatar.src = currentUser.avatar;
    
    // Initialize charts if we're on the dashboard
    const incomeExpenseChart = document.getElementById('income-expense-chart');
    const expenseBreakdownChart = document.getElementById('expense-breakdown-chart');
    if (incomeExpenseChart && expenseBreakdownChart) {
      Charts.initDashboardCharts();
    }
  }
  
  // Log init message
  console.log('Expense Tracker initialized');
});

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
  
  // Set the toggle switch state if it exists
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  if (darkModeToggle) {
    darkModeToggle.checked = darkModeEnabled;
    
    // Add event listener for toggle
    darkModeToggle.addEventListener('change', function() {
      const isDarkMode = this.checked;
      localStorage.setItem('darkMode', isDarkMode);
      document.documentElement.classList.toggle('dark', isDarkMode);
      document.body.classList.toggle('dark-mode', isDarkMode);
    });
  }
  
  // Listen for storage events to update theme in real-time across tabs
  window.addEventListener('storage', function(e) {
    if (e.key === 'darkMode') {
      const isDarkMode = e.newValue === 'true';
      document.documentElement.classList.toggle('dark', isDarkMode);
      document.body.classList.toggle('dark-mode', isDarkMode);
      if (darkModeToggle) darkModeToggle.checked = isDarkMode;
    }
  });
  
  console.log('Dark mode initialized, current state:', darkModeEnabled);
}

// Handle page navigation (hash-based)
window.addEventListener('hashchange', handleNavigation);

function handleNavigation() {
  // Get the page from the hash without # (or default to dashboard)
  const page = window.location.hash.substring(1) || 'dashboard';
  
  // Update active navigation item
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    if (item.getAttribute('data-page') === page) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
  
  // Show the corresponding page
  const pages = document.querySelectorAll('.page');
  pages.forEach(p => {
    if (p.id === page + '-page') {
      p.classList.add('active');
    } else {
      p.classList.remove('active');
    }
  });
  
  // Initialize charts if on dashboard or reports page
  if (page === 'dashboard') {
    Charts.initDashboardCharts();
  } else if (page === 'reports') {
    const now = new Date();
    Charts.initReportCharts(now.getMonth(), now.getFullYear());
  }
}

// Initial navigation handling (on page load)
document.addEventListener('DOMContentLoaded', function() {
  handleNavigation();
});

