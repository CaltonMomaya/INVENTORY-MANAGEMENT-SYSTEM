let currentPage = 1;
let totalPages = 1;
let currentFilters = {};

async function loadInventory(page = 1, filters = {}) {
    currentPage = page;
    currentFilters = filters;
    
    const params = new URLSearchParams({
        page: page,
        per_page: 10,
        ...filters
    });
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/products?${params}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        const products = data.products || [];
        totalPages = data.pagination?.pages || 1;
        
        renderInventoryTable(products);
        renderPagination();
        
    } catch (error) {
        console.error('Error loading inventory:', error);
    }
}

function renderInventoryTable(products) {
    const tbody = document.getElementById('inventory-body');
    const userRole = localStorage.getItem('userRole');
    const hasAdminAccess = userRole === 'admin' || userRole === 'manager';
    
    if (!tbody) return;
    
    if (!products || products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">No products found</td></tr>';
        return;
    }
    
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

function renderPagination() {
    const container = document.getElementById('pagination-controls');
    if (!container) return;
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = '<div class="pagination">';
    
    if (currentPage > 1) {
        html += `<button onclick="loadInventory(${currentPage - 1}, currentFilters)">← Prev</button>`;
    }
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            html += `<button class="active" disabled>${i}</button>`;
        } else if (Math.abs(i - currentPage) <= 2 || i === 1 || i === totalPages) {
            html += `<button onclick="loadInventory(${i}, currentFilters)">${i}</button>`;
        } else if (Math.abs(i - currentPage) === 3) {
            html += `<span>...</span>`;
        }
    }
    
    if (currentPage < totalPages) {
        html += `<button onclick="loadInventory(${currentPage + 1}, currentFilters)">Next →</button>`;
    }
    
    html += '</div>';
    container.innerHTML = html;
}

function applyFilters() {
    const filters = {
        search: document.getElementById('search-input')?.value,
        category_id: document.getElementById('category-filter')?.value,
        supplier_id: document.getElementById('supplier-filter')?.value,
        stock_status: document.getElementById('stock-filter')?.value
    };
    
    Object.keys(filters).forEach(key => {
        if (!filters[key]) delete filters[key];
    });
    
    loadInventory(1, filters);
}

function resetFilters() {
    const inputs = ['search-input', 'category-filter', 'supplier-filter', 'stock-filter'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    loadInventory(1, {});
}

// Add stock function
window.addStock = async function(productId) {
    const quantity = prompt('Enter quantity to add:');
    if (!quantity || quantity <= 0) return;
    
    try {
        const token = localStorage.getItem('token');
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
            loadInventory(currentPage, currentFilters);
            loadDashboard();
        } else {
            alert('Failed to add stock');
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

// Remove stock function
window.removeStock = async function(productId) {
    const quantity = prompt('Enter quantity to remove:');
    if (!quantity || quantity <= 0) return;
    
    try {
        const token = localStorage.getItem('token');
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
            loadInventory(currentPage, currentFilters);
            loadDashboard();
        } else {
            alert('Failed to remove stock');
        }
    } catch (error) {
        console.error('Error:', error);
    }
};
