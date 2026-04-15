// Enhanced Dark Mode Toggle with visible button
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
}

function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        const toggle = document.querySelector('.theme-toggle');
        if (toggle) {
            toggle.innerHTML = '<i class="fas fa-sun"></i>';
            toggle.style.backgroundColor = '#2a2a2a';
            toggle.style.color = '#ffd700';
        }
    } else {
        document.body.classList.remove('dark-mode');
        const toggle = document.querySelector('.theme-toggle');
        if (toggle) {
            toggle.innerHTML = '<i class="fas fa-moon"></i>';
            toggle.style.backgroundColor = '#f0f0f0';
            toggle.style.color = '#2f6fed';
        }
    }
    localStorage.setItem('theme', theme);
}

function toggleTheme() {
    const currentTheme = localStorage.getItem('theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
    showSnackbar(`${newTheme === 'dark' ? 'Dark' : 'Light'} mode activated`, 'success');
}

// Add theme toggle button with proper styling
function addThemeToggle() {
    const userMenu = document.querySelector('.user-menu');
    if (userMenu && !document.querySelector('.theme-toggle')) {
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'theme-toggle';
        toggleBtn.onclick = toggleTheme;
        toggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
        toggleBtn.style.cssText = `
            background: #f0f0f0;
            border: none;
            cursor: pointer;
            padding: 0;
            margin-right: 10px;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        `;
        userMenu.insertBefore(toggleBtn, userMenu.firstChild);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initTheme();
        addThemeToggle();
    });
} else {
    initTheme();
    addThemeToggle();
}
