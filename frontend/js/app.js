// API Configuration
const API_URL = 'http://localhost:5000/api';
let currentToken = null;
let currentUser = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
    setupRoleInfo();
});

// Setup Role Info Display
function setupRoleInfo() {
    const roleSelect = document.getElementById('signup-role');
    if (roleSelect) {
        roleSelect.addEventListener('change', (e) => {
            const role = e.target.value;
            const roleDescription = document.getElementById('role-description');
            
            switch(role) {
                case 'admin':
                    roleDescription.innerHTML = 'Admins have full access to all features including user management, product management, and system settings.';
                    break;
                case 'manager':
                    roleDescription.innerHTML = 'Managers can add/remove products, manage stock, and handle inventory transactions.';
                    break;
                case 'user':
                    roleDescription.innerHTML = 'Regular users can view inventory, dashboard, and reports but cannot make changes.';
                    break;
                default:
                    roleDescription.innerHTML = 'Regular users can view inventory but cannot make changes.';
            }
        });
    }
}

// Check Authentication
async function checkAuth() {
    const token = localStorage.getItem('token');
    if (token) {
        currentToken = token;
        await loadCurrentUser();
        showDashboard();
        loadCompleteDashboard();
    } else {
        showAuth();
    }
}

// Load Current User Info
async function loadCurrentUser() {
    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        
        if (response.ok) {
            currentUser = await response.json();
            localStorage.setItem('userRole', currentUser.user.role);
            localStorage.setItem('userName', currentUser.user.name);
        }
    } catch (error) {
        console.error('Error loading user:', error);
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Auth form switches
    document.getElementById('show-signup')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('login-form').classList.remove('active');
        document.getElementById('signup-form').classList.add('active');
    });
    
    document.getElementById('show-login')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('signup-form').classList.remove('active');
        document.getElementById('login-form').classList.add('active');
    });
    
    // Login form
    document.getElementById('login-form-element')?.addEventListener('submit', handleLogin);
    
    // Signup form
    document.getElementById('signup-form-element')?.addEventListener('submit', handleSignup);
    
    // Logout
    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
    
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            if (page) {
                navigateTo(page);
            }
        });
    });
    
    // Add product button
    document.getElementById('add-product-btn')?.addEventListener('click', () => {
        openProductModal();
    });
    
    // Product form
    document.getElementById('product-form')?.addEventListener('submit', handleCreateProduct);
    
    // Modal close
    document.querySelector('.close')?.addEventListener('click', () => {
        closeProductModal();
    });
    
    // Settings button
    document.getElementById('settings-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        showSettings();
    });
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentToken = data.access_token;
            currentUser = { user: data.user };
            localStorage.setItem('token', currentToken);
            localStorage.setItem('userRole', data.user.role);
            localStorage.setItem('userName', data.user.name);
            
            showDashboard();
            updateUIForRole();
            loadCompleteDashboard();
        } else {
            alert(data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Connection error. Make sure the backend is running.');
    }
}

// Handle Signup with Role Selection
async function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const role = document.getElementById('signup-role').value;
    
    if (password.length < 8) {
        alert('Password must be at least 8 characters');
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Creating account...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                name, 
                email, 
                password, 
                role: role // Send the selected role to backend
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert(`Account created successfully! You can now login as a ${role.toUpperCase()}.`);
            // Clear form
            document.getElementById('signup-form-element').reset();
            // Switch to login form
            document.getElementById('signup-form').classList.remove('active');
            document.getElementById('login-form').classList.add('active');
            
            // Pre-fill email for convenience
            document.getElementById('login-email').value = email;
        } else {
            alert(data.error || 'Registration failed');
        }
    } catch (error) {
        console.error('Signup error:', error);
        alert('Connection error. Make sure the backend is running.');
    } finally {
        // Restore button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Handle Logout
function handleLogout(e) {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    currentToken = null;
    currentUser = null;
    showAuth();
}

// Update UI Based on User Role
function updateUIForRole() {
    const role = localStorage.getItem('userRole');
    const isAdmin = role === 'admin';
    const isManager = role === 'manager';
    const hasAdminAccess = isAdmin || isManager;
    
    // Update user role display
    const userRoleSpan = document.getElementById('user-role');
    if (userRoleSpan) {
        userRoleSpan.textContent = role.toUpperCase();
        userRoleSpan.className = `role-badge role-${role}`;
    }
    
    // Update user name display
    const userNameSpan = document.getElementById('user-name');
    if (userNameSpan) {
        userNameSpan.textContent = localStorage.getItem('userName') || 'User';
    }
    
    // Show/hide admin-only navigation items
    const adminNavItems = document.querySelectorAll('.nav-item[data-page="manage-store"]');
    adminNavItems.forEach(item => {
        if (hasAdminAccess) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
    
    // Show/hide Add Product button
    const addProductBtn = document.getElementById('add-product-btn');
    if (addProductBtn) {
        if (hasAdminAccess) {
            addProductBtn.style.display = 'flex';
        } else {
            addProductBtn.style.display = 'none';
        }
    }
    
    // Show/hide action buttons in inventory table
    const actionButtons = document.querySelectorAll('.action-buttons');
    actionButtons.forEach(btn => {
        if (hasAdminAccess) {
            btn.style.display = 'flex';
        } else {
            btn.style.display = 'none';
        }
    });
    
    // Update welcome message
    const welcomeMsg = document.getElementById('dashboard-welcome');
    if (welcomeMsg) {
        if (isAdmin) {
            welcomeMsg.innerHTML = 'Welcome back, Admin! You have full system access.';
        } else if (isManager) {
            welcomeMsg.innerHTML = 'Welcome back, Manager! You can manage inventory and products.';
        } else {
            welcomeMsg.innerHTML = 'Welcome back! You can view inventory and products.';
        }
    }
}

// Navigation
function navigateTo(page) {
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) {
            item.classList.add('active');
        }
    });
    
    // Show active page
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });
    document.getElementById(`${page}-page`).classList.add('active');
    
    // Load page data
    if (page === 'dashboard') {
        loadCompleteDashboard();
    } else if (page === 'inventory') {
        loadInventory();
    }
}

// Show/Hide Screens
function showAuth() {
    document.getElementById('auth-screen').style.display = 'flex';
    document.getElementById('dashboard-screen').style.display = 'none';
}

function showDashboard() {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('dashboard-screen').style.display = 'block';
    updateUIForRole();
}

// Show Settings
function showSettings() {
    const role = localStorage.getItem('userRole');
    const isAdmin = role === 'admin';
    const isManager = role === 'manager';
    
    let settingsHtml = `
        <div class="settings-modal">
            <h3>User Settings</h3>
            <div class="settings-info">
                <p><strong>Name:</strong> ${localStorage.getItem('userName')}</p>
                <p><strong>Role:</strong> <span class="role-badge role-${role}">${role.toUpperCase()}</span></p>
                <p><strong>Permissions:</strong></p>
                <ul>
                    <li>${isAdmin || isManager ? '✓' : '✓'} View Dashboard</li>
                    <li>${isAdmin || isManager ? '✓' : '✓'} View Products</li>
                    <li>${isAdmin || isManager ? '✓' : '✗'} Create/Edit/Delete Products</li>
                    <li>${isAdmin || isManager ? '✓' : '✗'} Manage Stock Transactions</li>
                    <li>${isAdmin ? '✓' : '✗'} Manage Categories & Suppliers</li>
                    <li>${isAdmin ? '✓' : '✗'} User Management</li>
                </ul>
                ${!isAdmin && !isManager ? '<p class="note">Note: Contact an administrator to upgrade your permissions.</p>' : ''}
            </div>
            <button class="btn-primary" onclick="closeSettings()">Close</button>
        </div>
    `;
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `<div class="modal-content">${settingsHtml}</div>`;
    document.body.appendChild(modal);
    
    // Add close function
    window.closeSettings = () => {
        modal.remove();
    };
}

// Load Dashboard Data
async function loadCompleteDashboard() {
    try {
        const response = await fetch(`${API_URL}/transactions/dashboard`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        
        const data = await response.json();
        
        // Update stats
        document.getElementById('stat-sales').textContent = `₹${data.sales_overview.sales}`;
        document.getElementById('stat-revenue').textContent = `₹${data.sales_overview.revenue}`;
        document.getElementById('stat-profit').textContent = `₹${data.sales_overview.profit}`;
        document.getElementById('stat-cost').textContent = `₹${data.sales_overview.cost}`;
        
        document.getElementById('quantity-hand').textContent = data.inventory_summary.quantity_in_hand;
        document.getElementById('to-received').textContent = data.inventory_summary.to_be_received;
        document.getElementById('suppliers-count').textContent = data.product_summary.number_of_suppliers;
        document.getElementById('categories-count').textContent = data.product_summary.number_of_categories;
        
        // Load top selling products
        await loadTopSellingProducts();
        
        // Load low stock products
        await loadLowStockProducts();
        
        // Set user info
        const userName = localStorage.getItem('userName') || 'User';
        const userRole = localStorage.getItem('userRole') || 'user';
        document.getElementById('dashboard-user-name').textContent = userName;
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Load Top Selling Products
async function loadTopSellingProducts() {
    try {
        const response = await fetch(`${API_URL}/products`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        
        const data = await response.json();
        const products = data.products || [];
        const topProducts = products.slice(0, 5);
        
        const tbody = document.getElementById('top-products-body');
        if (topProducts.length === 0) {
            tbody.innerHTML = '}<tr><td colspan="4">No products found</td></tr>';
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
        
    } catch (error) {
        console.error('Error loading top products:', error);
    }
}

// Load Low Stock Products
async function loadLowStockProducts() {
    try {
        const response = await fetch(`${API_URL}/products`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        
        const data = await response.json();
        const products = data.products || [];
        const lowStock = products.filter(p => p.quantity <= p.reorder_level);
        
        const container = document.getElementById('low-stock-list');
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
        
    } catch (error) {
        console.error('Error loading low stock:', error);
    }
}

// Load Inventory
async function old_loadInventory() {
    try {
        const response = await fetch(`${API_URL}/products`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        
        const data = await response.json();
        const products = data.products || [];
        const userRole = localStorage.getItem('userRole');
        const hasAdminAccess = userRole === 'admin' || userRole === 'manager';
        
        const tbody = document.getElementById('inventory-body');
        if (products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7">No products found</td></tr>';
            return;
        }
        
        tbody.innerHTML = products.map(product => `
            <tr>
                <td>${product.name}</td>
                <td>${product.sku}</td>
                <td>${product.category_name || 'N/A'}</td>
                <td>${product.quantity}</td>
                <td>₹${product.price}</td>
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
                        <button class="btn-icon" onclick="removeStock(${product.id})" title="Remove Stock">
                            <i class="fas fa-minus-circle"></i>
                        </button>
                    ` : '<span class="no-access">View Only</span>'}
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error loading inventory:', error);
    }
}

// Open Product Modal
async function openProductModal() {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin' && userRole !== 'manager') {
        alert('You do not have permission to add products.');
        return;
    }
    
    // Load categories and suppliers
    try {
        const [categoriesRes, suppliersRes] = await Promise.all([
            fetch(`${API_URL}/categories`, { headers: { 'Authorization': `Bearer ${currentToken}` } }),
            fetch(`${API_URL}/suppliers`, { headers: { 'Authorization': `Bearer ${currentToken}` } })
        ]);
        
        const categories = await categoriesRes.json();
        const suppliers = await suppliersRes.json();
        
        const categorySelect = document.getElementById('product-category');
        categorySelect.innerHTML = '<option value="">Select Category</option>' + 
            categories.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        
        const supplierSelect = document.getElementById('product-supplier');
        supplierSelect.innerHTML = '<option value="">Select Supplier</option>' + 
            suppliers.suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
        
    } catch (error) {
        console.error('Error loading form data:', error);
    }
    
    document.getElementById('product-modal').style.display = 'block';
}

// Close Product Modal
function closeProductModal() {
    document.getElementById('product-modal').style.display = 'none';
    document.getElementById('product-form').reset();
}

// Handle Create Product
async function handleCreateProduct(e) {
    e.preventDefault();
    
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin' && userRole !== 'manager') {
        alert('You do not have permission to add products.');
        closeProductModal();
        return;
    }
    
    const productData = {
        name: document.getElementById('product-name').value,
        sku: document.getElementById('product-sku').value,
        category_id: parseInt(document.getElementById('product-category').value),
        supplier_id: parseInt(document.getElementById('product-supplier').value),
        quantity: parseInt(document.getElementById('product-quantity').value),
        price: parseFloat(document.getElementById('product-price').value),
        cost: parseFloat(document.getElementById('product-cost').value),
        reorder_level: parseInt(document.getElementById('product-reorder').value),
        description: document.getElementById('product-description').value
    };
    
    try {
        const response = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${currentToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Product created successfully!');
            closeProductModal();
            loadInventory();
            loadCompleteDashboard();
        } else {
            alert(data.error || 'Failed to create product');
        }
    } catch (error) {
        console.error('Error creating product:', error);
        alert('Connection error');
    }
}

// Add Stock
window.addStock = async function(productId) {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin' && userRole !== 'manager') {
        alert('You do not have permission to modify stock.');
        return;
    }
    
    const quantity = prompt('Enter quantity to add:');
    if (!quantity) return;
    
    try {
        const response = await fetch(`${API_URL}/transactions/in`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${currentToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                product_id: productId,
                quantity: parseInt(quantity),
                reference: 'Manual addition',
                notes: 'Stock added from dashboard'
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Stock added successfully!');
            loadInventory();
            loadCompleteDashboard();
        } else {
            alert(data.error || 'Failed to add stock');
        }
    } catch (error) {
        console.error('Error adding stock:', error);
        alert('Connection error');
    }
};

// Remove Stock
window.removeStock = async function(productId) {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin' && userRole !== 'manager') {
        alert('You do not have permission to modify stock.');
        return;
    }
    
    const quantity = prompt('Enter quantity to remove:');
    if (!quantity) return;
    
    try {
        const response = await fetch(`${API_URL}/transactions/out`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${currentToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                product_id: productId,
                quantity: parseInt(quantity),
                reference: 'Manual removal',
                notes: 'Stock removed from dashboard'
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Stock removed successfully!');
            loadInventory();
            loadCompleteDashboard();
        } else {
            alert(data.error || 'Failed to remove stock');
        }
    } catch (error) {
        console.error('Error removing stock:', error);
        alert('Connection error');
    }
};

// Dark Mode Functions
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
}

function initTheme() {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }
}

// Initialize theme on load
initTheme();

// Sell Product Function
window.sellProduct = async function(productId) {
    const quantity = prompt('Enter quantity to sell:');
    if (!quantity || quantity <= 0) return;
    
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin' && userRole !== 'manager') {
        alert('Only managers and admins can process sales');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/transactions/out`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                product_id: productId,
                quantity: parseInt(quantity),
                reference: `SALE-${Date.now()}`,
                notes: 'Product sold to customer'
            })
        });
        
        if (response.ok) {
            alert(`✅ Sold ${quantity} units successfully!`);
            loadInventory(); // Refresh inventory
            loadDashboard(); // Refresh dashboard
        } else {
            const data = await response.json();
            alert(data.error || 'Failed to process sale');
        }
    } catch (error) {
        console.error('Error selling product:', error);
        alert('Connection error');
    }
};

// Pagination variables
let currentPage = 1;
let totalPages = 1;

async function loadInventoryWithPagination(page = 1) {
    currentPage = page;
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/products?page=${page}&per_page=10`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        const products = data.products || [];
        totalPages = data.pagination?.pages || 1;
        
        // Render inventory table
        const tbody = document.getElementById('inventory-body');
        const userRole = localStorage.getItem('userRole');
        const isAdmin = userRole === 'admin' || userRole === 'manager';
        
        tbody.innerHTML = products.map(p => `
            <tr>
                <td>${p.name}</td>
                <td>${p.sku}</td>
                <td>${p.category_name || '-'}</td>
                <td>${p.quantity}</td>
                <td>₹${p.price}</td>
                <td><span class="status-badge ${p.is_low_stock ? 'status-low' : 'status-normal'}">${p.is_low_stock ? 'Low Stock' : 'In Stock'}</span></td>
                <td>${isAdmin ? `
                    <button class="btn-icon" onclick="addStock(${p.id})" title="Add Stock"><i class="fas fa-plus-circle"></i></button>
                    <button class="btn-icon" onclick="sellProduct(${p.id})" title="Sell"><i class="fas fa-shopping-cart"></i></button>
                ` : 'View Only'}</td>
            </tr>
        `).join('');
        
        // Render pagination
        renderPagination();
        
    } catch(e) {
        console.error('Error loading inventory:', e);
    }
}

function renderPagination() {
    const container = document.getElementById('pagination-controls');
    if (!container || totalPages <= 1) {
        if (container) container.innerHTML = '';
        return;
    }
    
    let html = '<div class="pagination">';
    if (currentPage > 1) {
        html += `<button onclick="loadInventoryWithPagination(${currentPage - 1})">← Prev</button>`;
    }
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            html += `<button class="active" disabled>${i}</button>`;
        } else if (Math.abs(i - currentPage) <= 2 || i === 1 || i === totalPages) {
            html += `<button onclick="loadInventoryWithPagination(${i})">${i}</button>`;
        } else if (Math.abs(i - currentPage) === 3) {
            html += `<span>...</span>`;
        }
    }
    
    if (currentPage < totalPages) {
        html += `<button onclick="loadInventoryWithPagination(${currentPage + 1})">Next →</button>`;
    }
    html += '</div>';
    container.innerHTML = html;
}

// Replace loadInventory with paginated version
window.loadInventory = loadInventoryWithPagination;

// User Management Functions
async function loadUsers() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/auth/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        const users = data.users || [];
        
        const container = document.getElementById('users-list');
        if (!container) return;
        
        if (users.length === 0) {
            container.innerHTML = '<p>No users found</p>';
            return;
        }
        
        let html = '<table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
        users.forEach(user => {
            html += `<tr>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td><span class="role-badge role-${user.role}">${user.role}</span></td>
                <td>${user.is_active ? '<span style="color:#10b981;">Active</span>' : '<span style="color:#ef4444;">Inactive</span>'}</td>
                <td>
                    <button onclick="toggleUserStatus(${user.id})" class="btn-icon"><i class="fas ${user.is_active ? 'fa-ban' : 'fa-check-circle'}"></i></button>
                    <button onclick="deleteUser(${user.id})" class="btn-icon"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
        });
        html += '</tbody></table>';
        container.innerHTML = html;
    } catch(e) {
        console.error('Error loading users:', e);
    }
}

async function toggleUserStatus(userId) {
    if (!confirm('Change user status?')) return;
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/auth/users/${userId}/toggle`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            alert('User status updated!');
            loadUsers();
        }
    } catch(e) { console.error(e); }
}

async function deleteUser(userId) {
    if (!confirm('Delete user permanently?')) return;
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/auth/users/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            alert('User deleted!');
            loadUsers();
        }
    } catch(e) { console.error(e); }
}

// Fix Add Product Modal
document.getElementById('add-product-btn')?.addEventListener('click', async () => {
    // Load categories and suppliers
    try {
        const token = localStorage.getItem('token');
        const [catRes, supRes] = await Promise.all([
            fetch(`${API_URL}/categories`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${API_URL}/suppliers`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        const categories = await catRes.json();
        const suppliers = await supRes.json();
        
        const categorySelect = document.getElementById('product-category');
        categorySelect.innerHTML = '<option value="">Select Category</option>' + 
            categories.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        
        const supplierSelect = document.getElementById('product-supplier');
        supplierSelect.innerHTML = '<option value="">Select Supplier</option>' + 
            suppliers.suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
        
        document.getElementById('product-modal').style.display = 'block';
    } catch(e) { console.error(e); }
});

document.querySelector('.close')?.addEventListener('click', () => {
    document.getElementById('product-modal').style.display = 'none';
});

document.getElementById('product-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const productData = {
        name: document.getElementById('product-name').value,
        sku: document.getElementById('product-sku').value,
        category_id: parseInt(document.getElementById('product-category').value),
        supplier_id: parseInt(document.getElementById('product-supplier').value),
        quantity: parseInt(document.getElementById('product-quantity').value),
        price: parseFloat(document.getElementById('product-price').value),
        cost: parseFloat(document.getElementById('product-cost').value),
        reorder_level: 10
    };
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });
        
        if (response.ok) {
            alert('Product created!');
            document.getElementById('product-modal').style.display = 'none';
            loadInventoryWithPagination();
        } else {
            alert('Failed to create product');
        }
    } catch(e) { console.error(e); }
});

// Hide Suppliers menu for non-admin users
function updateMenuBasedOnRole() {
    const userRole = localStorage.getItem('userRole');
    const suppliersMenuItem = document.querySelector('.nav-item[data-page="suppliers"]');
    const userManagementMenuItem = document.querySelector('.nav-item[data-page="users"]');
    
    if (suppliersMenuItem) {
        if (userRole !== 'admin') {
            suppliersMenuItem.style.display = 'none';
        } else {
            suppliersMenuItem.style.display = 'flex';
        }
    }
    
    if (userManagementMenuItem) {
        if (userRole !== 'admin') {
            userManagementMenuItem.style.display = 'none';
        } else {
            userManagementMenuItem.style.display = 'flex';
        }
    }
}

// Call after login
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
    originalSetItem.apply(this, arguments);
    if (key === 'userRole') {
        updateMenuBasedOnRole();
    }
};

// Call on page load
if (localStorage.getItem('userRole')) {
    updateMenuBasedOnRole();
}

// Override logout to clear session timer
const originalLogout = window.handleLogout;
window.handleLogout = function(e) {
    if (e) e.preventDefault();
    // Clear session timeout
    if (window.inactivityTimer) {
        clearTimeout(window.inactivityTimer);
    }
    if (window.countdownInterval) {
        clearInterval(window.countdownInterval);
    }
    // Call original logout
    if (originalLogout) {
        originalLogout(e);
    } else {
        localStorage.clear();
        window.location.href = '/';
    }
};
