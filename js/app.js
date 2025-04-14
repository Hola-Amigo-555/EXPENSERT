
// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize UI
  UI.init();
  
  // Enable dark mode toggle with system preference
  initDarkMode();
  
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
  
  // Listen for storage events to update theme in real-time across tabs
  window.addEventListener('storage', function(e) {
    if (e.key === 'darkMode') {
      const isDarkMode = e.newValue === 'true';
      document.documentElement.classList.toggle('dark', isDarkMode);
      document.body.classList.toggle('dark-mode', isDarkMode);
    }
  });
  
  console.log('Dark mode initialized, current state:', darkModeEnabled);
}
