// Complete Reports Functions - Matching your HTML structure
console.log('Reports.js loaded');

// Show report tab function
window.showReportTab = function(tab) {
    console.log('Showing tab:', tab);
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Hide all report contents
    document.querySelectorAll('.report-content').forEach(content => {
        content.style.display = 'none';
    });
    
    // Show selected tab content
    const selectedContent = document.getElementById(`${tab}-content`);
    if (selectedContent) {
        selectedContent.style.display = 'block';
    }
    
    // Load data for selected tab
    if (tab === 'sales') loadSalesReport();
    else if (tab === 'inventory') loadInventoryReport();
    else if (tab === 'transactions') loadTransactionsReport();
    else if (tab === 'trends') loadTrendsReport();
};

// Load Sales Report
async function loadSalesReport() {
    console.log('Loading sales report...');
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
        const response = await fetch('http://localhost:5000/api/reports/sales', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        // Create sales stats HTML
        const statsHtml = `
            <div class="stats-row" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px;">
                <div class="stat-card"><div class="stat-icon blue"><i class="fas fa-chart-line"></i></div><div class="stat-info"><h3>Total Sales</h3><p class="stat-value">${data.summary?.total_sales || 0}</p></div></div>
                <div class="stat-card"><div class="stat-icon purple"><i class="fas fa-dollar-sign"></i></div><div class="stat-info"><h3>Revenue</h3><p class="stat-value">₹${(data.summary?.total_revenue || 0).toLocaleString()}</p></div></div>
                <div class="stat-card"><div class="stat-icon green"><i class="fas fa-chart-simple"></i></div><div class="stat-info"><h3>Profit</h3><p class="stat-value">₹${(data.summary?.total_profit || 0).toLocaleString()}</p></div></div>
                <div class="stat-card"><div class="stat-icon orange"><i class="fas fa-chart-pie"></i></div><div class="stat-info"><h3>Avg Order</h3><p class="stat-value">₹${(data.summary?.average_order_value || 0).toLocaleString()}</p></div></div>
            </div>
            <div class="section-card">
                <h3>Top Selling Products</h3>
                <div class="table-container">
                    <table class="data-table">
                        <thead><tr><th>Product</th><th>Quantity Sold</th><th>Revenue</th></tr></thead>
                        <tbody>
                            ${data.top_products?.map(p => `<tr><td><strong>${p.name}</strong></td><td>${p.quantity}</td><td>₹${p.revenue.toLocaleString()}</td></tr>`).join('') || '<tr><td colspan="3">No sales data available</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        // Update the sales content
        let salesContent = document.getElementById('sales-content');
        if (!salesContent) {
            // Create sales content if it doesn't exist
            const reportsPage = document.getElementById('reports-page');
            if (reportsPage) {
                const tabsDiv = reportsPage.querySelector('.report-tabs');
                if (tabsDiv) {
                    const salesDiv = document.createElement('div');
                    salesDiv.id = 'sales-content';
                    salesDiv.className = 'report-content';
                    salesDiv.style.display = 'block';
                    salesDiv.innerHTML = statsHtml;
                    tabsDiv.insertAdjacentElement('afterend', salesDiv);
                }
            }
        } else {
            salesContent.innerHTML = statsHtml;
            salesContent.style.display = 'block';
        }
        
    } catch(e) {
        console.error('Error loading sales report:', e);
    }
}

// Load Inventory Report
async function loadInventoryReport() {
    console.log('Loading inventory report...');
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
        const response = await fetch('http://localhost:5000/api/reports/inventory', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        const statsHtml = `
            <div class="stats-row" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px;">
                <div class="stat-card"><div class="stat-icon blue"><i class="fas fa-boxes"></i></div><div class="stat-info"><h3>Total Products</h3><p class="stat-value">${data.summary?.total_products || 0}</p></div></div>
                <div class="stat-card"><div class="stat-icon purple"><i class="fas fa-cubes"></i></div><div class="stat-info"><h3>Total Quantity</h3><p class="stat-value">${data.summary?.total_quantity || 0}</p></div></div>
                <div class="stat-card"><div class="stat-icon green"><i class="fas fa-chart-line"></i></div><div class="stat-info"><h3>Inventory Value</h3><p class="stat-value">₹${(data.summary?.total_inventory_value || 0).toLocaleString()}</p></div></div>
                <div class="stat-card"><div class="stat-icon orange"><i class="fas fa-exclamation-triangle"></i></div><div class="stat-info"><h3>Low Stock</h3><p class="stat-value">${data.summary?.low_stock_count || 0}</p></div></div>
            </div>
            <div class="section-card">
                <h3>Category Breakdown</h3>
                <div class="table-container">
                    <table class="data-table">
                        <thead><tr><th>Category</th><th>Products</th><th>Quantity</th><th>Value</th></tr></thead>
                        <tbody>
                            ${data.category_breakdown?.map(c => `<tr><td><strong>${c.category}</strong></td><td>${c.product_count}</td><td>${c.total_quantity}</td><td>₹${c.total_value.toLocaleString()}</td></tr>`).join('') || '<tr><td colspan="4">No categories found</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="section-card">
                <h3>Low Stock Alerts</h3>
                <div id="low-stock-alerts-list">
                    ${data.low_stock_items?.map(item => `<div class="alert-item warning" style="padding: 12px; margin: 8px 0; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px;">⚠️ <strong>${item.name}</strong> - Only ${item.quantity} left (Reorder at ${item.reorder_level})</div>`).join('') || '<div class="alert-item success">✅ All products have sufficient stock</div>'}
                </div>
            </div>
        `;
        
        let inventoryContent = document.getElementById('inventory-content');
        if (!inventoryContent) {
            const reportsPage = document.getElementById('reports-page');
            if (reportsPage) {
                const tabsDiv = reportsPage.querySelector('.report-tabs');
                if (tabsDiv) {
                    const invDiv = document.createElement('div');
                    invDiv.id = 'inventory-content';
                    invDiv.className = 'report-content';
                    invDiv.style.display = 'none';
                    invDiv.innerHTML = statsHtml;
                    tabsDiv.insertAdjacentElement('afterend', invDiv);
                }
            }
        } else {
            inventoryContent.innerHTML = statsHtml;
        }
        
    } catch(e) {
        console.error('Error loading inventory report:', e);
    }
}

// Load Transactions Report
async function loadTransactionsReport() {
    console.log('Loading transactions report...');
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
        const response = await fetch('http://localhost:5000/api/reports/transactions', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        const transactionsHtml = `
            <div class="section-card">
                <h3>Transaction History</h3>
                <div class="table-container">
                    <table class="data-table">
                        <thead><tr><th>Date</th><th>Type</th><th>Product</th><th>Quantity</th><th>User</th></tr></thead>
                        <tbody>
                            ${data.transactions?.map(t => `
                                <tr>
                                    <td>${t.date}</td>
                                    <td><span class="badge ${t.type === 'in' ? 'badge-success' : 'badge-warning'}">${t.type === 'in' ? '📦 Stock In' : '💰 Stock Out'}</span></td>
                                    <td>${t.product}</td>
                                    <td>${t.quantity}</td>
                                    <td>${t.user}</td>
                                </tr>
                            `).join('') || '<tr><td colspan="5">No transactions found</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        let transactionsContent = document.getElementById('transactions-content');
        if (!transactionsContent) {
            const reportsPage = document.getElementById('reports-page');
            if (reportsPage) {
                const tabsDiv = reportsPage.querySelector('.report-tabs');
                if (tabsDiv) {
                    const transDiv = document.createElement('div');
                    transDiv.id = 'transactions-content';
                    transDiv.className = 'report-content';
                    transDiv.style.display = 'none';
                    transDiv.innerHTML = transactionsHtml;
                    tabsDiv.insertAdjacentElement('afterend', transDiv);
                }
            }
        } else {
            transactionsContent.innerHTML = transactionsHtml;
        }
        
    } catch(e) {
        console.error('Error loading transactions report:', e);
    }
}

// Load Trends Report
async function loadTrendsReport() {
    console.log('Loading trends report...');
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
        const response = await fetch('http://localhost:5000/api/reports/trends', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        const trendsHtml = `
            <div class="section-card chart-card">
                <h3>Monthly Sales vs Purchases</h3>
                <canvas id="trendsChart" height="300"></canvas>
            </div>
        `;
        
        let trendsContent = document.getElementById('trends-content');
        if (!trendsContent) {
            const reportsPage = document.getElementById('reports-page');
            if (reportsPage) {
                const tabsDiv = reportsPage.querySelector('.report-tabs');
                if (tabsDiv) {
                    const trendsDiv = document.createElement('div');
                    trendsDiv.id = 'trends-content';
                    trendsDiv.className = 'report-content';
                    trendsDiv.style.display = 'none';
                    trendsDiv.innerHTML = trendsHtml;
                    tabsDiv.insertAdjacentElement('afterend', trendsDiv);
                }
            }
        } else {
            trendsContent.innerHTML = trendsHtml;
        }
        
        // Draw chart
        const canvas = document.getElementById('trendsChart');
        if (canvas && data.length) {
            const ctx = canvas.getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.map(d => d.month.substring(0, 3)),
                    datasets: [
                        { label: 'Sales Quantity', data: data.map(d => d.sales_quantity), backgroundColor: '#10b981' },
                        { label: 'Purchases Quantity', data: data.map(d => d.purchases_quantity), backgroundColor: '#2f6fed' }
                    ]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }
        
    } catch(e) {
        console.error('Error loading trends report:', e);
    }
}

// Initialize reports when page loads
function initReportsPage() {
    console.log('Initializing reports page...');
    // Create report content containers if they don't exist
    if (!document.getElementById('sales-content')) {
        const reportsPage = document.getElementById('reports-page');
        if (reportsPage) {
            const tabsDiv = reportsPage.querySelector('.report-tabs');
            if (tabsDiv) {
                // Create sales content
                const salesDiv = document.createElement('div');
                salesDiv.id = 'sales-content';
                salesDiv.className = 'report-content';
                salesDiv.style.display = 'block';
                salesDiv.innerHTML = '<div class="loading">Loading sales data...</div>';
                tabsDiv.insertAdjacentElement('afterend', salesDiv);
                
                // Create inventory content
                const invDiv = document.createElement('div');
                invDiv.id = 'inventory-content';
                invDiv.className = 'report-content';
                invDiv.style.display = 'none';
                invDiv.innerHTML = '<div class="loading">Loading inventory data...</div>';
                salesDiv.insertAdjacentElement('afterend', invDiv);
                
                // Create transactions content
                const transDiv = document.createElement('div');
                transDiv.id = 'transactions-content';
                transDiv.className = 'report-content';
                transDiv.style.display = 'none';
                transDiv.innerHTML = '<div class="loading">Loading transactions...</div>';
                invDiv.insertAdjacentElement('afterend', transDiv);
                
                // Create trends content
                const trendsDiv = document.createElement('div');
                trendsDiv.id = 'trends-content';
                trendsDiv.className = 'report-content';
                trendsDiv.style.display = 'none';
                trendsDiv.innerHTML = '<div class="loading">Loading trends data...</div>';
                transDiv.insertAdjacentElement('afterend', trendsDiv);
            }
        }
    }
    
    // Load initial report
    loadSalesReport();
}

// Check if reports page is active and initialize
if (document.getElementById('reports-page')) {
    initReportsPage();
}

// Watch for navigation to reports page
const reportsObserver = new MutationObserver(() => {
    const reportsPage = document.getElementById('reports-page');
    if (reportsPage && reportsPage.classList.contains('active')) {
        console.log('Reports page activated');
        initReportsPage();
    }
});
reportsObserver.observe(document.getElementById('page-content') || document.body, { attributes: true, subtree: true });
