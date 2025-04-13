
// Charts related functions
const Charts = {
  // Initialize dashboard charts
  initDashboardCharts: function() {
    this.initIncomeExpenseChart();
    this.initExpenseBreakdownChart();
  },
  
  // Initialize report charts
  initReportCharts: function(month, year) {
    this.initMonthlyOverviewChart(month, year);
    this.initExpenseTrendChart(month, year);
    this.initTopCategoriesChart(month, year);
    this.initIncomeSourcesChart(month, year);
  },
  
  // Income vs Expense chart
  initIncomeExpenseChart: function() {
    const chartElement = document.getElementById('income-expense-chart');
    if (!chartElement) return;
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Get data for the last 6 months
    const labels = [];
    const incomeData = [];
    const expenseData = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const yearOffset = (currentMonth - i < 0) ? -1 : 0;
      const year = currentYear + yearOffset;
      
      const monthName = new Date(year, monthIndex, 1)
        .toLocaleString('default', { month: 'short' });
      
      labels.push(monthName);
      
      incomeData.push(ExpenseTracker.getTotalIncomeByMonth(monthIndex, year));
      expenseData.push(ExpenseTracker.getTotalExpensesByMonth(monthIndex, year));
    }
    
    // Check if chart already exists
    if (window.incomeExpenseChart) {
      window.incomeExpenseChart.destroy();
    }
    
    // Create chart
    window.incomeExpenseChart = new Chart(chartElement, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Income',
            data: incomeData,
            backgroundColor: 'rgba(16, 185, 129, 0.7)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 1
          },
          {
            label: 'Expenses',
            data: expenseData,
            backgroundColor: 'rgba(239, 68, 68, 0.7)',
            borderColor: 'rgba(239, 68, 68, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '₹' + value;
              }
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': ₹' + context.raw.toFixed(2);
              }
            }
          }
        }
      }
    });
  },
  
  // Expense breakdown chart
  initExpenseBreakdownChart: function() {
    const chartElement = document.getElementById('expense-breakdown-chart');
    if (!chartElement) return;
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const transactions = ExpenseTracker.getTransactionsByMonth(currentMonth, currentYear);
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    
    if (expenseTransactions.length === 0) {
      chartElement.innerHTML = `
        <div class="empty-chart">
          <p>No expense data available</p>
        </div>
      `;
      return;
    }
    
    // Group expenses by category
    const categoryMap = {};
    expenseTransactions.forEach(transaction => {
      if (categoryMap[transaction.category]) {
        categoryMap[transaction.category] += transaction.amount;
      } else {
        categoryMap[transaction.category] = transaction.amount;
      }
    });
    
    // Sort categories by amount (descending)
    const sortedCategories = Object.keys(categoryMap).sort((a, b) => 
      categoryMap[b] - categoryMap[a]
    );
    
    // Get top 5 categories, group the rest as "Others"
    const labels = [];
    const data = [];
    const backgroundColors = [];
    
    const categories = ExpenseTracker.getCategories();
    
    let otherAmount = 0;
    
    sortedCategories.forEach((category, index) => {
      if (index < 5) {
        labels.push(category);
        data.push(categoryMap[category]);
        
        // Find category color
        const categoryObj = categories.find(c => c.name === category);
        backgroundColors.push(categoryObj ? categoryObj.color : '#6366f1');
      } else {
        otherAmount += categoryMap[category];
      }
    });
    
    // Add "Others" category if needed
    if (otherAmount > 0) {
      labels.push('Others');
      data.push(otherAmount);
      backgroundColors.push('#94a3b8');
    }
    
    // Check if chart already exists
    if (window.expenseBreakdownChart) {
      window.expenseBreakdownChart.destroy();
    }
    
    // Create chart
    window.expenseBreakdownChart = new Chart(chartElement, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: backgroundColors,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                
                return label + ': ₹' + value.toFixed(2) + ' (' + percentage + '%)';
              }
            }
          }
        }
      }
    });
  },
  
  // Monthly overview chart
  initMonthlyOverviewChart: function(month, year) {
    const chartElement = document.getElementById('monthly-overview-chart');
    if (!chartElement) return;
    
    const transactions = ExpenseTracker.getTransactionsByMonth(month, year);
    
    // Calculate total income and expenses
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpenses;
    
    // Check if chart already exists
    if (window.monthlyOverviewChart) {
      window.monthlyOverviewChart.destroy();
    }
    
    // Create chart
    window.monthlyOverviewChart = new Chart(chartElement, {
      type: 'bar',
      data: {
        labels: ['Income', 'Expenses', 'Balance'],
        datasets: [{
          data: [totalIncome, totalExpenses, balance],
          backgroundColor: [
            'rgba(16, 185, 129, 0.7)', // Income
            'rgba(239, 68, 68, 0.7)',  // Expenses
            balance >= 0 ? 'rgba(59, 130, 246, 0.7)' : 'rgba(249, 115, 22, 0.7)' // Balance
          ],
          borderColor: [
            'rgba(16, 185, 129, 1)',
            'rgba(239, 68, 68, 1)',
            balance >= 0 ? 'rgba(59, 130, 246, 1)' : 'rgba(249, 115, 22, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '₹' + value;
              }
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.raw || 0;
                return '₹' + value.toFixed(2);
              }
            }
          }
        }
      }
    });
  },
  
  // Expense trend chart
  initExpenseTrendChart: function(month, year) {
    const chartElement = document.getElementById('expense-trend-chart');
    if (!chartElement) return;
    
    // Get days in the month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Get all transactions for the month
    const transactions = ExpenseTracker.getTransactionsByMonth(month, year);
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    
    // Group expenses by day
    const dailyExpenses = Array(daysInMonth).fill(0);
    
    expenseTransactions.forEach(transaction => {
      const day = new Date(transaction.date).getDate() - 1; // 0-indexed
      dailyExpenses[day] += transaction.amount;
    });
    
    // Calculate cumulative expenses
    const cumulativeExpenses = [];
    let runningTotal = 0;
    
    dailyExpenses.forEach(amount => {
      runningTotal += amount;
      cumulativeExpenses.push(runningTotal);
    });
    
    // Create labels (days of month)
    const labels = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    
    // Check if chart already exists
    if (window.expenseTrendChart) {
      window.expenseTrendChart.destroy();
    }
    
    // Create chart
    window.expenseTrendChart = new Chart(chartElement, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Daily Expenses',
            data: dailyExpenses,
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            borderColor: 'rgba(239, 68, 68, 1)',
            borderWidth: 1,
            pointRadius: 2,
            type: 'bar',
            yAxisID: 'y'
          },
          {
            label: 'Cumulative',
            data: cumulativeExpenses,
            borderColor: 'rgba(99, 102, 241, 1)',
            borderWidth: 2,
            pointRadius: 0,
            type: 'line',
            fill: false,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            position: 'left',
            title: {
              display: true,
              text: 'Daily'
            },
            ticks: {
              callback: function(value) {
                return '₹' + value;
              }
            }
          },
          y1: {
            beginAtZero: true,
            position: 'right',
            title: {
              display: true,
              text: 'Cumulative'
            },
            grid: {
              drawOnChartArea: false
            },
            ticks: {
              callback: function(value) {
                return '₹' + value;
              }
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.raw || 0;
                return context.dataset.label + ': ₹' + value.toFixed(2);
              }
            }
          }
        }
      }
    });
  },
  
  // Top categories chart
  initTopCategoriesChart: function(month, year) {
    const chartElement = document.getElementById('top-categories-chart');
    if (!chartElement) return;
    
    const transactions = ExpenseTracker.getTransactionsByMonth(month, year);
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    
    if (expenseTransactions.length === 0) {
      chartElement.innerHTML = `
        <div class="empty-chart">
          <p>No expense data available</p>
        </div>
      `;
      return;
    }
    
    // Group expenses by category
    const categoryMap = {};
    expenseTransactions.forEach(transaction => {
      if (categoryMap[transaction.category]) {
        categoryMap[transaction.category] += transaction.amount;
      } else {
        categoryMap[transaction.category] = transaction.amount;
      }
    });
    
    // Sort categories by amount (descending)
    const sortedCategories = Object.keys(categoryMap).sort((a, b) => 
      categoryMap[b] - categoryMap[a]
    );
    
    // Get top 5 categories
    const labels = [];
    const data = [];
    const backgroundColors = [];
    
    const categories = ExpenseTracker.getCategories();
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Only take the top 5 categories
    const topCategories = sortedCategories.slice(0, 5);
    
    topCategories.forEach(category => {
      // Find category object to get name
      const categoryObj = categories.find(c => c.id === category);
      labels.push(categoryObj ? categoryObj.name : 'Unknown');
      data.push(categoryMap[category]);
      
      // Find category color
      backgroundColors.push(categoryObj ? categoryObj.color : '#6366f1');
    });
    
    // Check if chart already exists
    if (window.topCategoriesChart) {
      window.topCategoriesChart.destroy();
    }
    
    // Create chart
    window.topCategoriesChart = new Chart(chartElement, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: backgroundColors,
          borderWidth: 1
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '₹' + value;
              }
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.raw || 0;
                const percentage = totalExpenses > 0 
                  ? Math.round((value / totalExpenses) * 100) 
                  : 0;
                
                return '₹' + value.toFixed(2) + ' (' + percentage + '%)';
              }
            }
          }
        }
      }
    });
  },
  
  // Income sources chart
  initIncomeSourcesChart: function(month, year) {
    const chartElement = document.getElementById('income-sources-chart');
    if (!chartElement) return;
    
    const transactions = ExpenseTracker.getTransactionsByMonth(month, year);
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    
    if (incomeTransactions.length === 0) {
      chartElement.innerHTML = `
        <div class="empty-chart">
          <p>No income data available</p>
        </div>
      `;
      return;
    }
    
    // Group income by category
    const categoryMap = {};
    incomeTransactions.forEach(transaction => {
      if (categoryMap[transaction.category]) {
        categoryMap[transaction.category] += transaction.amount;
      } else {
        categoryMap[transaction.category] = transaction.amount;
      }
    });
    
    // Prepare data for pie chart
    const labels = [];
    const data = [];
    const backgroundColors = [];
    
    const categories = ExpenseTracker.getCategories();
    
    for (const categoryId in categoryMap) {
      // Find category object to get name
      const categoryObj = categories.find(c => c.id === categoryId);
      labels.push(categoryObj ? categoryObj.name : 'Unknown');
      data.push(categoryMap[categoryId]);
      
      // Find category color
      backgroundColors.push(categoryObj ? categoryObj.color : '#6366f1');
    }
    
    // Check if chart already exists
    if (window.incomeSourcesChart) {
      window.incomeSourcesChart.destroy();
    }
    
    // Create chart
    window.incomeSourcesChart = new Chart(chartElement, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: backgroundColors,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                
                return label + ': ₹' + value.toFixed(2) + ' (' + percentage + '%)';
              }
            }
          }
        }
      }
    });
  }
};
