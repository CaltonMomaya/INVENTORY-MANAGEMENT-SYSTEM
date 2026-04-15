// Complete User Management System
console.log('User Management loaded');

let usersList = [];
let currentUserPage = 1;
let usersPerPage = 10;

// Load all users from backend
async function loadUsers() {
    console.log('Loading users...');
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('No token found');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:5000/api/auth/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to load users');
        
        const data = await response.json();
        usersList = data.users || [];
        console.log('Loaded', usersList.length, 'users');
        
        renderUsersPage();
        
    } catch (error) {
        console.error('Error loading users:', error);
        const container = document.getElementById('users-list');
        if (container) {
            container.innerHTML = '<p style="color: red; text-align: center; padding: 40px;">❌ Error loading users. Make sure you are logged in as Admin.</p>';
        }
    }
}

// Render complete users page
function renderUsersPage() {
    const container = document.getElementById('users-list');
    if (!container) return;
    
    const currentUserEmail = localStorage.getItem('userEmail') || 'admin@kanban.com';
    const currentUserRole = localStorage.getItem('userRole');
    
    // Check if current user is admin
    if (currentUserRole !== 'admin') {
        container.innerHTML = `
            <div class="section-card" style="text-align: center; padding: 60px;">
                <i class="fas fa-lock" style="font-size: 64px; color: #ef4444; margin-bottom: 20px; display: block;"></i>
                <h3>Access Denied</h3>
                <p>Only Administrators can access User Management.</p>
                <button onclick="window.location.href='#'" class="btn-primary" style="margin-top: 20px;" data-page="dashboard">
                    <i class="fas fa-home"></i> Go to Dashboard
                </button>
            </div>
        `;
        return;
    }
    
    // Statistics
    const totalUsers = usersList.length;
    const activeUsers = usersList.filter(u => u.is_active).length;
    const inactiveUsers = totalUsers - activeUsers;
    const adminUsers = usersList.filter(u => u.role === 'admin').length;
    const managerUsers = usersList.filter(u => u.role === 'manager').length;
    const regularUsers = usersList.filter(u => u.role === 'user').length;
    
    // Pagination
    const totalPages = Math.ceil(usersList.length / usersPerPage);
    const startIndex = (currentUserPage - 1) * usersPerPage;
    const paginatedUsers = usersList.slice(startIndex, startIndex + usersPerPage);
    
    let html = `
        <!-- Statistics Cards -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px;">
            <div class="stat-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                <div class="stat-info">
                    <h3 style="color: rgba(255,255,255,0.9);">Total Users</h3>
                    <p class="stat-value" style="color: white; font-size: 32px;">${totalUsers}</p>
                </div>
                <div class="stat-icon"><i class="fas fa-users" style="font-size: 32px;"></i></div>
            </div>
            <div class="stat-card" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white;">
                <div class="stat-info">
                    <h3 style="color: rgba(255,255,255,0.9);">Active Users</h3>
                    <p class="stat-value" style="color: white; font-size: 32px;">${activeUsers}</p>
                </div>
                <div class="stat-icon"><i class="fas fa-check-circle" style="font-size: 32px;"></i></div>
            </div>
            <div class="stat-card" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white;">
                <div class="stat-info">
                    <h3 style="color: rgba(255,255,255,0.9);">Inactive Users</h3>
                    <p class="stat-value" style="color: white; font-size: 32px;">${inactiveUsers}</p>
                </div>
                <div class="stat-icon"><i class="fas fa-ban" style="font-size: 32px;"></i></div>
            </div>
            <div class="stat-card" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white;">
                <div class="stat-info">
                    <h3 style="color: rgba(255,255,255,0.9);">Admins</h3>
                    <p class="stat-value" style="color: white; font-size: 32px;">${adminUsers}</p>
                </div>
                <div class="stat-icon"><i class="fas fa-crown" style="font-size: 32px;"></i></div>
            </div>
        </div>
        
        <!-- Action Bar -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
            <button onclick="showAddUserModal()" class="btn-primary" style="display: inline-flex; align-items: center; gap: 8px;">
                <i class="fas fa-user-plus"></i> Add New User
            </button>
            <div style="display: flex; gap: 15px;">
                <span><i class="fas fa-user-shield"></i> Admins: ${adminUsers}</span>
                <span><i class="fas fa-user-tie"></i> Managers: ${managerUsers}</span>
                <span><i class="fas fa-user"></i> Regular: ${regularUsers}</span>
            </div>
        </div>
        
        <!-- Users Table -->
        <div class="section-card">
            <div class="table-container" style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
                            <th style="padding: 12px; text-align: left;">ID</th>
                            <th style="padding: 12px; text-align: left;">Name</th>
                            <th style="padding: 12px; text-align: left;">Email</th>
                            <th style="padding: 12px; text-align: center;">Role</th>
                            <th style="padding: 12px; text-align: center;">Status</th>
                            <th style="padding: 12px; text-align: left;">Joined</th>
                            <th style="padding: 12px; text-align: center;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    paginatedUsers.forEach(user => {
        const isCurrentUser = user.email === currentUserEmail;
        const statusColor = user.is_active ? '#10b981' : '#ef4444';
        const statusText = user.is_active ? 'Active' : 'Inactive';
        const statusIcon = user.is_active ? 'fa-check-circle' : 'fa-ban';
        
        let roleBadgeStyle = '';
        if (user.role === 'admin') roleBadgeStyle = 'background: #fee2e2; color: #dc2626;';
        else if (user.role === 'manager') roleBadgeStyle = 'background: #fef3c7; color: #d97706;';
        else roleBadgeStyle = 'background: #d1fae5; color: #10b981;';
        
        html += `
            <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px;">${user.id}</td>
                <td style="padding: 12px;">
                    <strong>${escapeHtml(user.name)}</strong>
                    ${isCurrentUser ? '<br><small style="color: #2f6fed;">(You)</small>' : ''}
                </td>
                <td style="padding: 12px;">${escapeHtml(user.email)}</td>
                <td style="padding: 12px; text-align: center;">
                    <span style="${roleBadgeStyle} padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;">
                        ${user.role.toUpperCase()}
                    </span>
                </td>
                <td style="padding: 12px; text-align: center;">
                    <span style="color: ${statusColor};">
                        <i class="fas ${statusIcon}"></i> ${statusText}
                    </span>
                 </td>
                <td style="padding: 12px;">${new Date(user.created_at).toLocaleDateString()}</td>
                <td style="padding: 12px; text-align: center;">
                    ${!isCurrentUser ? `
                        <button onclick="toggleUserStatus(${user.id}, ${user.is_active})" class="btn-icon" title="${user.is_active ? 'Deactivate' : 'Activate'} User" style="background: none; border: none; cursor: pointer; margin: 0 5px; color: ${user.is_active ? '#f59e0b' : '#10b981'}; font-size: 18px;">
                            <i class="fas ${user.is_active ? 'fa-user-slash' : 'fa-user-check'}"></i>
                        </button>
                        <button onclick="deleteUser(${user.id}, '${escapeHtml(user.name)}')" class="btn-icon" title="Delete User" style="background: none; border: none; cursor: pointer; margin: 0 5px; color: #ef4444; font-size: 18px;">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    ` : `
                        <span style="color: #9ca3af; font-size: 12px;">Cannot modify self</span>
                    `}
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
                ${currentUserPage > 1 ? `<button onclick="changeUserPage(${currentUserPage - 1})" style="padding: 8px 12px; border: 1px solid #ddd; background: white; cursor: pointer; border-radius: 6px;">← Previous</button>` : ''}
                <span style="padding: 8px;">Page ${currentUserPage} of ${totalPages}</span>
                ${currentUserPage < totalPages ? `<button onclick="changeUserPage(${currentUserPage + 1})" style="padding: 8px 12px; border: 1px solid #ddd; background: white; cursor: pointer; border-radius: 6px;">Next →</button>` : ''}
            </div>
        `;
    }
    
    html += `</div>`;
    
    container.innerHTML = html;
}

// Show Add User Modal
window.showAddUserModal = function() {
    const modalHtml = `
        <div id="user-modal" class="modal" style="display: block; z-index: 10002;">
            <div class="modal-content" style="max-width: 450px;">
                <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid #e5e7eb;">
                    <h3><i class="fas fa-user-plus"></i> Add New User</h3>
                    <span class="close" onclick="closeUserModal()" style="font-size: 28px; cursor: pointer;">&times;</span>
                </div>
                <form id="user-form" style="padding: 20px;">
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Full Name *</label>
                        <input type="text" id="user-name" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                    </div>
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Email *</label>
                        <input type="email" id="user-email" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                    </div>
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Password *</label>
                        <input type="password" id="user-password" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                        <small style="color: #6b7280;">Minimum 8 characters</small>
                    </div>
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Role</label>
                        <select id="user-role" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                            <option value="user">Regular User (View Only)</option>
                            <option value="manager">Manager (Can manage inventory)</option>
                            <option value="admin">Admin (Full access)</option>
                        </select>
                    </div>
                    <button type="submit" class="btn-primary" style="width: 100%; padding: 12px; margin-top: 10px;">
                        <i class="fas fa-save"></i> Create User
                    </button>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.getElementById('user-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await createUser();
    });
};

// Close modal
window.closeUserModal = function() {
    const modal = document.getElementById('user-modal');
    if (modal) modal.remove();
};

// Create new user
async function createUser() {
    const token = localStorage.getItem('token');
    const name = document.getElementById('user-name').value;
    const email = document.getElementById('user-email').value;
    const password = document.getElementById('user-password').value;
    const role = document.getElementById('user-role').value;
    
    if (!name || !email || !password) {
        alert('Please fill all required fields');
        return;
    }
    
    if (password.length < 8) {
        alert('Password must be at least 8 characters');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password, role })
        });
        
        if (response.ok) {
            alert('✅ User created successfully!');
            closeUserModal();
            loadUsers(); // Refresh the list
            addNotification(`New user "${name}" added with ${role} role`, 'user');
        } else {
            const error = await response.json();
            alert('❌ Failed to create user: ' + (error.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Connection error. Make sure backend is running.');
    }
}

// Toggle user status (activate/deactivate)
window.toggleUserStatus = async function(userId, currentStatus) {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;
    
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`http://localhost:5000/api/auth/users/${userId}/toggle`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            alert(`✅ User ${action}d successfully!`);
            loadUsers(); // Refresh the list
            addNotification(`User status changed to ${action}d`, 'user');
        } else {
            alert('❌ Failed to update user status');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Connection error');
    }
};

// Delete user
window.deleteUser = async function(userId, userName) {
    if (!confirm(`⚠️ Are you sure you want to permanently delete user "${userName}"?\n\nThis action cannot be undone!`)) {
        return;
    }
    
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`http://localhost:5000/api/auth/users/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            alert('✅ User deleted successfully!');
            loadUsers(); // Refresh the list
            addNotification(`User "${userName}" deleted from system`, 'user');
        } else {
            const error = await response.json();
            alert('❌ Failed to delete user: ' + (error.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Connection error');
    }
};

// Change page
window.changeUserPage = function(page) {
    currentUserPage = page;
    renderUsersPage();
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

// Initialize users when page loads
function initUsersPage() {
    console.log('Initializing users page...');
    currentUserPage = 1;
    loadUsers();
}

// Check if users page is active
if (document.getElementById('users-page')) {
    // Watch for navigation to users page
    const usersObserver = new MutationObserver(() => {
        const usersPage = document.getElementById('users-page');
        if (usersPage && usersPage.classList.contains('active')) {
            console.log('Users page activated');
            initUsersPage();
        }
    });
    const pageContent = document.getElementById('page-content');
    if (pageContent) {
        usersObserver.observe(pageContent, { attributes: true, subtree: true });
    }
    
    // Also check if already active
    if (document.getElementById('users-page').classList.contains('active')) {
        initUsersPage();
    }
}

// Override confirm in user management
window.toggleUserStatus = async function(userId, currentStatus) {
    const action = currentStatus ? 'deactivate' : 'activate';
    window.customConfirm(`Are you sure you want to ${action} this user?`, async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:5000/api/auth/users/${userId}/toggle`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                showSnackbar(`User ${action}d successfully!`, 'success');
                loadUsers();
            } else {
                showSnackbar('Failed to update user status', 'error');
            }
        } catch (error) {
            showSnackbar('Connection error', 'error');
        }
    });
};

window.deleteUser = async function(userId, userName) {
    window.customConfirm(`Are you sure you want to permanently delete user "${userName}"? This action cannot be undone!`, async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:5000/api/auth/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                showSnackbar('User deleted successfully!', 'success');
                loadUsers();
            } else {
                showSnackbar('Failed to delete user', 'error');
            }
        } catch (error) {
            showSnackbar('Connection error', 'error');
        }
    });
};
