from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.transaction import Transaction
from app.models.product import Product
from app.models.category import Category
from app.models.supplier import Supplier
from app.utils.decorators import manager_required

bp = Blueprint('transactions', __name__)

@bp.route('', methods=['GET'])
@jwt_required()
def get_transactions():
    """Get all transactions"""
    transactions = Transaction.query.order_by(Transaction.created_at.desc()).all()
    return jsonify({'transactions': [t.to_dict() for t in transactions]}), 200

@bp.route('/in', methods=['POST'])
@manager_required
def add_stock():
    """Add stock to a product (stock in)"""
    data = request.get_json()
    current_user_id = get_jwt_identity()
    
    if not data.get('product_id') or not data.get('quantity'):
        return jsonify({'error': 'Product ID and quantity are required'}), 400
    
    product = Product.query.get_or_404(data['product_id'])
    quantity = data['quantity']
    
    if quantity <= 0:
        return jsonify({'error': 'Quantity must be greater than 0'}), 400
    
    transaction = Transaction(
        transaction_type='in',
        quantity=quantity,
        reference=data.get('reference'),
        notes=data.get('notes'),
        product_id=product.id,
        user_id=current_user_id
    )
    
    product.quantity += quantity
    
    db.session.add(transaction)
    db.session.commit()
    
    return jsonify({
        'message': 'Stock added successfully',
        'transaction': transaction.to_dict(),
        'product': product.to_dict()
    }), 201

@bp.route('/out', methods=['POST'])
@manager_required
def remove_stock():
    """Remove stock from a product (stock out)"""
    data = request.get_json()
    current_user_id = get_jwt_identity()
    
    if not data.get('product_id') or not data.get('quantity'):
        return jsonify({'error': 'Product ID and quantity are required'}), 400
    
    product = Product.query.get_or_404(data['product_id'])
    quantity = data['quantity']
    
    if quantity <= 0:
        return jsonify({'error': 'Quantity must be greater than 0'}), 400
    
    if product.quantity < quantity:
        return jsonify({'error': 'Insufficient stock'}), 400
    
    transaction = Transaction(
        transaction_type='out',
        quantity=quantity,
        reference=data.get('reference'),
        notes=data.get('notes'),
        product_id=product.id,
        user_id=current_user_id
    )
    
    product.quantity -= quantity
    
    db.session.add(transaction)
    db.session.commit()
    
    return jsonify({
        'message': 'Stock removed successfully',
        'transaction': transaction.to_dict(),
        'product': product.to_dict()
    }), 201

@bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard():
    """Get dashboard statistics"""
    total_products = Product.query.count()
    total_suppliers = Supplier.query.count()
    total_categories = Category.query.count()
    low_stock = Product.query.filter(Product.quantity <= Product.reorder_level).count()
    
    return jsonify({
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
    }), 200
