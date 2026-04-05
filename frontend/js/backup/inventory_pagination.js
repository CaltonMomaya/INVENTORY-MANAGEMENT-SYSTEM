// Inventory Pagination
let currentPage = 1;
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
        const response = await fetch(`${API_URL}/products?${params}`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        
        const data = await response.json();
        renderInventoryTable(data.products || []);
        renderPagination(data.pagination || {});
        
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
        tbody.innerHTML = '<tr><td colspan="8">No products found</td></tr>';
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

function renderPagination(pagination) {
    const container = document.getElementById('pagination-controls');
    if (!container) return;
    
    if (!pagination.pages || pagination.pages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = '<div class="pagination" style="display: flex; gap: 8px; justify-content: center; margin-top: 20px;">';
    
    if (pagination.has_prev) {
        html += `<button onclick="loadInventory(${pagination.prev_num}, currentFilters)" style="padding: 8px 12px; border: 1px solid #ddd; background: white; cursor: pointer;">← Prev</button>`;
    }
    
    for (let i = 1; i <= pagination.pages; i++) {
        if (i === pagination.page) {
            html += `<button disabled style="padding: 8px 12px; background: #2f6fed; color: white; border: none;">${i}</button>`;
        } else if (Math.abs(i - pagination.page) <= 2 || i === 1 || i === pagination.pages) {
            html += `<button onclick="loadInventory(${i}, currentFilters)" style="padding: 8px 12px; border: 1px solid #ddd; background: white; cursor: pointer;">${i}</button>`;
        } else if (Math.abs(i - pagination.page) === 3) {
            html += `<span style="padding: 8px;">...</span>`;
        }
    }
    
    if (pagination.has_next) {
        html += `<button onclick="loadInventory(${pagination.next_num}, currentFilters)" style="padding: 8px 12px; border: 1px solid #ddd; background: white; cursor: pointer;">Next →</button>`;
    }
    
    html += '</div>';
    container.innerHTML = html;
}

function applyFilters() {
    const filters = {
        search: document.getElementById('search-input')?.value,
        category_id: document.getElementById('category-filter')?.value,
        supplier_id: document.getElementById('supplier-filter')?.value,
        stock_status: document.getElementById('stock-filter')?.value,
        min_price: document.getElementById('min-price')?.value,
        max_price: document.getElementById('max-price')?.value,
        sort_by: document.getElementById('sort-by')?.value,
        sort_order: document.getElementById('sort-order')?.value
    };
    
    Object.keys(filters).forEach(key => {
        if (!filters[key]) delete filters[key];
    });
    
    loadInventory(1, filters);
}

function resetFilters() {
    const inputs = ['search-input', 'category-filter', 'supplier-filter', 'stock-filter', 'min-price', 'max-price'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const sortBy = document.getElementById('sort-by');
    if (sortBy) sortBy.value = 'id';
    const sortOrder = document.getElementById('sort-order');
    if (sortOrder) sortOrder.value = 'asc';
    
    loadInventory(1, {});
}
