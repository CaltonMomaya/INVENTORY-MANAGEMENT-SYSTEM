async function sellProduct(productId) {
    const quantity = prompt('Enter quantity to sell:', '1');
    if (!quantity || quantity <= 0) return;
    
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (userRole !== 'admin' && userRole !== 'manager') {
        alert('Only managers and admins can process sales');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/transactions/out`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                product_id: productId,
                quantity: parseInt(quantity),
                reference: `SALE-${Date.now()}`,
                notes: 'Product sold to customer'
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert(`✅ Sold ${quantity} units successfully!`);
            // Refresh all relevant data
            if (typeof loadInventory === 'function') loadInventory();
            if (typeof loadDashboard === 'function') loadDashboard();
            if (typeof loadTopSellingProducts === 'function') loadTopSellingProducts();
            // Add notification
            addNotification(`Sold ${quantity} units of product`, 'sale');
        } else {
            alert(data.error || 'Failed to process sale');
        }
    } catch (error) {
        console.error('Error selling product:', error);
        alert('Connection error. Make sure backend is running.');
    }
}
