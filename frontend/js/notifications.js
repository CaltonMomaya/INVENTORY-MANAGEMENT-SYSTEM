// Notification System
let notifications = JSON.parse(localStorage.getItem('notifications') || '[]');

function addNotification(message, type) {
    const notification = {
        id: Date.now(),
        message: message,
        type: type,
        timestamp: new Date().toISOString(),
        read: false
    };
    
    notifications.unshift(notification);
    if (notifications.length > 50) notifications.pop();
    saveNotifications();
    updateNotificationBadge();
}

function updateNotificationBadge() {
    const unreadCount = notifications.filter(n => !n.read).length;
    const badge = document.querySelector('.notification-badge');
    if (badge) {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'inline-flex' : 'none';
    }
}

function showNotifications() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.style.zIndex = '10001';
    
    let html = `
        <div class="modal-content" style="max-width: 500px; max-height: 500px; overflow: auto;">
            <div class="modal-header">
                <h3><i class="fas fa-bell"></i> Notifications</h3>
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div style="padding: 10px;">
    `;
    
    if (notifications.length === 0) {
        html += '<p style="text-align: center; padding: 20px;">No notifications yet</p>';
    } else {
        notifications.forEach(notif => {
            const icon = notif.type === 'sale' ? '💰' : (notif.type === 'supplier' ? '🏭' : '👤');
            html += `
                <div class="notification-item" style="padding: 12px; border-bottom: 1px solid #e5e7eb; cursor: pointer; ${notif.read ? 'opacity: 0.7;' : 'background: #f0f9ff;'}">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 20px;">${icon}</span>
                        <div style="flex: 1;">
                            <div style="font-weight: 500;">${notif.message}</div>
                            <div style="font-size: 12px; color: #6b7280;">${new Date(notif.timestamp).toLocaleString()}</div>
                        </div>
                        ${!notif.read ? '<span style="background: #2f6fed; width: 8px; height: 8px; border-radius: 50%;"></span>' : ''}
                    </div>
                </div>
            `;
        });
    }
    
    html += `
            </div>
            <div style="padding: 10px; border-top: 1px solid #e5e7eb;">
                <button onclick="clearAllNotifications(); this.closest('.modal').remove();" class="btn-secondary" style="width: 100%;">Clear All</button>
            </div>
        </div>
    `;
    
    modal.innerHTML = html;
    document.body.appendChild(modal);
    
    // Mark all as read when opened
    notifications.forEach(n => n.read = true);
    updateNotificationBadge();
    saveNotifications();
}

function markAsRead(id) {
    const notif = notifications.find(n => n.id === id);
    if (notif) notif.read = true;
    updateNotificationBadge();
    saveNotifications();
}

function clearAllNotifications() {
    notifications = [];
    updateNotificationBadge();
    saveNotifications();
}

function saveNotifications() {
    localStorage.setItem('notifications', JSON.stringify(notifications));
}

function loadNotifications() {
    const saved = localStorage.getItem('notifications');
    if (saved) {
        notifications = JSON.parse(saved);
        updateNotificationBadge();
    }
}

// Load notifications on page load
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', loadNotifications);
}
