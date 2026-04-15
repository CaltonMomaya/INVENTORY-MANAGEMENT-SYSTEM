// Complete Supplier Management System - Admin Only
console.log('Supplier Management loaded');

let suppliersList = [];
let currentSupplierPage = 1;
let suppliersPerPage = 10;

// Check if current user is admin
function isAdmin() {
    const userRole = localStorage.getItem('userRole');
    return userRole === 'admin';
}

// Load all suppliers from backend
async function loadSuppliers() {
    console.log('Loading suppliers...');
    
    // Check if user is admin
    if (!isAdmin()) {
        const container = document.getElementById('suppliers-list');
        if (container) {
            container.innerHTML = `
                <div class="section-card" style="text-align: center; padding: 60px;">
                    <i class="fas fa-lock" style="font-size: 64px; color: #ef4444; margin-bottom: 20px; display: block;"></i>
                    <h3>Access Denied</h3>
                    <p>Only Administrators can access Supplier Management.</p>
                    <button onclick="document.querySelector('[data-page=\"dashboard\"]').click()" class="btn-primary" style="margin-top: 20px;">
                        <i class="fas fa-home"></i> Go to Dashboard
                    </button>
                </div>
            `;
        }
        return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('No token found');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:5000/api/suppliers', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to load suppliers');
        
        const data = await response.json();
        suppliersList = data.suppliers || [];
        console.log('Loaded', suppliersList.length, 'suppliers');
        
        renderSuppliersTable();
        
    } catch (error) {
        console.error('Error loading suppliers:', error);
        const container = document.getElementById('suppliers-list');
        if (container) {
            container.innerHTML = '<p style="color: red; text-align: center; padding: 40px;">❌ Error loading suppliers. Make sure backend is running.</p>';
        }
    }
}

// Render suppliers table
function renderSuppliersTable() {
    const container = document.getElementById('suppliers-list');
    if (!container) return;
    
    // Double-check admin access
    if (!isAdmin()) {
        container.innerHTML = `
            <div class="section-card" style="text-align: center; padding: 60px;">
                <i class="fas fa-lock" style="font-size: 64px; color: #ef4444; margin-bottom: 20px; display: block;"></i>
                <h3>Access Denied</h3>
                <p>Only Administrators can access Supplier Management.</p>
            </div>
        `;
        return;
    }
    
    if (suppliersList.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <p>No suppliers found.</p>
                <button onclick="showAddSupplierModal()" class="btn-primary" style="margin-top: 10px;">
                    <i class="fas fa-plus"></i> Add Your First Supplier
                </button>
            </div>
        `;
        return;
    }
    
    // Pagination
    const totalPages = Math.ceil(suppliersList.length / suppliersPerPage);
    const startIndex = (currentSupplierPage - 1) * suppliersPerPage;
    const paginatedSuppliers = suppliersList.slice(startIndex, startIndex + suppliersPerPage);
    
    let html = `
        <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <button onclick="showAddSupplierModal()" class="btn-primary" style="display: inline-flex; align-items: center; gap: 8px;">
                <i class="fas fa-plus"></i> Add New Supplier
            </button>
            <div>
                <span>Total Suppliers: <strong>${suppliersList.length}</strong></span>
            </div>
        </div>
        
        <div class="table-container" style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
                        <th style="padding: 12px; text-align: left;">ID</th>
                        <th style="padding: 12px; text-align: left;">Supplier Name</th>
                        <th style="padding: 12px; text-align: left;">Contact Person</th>
                        <th style="padding: 12px; text-align: left;">Email</th>
                        <th style="padding: 12px; text-align: left;">Phone</th>
                        <th style="padding: 12px; text-align: left;">Address</th>
                        <th style="padding: 12px; text-align: center;">Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    paginatedSuppliers.forEach(supplier => {
        html += `
            <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px;">${supplier.id}</td>
                <td style="padding: 12px;"><strong>${escapeHtml(supplier.name)}</strong></td>
                <td style="padding: 12px;">${escapeHtml(supplier.contact_person || '-')}</td>
                <td style="padding: 12px;">${escapeHtml(supplier.email || '-')}</td>
                <td style="padding: 12px;">${escapeHtml(supplier.phone || '-')}</td>
                <td style="padding: 12px;">${escapeHtml(supplier.address || '-')}</td>
                <td style="padding: 12px; text-align: center;">
                    <button onclick="editSupplier(${supplier.id})" class="btn-icon" title="Edit Supplier" style="background: none; border: none; cursor: pointer; margin: 0 5px; color: #2f6fed; font-size: 18px;">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteSupplier(${supplier.id})" class="btn-icon" title="Delete Supplier" style="background: none; border: none; cursor: pointer; margin: 0 5px; color: #ef4444; font-size: 18px;">
                        <i class="fas fa-trash-alt"></i>
                    </button>
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
                ${currentSupplierPage > 1 ? `<button onclick="changeSupplierPage(${currentSupplierPage - 1})" style="padding: 8px 12px; border: 1px solid #ddd; background: white; cursor: pointer; border-radius: 6px;">← Previous</button>` : ''}
                <span style="padding: 8px;">Page ${currentSupplierPage} of ${totalPages}</span>
                ${currentSupplierPage < totalPages ? `<button onclick="changeSupplierPage(${currentSupplierPage + 1})" style="padding: 8px 12px; border: 1px solid #ddd; background: white; cursor: pointer; border-radius: 6px;">Next →</button>` : ''}
            </div>
        `;
    }
    
    container.innerHTML = html;
}

// Change page
window.changeSupplierPage = function(page) {
    currentSupplierPage = page;
    renderSuppliersTable();
};

// Show Add Supplier Modal (Admin only)
window.showAddSupplierModal = function() {
    if (!isAdmin()) {
        alert('Only administrators can add suppliers');
        return;
    }
    
    const modalHtml = `
        <div id="supplier-modal" class="modal" style="display: block; z-index: 10002;">
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid #e5e7eb;">
                    <h3><i class="fas fa-truck"></i> Add New Supplier</h3>
                    <span class="close" onclick="closeSupplierModal()" style="font-size: 28px; cursor: pointer;">&times;</span>
                </div>
                <form id="supplier-form" style="padding: 20px;">
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Supplier Name *</label>
                        <input type="text" id="supplier-name" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                    </div>
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Contact Person</label>
                        <input type="text" id="supplier-contact" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                    </div>
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Email</label>
                        <input type="email" id="supplier-email" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                    </div>
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Phone</label>
                        <input type="tel" id="supplier-phone" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                    </div>
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Address</label>
                        <textarea id="supplier-address" rows="2" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;"></textarea>
                    </div>
                    <button type="submit" class="btn-primary" style="width: 100%; padding: 12px; margin-top: 10px;">
                        <i class="fas fa-save"></i> Save Supplier
                    </button>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.getElementById('supplier-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await createSupplier();
    });
};

// Close modal
window.closeSupplierModal = function() {
    const modal = document.getElementById('supplier-modal');
    if (modal) modal.remove();
};

// Create new supplier (Admin only)
async function createSupplier() {
    if (!isAdmin()) {
        alert('Only administrators can add suppliers');
        return;
    }
    
    const token = localStorage.getItem('token');
    const data = {
        name: document.getElementById('supplier-name').value,
        contact_person: document.getElementById('supplier-contact').value,
        email: document.getElementById('supplier-email').value,
        phone: document.getElementById('supplier-phone').value,
        address: document.getElementById('supplier-address').value
    };
    
    if (!data.name) {
        alert('Supplier name is required');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:5000/api/suppliers', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            alert('✅ Supplier added successfully!');
            closeSupplierModal();
            loadSuppliers();
            if (typeof addNotification === 'function') {
                addNotification(`New supplier "${data.name}" added`, 'supplier');
            }
        } else {
            const error = await response.json();
            alert('❌ Failed to add supplier: ' + (error.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Connection error. Make sure backend is running.');
    }
}

// Edit supplier (Admin only)
window.editSupplier = async function(supplierId) {
    if (!isAdmin()) {
        alert('Only administrators can edit suppliers');
        return;
    }
    
    const supplier = suppliersList.find(s => s.id === supplierId);
    if (!supplier) return;
    
    const modalHtml = `
        <div id="supplier-modal" class="modal" style="display: block; z-index: 10002;">
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid #e5e7eb;">
                    <h3><i class="fas fa-edit"></i> Edit Supplier</h3>
                    <span class="close" onclick="closeSupplierModal()" style="font-size: 28px; cursor: pointer;">&times;</span>
                </div>
                <form id="supplier-form" style="padding: 20px;">
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Supplier Name *</label>
                        <input type="text" id="supplier-name" value="${escapeHtml(supplier.name)}" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                    </div>
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Contact Person</label>
                        <input type="text" id="supplier-contact" value="${escapeHtml(supplier.contact_person || '')}" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                    </div>
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Email</label>
                        <input type="email" id="supplier-email" value="${escapeHtml(supplier.email || '')}" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                    </div>
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Phone</label>
                        <input type="tel" id="supplier-phone" value="${escapeHtml(supplier.phone || '')}" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                    </div>
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Address</label>
                        <textarea id="supplier-address" rows="2" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">${escapeHtml(supplier.address || '')}</textarea>
                    </div>
                    <button type="submit" class="btn-primary" style="width: 100%; padding: 12px; margin-top: 10px;">
                        <i class="fas fa-save"></i> Update Supplier
                    </button>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.getElementById('supplier-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await updateSupplier(supplierId);
    });
};

// Update supplier (Admin only)
async function updateSupplier(supplierId) {
    if (!isAdmin()) {
        alert('Only administrators can edit suppliers');
        return;
    }
    
    const token = localStorage.getItem('token');
    const data = {
        name: document.getElementById('supplier-name').value,
        contact_person: document.getElementById('supplier-contact').value,
        email: document.getElementById('supplier-email').value,
        phone: document.getElementById('supplier-phone').value,
        address: document.getElementById('supplier-address').value
    };
    
    try {
        const response = await fetch(`http://localhost:5000/api/suppliers/${supplierId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            alert('✅ Supplier updated successfully!');
            closeSupplierModal();
            loadSuppliers();
            if (typeof addNotification === 'function') {
                addNotification(`Supplier "${data.name}" updated`, 'supplier');
            }
        } else {
            alert('❌ Failed to update supplier');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Connection error');
    }
}

// Delete supplier (Admin only)
window.deleteSupplier = async function(supplierId) {
    if (!isAdmin()) {
        alert('Only administrators can delete suppliers');
        return;
    }
    
    const supplier = suppliersList.find(s => s.id === supplierId);
    if (!confirm(`⚠️ Are you sure you want to delete supplier "${supplier.name}"?\n\nThis will also delete all products associated with this supplier.`)) {
        return;
    }
    
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`http://localhost:5000/api/suppliers/${supplierId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            alert('✅ Supplier deleted successfully!');
            loadSuppliers();
            if (typeof addNotification === 'function') {
                addNotification(`Supplier "${supplier.name}" deleted`, 'supplier');
            }
        } else {
            const error = await response.json();
            alert('❌ Failed to delete supplier: ' + (error.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Connection error');
    }
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

// Initialize suppliers when page loads
function initSuppliersPage() {
    console.log('Initializing suppliers page...');
    currentSupplierPage = 1;
    loadSuppliers();
}

// Check if suppliers page is active
if (document.getElementById('suppliers-page')) {
    // Watch for navigation to suppliers page
    const suppliersObserver = new MutationObserver(() => {
        const suppliersPage = document.getElementById('suppliers-page');
        if (suppliersPage && suppliersPage.classList.contains('active')) {
            console.log('Suppliers page activated');
            initSuppliersPage();
        }
    });
    const pageContent = document.getElementById('page-content');
    if (pageContent) {
        suppliersObserver.observe(pageContent, { attributes: true, subtree: true });
    }
    
    // Also check if already active
    if (document.getElementById('suppliers-page').classList.contains('active')) {
        initSuppliersPage();
    }
}

// Override confirm in supplier management
window.deleteSupplier = async function(supplierId) {
    const supplier = suppliersList.find(s => s.id === supplierId);
    window.customConfirm(`Are you sure you want to delete supplier "${supplier.name}"? This will also delete all products associated with this supplier.`, async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:5000/api/suppliers/${supplierId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                showSnackbar('Supplier deleted successfully!', 'success');
                loadSuppliers();
                if (typeof addNotification === 'function') {
                    addNotification(`Supplier "${supplier.name}" deleted`, 'supplier');
                }
            } else {
                showSnackbar('Failed to delete supplier', 'error');
            }
        } catch (error) {
            showSnackbar('Connection error', 'error');
        }
    });
};
