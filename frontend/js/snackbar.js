// Snackbar/Toast Notification System
function showSnackbar(message, type = 'success') {
    // Remove existing snackbar if any
    const existingSnackbar = document.querySelector('.snackbar');
    if (existingSnackbar) {
        existingSnackbar.remove();
    }
    
    // Create snackbar element
    const snackbar = document.createElement('div');
    snackbar.className = `snackbar snackbar-${type}`;
    snackbar.innerHTML = `
        <div class="snackbar-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : (type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle')}"></i>
            <span>${message}</span>
            <button class="snackbar-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
        </div>
    `;
    
    // Add styles
    snackbar.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        min-width: 300px;
        max-width: 400px;
        background: ${type === 'success' ? '#10b981' : (type === 'error' ? '#ef4444' : '#3b82f6')};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 100000;
        animation: slideInRight 0.3s ease;
        font-family: 'Inter', sans-serif;
    `;
    
    snackbar.querySelector('.snackbar-content').style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 20px;
    `;
    
    snackbar.querySelector('.snackbar-close').style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        margin-left: auto;
        padding: 0 4px;
    `;
    
    document.body.appendChild(snackbar);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        if (snackbar && snackbar.parentElement) {
            snackbar.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => snackbar.remove(), 300);
        }
    }, 4000);
}

// Add CSS animations
const snackbarStyles = document.createElement('style');
snackbarStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(snackbarStyles);

// Override alert with snackbar
window.originalAlert = window.alert;
window.alert = function(message) {
    showSnackbar(message, 'info');
};

// Override confirm with custom modal
window.customConfirm = function(message, onConfirm, onCancel) {
    const modal = document.createElement('div');
    modal.className = 'custom-confirm-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100001;
        backdrop-filter: blur(4px);
    `;
    
    modal.innerHTML = `
        <div class="custom-confirm-content" style="
            background: white;
            border-radius: 16px;
            padding: 24px;
            max-width: 400px;
            width: 90%;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            animation: modalSlideIn 0.2s ease;
        ">
            <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
            <h3 style="margin-bottom: 12px; color: #1f2937;">Confirm Action</h3>
            <p style="margin-bottom: 24px; color: #6b7280;">${message}</p>
            <div style="display: flex; gap: 12px; justify-content: center;">
                <button class="confirm-cancel" style="
                    padding: 10px 20px;
                    background: #e5e7eb;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 500;
                ">Cancel</button>
                <button class="confirm-ok" style="
                    padding: 10px 20px;
                    background: #2f6fed;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 500;
                ">OK</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.confirm-cancel').onclick = () => {
        modal.remove();
        if (onCancel) onCancel();
    };
    
    modal.querySelector('.confirm-ok').onclick = () => {
        modal.remove();
        if (onConfirm) onConfirm();
    };
    
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
            if (onCancel) onCancel();
        }
    };
}

// Add modal animation styles
const modalStyles = document.createElement('style');
modalStyles.textContent = `
    @keyframes modalSlideIn {
        from {
            transform: translateY(-50px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
    
    body.dark-mode .custom-confirm-content {
        background: #1e1e1e !important;
    }
    
    body.dark-mode .custom-confirm-content h3 {
        color: #ffffff !important;
    }
    
    body.dark-mode .custom-confirm-content p {
        color: #aaaaaa !important;
    }
    
    body.dark-mode .confirm-cancel {
        background: #333333 !important;
        color: #ffffff !important;
    }
`;
document.head.appendChild(modalStyles);

console.log('Snackbar system loaded - alerts replaced with toast notifications');
