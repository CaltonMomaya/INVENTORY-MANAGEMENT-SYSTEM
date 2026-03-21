-- Show all tables
.tables

-- Show schema
.schema users
.schema products
.schema categories
.schema suppliers
.schema transactions

-- Show data
SELECT '========== USERS ==========' as '';
SELECT id, name, email, role, is_active FROM users;

SELECT '========== PRODUCTS ==========' as '';
SELECT id, name, sku, quantity, price, reorder_level FROM products;

SELECT '========== CATEGORIES ==========' as '';
SELECT * FROM categories;

SELECT '========== SUPPLIERS ==========' as '';
SELECT * FROM suppliers;

SELECT '========== TRANSACTIONS (last 5) ==========' as '';
SELECT id, transaction_type, quantity, product_id, user_id, created_at FROM transactions ORDER BY created_at DESC LIMIT 5;

SELECT '========== STATISTICS ==========' as '';
SELECT 
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM products) as total_products,
    (SELECT COUNT(*) FROM categories) as total_categories,
    (SELECT COUNT(*) FROM suppliers) as total_suppliers,
    (SELECT SUM(quantity) FROM products) as total_inventory,
    (SELECT COUNT(*) FROM products WHERE quantity <= reorder_level) as low_stock_count;
