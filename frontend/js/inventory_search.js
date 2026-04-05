// Inventory Search and Filter Fix
console.log('Inventory search fix loaded');

// Add event listeners for search and filters
function initInventorySearch() {
    console.log('Initializing inventory search...');
    
    // Search input - search as you type (with debounce)
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            console.log('Searching for:', this.value);
            applyFilters();
        });
    }
    
    // Category filter
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            console.log('Category changed:', this.value);
            applyFilters();
        });
    }
    
    // Supplier filter
    const supplierFilter = document.getElementById('supplier-filter');
    if (supplierFilter) {
        supplierFilter.addEventListener('change', function() {
            console.log('Supplier changed:', this.value);
            applyFilters();
        });
    }
    
    // Stock filter
    const stockFilter = document.getElementById('stock-filter');
    if (stockFilter) {
        stockFilter.addEventListener('change', function() {
            console.log('Stock filter changed:', this.value);
            applyFilters();
        });
    }
    
    // Min price filter
    const minPrice = document.getElementById('min-price');
    if (minPrice) {
        minPrice.addEventListener('input', function() {
            applyFilters();
        });
    }
    
    // Max price filter
    const maxPrice = document.getElementById('max-price');
    if (maxPrice) {
        maxPrice.addEventListener('input', function() {
            applyFilters();
        });
    }
    
    // Sort by filter
    const sortBy = document.getElementById('sort-by');
    if (sortBy) {
        sortBy.addEventListener('change', function() {
            console.log('Sort by changed:', this.value);
            applyFilters();
        });
    }
    
    // Sort order filter
    const sortOrder = document.getElementById('sort-order');
    if (sortOrder) {
        sortOrder.addEventListener('change', function() {
            console.log('Sort order changed:', this.value);
            applyFilters();
        });
    }
}

// Apply filters function
window.applyFilters = function() {
    console.log('Applying filters...');
    
    // Get all filter values
    const searchValue = document.getElementById('search-input')?.value || '';
    const categoryValue = document.getElementById('category-filter')?.value || '';
    const supplierValue = document.getElementById('supplier-filter')?.value || '';
    const stockValue = document.getElementById('stock-filter')?.value || '';
    const minPriceValue = document.getElementById('min-price')?.value || '';
    const maxPriceValue = document.getElementById('max-price')?.value || '';
    const sortByValue = document.getElementById('sort-by')?.value || 'id';
    const sortOrderValue = document.getElementById('sort-order')?.value || 'asc';
    
    // Build filters object
    const filters = {};
    if (searchValue) filters.search = searchValue;
    if (categoryValue) filters.category_id = categoryValue;
    if (supplierValue) filters.supplier_id = supplierValue;
    if (stockValue === 'low') filters.low_stock = 'true';
    if (minPriceValue) filters.min_price = minPriceValue;
    if (maxPriceValue) filters.max_price = maxPriceValue;
    if (sortByValue) filters.sort_by = sortByValue;
    if (sortOrderValue) filters.sort_order = sortOrderValue;
    
    console.log('Filters applied:', filters);
    
    // Call loadInventory with filters
    if (typeof loadInventoryPage === 'function') {
        loadInventoryPage(1, filters);
    } else if (typeof loadInventory === 'function') {
        loadInventory(1, filters);
    } else {
        console.error('No loadInventory function found');
        // Fallback - reload page with query params
        reloadWithFilters(filters);
    }
};

// Reset filters function
window.resetFilters = function() {
    console.log('Resetting filters...');
    
    // Clear all filter inputs
    const filterIds = ['search-input', 'category-filter', 'supplier-filter', 'stock-filter', 'min-price', 'max-price'];
    filterIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    
    // Reset sort to defaults
    const sortBy = document.getElementById('sort-by');
    if (sortBy) sortBy.value = 'id';
    const sortOrder = document.getElementById('sort-order');
    if (sortOrder) sortOrder.value = 'asc';
    
    // Reload without filters
    if (typeof loadInventoryPage === 'function') {
        loadInventoryPage(1, {});
    } else if (typeof loadInventory === 'function') {
        loadInventory(1, {});
    }
};

// Fallback: reload page with filter query parameters
function reloadWithFilters(filters) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.category_id) params.append('category', filters.category_id);
    if (filters.supplier_id) params.append('supplier', filters.supplier_id);
    if (filters.low_stock) params.append('low_stock', 'true');
    
    const newUrl = window.location.pathname + '?' + params.toString();
    window.location.href = newUrl;
}

// Initialize when inventory page becomes active
function initInventoryFilters() {
    const inventoryPage = document.getElementById('inventory-page');
    if (inventoryPage && inventoryPage.classList.contains('active')) {
        setTimeout(() => {
            initInventorySearch();
        }, 500);
    }
}

// Watch for navigation to inventory page
const inventoryObserver = new MutationObserver(() => {
    const inventoryPage = document.getElementById('inventory-page');
    if (inventoryPage && inventoryPage.classList.contains('active')) {
        console.log('Inventory page activated - initializing search');
        initInventorySearch();
    }
});

const pageContent = document.getElementById('page-content');
if (pageContent) {
    inventoryObserver.observe(pageContent, { attributes: true, subtree: true });
}

// Also initialize if inventory is already active
if (document.getElementById('inventory-page')?.classList.contains('active')) {
    initInventorySearch();
}

console.log('Inventory search fix ready - search will work as you type!');
