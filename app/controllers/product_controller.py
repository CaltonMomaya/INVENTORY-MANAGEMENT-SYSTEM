"""Product Controller - Handles all product business logic"""
from app import db
from app.models.product import Product
from app.models.category import Category
from app.models.supplier import Supplier

class ProductController:
    """Separates product logic from routes"""
    
    @staticmethod
    def get_all_products(filters=None):
        """Get products with filters"""
        query = Product.query
        
        if filters:
            if filters.get('category_id'):
                query = query.filter_by(category_id=filters['category_id'])
            if filters.get('supplier_id'):
                query = query.filter_by(supplier_id=filters['supplier_id'])
            if filters.get('low_stock'):
                query = query.filter(Product.quantity <= Product.reorder_level)
            if filters.get('search'):
                query = query.filter(Product.name.ilike(f"%{filters['search']}%"))
        
        products = query.all()
        return {'products': [p.to_dict() for p in products]}, 200
    
    @staticmethod
    def get_product_by_id(product_id):
        """Get single product"""
        product = Product.query.get(product_id)
        if not product:
            return None, {'error': 'Product not found'}, 404
        return {'product': product.to_dict()}, None, 200
    
    @staticmethod
    def create_product(data):
        """Create new product logic"""
        # Check duplicate SKU
        if Product.query.filter_by(sku=data['sku']).first():
            return None, {'error': 'Product with this SKU already exists'}, 409
        
        # Validate category
        if data.get('category_id'):
            category = Category.query.get(data['category_id'])
            if not category:
                return None, {'error': 'Category not found'}, 404
        
        # Validate supplier
        if data.get('supplier_id'):
            supplier = Supplier.query.get(data['supplier_id'])
            if not supplier:
                return None, {'error': 'Supplier not found'}, 404
        
        # Create product
        product = Product(
            name=data['name'],
            sku=data['sku'],
            description=data.get('description'),
            quantity=data.get('quantity', 0),
            price=data['price'],
            cost=data['cost'],
            reorder_level=data.get('reorder_level', 10),
            category_id=data.get('category_id'),
            supplier_id=data.get('supplier_id')
        )
        
        db.session.add(product)
        db.session.commit()
        
        return {
            'message': 'Product created successfully',
            'product': product.to_dict()
        }, None, 201
    
    @staticmethod
    def update_product(product_id, data):
        """Update product logic"""
        product = Product.query.get(product_id)
        if not product:
            return None, {'error': 'Product not found'}, 404
        
        # Update fields
        if 'name' in data:
            product.name = data['name']
        if 'sku' in data and data['sku'] != product.sku:
            if Product.query.filter_by(sku=data['sku']).first():
                return None, {'error': 'SKU already exists'}, 409
            product.sku = data['sku']
        if 'quantity' in data:
            product.quantity = data['quantity']
        if 'price' in data:
            product.price = data['price']
        if 'cost' in data:
            product.cost = data['cost']
        if 'reorder_level' in data:
            product.reorder_level = data['reorder_level']
        if 'category_id' in data:
            product.category_id = data['category_id']
        if 'supplier_id' in data:
            product.supplier_id = data['supplier_id']
        
        db.session.commit()
        
        return {
            'message': 'Product updated successfully',
            'product': product.to_dict()
        }, None, 200
    
    @staticmethod
    def delete_product(product_id):
        """Delete product logic"""
        product = Product.query.get(product_id)
        if not product:
            return None, {'error': 'Product not found'}, 404
        
        if product.transactions:
            return None, {'error': 'Cannot delete product with transactions'}, 400
        
        db.session.delete(product)
        db.session.commit()
        
        return {'message': 'Product deleted successfully'}, None, 200
