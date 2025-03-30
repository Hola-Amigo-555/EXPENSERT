
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
  // Check for system preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Set initial theme
  if (prefersDark) {
    document.body.classList.add('dark-mode');
  }
  
  // Add dark mode toggle to settings (placeholder for now)
  // This could be expanded in the future
}
