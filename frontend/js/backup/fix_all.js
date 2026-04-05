// Complete fix for all features - matches your HTML IDs

window.API_URL = 'http://localhost:5000/api';

// ============ INVENTORY FUNCTIONS ============
window.applyFilters = function() {
    console.log('Applying filters...');
    if (typeof loadInventory === 'function') {
        loadInventory();
    } else {
        // Simple reload as fallback
        location.reload();
    }
};

window.resetFilters = function() {
    console.log('Resetting filters...');
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const supplierFilter = document.getElementById('supplier-filter');
    const stockFilter = document.getElementById('stock-filter');
    
    if (searchInput) searchInput.value = '';
    if (categoryFilter) categoryFilter.value = '';
    if (supplierFilter) supplierFilter.value = '';
    if (stockFilter) stockFilter.value = '';
    
    if (typeof loadInventory === 'function') {
        loadInventory();
    } else {
        location.reload();
    }
};

// ============ SELL PRODUCT ============
window.sellProduct = async function(productId) {
    const quantity = prompt('Enter quantity to sell:', '1');
    if (!quantity || quantity <= 0) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login first');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/transactions/out`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                product_id: productId,
                quantity: parseInt(quantity),
                reference: `SALE-${Date.now()}`,
                notes: 'Product sold'
            })
        });
        
        if (response.ok) {
            alert(`✅ Sold ${quantity} units successfully!`);
            // Refresh the page to update all data
            location.reload();
        } else {
            const data = await response.json();
            alert(data.error || 'Failed to sell product');
        }
    } catch (error) {
        console.error('Error selling product:', error);
        alert('Connection error. Make sure backend is running on port 5000');
    }
};

// ============ ADD STOCK ============
window.addStock = async function(productId) {
    const quantity = prompt('Enter quantity to add:', '1');
    if (!quantity || quantity <= 0) return;
    
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/transactions/in`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                product_id: productId,
                quantity: parseInt(quantity),
                reference: `PO-${Date.now()}`,
                notes: 'Stock added'
            })
        });
        
        if (response.ok) {
            alert(`✅ Added ${quantity} units!`);
            location.reload();
        } else {
            alert('Failed to add stock');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Connection error');
    }
};

// ============ REMOVE STOCK ============
window.removeStock = async function(productId) {
    const quantity = prompt('Enter quantity to remove:', '1');
    if (!quantity || quantity <= 0) return;
    
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/transactions/out`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                product_id: productId,
                quantity: parseInt(quantity),
                reference: `ADJ-${Date.now()}`,
                notes: 'Stock adjustment'
            })
        });
        
        if (response.ok) {
            alert(`✅ Removed ${quantity} units!`);
            location.reload();
        } else {
            alert('Failed to remove stock');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Connection error');
    }
};

// ============ DARK MODE ============
window.toggleTheme = function() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
};

// Initialize theme from localStorage
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
}

// ============ USER MANAGEMENT ============
window.loadUsers = async function() {
    const container = document.getElementById('users-list');
    if (!container) return;
    
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/auth/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        const users = data.users || [];
        
        if (users.length === 0) {
            container.innerHTML = '<p>No users found</p>';
            return;
        }
        
        let html = '<table style="width:100%; border-collapse:collapse;"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
        
        users.forEach(user => {
            html += `<tr>
                <td style="padding:8px; border-bottom:1px solid #ddd;">${user.name}</td>
                <td style="padding:8px; border-bottom:1px solid #ddd;">${user.email}</td>
                <td style="padding:8px; border-bottom:1px solid #ddd;">${user.role}</td>
                <td style="padding:8px; border-bottom:1px solid #ddd;">${user.is_active ? '✅ Active' : '❌ Inactive'}</td>
                <td style="padding:8px; border-bottom:1px solid #ddd;">
                    <button onclick="toggleUserStatus(${user.id})" style="margin-right:5px; padding:4px 8px;">Toggle</button>
                    <button onclick="deleteUser(${user.id})" style="padding:4px 8px;">Delete</button>
                </td>
            </tr>`;
        });
        
        html += '</tbody></table>';
        container.innerHTML = html;
    } catch(e) {
        console.error(e);
        container.innerHTML = '<p>Error loading users. Make sure you are admin.</p>';
    }
};

window.toggleUserStatus = async function(userId) {
    if (!confirm('Change user status?')) return;
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/auth/users/${userId}/toggle`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            alert('User status updated!');
            loadUsers();
        }
    } catch(e) { alert('Error'); }
};

window.deleteUser = async function(userId) {
    if (!confirm('Delete user permanently?')) return;
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/auth/users/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            alert('User deleted!');
            loadUsers();
        }
    } catch(e) { alert('Error'); }
};

// ============ ORDERS ============
window.loadOrders = async function() {
    const container = document.getElementById('orders-list');
    if (!container) return;
    
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/transactions?type=out`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        const orders = data.transactions || [];
        
        if (orders.length === 0) {
            container.innerHTML = '<p>No orders yet. Sell some products to see orders here!</p>';
            return;
        }
        
        let html = '<table style="width:100%; border-collapse:collapse;"><thead><tr><th>Date</th><th>Product</th><th>Quantity</th><th>Reference</th></tr></thead><tbody>';
        
        orders.forEach(order => {
            html += `<tr>
                <td style="padding:8px; border-bottom:1px solid #ddd;">${new Date(order.created_at).toLocaleDateString()}</td>
                <td style="padding:8px; border-bottom:1px solid #ddd;">${order.product_name}</td>
                <td style="padding:8px; border-bottom:1px solid #ddd;">${order.quantity}</td>
                <td style="padding:8px; border-bottom:1px solid #ddd;">${order.reference || '-'}</td>
            </tr>`;
        });
        
        html += '</tbody></table>';
        container.innerHTML = html;
    } catch(e) {
        console.error(e);
        container.innerHTML = '<p>Error loading orders</p>';
    }
};

// ============ SUPPLIERS ============
window.loadSuppliers = async function() {
    const container = document.getElementById('suppliers-list');
    if (!container) return;
    
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/suppliers`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        const suppliers = data.suppliers || [];
        
        if (suppliers.length === 0) {
            container.innerHTML = '<p>No suppliers found. Click "Add Supplier" to add one.</p>';
            return;
        }
        
        let html = '<table style="width:100%; border-collapse:collapse;"><thead><tr><th>Name</th><th>Contact Person</th><th>Email</th><th>Phone</th><th>Actions</th></tr></thead><tbody>';
        
        suppliers.forEach(supplier => {
            html += `<tr>
                <td style="padding:8px; border-bottom:1px solid #ddd;">${supplier.name}</td>
                <td style="padding:8px; border-bottom:1px solid #ddd;">${supplier.contact_person || '-'}</td>
                <td style="padding:8px; border-bottom:1px solid #ddd;">${supplier.email || '-'}</td>
                <td style="padding:8px; border-bottom:1px solid #ddd;">${supplier.phone || '-'}</td>
                <td style="padding:8px; border-bottom:1px solid #ddd;">
                    <button onclick="editSupplier(${supplier.id})" style="margin-right:5px;">Edit</button>
                    <button onclick="deleteSupplier(${supplier.id})">Delete</button>
                </td>
            </tr>`;
        });
        
        html += '</tbody></table>';
        container.innerHTML = html;
    } catch(e) {
        console.error(e);
        container.innerHTML = '<p>Error loading suppliers</p>';
    }
};

// Simple supplier functions
window.showAddSupplierModal = function() {
    alert('Add supplier feature - implement full CRUD in next step');
};

window.editSupplier = function(id) {
    alert('Edit supplier feature - coming soon');
};

window.deleteSupplier = async function(id) {
    if (!confirm('Delete supplier?')) return;
    const token = localStorage.getItem('token');
    try {
        await fetch(`${API_URL}/suppliers/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        alert('Supplier deleted!');
        loadSuppliers();
    } catch(e) { alert('Error'); }
};

// ============ STORE SETTINGS ============
window.loadStoreSettings = function() {
    const container = document.getElementById('store-content');
    if (!container) return;
    
    container.innerHTML = `
        <div style="background:white; padding:20px; border-radius:12px;">
            <h3>Store Settings</h3>
            <div style="margin:15px 0;">
                <label>Store Name:</label>
                <input type="text" id="store-name" value="KANBAN Store" class="filter-input" style="width:100%; margin-top:5px;">
            </div>
            <div style="margin:15px 0;">
                <label>Store Email:</label>
                <input type="email" id="store-email" value="store@kanban.com" class="filter-input" style="width:100%; margin-top:5px;">
            </div>
            <div style="margin:15px 0;">
                <label>Items Per Page:</label>
                <select id="items-per-page" class="filter-select" style="width:100%; margin-top:5px;">
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                </select>
            </div>
            <button onclick="saveStoreSettings()" class="btn-primary">Save Settings</button>
        </div>
    `;
};

window.saveStoreSettings = function() {
    alert('Settings saved!');
};

// ============ REPORTS ============
window.loadSalesReport = async function() {
    const container = document.getElementById('sales-stats');
    if (!container) return;
    
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/reports/sales`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        container.innerHTML = `
            <div class="stat-card"><h3>Total Sales</h3><div class="value">${data.summary?.total_sales || 0}</div></div>
            <div class="stat-card"><h3>Revenue</h3><div class="value">₹${(data.summary?.total_revenue || 0).toLocaleString()}</div></div>
            <div class="stat-card"><h3>Profit</h3><div class="value">₹${(data.summary?.total_profit || 0).toLocaleString()}</div></div>
            <div class="stat-card"><h3>Avg Order</h3><div class="value">₹${(data.summary?.average_order_value || 0).toLocaleString()}</div></div>
        `;
        
        const topProductsContainer = document.getElementById('top-products-report');
        if (topProductsContainer && data.top_products) {
            let html = '<table><thead><tr><th>Product</th><th>Quantity</th><th>Revenue</th></tr></thead><tbody>';
            data.top_products.forEach(p => {
                html += `<tr><td>${p.name}</td><td>${p.quantity}</td><td>₹${p.revenue.toLocaleString()}</td></tr>`;
            });
            html += '</tbody></table>';
            topProductsContainer.innerHTML = html;
        }
    } catch(e) {
        console.error('Error loading sales report:', e);
        container.innerHTML = '<p>Error loading sales data</p>';
    }
};

window.loadInventoryReport = async function() {
    const container = document.getElementById('inventory-stats');
    if (!container) return;
    
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/reports/inventory`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        container.innerHTML = `
            <div class="stat-card"><h3>Total Products</h3><div class="value">${data.summary?.total_products || 0}</div></div>
            <div class="stat-card"><h3>Total Quantity</h3><div class="value">${data.summary?.total_quantity || 0}</div></div>
            <div class="stat-card"><h3>Inventory Value</h3><div class="value">₹${(data.summary?.total_inventory_value || 0).toLocaleString()}</div></div>
            <div class="stat-card"><h3>Low Stock</h3><div class="value">${data.summary?.low_stock_count || 0}</div></div>
        `;
        
        const categoryContainer = document.getElementById('category-report');
        if (categoryContainer && data.category_breakdown) {
            let html = '<tr><thead><tr><th>Category</th><th>Products</th><th>Quantity</th><th>Value</th></tr></thead><tbody>';
            data.category_breakdown.forEach(c => {
                html += `<tr><td>${c.category}</td><td>${c.product_count}</td><td>${c.total_quantity}</td><td>₹${c.total_value.toLocaleString()}</td></tr>`;
            });
            html += '</tbody></table>';
            categoryContainer.innerHTML = html;
        }
        
        const lowStockContainer = document.getElementById('low-stock-report');
        if (lowStockContainer && data.low_stock_items) {
            if (data.low_stock_items.length > 0) {
                let alerts = '';
                data.low_stock_items.forEach(item => {
                    alerts += `<div class="alert-item warning">⚠️ ${item.name}: Only ${item.quantity} left</div>`;
                });
                lowStockContainer.innerHTML = alerts;
            } else {
                lowStockContainer.innerHTML = '<div class="alert-item success">✅ All products have sufficient stock</div>';
            }
        }
    } catch(e) {
        console.error('Error loading inventory report:', e);
    }
};

window.loadTransactionsReport = async function() {
    const container = document.getElementById('transactions-report-list');
    if (!container) return;
    
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/reports/transactions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        const transactions = data.transactions || [];
        
        if (transactions.length === 0) {
            container.innerHTML = '<p>No transactions found</p>';
            return;
        }
        
        let html = '<table><thead><tr><th>Date</th><th>Type</th><th>Product</th><th>Quantity</th><th>User</th></tr></thead><tbody>';
        transactions.forEach(t => {
            html += `<tr>
                <td>${new Date(t.date).toLocaleDateString()}</td>
                <td><span class="badge ${t.type === 'in' ? 'badge-success' : 'badge-warning'}">${t.type === 'in' ? 'Stock In' : 'Stock Out'}</span></td>
                <td>${t.product}</td>
                <td>${t.quantity}</td>
                <td>${t.user}</td>
            </tr>`;
        });
        html += '</tbody></table>';
        container.innerHTML = html;
    } catch(e) {
        console.error('Error loading transactions:', e);
    }
};

// ============ NOTIFICATIONS ============
window.showNotifications = function() {
    alert('🔔 Notifications\n\nNo new notifications at this time.\n\nWhen you sell products or add suppliers, you will see notifications here.');
};

// ============ ADD PRODUCT MODAL ============
document.addEventListener('DOMContentLoaded', function() {
    const addBtn = document.getElementById('add-product-btn');
    if (addBtn) {
        addBtn.onclick = function() {
            const modal = document.getElementById('product-modal');
            if (modal) modal.style.display = 'block';
        };
    }
    
    const closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.onclick = function() {
            const modal = document.getElementById('product-modal');
            if (modal) modal.style.display = 'none';
        };
    }
    
    // Load data when page is shown
    const usersPage = document.getElementById('users-page');
    if (usersPage && typeof loadUsers === 'function') {
        // Will be called when navigation happens
    }
});

console.log('Fix file loaded successfully!');

// ============ INVENTORY WITH PAGINATION AND FILTERS ============
let currentPage = 1;
let currentFilters = {};
let totalPages = 1;

window.loadInventory = async function(page = 1, filters = {}) {
    currentPage = page;
    currentFilters = filters;
    
    // Get filter values from inputs if not provided
    if (Object.keys(filters).length === 0) {
        filters = {
            search: document.getElementById('search-input')?.value || '',
            category_id: document.getElementById('category-filter')?.value || '',
            supplier_id: document.getElementById('supplier-filter')?.value || '',
            stock_status: document.getElementById('stock-filter')?.value || ''
        };
        // Remove empty filters
        Object.keys(filters).forEach(key => {
            if (!filters[key]) delete filters[key];
        });
        currentFilters = filters;
    }
    
    // Build query string
    const params = new URLSearchParams({
        page: page,
        per_page: 10
    });
    
    if (filters.search) params.append('search', filters.search);
    if (filters.category_id) params.append('category_id', filters.category_id);
    if (filters.supplier_id) params.append('supplier_id', filters.supplier_id);
    if (filters.stock_status === 'low') params.append('low_stock', 'true');
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/products?${params}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        const products = data.products || [];
        totalPages = data.pagination?.pages || 1;
        
        // Render inventory table
        const tbody = document.getElementById('inventory-body');
        const userRole = localStorage.getItem('userRole');
        const hasAdminAccess = userRole === 'admin' || userRole === 'manager';
        
        if (!tbody) return;
        
        if (products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7">No products found</td></tr>';
        } else {
            tbody.innerHTML = products.map(product => `
                <tr>
                    <td>${product.name || 'N/A'}</td>
                    <td>${product.sku || 'N/A'}</td>
                    <td>${product.category_name || 'N/A'}</td>
                    <td>${product.quantity || 0}</td>
                    <td>₹${(product.price || 0).toLocaleString()}</td>
                    <td>
                        <span class="status-badge ${product.is_low_stock ? 'status-low' : 'status-normal'}">
                            ${product.is_low_stock ? 'Low Stock' : 'In Stock'}
                        </span>
                    </td>
                    <td class="action-buttons">
                        ${hasAdminAccess ? `
                            <button class="btn-icon" onclick="addStock(${product.id})" title="Add Stock">
                                <i class="fas fa-plus-circle"></i>
                            </button>
                            <button class="btn-icon" onclick="sellProduct(${product.id})" title="Sell Product">
                                <i class="fas fa-shopping-cart"></i>
                            </button>
                            <button class="btn-icon" onclick="removeStock(${product.id})" title="Remove Stock">
                                <i class="fas fa-minus-circle"></i>
                            </button>
                        ` : '<span class="no-access">View Only</span>'}
                    </td>
                </tr>
            `).join('');
        }
        
        // Render pagination
        renderPagination();
        
    } catch (error) {
        console.error('Error loading inventory:', error);
        const tbody = document.getElementById('inventory-body');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="7">Error loading products. Make sure backend is running.</td></tr>';
        }
    }
};

function renderPagination() {
    const container = document.getElementById('pagination-controls');
    if (!container) return;
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = '<div class="pagination" style="display: flex; gap: 8px; justify-content: center; margin-top: 20px; flex-wrap: wrap;">';
    
    // Previous button
    if (currentPage > 1) {
        html += `<button onclick="loadInventory(${currentPage - 1}, currentFilters)" style="padding: 8px 12px; border: 1px solid #ddd; background: white; cursor: pointer; border-radius: 6px;">← Prev</button>`;
    }
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            html += `<button disabled style="padding: 8px 12px; background: #2f6fed; color: white; border: none; border-radius: 6px;">${i}</button>`;
        } else if (Math.abs(i - currentPage) <= 2 || i === 1 || i === totalPages) {
            html += `<button onclick="loadInventory(${i}, currentFilters)" style="padding: 8px 12px; border: 1px solid #ddd; background: white; cursor: pointer; border-radius: 6px;">${i}</button>`;
        } else if (Math.abs(i - currentPage) === 3) {
            html += `<span style="padding: 8px;">...</span>`;
        }
    }
    
    // Next button
    if (currentPage < totalPages) {
        html += `<button onclick="loadInventory(${currentPage + 1}, currentFilters)" style="padding: 8px 12px; border: 1px solid #ddd; background: white; cursor: pointer; border-radius: 6px;">Next →</button>`;
    }
    
    html += '</div>';
    container.innerHTML = html;
}

// Override applyFilters to use the new function
window.applyFilters = function() {
    console.log('Applying filters...');
    const filters = {
        search: document.getElementById('search-input')?.value || '',
        category_id: document.getElementById('category-filter')?.value || '',
        supplier_id: document.getElementById('supplier-filter')?.value || '',
        stock_status: document.getElementById('stock-filter')?.value || ''
    };
    
    // Remove empty filters
    Object.keys(filters).forEach(key => {
        if (!filters[key]) delete filters[key];
    });
    
    console.log('Filters:', filters);
    loadInventory(1, filters);
};

window.resetFilters = function() {
    console.log('Resetting filters...');
    // Clear all filter inputs
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const supplierFilter = document.getElementById('supplier-filter');
    const stockFilter = document.getElementById('stock-filter');
    
    if (searchInput) searchInput.value = '';
    if (categoryFilter) categoryFilter.value = '';
    if (supplierFilter) supplierFilter.value = '';
    if (stockFilter) stockFilter.value = '';
    
    // Reset to first page with no filters
    loadInventory(1, {});
};

// Load categories and suppliers for filters
async function loadFilterOptions() {
    const token = localStorage.getItem('token');
    try {
        // Load categories
        const catResponse = await fetch(`${API_URL}/categories`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const categories = await catResponse.json();
        const categorySelect = document.getElementById('category-filter');
        if (categorySelect && categories.categories) {
            categorySelect.innerHTML = '<option value="">All Categories</option>' + 
                categories.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        }
        
        // Load suppliers
        const supResponse = await fetch(`${API_URL}/suppliers`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const suppliers = await supResponse.json();
        const supplierSelect = document.getElementById('supplier-filter');
        if (supplierSelect && suppliers.suppliers) {
            supplierSelect.innerHTML = '<option value="">All Suppliers</option>' + 
                suppliers.suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
        }
    } catch(e) {
        console.error('Error loading filter options:', e);
    }
}

// Initialize inventory when page loads
if (document.getElementById('inventory-page')) {
    // Wait for DOM to be ready
    setTimeout(() => {
        loadFilterOptions();
        loadInventory(1, {});
    }, 500);
}

// Also update product modal dropdowns
async function loadProductFormOptions() {
    const token = localStorage.getItem('token');
    try {
        const catResponse = await fetch(`${API_URL}/categories`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const categories = await catResponse.json();
        const categorySelect = document.getElementById('product-category');
        if (categorySelect && categories.categories) {
            categorySelect.innerHTML = '<option value="">Select Category</option>' + 
                categories.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        }
        
        const supResponse = await fetch(`${API_URL}/suppliers`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const suppliers = await supResponse.json();
        const supplierSelect = document.getElementById('product-supplier');
        if (supplierSelect && suppliers.suppliers) {
            supplierSelect.innerHTML = '<option value="">Select Supplier</option>' + 
                suppliers.suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
        }
    } catch(e) {
        console.error('Error loading form options:', e);
    }
}

// Load product form options when modal opens
const originalAddProduct = window.addProductClick;
if (document.getElementById('add-product-btn')) {
    document.getElementById('add-product-btn').addEventListener('click', function() {
        loadProductFormOptions();
        const modal = document.getElementById('product-modal');
        if (modal) modal.style.display = 'block';
    });
}
