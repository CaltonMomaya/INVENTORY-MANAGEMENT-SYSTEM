// Session Timeout Management
console.log('Session timeout manager loaded');

let inactivityTimer;
const INACTIVITY_LIMIT = 10000; // 10 seconds (10000 milliseconds)
let warningTimer;
let countdownInterval;

// Events that reset the timer
const resetEvents = [
    'mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart',
    'click', 'keydown', 'keyup', 'wheel', 'touchmove'
];

// Function to show timeout warning
function showTimeoutWarning() {
    // Don't show warning if already logged out or on auth screen
    if (!localStorage.getItem('token')) return;
    
    const warningModal = document.createElement('div');
    warningModal.id = 'timeout-warning-modal';
    warningModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 20000;
        backdrop-filter: blur(5px);
    `;
    
    let countdown = 5;
    
    warningModal.innerHTML = `
        <div style="
            background: white;
            border-radius: 16px;
            padding: 32px;
            max-width: 400px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            animation: slideDown 0.3s ease;
        ">
            <div style="font-size: 48px; margin-bottom: 16px;">⏰</div>
            <h2 style="margin-bottom: 12px; color: #1f2937;">Session Timeout</h2>
            <p style="margin-bottom: 20px; color: #6b7280;">
                You have been inactive for 10 seconds.
            </p>
            <p style="margin-bottom: 24px; font-size: 24px; font-weight: bold; color: #ef4444;" id="countdown-timer">
                Logging out in ${countdown} seconds...
            </p>
            <button id="stay-logged-in-btn" class="btn-primary" style="width: 100%; padding: 12px;">
                <i class="fas fa-clock"></i> Stay Logged In
            </button>
        </div>
    `;
    
    document.body.appendChild(warningModal);
    
    // Countdown timer
    countdownInterval = setInterval(() => {
        countdown--;
        const timerElement = document.getElementById('countdown-timer');
        if (timerElement) {
            timerElement.textContent = `Logging out in ${countdown} seconds...`;
        }
        
        if (countdown <= 0) {
            clearInterval(countdownInterval);
            logoutUser();
        }
    }, 1000);
    
    // Stay logged in button
    document.getElementById('stay-logged-in-btn').addEventListener('click', () => {
        clearInterval(countdownInterval);
        warningModal.remove();
        resetInactivityTimer();
        // Show confirmation
        const toast = document.createElement('div');
        toast.textContent = '✅ Session extended!';
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 20001;
            animation: fadeOut 2s ease;
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    });
}

// Function to logout user
function logoutUser() {
    // Clear all intervals
    if (countdownInterval) clearInterval(countdownInterval);
    
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('theme');
    localStorage.removeItem('notifications');
    
    // Remove any modals
    const warningModal = document.getElementById('timeout-warning-modal');
    if (warningModal) warningModal.remove();
    
    // Show logout message
    const logoutMessage = document.createElement('div');
    logoutMessage.textContent = '⏰ Session expired. Redirecting to login...';
    logoutMessage.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #1f2937;
        color: white;
        padding: 20px 40px;
        border-radius: 12px;
        z-index: 20002;
        font-size: 18px;
        text-align: center;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(logoutMessage);
    
    // Redirect to login after 1 second
    setTimeout(() => {
        window.location.href = '/';
    }, 1000);
}

// Reset the inactivity timer
function resetInactivityTimer() {
    // Clear existing timer
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
    }
    
    // Don't set timer if not logged in or on auth screen
    if (!localStorage.getItem('token')) return;
    if (document.getElementById('auth-screen') && document.getElementById('auth-screen').style.display !== 'none') return;
    
    // Set new timer
    inactivityTimer = setTimeout(() => {
        console.log('User inactive for 10 seconds - showing warning');
        showTimeoutWarning();
    }, INACTIVITY_LIMIT);
}

// Add event listeners for user activity
function initSessionTimeout() {
    console.log('Session timeout initialized - 10 seconds inactivity limit');
    
    // Reset timer on user activity
    resetEvents.forEach(event => {
        document.addEventListener(event, resetInactivityTimer);
    });
    
    // Also reset when page becomes visible again
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            resetInactivityTimer();
        }
    });
    
    // Initial timer start
    resetInactivityTimer();
    
    // Check for token on page load
    if (localStorage.getItem('token')) {
        resetInactivityTimer();
    }
}

// Watch for dashboard screen to become visible
const sessionObserver = new MutationObserver(() => {
    const dashboardScreen = document.getElementById('dashboard-screen');
    if (dashboardScreen && dashboardScreen.style.display !== 'none') {
        console.log('Dashboard active - session timeout running');
        resetInactivityTimer();
    }
});

sessionObserver.observe(document.body, { attributes: true, subtree: true });

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSessionTimeout);
} else {
    initSessionTimeout();
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-50px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    @keyframes fadeOut {
        0% { opacity: 1; }
        70% { opacity: 1; }
        100% { opacity: 0; visibility: hidden; }
    }
`;
document.head.appendChild(style);

console.log('Session timeout ready - Will logout after 10 seconds of inactivity');
