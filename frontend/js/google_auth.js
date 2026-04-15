// Google OAuth Integration - Real Google Sign-In
function initGoogleSignIn() {
    // Load Google Identity Services library
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    
    script.onload = () => {
        // Initialize Google Identity Services
        window.google.accounts.id.initialize({
            client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com', // Replace with your actual client ID
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
        });
        
        // Render the Google Sign-In button
        const googleBtns = document.querySelectorAll('.btn-google');
        googleBtns.forEach((btn, index) => {
            // Replace existing button with Google button
            const parent = btn.parentElement;
            const wrapper = document.createElement('div');
            wrapper.id = `google-btn-wrapper-${index}`;
            wrapper.style.display = 'flex';
            wrapper.style.justifyContent = 'center';
            wrapper.style.marginTop = '10px';
            btn.style.display = 'none';
            parent.insertBefore(wrapper, btn.nextSibling);
            
            window.google.accounts.id.renderButton(
                wrapper,
                { 
                    theme: 'outline',
                    size: 'large',
                    width: '100%',
                    text: 'signin_with',
                    shape: 'rectangular',
                    logo_alignment: 'center'
                }
            );
        });
    };
}

// Handle Google credential response
async function handleGoogleCredentialResponse(response) {
    const id_token = response.credential;
    
    // Decode the JWT token to get user info
    const decodedToken = parseJwt(id_token);
    
    const userData = {
        name: decodedToken.name,
        email: decodedToken.email,
        picture: decodedToken.picture,
        google_id: decodedToken.sub
    };
    
    showSnackbar(`Welcome ${userData.name}! Signing in with Google...`, 'info');
    
    // Send to your backend for authentication
    try {
        const backendResponse = await fetch(`${API_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: userData.email,
                name: userData.name,
                google_id: userData.google_id,
                picture: userData.picture
            })
        });
        
        const data = await backendResponse.json();
        
        if (backendResponse.ok) {
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('userRole', data.user.role);
            localStorage.setItem('userName', data.user.name);
            localStorage.setItem('userEmail', data.user.email);
            localStorage.setItem('userId', data.user.id);
            localStorage.setItem('profileImage', userData.picture);
            showSnackbar(`Welcome ${userData.name}!`, 'success');
            window.location.reload();
        } else {
            showSnackbar(data.error || 'Google sign-in failed', 'error');
        }
    } catch (error) {
        showSnackbar('Connection error. Please try again.', 'error');
    }
}

// Helper function to parse JWT token
function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGoogleSignIn);
} else {
    initGoogleSignIn();
}
