// Inventory Fix - Complete working version
console.log('Inventory fix loaded!');

const API_URL = 'http://localhost:5000/api';
let currentPage = 1;
let totalPages = 1;
let currentFilters = {};

// Main function to load inventory
async function loadInventoryData(page = 1, filters = {}) {
    console.log('Loading inventory data - Page:', page, 'Filters:', filters);
    currentPage = page;
    
    // Get filter values from DOM if not provided
    if (Object.keys(filters).length === 0) {
        filters = {
            search: document.getElementById('search-input')?.value || '',
            category_id: document.getElementById('category-filter')?.value || '',
            supplier_id: document.getElementById('supplier-filter')?.value || '',
            stock_status: document.getElementById('stock-filter')?.value || '',
            min_price: document.getElementById('min-price')?.value || '',
            max_price: document.getElementById('max-price')?.value || '',
            sort_by: document.getElementById('sort-by')?.value || 'id',
            sort_order: document.getElementById('sort-order')?.value || 'asc'
        };
        // Remove empty filters
        Object.keys(filters).forEach(key => {
            if (!filters[key]) delete filters[key];
        });
        currentFilters = filters;
    }
    
    // Build URL params
    const params = new URLSearchParams({
        page: page,
        per_page: 10
    });
    
    if (filters.search) params.append('search', filters.search);
    if (filters.category_id) params.append('category_id', filters.category_id);
    if (filters.supplier_id) params.append('supplier_id', filters.supplier_id);
    if (filters.stock_status === 'low') params.append('low_stock', 'true');
    if (filters.min_price) params.append('min_price', filters.min_price);
    if (filters.max_price) params.append('max_price', filters.max_price);
    if (filters.sort_by) params.append('sort_by', filters.sort_by);
    if (filters.sort_order) params.append('sort_order', filters.sort_order);
    
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('No token found');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/products?${params}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to load products');
        
        const data = await response.json();
        const products = data.products || [];
        totalPages = data.pagination?.pages || 1;
        
        console.log('Loaded', products.length, 'products, total pages:', totalPages);
        
        // Render the table
        renderProductsTable(products);
        renderPaginationControls();
        
    } catch (error) {
        console.error('Error loading inventory:', error);
        const tbody = document.getElementById('inventory-body');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:red;">Error loading products. Make sure backend is running.</td></tr>';
        }
    }
}

// Render products table
function renderProductsTable(products) {
    const tbody = document.getElementById('inventory-body');
    if (!tbody) {
        console.error('inventory-body element not found');
        return;
    }
    
    const userRole = localStorage.getItem('userRole');
    const hasAdminAccess = userRole === 'admin' || userRole === 'manager';
    
    if (!products || products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No products found</td></tr>';
        return;
    }
    
    tbody.innerHTML = products.map(product => `
        <tr>
            <td>${escapeHtml(product.name || 'N/A')}</td>
            <td>${escapeHtml(product.sku || 'N/A')}</td>
            <td>${escapeHtml(product.category_name || 'N/A')}</td>
            <td>${product.quantity || 0}</td>
            <td>₹${(product.price || 0).toLocaleString()}</td>
            <td>
                <span class="status-badge ${product.is_low_stock ? 'status-low' : 'status-normal'}">
                    ${product.is_low_stock ? 'Low Stock' : 'In Stock'}
                </span>
            </td>
            <td class="action-buttons">
                ${hasAdminAccess ? `
                    <button class="btn-icon" onclick="window.addStockItem(${product.id})" title="Add Stock">
                        <i class="fas fa-plus-circle"></i>
                    </button>
                    <button class="btn-icon" onclick="window.sellProductItem(${product.id})" title="Sell Product">
                        <i class="fas fa-shopping-cart"></i>
                    </button>
                    <button class="btn-icon" onclick="window.removeStockItem(${product.id})" title="Remove Stock">
                        <i class="fas fa-minus-circle"></i>
                    </button>
                ` : '<span class="no-access">View Only</span>'}
            </td>
        </tr>
    `).join('');
}

// Render pagination controls
function renderPaginationControls() {
    const container = document.getElementById('pagination-controls');
    if (!container) return;
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = '<div class="pagination" style="display: flex; gap: 8px; justify-content: center; margin-top: 20px; flex-wrap: wrap;">';
    
    if (currentPage > 1) {
        html += `<button onclick="window.loadInventoryData(${currentPage - 1}, currentFilters)" style="padding: 8px 12px; border: 1px solid #ddd; background: white; cursor: pointer; border-radius: 6px;">← Prev</button>`;
    }
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            html += `<button disabled style="padding: 8px 12px; background: #2f6fed; color: white; border: none; border-radius: 6px;">${i}</button>`;
        } else if (Math.abs(i - currentPage) <= 2 || i === 1 || i === totalPages) {
            html += `<button onclick="window.loadInventoryData(${i}, currentFilters)" style="padding: 8px 12px; border: 1px solid #ddd; background: white; cursor: pointer; border-radius: 6px;">${i}</button>`;
        } else if (Math.abs(i - currentPage) === 3) {
            html += `<span style="padding: 8px;">...</span>`;
        }
    }
    
    if (currentPage < totalPages) {
        html += `<button onclick="window.loadInventoryData(${currentPage + 1}, currentFilters)" style="padding: 8px 12px; border: 1px solid #ddd; background: white; cursor: pointer; border-radius: 6px;">Next →</button>`;
    }
    
    html += '</div>';
    container.innerHTML = html;
}

// Apply filters
window.applyFilters = function() {
    console.log('Applying filters...');
    const filters = {
        search: document.getElementById('search-input')?.value || '',
        category_id: document.getElementById('category-filter')?.value || '',
        supplier_id: document.getElementById('supplier-filter')?.value || '',
        stock_status: document.getElementById('stock-filter')?.value || '',
        min_price: document.getElementById('min-price')?.value || '',
        max_price: document.getElementById('max-price')?.value || '',
        sort_by: document.getElementById('sort-by')?.value || 'id',
        sort_order: document.getElementById('sort-order')?.value || 'asc'
    };
    
    Object.keys(filters).forEach(key => {
        if (!filters[key]) delete filters[key];
    });
    
    currentFilters = filters;
    loadInventoryData(1, filters);
};

// Reset filters
window.resetFilters = function() {
    console.log('Resetting filters...');
    const filterIds = ['search-input', 'category-filter', 'supplier-filter', 'stock-filter', 'min-price', 'max-price', 'sort-by', 'sort-order'];
    filterIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const sortBy = document.getElementById('sort-by');
    if (sortBy) sortBy.value = 'id';
    const sortOrder = document.getElementById('sort-order');
    if (sortOrder) sortOrder.value = 'asc';
    
    currentFilters = {};
    loadInventoryData(1, {});
};

// Sell product
window.sellProductItem = async function(productId) {
    const quantity = prompt('Enter quantity to sell:', '1');
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
                reference: `SALE-${Date.now()}`,
                notes: 'Product sold'
            })
        });
        
        if (response.ok) {
            alert(`✅ Sold ${quantity} units successfully!`);
            loadInventoryData(currentPage, currentFilters);
            if (typeof loadDashboard === 'function') loadDashboard();
        } else {
            const data = await response.json();
            alert(data.error || 'Failed to sell');
        }
    } catch (error) {
        alert('Connection error');
    }
};

// Add stock
window.addStockItem = async function(productId) {
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
            loadInventoryData(currentPage, currentFilters);
            if (typeof loadDashboard === 'function') loadDashboard();
        } else {
            alert('Failed to add stock');
        }
    } catch (error) {
        alert('Connection error');
    }
};

// Remove stock
window.removeStockItem = async function(productId) {
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
            loadInventoryData(currentPage, currentFilters);
            if (typeof loadDashboard === 'function') loadDashboard();
        } else {
            alert('Failed to remove stock');
        }
    } catch (error) {
        alert('Connection error');
    }
};

// Load filter dropdown options
async function loadFilterDropdowns() {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
        // Load categories
        const catRes = await fetch(`${API_URL}/categories`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const categories = await catRes.json();
        const categorySelect = document.getElementById('category-filter');
        if (categorySelect && categories.categories) {
            categorySelect.innerHTML = '<option value="">All Categories</option>' + 
                categories.categories.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
        }
        
        // Load suppliers
        const supRes = await fetch(`${API_URL}/suppliers`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const suppliers = await supRes.json();
        const supplierSelect = document.getElementById('supplier-filter');
        if (supplierSelect && suppliers.suppliers) {
            supplierSelect.innerHTML = '<option value="">All Suppliers</option>' + 
                suppliers.suppliers.map(s => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join('');
        }
    } catch(e) {
        console.error('Error loading dropdowns:', e);
    }
}

// Helper function
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Make functions available globally
window.loadInventoryData = loadInventoryData;

// Initialize when inventory page is shown
function initInventoryPage() {
    console.log('Initializing inventory page...');
    loadFilterDropdowns();
    loadInventoryData(1, {});
}

// Check if inventory page is active on load
if (document.getElementById('inventory-page') && document.getElementById('inventory-page').classList.contains('active')) {
    initInventoryPage();
}

// Watch for navigation to inventory page
const navObserver = new MutationObserver(function(mutations) {
    const inventoryPage = document.getElementById('inventory-page');
    if (inventoryPage && inventoryPage.classList.contains('active')) {
        console.log('Inventory page became active');
        initInventoryPage();
    }
});
navObserver.observe(document.getElementById('page-content') || document.body, { attributes: true, childList: true, subtree: true });

console.log('Inventory fix ready!');
