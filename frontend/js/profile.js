// Profile Picture Management - Per User Account
function loadUserProfile() {
    const userName = localStorage.getItem('userName') || 'User';
    const userRole = localStorage.getItem('userRole') || 'user';
    const userEmail = localStorage.getItem('userEmail') || '';
    const userId = localStorage.getItem('userId') || '1';
    
    // Update user name display
    const userNameSpan = document.getElementById('user-name');
    if (userNameSpan) {
        userNameSpan.textContent = userName;
    }
    
    // Update user role display
    const userRoleSpan = document.getElementById('user-role');
    if (userRoleSpan) {
        userRoleSpan.textContent = userRole.toUpperCase();
        userRoleSpan.className = `role-badge role-${userRole}`;
    }
    
    // Load profile picture from localStorage (per user)
    const profileKey = `profileImage_${userId}`;
    const savedImage = localStorage.getItem(profileKey);
    const avatarImg = document.querySelector('.user-avatar img');
    if (avatarImg && savedImage) {
        avatarImg.src = savedImage;
    } else if (avatarImg) {
        // Generate avatar from initials
        const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        avatarImg.src = `https://ui-avatars.com/api/?name=${initials}&background=2f6fed&color=fff&size=40&bold=true`;
    }
}

// Setup profile picture upload (per user)
function setupProfileUpload() {
    const avatarContainer = document.querySelector('.user-avatar');
    if (!avatarContainer) return;
    
    // Make avatar clickable
    avatarContainer.style.cursor = 'pointer';
    avatarContainer.title = 'Click to change profile picture';
    
    avatarContainer.onclick = () => {
        // Create modal for profile picture options
        const modal = document.createElement('div');
        modal.className = 'profile-modal';
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
            z-index: 100003;
            backdrop-filter: blur(4px);
        `;
        
        const userId = localStorage.getItem('userId') || '1';
        const profileKey = `profileImage_${userId}`;
        const currentImage = localStorage.getItem(profileKey);
        
        modal.innerHTML = `
            <div class="profile-modal-content" style="
                background: white;
                border-radius: 16px;
                padding: 28px;
                max-width: 400px;
                width: 90%;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                animation: modalSlideIn 0.2s ease;
            ">
                <div style="font-size: 48px; margin-bottom: 16px;">🖼️</div>
                <h3 style="margin-bottom: 12px; color: #1f2937;">Profile Picture</h3>
                <div style="margin-bottom: 20px;">
                    <img src="${currentImage || 'https://ui-avatars.com/api/?name=User&background=2f6fed&color=fff&size=100'}" 
                         style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; margin-bottom: 10px;" 
                         id="preview-image">
                </div>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <button id="upload-photo-btn" style="
                        padding: 10px 20px;
                        background: #2f6fed;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 500;
                    ">Upload New Photo</button>
                    ${currentImage ? `<button id="delete-photo-btn" style="
                        padding: 10px 20px;
                        background: #ef4444;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 500;
                    ">Delete Photo</button>` : ''}
                    <button id="close-profile-modal" style="
                        padding: 10px 20px;
                        background: #e5e7eb;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 500;
                    ">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Upload photo
        modal.querySelector('#upload-photo-btn')?.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const imgData = event.target.result;
                        localStorage.setItem(`profileImage_${userId}`, imgData);
                        document.querySelector('.user-avatar img').src = imgData;
                        modal.querySelector('#preview-image').src = imgData;
                        showSnackbar('Profile picture updated!', 'success');
                        
                        // Show delete button if not present
                        if (!modal.querySelector('#delete-photo-btn')) {
                            const deleteBtn = document.createElement('button');
                            deleteBtn.id = 'delete-photo-btn';
                            deleteBtn.textContent = 'Delete Photo';
                            deleteBtn.style.cssText = `
                                padding: 10px 20px;
                                background: #ef4444;
                                color: white;
                                border: none;
                                border-radius: 8px;
                                cursor: pointer;
                                font-weight: 500;
                            `;
                            deleteBtn.onclick = () => deletePhoto(userId, modal);
                            modal.querySelector('div[style*="flex-direction: column"]').appendChild(deleteBtn);
                        }
                    };
                    reader.readAsDataURL(file);
                }
            };
            input.click();
        });
        
        // Delete photo
        const deleteBtn = modal.querySelector('#delete-photo-btn');
        if (deleteBtn) {
            deleteBtn.onclick = () => deletePhoto(userId, modal);
        }
        
        // Close modal
        modal.querySelector('#close-profile-modal').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    };
}

function deletePhoto(userId, modal) {
    localStorage.removeItem(`profileImage_${userId}`);
    const initials = (localStorage.getItem('userName') || 'User').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    document.querySelector('.user-avatar img').src = `https://ui-avatars.com/api/?name=${initials}&background=2f6fed&color=fff&size=40&bold=true`;
    showSnackbar('Profile picture deleted!', 'success');
    modal.remove();
}

// Initialize profile on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        loadUserProfile();
        setupProfileUpload();
    });
} else {
    loadUserProfile();
    setupProfileUpload();
}
