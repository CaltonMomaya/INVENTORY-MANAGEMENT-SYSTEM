// Sell Product with Custom Prompt
async function sellProduct(productId) {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin' && userRole !== 'manager') {
        showSnackbar('Only managers and admins can process sales', 'error');
        return;
    }
    
    showQuantityPrompt('Sell Product', '1', async (quantity) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/transactions/out`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    product_id: productId,
                    quantity: quantity,
                    reference: `SALE-${Date.now()}`,
                    notes: 'Product sold to customer'
                })
            });
            
            if (response.ok) {
                showSnackbar(`Sold ${quantity} units successfully!`, 'success');
                if (typeof loadInventory === 'function') loadInventory();
                if (typeof loadDashboard === 'function') loadDashboard();
                if (typeof addNotification === 'function') addNotification(`Sold ${quantity} units`, 'sale');
                if (typeof loadOrders === 'function') loadOrders();
            } else {
                const data = await response.json();
                showSnackbar(data.error || 'Failed to process sale', 'error');
            }
        } catch (error) {
            showSnackbar('Connection error. Make sure backend is running.', 'error');
        }
    });
}

// Also update addStock and removeStock to use custom prompt
async function addStock(productId) {
    showQuantityPrompt('Add Stock', '1', async (quantity) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/transactions/in`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    product_id: productId,
                    quantity: quantity,
                    reference: `PO-${Date.now()}`,
                    notes: 'Stock added'
                })
            });
            
            if (response.ok) {
                showSnackbar(`Added ${quantity} units successfully!`, 'success');
                if (typeof loadInventory === 'function') loadInventory();
                if (typeof loadDashboard === 'function') loadDashboard();
            } else {
                showSnackbar('Failed to add stock', 'error');
            }
        } catch (error) {
            showSnackbar('Connection error', 'error');
        }
    });
}

async function removeStock(productId) {
    showQuantityPrompt('Remove Stock', '1', async (quantity) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/transactions/out`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    product_id: productId,
                    quantity: quantity,
                    reference: `ADJ-${Date.now()}`,
                    notes: 'Stock adjustment'
                })
            });
            
            if (response.ok) {
                showSnackbar(`Removed ${quantity} units successfully!`, 'success');
                if (typeof loadInventory === 'function') loadInventory();
                if (typeof loadDashboard === 'function') loadDashboard();
            } else {
                showSnackbar('Failed to remove stock', 'error');
            }
        } catch (error) {
            showSnackbar('Connection error', 'error');
        }
    });
}
