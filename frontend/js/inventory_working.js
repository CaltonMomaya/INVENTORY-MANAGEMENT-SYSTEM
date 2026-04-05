// SINGLE WORKING INVENTORY FILE - No conflicts
console.log('Inventory working file loaded');

// Use different variable names to avoid conflicts
let invCurrentPage = 1;
let invTotalPages = 1;
let invCurrentFilters = {};

// Main function to load inventory
window.loadInventoryPage = async function(page = 1, filters = {}) {
    console.log('Loading inventory page:', page);
    invCurrentPage = page;
    
    // Get filter values
    if (Object.keys(filters).length === 0) {
        filters = {
            search: document.getElementById('search-input')?.value || '',
            category_id: document.getElementById('category-filter')?.value || '',
            supplier_id: document.getElementById('supplier-filter')?.value || '',
            stock_status: document.getElementById('stock-filter')?.value || ''
        };
        Object.keys(filters).forEach(key => {
            if (!filters[key]) delete filters[key];
        });
        invCurrentFilters = filters;
    }
    
    // Build URL
    const params = new URLSearchParams({ page: page, per_page: 10 });
    if (filters.search) params.append('search', filters.search);
    if (filters.category_id) params.append('category_id', filters.category_id);
    if (filters.supplier_id) params.append('supplier_id', filters.supplier_id);
    if (filters.stock_status === 'low') params.append('low_stock', 'true');
    
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
        const response = await fetch(`http://localhost:5000/api/products?${params}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        const products = data.products || [];
        invTotalPages = data.pagination?.pages || 1;
        
        // Render table
        const tbody = document.getElementById('inventory-body');
        const userRole = localStorage.getItem('userRole');
        const isAdmin = userRole === 'admin' || userRole === 'manager';
        
        if (tbody && products.length) {
            tbody.innerHTML = products.map(p => `
                <tr>
                    <td>${p.name || ''}</td>
                    <td>${p.sku || ''}</td>
                    <td>${p.category_name || '-'}</td>
                    <td>${p.quantity || 0}</td>
                    <td>₹${p.price || 0}</td>
                    <td><span class="status-badge ${p.is_low_stock ? 'status-low' : 'status-normal'}">${p.is_low_stock ? 'Low Stock' : 'In Stock'}</span></td>
                    <td>${isAdmin ? `<button onclick="sellProductItem(${p.id})" style="background:none; border:none; cursor:pointer; font-size:18px;">🛒</button>` : 'View'}</td>
                </tr>
            `).join('');
        } else if (tbody) {
            tbody.innerHTML = '<tr><td colspan="7">No products found</td></tr>';
        }
        
        // Render pagination
        const paginationDiv = document.getElementById('pagination-controls');
        if (paginationDiv && invTotalPages > 1) {
            let pHtml = '<div style="display:flex; gap:8px; justify-content:center; margin-top:20px;">';
            if (invCurrentPage > 1) pHtml += `<button onclick="loadInventoryPage(${invCurrentPage - 1}, invCurrentFilters)">← Prev</button>`;
            pHtml += `<span style="padding:8px;">Page ${invCurrentPage} of ${invTotalPages}</span>`;
            if (invCurrentPage < invTotalPages) pHtml += `<button onclick="loadInventoryPage(${invCurrentPage + 1}, invCurrentFilters)">Next →</button>`;
            pHtml += '</div>';
            paginationDiv.innerHTML = pHtml;
        }
        
    } catch(e) {
        console.error('Error:', e);
        const tbody = document.getElementById('inventory-body');
        if (tbody) tbody.innerHTML = '<tr><td colspan="7">Error loading products</td></tr>';
    }
};

// Apply filters
window.applyFiltersInv = function() {
    const filters = {
        search: document.getElementById('search-input')?.value,
        category_id: document.getElementById('category-filter')?.value,
        supplier_id: document.getElementById('supplier-filter')?.value,
        stock_status: document.getElementById('stock-filter')?.value
    };
    Object.keys(filters).forEach(k => { if (!filters[k]) delete filters[k]; });
    loadInventoryPage(1, filters);
};

// Reset filters
window.resetFiltersInv = function() {
    ['search-input', 'category-filter', 'supplier-filter', 'stock-filter'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    loadInventoryPage(1, {});
};

// Sell product
window.sellProductItem = async function(productId) {
    const qty = prompt('Quantity to sell:', '1');
    if (!qty) return;
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`http://localhost:5000/api/transactions/out`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: productId, quantity: parseInt(qty), reference: `SALE-${Date.now()}` })
        });
        if (res.ok) {
            alert(`✅ Sold ${qty} units!`);
            loadInventoryPage(invCurrentPage, invCurrentFilters);
        } else alert('Sale failed');
    } catch(e) { alert('Error'); }
};

// Initialize when inventory page is shown
function initInventoryPage() {
    console.log('Init inventory');
    loadInventoryPage(1, {});
}

// Check if inventory is active on load
if (document.getElementById('inventory-page')?.classList.contains('active')) {
    initInventoryPage();
}

// Watch for navigation
const watchNav = new MutationObserver(() => {
    if (document.getElementById('inventory-page')?.classList.contains('active')) {
        initInventoryPage();
    }
});
watchNav.observe(document.getElementById('page-content') || document.body, { attributes: true, subtree: true });
