"""Transaction Routes - Only endpoint definitions"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.controllers.transaction_controller import TransactionController
from app.utils.decorators import manager_required

bp = Blueprint('transactions', __name__)

@bp.route('/in', methods=['POST'])
@manager_required
def add_stock():
    """Add stock to product"""
    data = request.get_json()
    user_id = get_jwt_identity()
    
    if not data.get('product_id') or not data.get('quantity'):
        return jsonify({'error': 'Product ID and quantity required'}), 400
    
    response, error, status = TransactionController.add_stock(
        product_id=data['product_id'],
        quantity=data['quantity'],
        reference=data.get('reference'),
        notes=data.get('notes'),
        user_id=int(user_id)
    )
    
    if error:
        return jsonify(error), status
    return jsonify(response), status

@bp.route('/out', methods=['POST'])
@manager_required
def remove_stock():
    """Remove stock from product"""
    data = request.get_json()
    user_id = get_jwt_identity()
    
    if not data.get('product_id') or not data.get('quantity'):
        return jsonify({'error': 'Product ID and quantity required'}), 400
    
    response, error, status = TransactionController.remove_stock(
        product_id=data['product_id'],
        quantity=data['quantity'],
        reference=data.get('reference'),
        notes=data.get('notes'),
        user_id=int(user_id)
    )
    
    if error:
        return jsonify(error), status
    return jsonify(response), status

@bp.route('', methods=['GET'])
@jwt_required()
def get_transactions():
    """Get transaction history"""
    filters = {
        'product_id': request.args.get('product_id', type=int),
        'transaction_type': request.args.get('type', type=str)
    }
    response, status = TransactionController.get_transaction_history(filters)
    return jsonify(response), status

@bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard():
    """Get dashboard statistics"""
    response, status = TransactionController.get_dashboard_stats()
    return jsonify(response), status
