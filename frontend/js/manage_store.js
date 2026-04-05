// Manage Store Functions
async function loadStoreSettings() {
    const container = document.getElementById('store-content');
    if (!container) return;
    
    const storeData = JSON.parse(localStorage.getItem('storeSettings') || '{}');
    
    container.innerHTML = `
        <div class="settings-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
            <div class="settings-card" style="background: white; padding: 20px; border-radius: 12px;">
                <h3><i class="fas fa-store"></i> Store Information</h3>
                <div class="setting-item" style="margin: 15px 0;">
                    <label>Store Name</label>
                    <input type="text" id="store-name" value="${storeData.name || 'KANBAN'}" class="filter-input" style="width: 100%;">
                </div>
                <div class="setting-item" style="margin: 15px 0;">
                    <label>Store Email</label>
                    <input type="email" id="store-email" value="${storeData.email || ''}" class="filter-input" style="width: 100%;">
                </div>
                <div class="setting-item" style="margin: 15px 0;">
                    <label>Store Phone</label>
                    <input type="tel" id="store-phone" value="${storeData.phone || ''}" class="filter-input" style="width: 100%;">
                </div>
                <button onclick="saveStoreSettings()" class="btn-primary">Save Settings</button>
            </div>
            
            <div class="settings-card" style="background: white; padding: 20px; border-radius: 12px;">
                <h3><i class="fas fa-cog"></i> System Settings</h3>
                <div class="setting-item" style="margin: 15px 0;">
                    <label>
                        <input type="checkbox" id="low-stock-alerts" ${localStorage.getItem('lowStockAlerts') !== 'false' ? 'checked' : ''}> 
                        Enable Low Stock Alerts
                    </label>
                </div>
                <div class="setting-item" style="margin: 15px 0;">
                    <label>Low Stock Threshold</label>
                    <input type="number" id="threshold" value="${localStorage.getItem('lowStockThreshold') || 10}" class="filter-input" style="width: 100%;">
                </div>
                <div class="setting-item" style="margin: 15px 0;">
                    <label>Items Per Page</label>
                    <select id="items-per-page" class="filter-select" style="width: 100%;">
                        <option value="10" ${localStorage.getItem('itemsPerPage') === '10' ? 'selected' : ''}>10</option>
                        <option value="25" ${localStorage.getItem('itemsPerPage') === '25' ? 'selected' : ''}>25</option>
                        <option value="50" ${localStorage.getItem('itemsPerPage') === '50' ? 'selected' : ''}>50</option>
                    </select>
                </div>
                <button onclick="saveSystemSettings()" class="btn-primary">Save Settings</button>
            </div>
        </div>
        <div class="settings-card" style="background: white; padding: 20px; border-radius: 12px; margin-top: 20px;">
            <h3><i class="fas fa-database"></i> Data Management</h3>
            <button onclick="clearCache()" class="btn-secondary" style="margin-right: 10px;"><i class="fas fa-trash"></i> Clear Cache</button>
            <button onclick="exportData()" class="btn-secondary"><i class="fas fa-download"></i> Export Data</button>
        </div>
    `;
}

function saveStoreSettings() {
    const settings = {
        name: document.getElementById('store-name')?.value,
        email: document.getElementById('store-email')?.value,
        phone: document.getElementById('store-phone')?.value
    };
    localStorage.setItem('storeSettings', JSON.stringify(settings));
    alert('Store settings saved!');
    addNotification('Store settings updated', 'system');
}

function saveSystemSettings() {
    localStorage.setItem('lowStockAlerts', document.getElementById('low-stock-alerts')?.checked);
    localStorage.setItem('lowStockThreshold', document.getElementById('threshold')?.value);
    localStorage.setItem('itemsPerPage', document.getElementById('items-per-page')?.value);
    alert('System settings saved!');
}

function clearCache() {
    if (confirm('Clear cached data? You may need to login again.')) {
        localStorage.removeItem('storeSettings');
        localStorage.removeItem('systemSettings');
        alert('Cache cleared!');
    }
}

function exportData() {
    alert('Export feature would download CSV/JSON of all data');
}

// Load store settings when page opens
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('store-content')) {
            loadStoreSettings();
        }
    });
}
