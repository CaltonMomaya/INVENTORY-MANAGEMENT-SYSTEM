// Dark/Light Mode Toggle
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
}

function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        const toggle = document.querySelector('.theme-toggle i');
        if (toggle) toggle.className = 'fas fa-sun';
    } else {
        document.body.classList.remove('dark-mode');
        const toggle = document.querySelector('.theme-toggle i');
        if (toggle) toggle.className = 'fas fa-moon';
    }
    localStorage.setItem('theme', theme);
}

function toggleTheme() {
    const currentTheme = localStorage.getItem('theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
}

// Add theme toggle button
function addThemeToggle() {
    const userMenu = document.querySelector('.user-menu');
    if (userMenu && !document.querySelector('.theme-toggle')) {
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'theme-toggle';
        toggleBtn.onclick = toggleTheme;
        toggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
        toggleBtn.style.cssText = 'background: none; border: none; font-size: 18px; cursor: pointer; padding: 8px; margin-right: 10px; border-radius: 8px;';
        userMenu.insertBefore(toggleBtn, userMenu.firstChild);
    }
}

// Dark mode CSS
const darkModeCSS = `
    body.dark-mode { background: #1a1a2e; color: #eee; }
    body.dark-mode .sidebar, body.dark-mode .top-navbar, body.dark-mode .stat-card,
    body.dark-mode .section-card, body.dark-mode .quick-stat-card, body.dark-mode .modal-content,
    body.dark-mode .filter-bar { background: #16213e; color: #eee; border-color: #0f3460; }
    body.dark-mode .stat-card .stat-value, body.dark-mode .quick-stat-card .large-number { color: #4fc3f7; }
    body.dark-mode table th { background: #0f3460; color: #ddd; }
    body.dark-mode table td { border-bottom-color: #0f3460; }
    body.dark-mode .filter-input, body.dark-mode .filter-select { background: #0f3460; color: #eee; border-color: #1a4a7a; }
    body.dark-mode .search-bar { background: #0f3460; }
    body.dark-mode .nav-item:hover { background: #0f3460; }
    body.dark-mode .alert-item.warning { background: #2d1b00; color: #ffb74d; }
`;

const styleSheet = document.createElement("style");
styleSheet.textContent = darkModeCSS;
document.head.appendChild(styleSheet);

// Initialize when DOM is ready
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        initTheme();
        addThemeToggle();
    });
}
