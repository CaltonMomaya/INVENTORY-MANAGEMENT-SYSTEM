// Dashboard Functions
async function loadDashboard() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/transactions/dashboard`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        // Update Sales Overview
        if (data.sales_overview) {
            document.getElementById('stat-sales').textContent = data.sales_overview.sales || 0;
            document.getElementById('stat-revenue').textContent = `₹${(data.sales_overview.revenue || 0).toLocaleString()}`;
            document.getElementById('stat-profit').textContent = `₹${(data.sales_overview.profit || 0).toLocaleString()}`;
            document.getElementById('stat-cost').textContent = `₹${(data.sales_overview.cost || 0).toLocaleString()}`;
        }
        
        // Update Inventory Summary
        if (data.inventory_summary) {
            document.getElementById('quantity-hand').textContent = data.inventory_summary.quantity_in_hand || 0;
            document.getElementById('to-received').textContent = data.inventory_summary.to_be_received || 0;
        }
        
        // Update Purchase Overview
        if (data.purchase_overview) {
            document.getElementById('purchase-count').textContent = data.purchase_overview.purchase || 0;
            document.getElementById('purchase-cost').textContent = `₹${(data.purchase_overview.cost || 0).toLocaleString()}`;
            document.getElementById('purchase-cancel').textContent = data.purchase_overview.cancel || 0;
            document.getElementById('purchase-return').textContent = `₹${(data.purchase_overview.return || 0).toLocaleString()}`;
        }
        
        // Update Product Summary
        if (data.product_summary) {
            document.getElementById('suppliers-count').textContent = data.product_summary.number_of_suppliers || 0;
            document.getElementById('categories-count').textContent = data.product_summary.number_of_categories || 0;
        }
        
        // Load Top Selling Products
        await loadTopSellingProducts();
        
        // Load Low Stock Products
        await loadLowStockProducts();
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

async function loadTopSellingProducts() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/products`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        const products = data.products || [];
        const topProducts = products.slice(0, 5);
        
        const tbody = document.getElementById('top-products-body');
        if (tbody) {
            if (topProducts.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4">No products found</td></tr>';
                return;
            }
            
            tbody.innerHTML = topProducts.map(product => `
                <tr>
                    <td>${product.name}</td>
                    <td>${Math.floor(Math.random() * 100)}</td>
                    <td>${product.quantity}</td>
                    <td>₹${product.price}</td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading top products:', error);
    }
}

async function loadLowStockProducts() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/products`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        const products = data.products || [];
        const lowStock = products.filter(p => p.quantity <= p.reorder_level);
        
        const container = document.getElementById('low-stock-list');
        if (container) {
            if (lowStock.length === 0) {
                container.innerHTML = '<p>No low stock items</p>';
                return;
            }
            
            container.innerHTML = lowStock.map(product => `
                <div class="low-stock-item">
                    <div class="low-stock-info">
                        <i class="fas fa-box"></i>
                        <strong>${product.name}</strong>
                        <span>${product.quantity} units left</span>
                    </div>
                    <span class="low-stock-badge">Low Stock</span>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading low stock:', error);
    }
}
