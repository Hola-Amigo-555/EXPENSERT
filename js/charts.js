
// Charts related functions
const Charts = {
  // Store chart instances to destroy them when needed
  chartInstances: {},
  
  // Initialize dashboard charts
  initDashboardCharts() {
    this.initExpenseChart();
    this.initIncomeExpenseChart();
  },
  
  // Initialize expense breakdown chart
  initExpenseChart() {
    const ctx = document.getElementById('expense-chart');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (this.chartInstances.expenseChart) {
      this.chartInstances.expenseChart.destroy();
    }
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const expensesByCategory = ExpenseTracker.getExpensesByCategory(currentMonth, currentYear);
    
    // Prepare data
    const categories = Object.keys(expensesByCategory);
    const amounts = Object.values(expensesByCategory);
    
    // Get colors for each category
    const allCategories = ExpenseTracker.getCategories();
    const colors = categories.map(categoryName => {
      const category = allCategories.find(c => c.name === categoryName);
      return category ? category.color : '#6366f1';
    });
    
    if (categories.length === 0) {
      ctx.parentElement.innerHTML = `
        <h3>Expense Breakdown</h3>
        <div class="empty-chart-message">No expense data for this month</div>
      `;
      return;
    }
    
    // Create chart
    this.chartInstances.expenseChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: categories,
        datasets: [{
          data: amounts,
          backgroundColor: colors,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: $${value.toFixed(2)} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
    
    // Add styles for empty chart message
    const style = document.createElement('style');
    style.textContent = `
      .empty-chart-message {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 200px;
        color: var(--muted-foreground);
        font-size: 0.875rem;
      }
    `;
    document.head.appendChild(style);
  },
  
  // Initialize income vs expense chart
  initIncomeExpenseChart() {
    const ctx = document.getElementById('income-expense-chart');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (this.chartInstances.incomeExpenseChart) {
      this.chartInstances.incomeExpenseChart.destroy();
    }
    
    const monthlyData = ExpenseTracker.getMonthlySpendingTrend();
    
    if (monthlyData.length === 0) {
      ctx.parentElement.innerHTML = `
        <h3>Income vs Expenses</h3>
        <div class="empty-chart-message">No data available</div>
      `;
      return;
    }
    
    // Prepare data
    const labels = monthlyData.map(item => item.month);
    const incomeData = monthlyData.map(item => item.income);
    const expenseData = monthlyData.map(item => item.expenses);
    
    // Create chart
    this.chartInstances.incomeExpenseChart = new Chart(ctx, {
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
                return '$' + value;
              }
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += '$' + context.parsed.y.toFixed(2);
                }
                return label;
              }
            }
          }
        }
      }
    });
  },
  
  // Initialize all report charts
  initReportCharts(month, year) {
    this.initMonthlyOverviewChart(month, year);
    this.initExpenseCategoriesChart(month, year);
    this.initIncomeSourcesChart(month, year);
    this.initMonthlyTrendChart();
  },
  
  // Initialize monthly overview chart for reports
  initMonthlyOverviewChart(month, year) {
    const ctx = document.getElementById('monthly-overview-chart');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (this.chartInstances.monthlyOverviewChart) {
      this.chartInstances.monthlyOverviewChart.destroy();
    }
    
    const income = ExpenseTracker.getTotalIncomeByMonth(month, year);
    const expenses = ExpenseTracker.getTotalExpensesByMonth(month, year);
    const balance = income - expenses;
    
    // Create chart
    this.chartInstances.monthlyOverviewChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Income', 'Expenses', 'Balance'],
        datasets: [{
          data: [income, expenses, balance],
          backgroundColor: [
            'rgba(16, 185, 129, 0.7)',
            'rgba(239, 68, 68, 0.7)',
            'rgba(99, 102, 241, 0.7)'
          ],
          borderColor: [
            'rgba(16, 185, 129, 1)',
            'rgba(239, 68, 68, 1)',
            'rgba(99, 102, 241, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += '$' + context.parsed.y.toFixed(2);
                }
                return label;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '$' + value;
              }
            }
          }
        }
      }
    });
  },
  
  // Initialize expense categories chart for reports
  initExpenseCategoriesChart(month, year) {
    const ctx = document.getElementById('expense-categories-chart');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (this.chartInstances.expenseCategoriesChart) {
      this.chartInstances.expenseCategoriesChart.destroy();
    }
    
    const expensesByCategory = ExpenseTracker.getExpensesByCategory(month, year);
    
    // Prepare data
    const categories = Object.keys(expensesByCategory);
    const amounts = Object.values(expensesByCategory);
    
    // Get colors for each category
    const allCategories = ExpenseTracker.getCategories();
    const colors = categories.map(categoryName => {
      const category = allCategories.find(c => c.name === categoryName);
      return category ? category.color : '#6366f1';
    });
    
    if (categories.length === 0) {
      ctx.parentElement.innerHTML = `
        <h3>Expense Categories</h3>
        <div class="empty-chart-message">No expense data for this month</div>
      `;
      return;
    }
    
    // Create chart
    this.chartInstances.expenseCategoriesChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: categories,
        datasets: [{
          data: amounts,
          backgroundColor: colors,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: $${value.toFixed(2)} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  },
  
  // Initialize income sources chart for reports
  initIncomeSourcesChart(month, year) {
    const ctx = document.getElementById('income-sources-chart');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (this.chartInstances.incomeSourcesChart) {
      this.chartInstances.incomeSourcesChart.destroy();
    }
    
    const incomeByCategory = ExpenseTracker.getIncomeByCategory(month, year);
    
    // Prepare data
    const categories = Object.keys(incomeByCategory);
    const amounts = Object.values(incomeByCategory);
    
    // Get colors for each category
    const allCategories = ExpenseTracker.getCategories();
    const colors = categories.map(categoryName => {
      const category = allCategories.find(c => c.name === categoryName);
      return category ? category.color : '#6366f1';
    });
    
    if (categories.length === 0) {
      ctx.parentElement.innerHTML = `
        <h3>Income Sources</h3>
        <div class="empty-chart-message">No income data for this month</div>
      `;
      return;
    }
    
    // Create chart
    this.chartInstances.incomeSourcesChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: categories,
        datasets: [{
          data: amounts,
          backgroundColor: colors,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: $${value.toFixed(2)} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  },
  
  // Initialize monthly trend chart for reports
  initMonthlyTrendChart() {
    const ctx = document.getElementById('monthly-trend-chart');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (this.chartInstances.monthlyTrendChart) {
      this.chartInstances.monthlyTrendChart.destroy();
    }
    
    const monthlyData = ExpenseTracker.getMonthlySpendingTrend();
    
    if (monthlyData.length === 0) {
      ctx.parentElement.innerHTML = `
        <h3>Monthly Trend</h3>
        <div class="empty-chart-message">No data available</div>
      `;
      return;
    }
    
    // Prepare data
    const labels = monthlyData.map(item => item.month);
    const incomeData = monthlyData.map(item => item.income);
    const expenseData = monthlyData.map(item => item.expenses);
    const balanceData = monthlyData.map(item => item.income - item.expenses);
    
    // Create chart
    this.chartInstances.monthlyTrendChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Income',
            data: incomeData,
            borderColor: 'rgba(16, 185, 129, 1)',
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            fill: false,
            tension: 0.3
          },
          {
            label: 'Expenses',
            data: expenseData,
            borderColor: 'rgba(239, 68, 68, 1)',
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            fill: false,
            tension: 0.3
          },
          {
            label: 'Balance',
            data: balanceData,
            borderColor: 'rgba(99, 102, 241, 1)',
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            fill: false,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += '$' + context.parsed.y.toFixed(2);
                }
                return label;
              }
            }
          }
        },
        scales: {
          y: {
            ticks: {
              callback: function(value) {
                return '$' + value;
              }
            }
          }
        }
      }
    });
  }
};
