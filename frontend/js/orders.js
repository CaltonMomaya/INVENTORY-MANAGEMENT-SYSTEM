// Complete Orders Management System with Product Prices
console.log('Orders Management loaded');

let ordersList = [];
let currentOrderPage = 1;
let ordersPerPage = 10;
let currentOrderFilter = 'all';

// Load all orders (sold products) from backend
async function loadOrders() {
    console.log('Loading orders...');
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('No token found');
        return;
    }
    
    try {
        // Show loading state
        const container = document.getElementById('orders-list');
        if (container) {
            container.innerHTML = '<div style="text-align: center; padding: 40px;"><i class="fas fa-spinner fa-spin"></i> Loading orders...</div>';
        }
        
        // Get all stock out transactions (sales)
        const response = await fetch('http://localhost:5000/api/transactions?type=out', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to load orders');
        
        const data = await response.json();
        ordersList = data.transactions || [];
        console.log('Loaded', ordersList.length, 'orders');
        
        // Fetch product prices for each order
        let priceFetchPromises = ordersList.map(async (order) => {
            if (order.product_id) {
                try {
                    const productRes = await fetch(`http://localhost:5000/api/products/${order.product_id}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (productRes.ok) {
                        const productData = await productRes.json();
                        order.product_price = productData.product?.price || 0;
                    } else {
                        order.product_price = 0;
                    }
                } catch (e) {
                    console.error(`Error fetching price for product ${order.product_id}:`, e);
                    order.product_price = 0;
                }
            } else {
                order.product_price = 0;
            }
            return order;
        });
        
        // Wait for all price fetches to complete
        await Promise.all(priceFetchPromises);
        console.log('All product prices fetched');
        
        renderOrdersPage();
        
    } catch (error) {
        console.error('Error loading orders:', error);
        const container = document.getElementById('orders-list');
        if (container) {
            container.innerHTML = '<p style="color: red; text-align: center; padding: 40px;">❌ Error loading orders. Make sure backend is running.</p>';
        }
    }
}

// Render complete orders page
function renderOrdersPage() {
    const container = document.getElementById('orders-list');
    if (!container) return;
    
    // Calculate statistics
    const totalOrders = ordersList.length;
    const totalItemsSold = ordersList.reduce((sum, order) => sum + order.quantity, 0);
    const totalRevenue = ordersList.reduce((sum, order) => sum + (order.quantity * (order.product_price || 0)), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Filter orders if needed
    let filteredOrders = ordersList;
    if (currentOrderFilter !== 'all') {
        filteredOrders = ordersList.filter(order => order.transaction_type === currentOrderFilter);
    }
    
    // Pagination
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    const startIndex = (currentOrderPage - 1) * ordersPerPage;
    const paginatedOrders = filteredOrders.slice(startIndex, startIndex + ordersPerPage);
    
    let html = `
        <!-- Statistics Cards -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px;">
            <div class="stat-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                <div class="stat-info">
                    <h3 style="color: rgba(255,255,255,0.9);">Total Orders</h3>
                    <p class="stat-value" style="color: white; font-size: 32px;">${totalOrders}</p>
                </div>
                <div class="stat-icon"><i class="fas fa-shopping-cart" style="font-size: 32px;"></i></div>
            </div>
            <div class="stat-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white;">
                <div class="stat-info">
                    <h3 style="color: rgba(255,255,255,0.9);">Items Sold</h3>
                    <p class="stat-value" style="color: white; font-size: 32px;">${totalItemsSold}</p>
                </div>
                <div class="stat-icon"><i class="fas fa-boxes" style="font-size: 32px;"></i></div>
            </div>
            <div class="stat-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white;">
                <div class="stat-info">
                    <h3 style="color: rgba(255,255,255,0.9);">Total Revenue</h3>
                    <p class="stat-value" style="color: white; font-size: 32px;">₹${totalRevenue.toLocaleString()}</p>
                </div>
                <div class="stat-icon"><i class="fas fa-dollar-sign" style="font-size: 32px;"></i></div>
            </div>
            <div class="stat-card" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white;">
                <div class="stat-info">
                    <h3 style="color: rgba(255,255,255,0.9);">Avg Order Value</h3>
                    <p class="stat-value" style="color: white; font-size: 32px;">₹${Math.round(avgOrderValue).toLocaleString()}</p>
                </div>
                <div class="stat-icon"><i class="fas fa-chart-line" style="font-size: 32px;"></i></div>
            </div>
        </div>
        
        <!-- Filter Bar -->
        <div style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; align-items: center;">
            <div style="display: flex; gap: 8px;">
                <button onclick="filterOrders('all')" class="${currentOrderFilter === 'all' ? 'btn-primary' : 'btn-secondary'}" style="padding: 8px 16px;">
                    All Orders
                </button>
                <button onclick="filterOrders('out')" class="${currentOrderFilter === 'out' ? 'btn-primary' : 'btn-secondary'}" style="padding: 8px 16px;">
                    Sales Only
                </button>
            </div>
            <div style="flex: 1;"></div>
            <div>
                <span>Showing ${filteredOrders.length} of ${totalOrders} orders</span>
            </div>
        </div>
    `;
    
    if (filteredOrders.length === 0) {
        html += `
            <div class="section-card" style="text-align: center; padding: 60px;">
                <i class="fas fa-shopping-cart" style="font-size: 64px; color: #cbd5e1; margin-bottom: 20px; display: block;"></i>
                <h3>No Orders Yet</h3>
                <p>When you sell products from the Inventory page, they will appear here.</p>
                <button onclick="document.querySelector('[data-page=\"inventory\"]').click()" class="btn-primary" style="margin-top: 20px;">
                    <i class="fas fa-boxes"></i> Go to Inventory
                </button>
            </div>
        `;
    } else {
        html += `
            <div class="section-card">
                <div class="table-container" style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
                                <th style="padding: 12px; text-align: left;">Order ID</th>
                                <th style="padding: 12px; text-align: left;">Date & Time</th>
                                <th style="padding: 12px; text-align: left;">Product</th>
                                <th style="padding: 12px; text-align: center;">Quantity</th>
                                <th style="padding: 12px; text-align: right;">Unit Price</th>
                                <th style="padding: 12px; text-align: right;">Total Amount</th>
                                <th style="padding: 12px; text-align: left;">Reference</th>
                                <th style="padding: 12px; text-align: left;">Sold By</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        paginatedOrders.forEach(order => {
            const unitPrice = order.product_price || 0;
            const totalAmount = order.quantity * unitPrice;
            const date = new Date(order.created_at);
            const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
            
            html += `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 12px;"><strong>#${order.id}</strong></td>
                    <td style="padding: 12px;">${formattedDate}</td>
                    <td style="padding: 12px;">
                        <strong>${escapeHtml(order.product_name || 'Unknown')}</strong>
                        ${order.notes ? `<br><small style="color: #6b7280; font-size: 11px;">${escapeHtml(order.notes)}</small>` : ''}
                    </td>
                    <td style="padding: 12px; text-align: center;">
                        <span style="background: #dbeafe; color: #2f6fed; padding: 4px 8px; border-radius: 6px; font-weight: 500;">
                            ${order.quantity}
                        </span>
                    </td>
                    <td style="padding: 12px; text-align: right;">₹${unitPrice.toLocaleString()}</td>
                    <td style="padding: 12px; text-align: right;">
                        <strong style="color: #10b981;">₹${totalAmount.toLocaleString()}</strong>
                    </td>
                    <td style="padding: 12px;">${order.reference || '-'}</td>
                    <td style="padding: 12px;">
                        <i class="fas fa-user"></i> ${order.user_name || 'System'}
                    </td>
                </tr>
            `;
        });
        
        html += `
                        </tbody>
                    </table>
                </div>
        `;
        
        // Add pagination
        if (totalPages > 1) {
            html += `
                <div style="display: flex; gap: 8px; justify-content: center; margin-top: 20px;">
                    ${currentOrderPage > 1 ? `<button onclick="changeOrderPage(${currentOrderPage - 1})" style="padding: 8px 12px; border: 1px solid #ddd; background: white; cursor: pointer; border-radius: 6px;">← Previous</button>` : ''}
                    <span style="padding: 8px;">Page ${currentOrderPage} of ${totalPages}</span>
                    ${currentOrderPage < totalPages ? `<button onclick="changeOrderPage(${currentOrderPage + 1})" style="padding: 8px 12px; border: 1px solid #ddd; background: white; cursor: pointer; border-radius: 6px;">Next →</button>` : ''}
                </div>
            `;
        }
        
        html += `</div>`;
    }
    
    container.innerHTML = html;
}

// Filter orders
window.filterOrders = function(filter) {
    currentOrderFilter = filter;
    currentOrderPage = 1;
    renderOrdersPage();
};

// Change page
window.changeOrderPage = function(page) {
    currentOrderPage = page;
    renderOrdersPage();
};

// Helper function to escape HTML
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Refresh orders (useful after selling)
window.refreshOrders = function() {
    loadOrders();
};

// Initialize orders when page loads
function initOrdersPage() {
    console.log('Initializing orders page...');
    currentOrderPage = 1;
    currentOrderFilter = 'all';
    loadOrders();
}

// Check if orders page is active
if (document.getElementById('orders-page')) {
    // Watch for navigation to orders page
    const ordersObserver = new MutationObserver(() => {
        const ordersPage = document.getElementById('orders-page');
        if (ordersPage && ordersPage.classList.contains('active')) {
            console.log('Orders page activated');
            initOrdersPage();
        }
    });
    const pageContent = document.getElementById('page-content');
    if (pageContent) {
        ordersObserver.observe(pageContent, { attributes: true, subtree: true });
    }
    
    // Also check if already active
    if (document.getElementById('orders-page').classList.contains('active')) {
        initOrdersPage();
    }
}
