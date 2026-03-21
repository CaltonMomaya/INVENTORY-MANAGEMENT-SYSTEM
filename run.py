from app import create_app, db
from app.models.user import User
from app.models.product import Product
from app.models.category import Category
from app.models.supplier import Supplier

app = create_app()

@app.cli.command('init-db')
def init_db():
    """Initialize the database with tables and sample data"""
    db.create_all()
    
    # Create admin user if not exists
    if not User.query.filter_by(email='admin@kanban.com').first():
        from app import bcrypt
        admin = User(
            name='Admin User',
            email='admin@kanban.com',
            password_hash=bcrypt.generate_password_hash('admin123').decode('utf-8'),
            role='admin'
        )
        db.session.add(admin)
    
    # Create sample categories
    categories = [
        Category(name='Electronics', description='Electronic devices and accessories'),
        Category(name='Groceries', description='Food and household items'),
        Category(name='Clothing', description='Apparel and fashion items')
    ]
    
    for category in categories:
        if not Category.query.filter_by(name=category.name).first():
            db.session.add(category)
    
    # Create sample suppliers
    suppliers = [
        Supplier(name='Tech Distributors Inc.', contact_person='John Smith', email='john@techdist.com', phone='+1234567890'),
        Supplier(name='Global Foods Ltd.', contact_person='Sarah Johnson', email='sarah@globalfoods.com', phone='+1234567891'),
        Supplier(name='Fashion Hub', contact_person='Mike Brown', email='mike@fashionhub.com', phone='+1234567892')
    ]
    
    for supplier in suppliers:
        if not Supplier.query.filter_by(name=supplier.name).first():
            db.session.add(supplier)
    
    db.session.commit()
    
    # Create sample products if none exist
    if Product.query.count() == 0:
        electronics = Category.query.filter_by(name='Electronics').first()
        groceries = Category.query.filter_by(name='Groceries').first()
        clothing = Category.query.filter_by(name='Clothing').first()
        
        tech_supplier = Supplier.query.filter_by(name='Tech Distributors Inc.').first()
        food_supplier = Supplier.query.filter_by(name='Global Foods Ltd.').first()
        fashion_supplier = Supplier.query.filter_by(name='Fashion Hub').first()
        
        products = [
            Product(name='Surf Excel', sku='SURF001', quantity=50, price=45.00, cost=38.00, reorder_level=10, category_id=groceries.id if groceries else None, supplier_id=food_supplier.id if food_supplier else None),
            Product(name='Rin', sku='RIN001', quantity=35, price=40.00, cost=32.00, reorder_level=10, category_id=groceries.id if groceries else None, supplier_id=food_supplier.id if food_supplier else None),
            Product(name='Parle G', sku='PARLE001', quantity=100, price=10.00, cost=8.00, reorder_level=20, category_id=groceries.id if groceries else None, supplier_id=food_supplier.id if food_supplier else None),
            Product(name='Tata Salt', sku='TATA001', quantity=8, price=25.00, cost=20.00, reorder_level=10, category_id=groceries.id if groceries else None, supplier_id=food_supplier.id if food_supplier else None),
            Product(name='Lays', sku='LAYS001', quantity=12, price=20.00, cost=15.00, reorder_level=10, category_id=groceries.id if groceries else None, supplier_id=food_supplier.id if food_supplier else None),
            Product(name='Smartphone', sku='PHONE001', quantity=25, price=15000.00, cost=12000.00, reorder_level=5, category_id=electronics.id if electronics else None, supplier_id=tech_supplier.id if tech_supplier else None),
            Product(name='Laptop', sku='LAPTOP001', quantity=15, price=45000.00, cost=35000.00, reorder_level=3, category_id=electronics.id if electronics else None, supplier_id=tech_supplier.id if tech_supplier else None),
            Product(name='T-Shirt', sku='TSHIRT001', quantity=40, price=500.00, cost=350.00, reorder_level=10, category_id=clothing.id if clothing else None, supplier_id=fashion_supplier.id if fashion_supplier else None)
        ]
        
        for product in products:
            db.session.add(product)
        
        db.session.commit()
    
    print("Database initialized successfully!")

if __name__ == '__main__':
    app.run(debug=True)
