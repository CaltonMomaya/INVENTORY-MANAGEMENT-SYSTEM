"""Transaction Controller - Handles all stock transaction logic"""
from app import db
from app.models.transaction import Transaction
from app.models.product import Product
from app.models.category import Category
from app.models.supplier import Supplier

class TransactionController:
    """Separates transaction logic from routes"""
    
    @staticmethod
    def add_stock(product_id, quantity, reference, notes, user_id):
        """Add stock logic"""
        product = Product.query.get(product_id)
        if not product:
            return None, {'error': 'Product not found'}, 404
        
        if quantity <= 0:
            return None, {'error': 'Quantity must be greater than 0'}, 400
        
        transaction = Transaction(
            transaction_type='in',
            quantity=quantity,
            reference=reference,
            notes=notes,
            product_id=product.id,
            user_id=user_id
        )
        
        product.quantity += quantity
        
        db.session.add(transaction)
        db.session.commit()
        
        return {
            'message': 'Stock added successfully',
            'transaction': transaction.to_dict(),
            'product': product.to_dict()
        }, None, 201
    
    @staticmethod
    def remove_stock(product_id, quantity, reference, notes, user_id):
        """Remove stock logic"""
        product = Product.query.get(product_id)
        if not product:
            return None, {'error': 'Product not found'}, 404
        
        if quantity <= 0:
            return None, {'error': 'Quantity must be greater than 0'}, 400
        
        if product.quantity < quantity:
            return None, {'error': 'Insufficient stock'}, 400
        
        transaction = Transaction(
            transaction_type='out',
            quantity=quantity,
            reference=reference,
            notes=notes,
            product_id=product.id,
            user_id=user_id
        )
        
        product.quantity -= quantity
        
        db.session.add(transaction)
        db.session.commit()
        
        return {
            'message': 'Stock removed successfully',
            'transaction': transaction.to_dict(),
            'product': product.to_dict()
        }, None, 201
    
    @staticmethod
    def get_transaction_history(filters=None):
        """Get transaction history"""
        query = Transaction.query
        
        if filters:
            if filters.get('product_id'):
                query = query.filter_by(product_id=filters['product_id'])
            if filters.get('transaction_type'):
                query = query.filter_by(transaction_type=filters['transaction_type'])
        
        transactions = query.order_by(Transaction.created_at.desc()).all()
        return {'transactions': [t.to_dict() for t in transactions]}, 200
    
    @staticmethod
    def get_dashboard_stats():
        """Get dashboard statistics"""
        total_products = Product.query.count()
        total_suppliers = Supplier.query.count()
        total_categories = Category.query.count()
        low_stock = Product.query.filter(Product.quantity <= Product.reorder_level).count()
        
        return {
            'sales_overview': {
                'sales': 832,
                'revenue': 18300,
                'profit': 868,
                'cost': 17432
            },
            'inventory_summary': {
                'quantity_in_hand': sum(p.quantity for p in Product.query.all()),
                'to_be_received': 200
            },
            'product_summary': {
                'number_of_suppliers': total_suppliers,
                'number_of_categories': total_categories
            },
            'total_products': total_products,
            'low_stock_products': low_stock
        }, 200
