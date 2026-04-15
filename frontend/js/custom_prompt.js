// Custom Prompt Modal for Quantity Input
function showQuantityPrompt(title, defaultValue = '1', onConfirm) {
    const modal = document.createElement('div');
    modal.className = 'custom-prompt-modal';
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
        z-index: 100002;
        backdrop-filter: blur(4px);
    `;
    
    modal.innerHTML = `
        <div class="custom-prompt-content" style="
            background: white;
            border-radius: 16px;
            padding: 28px;
            max-width: 400px;
            width: 90%;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            animation: modalSlideIn 0.2s ease;
        ">
            <div style="font-size: 48px; margin-bottom: 16px;">📦</div>
            <h3 style="margin-bottom: 12px; color: #1f2937;">${title}</h3>
            <p style="margin-bottom: 20px; color: #6b7280;">Please enter the quantity:</p>
            <input type="number" id="quantity-input" class="quantity-input" value="${defaultValue}" min="1" step="1" style="
                width: 100%;
                padding: 12px;
                font-size: 16px;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                margin-bottom: 20px;
                text-align: center;
            ">
            <div style="display: flex; gap: 12px; justify-content: center;">
                <button class="prompt-cancel" style="
                    padding: 10px 24px;
                    background: #e5e7eb;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 500;
                ">Cancel</button>
                <button class="prompt-confirm" style="
                    padding: 10px 24px;
                    background: #2f6fed;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 500;
                ">Confirm</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const input = modal.querySelector('#quantity-input');
    input.focus();
    input.select();
    
    modal.querySelector('.prompt-cancel').onclick = () => {
        modal.remove();
    };
    
    modal.querySelector('.prompt-confirm').onclick = () => {
        const quantity = parseInt(input.value);
        if (quantity && quantity > 0) {
            modal.remove();
            onConfirm(quantity);
        } else {
            showSnackbar('Please enter a valid quantity', 'error');
        }
    };
    
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    };
    
    // Enter key support
    input.onkeypress = (e) => {
        if (e.key === 'Enter') {
            modal.querySelector('.prompt-confirm').click();
        }
    };
}

// Dark mode styles for prompt
const promptStyles = document.createElement('style');
promptStyles.textContent = `
    body.dark-mode .custom-prompt-content {
        background: #1e1e1e !important;
    }
    body.dark-mode .custom-prompt-content h3 {
        color: #ffffff !important;
    }
    body.dark-mode .custom-prompt-content p {
        color: #aaaaaa !important;
    }
    body.dark-mode .quantity-input {
        background: #2d2d2d !important;
        color: #ffffff !important;
        border-color: #444444 !important;
    }
    body.dark-mode .prompt-cancel {
        background: #333333 !important;
        color: #ffffff !important;
    }
`;
document.head.appendChild(promptStyles);

console.log('Custom prompt loaded - replaces browser prompt for quantity');
