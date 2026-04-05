"""Product Routes - With Full Pagination Support"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models.product import Product
from app.utils.decorators import manager_required, admin_required

bp = Blueprint('products', __name__)

@bp.route('', methods=['GET'])
@jwt_required()
def get_products():
    """Get all products with pagination and filtering"""
    # Get pagination parameters
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    # Get filter parameters
    search = request.args.get('search', type=str)
    category_id = request.args.get('category_id', type=int)
    supplier_id = request.args.get('supplier_id', type=int)
    low_stock = request.args.get('low_stock', type=bool)
    
    # Build query
    query = Product.query
    
    # Apply filters
    if search:
        query = query.filter(Product.name.ilike(f'%{search}%'))
    if category_id:
        query = query.filter_by(category_id=category_id)
    if supplier_id:
        query = query.filter_by(supplier_id=supplier_id)
    if low_stock:
        query = query.filter(Product.quantity <= Product.reorder_level)
    
    # Order by ID
    query = query.order_by(Product.id)
    
    # Paginate
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    # Return response with pagination metadata
    return jsonify({
        'products': [p.to_dict() for p in pagination.items],
        'pagination': {
            'total': pagination.total,
            'page': page,
            'per_page': per_page,
            'pages': pagination.pages,
            'has_prev': pagination.has_prev,
            'has_next': pagination.has_next,
            'prev_num': pagination.prev_num,
            'next_num': pagination.next_num
        }
    }), 200

# Keep existing CRUD endpoints
@bp.route('/<int:product_id>', methods=['GET'])
@jwt_required()
def get_product(product_id):
    product = Product.query.get_or_404(product_id)
    return jsonify({'product': product.to_dict()}), 200

@bp.route('', methods=['POST'])
@manager_required
def create_product():
    data = request.get_json()
    
    required = ['name', 'sku', 'price', 'cost']
    for field in required:
        if field not in data:
            return jsonify({'error': f'Missing field: {field}'}), 400
    
    if Product.query.filter_by(sku=data['sku']).first():
        return jsonify({'error': 'SKU already exists'}), 409
    
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
    
    return jsonify({
        'message': 'Product created successfully',
        'product': product.to_dict()
    }), 201

@bp.route('/<int:product_id>', methods=['PUT'])
@manager_required
def update_product(product_id):
    product = Product.query.get_or_404(product_id)
    data = request.get_json()
    
    if 'name' in data:
        product.name = data['name']
    if 'sku' in data and data['sku'] != product.sku:
        if Product.query.filter_by(sku=data['sku']).first():
            return jsonify({'error': 'SKU already exists'}), 409
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
    if 'description' in data:
        product.description = data['description']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Product updated successfully',
        'product': product.to_dict()
    }), 200

@bp.route('/<int:product_id>', methods=['DELETE'])
@admin_required
def delete_product(product_id):
    product = Product.query.get_or_404(product_id)
    
    if product.transactions:
        return jsonify({'error': 'Cannot delete product with existing transactions'}), 400
    
    db.session.delete(product)
    db.session.commit()
    
    return jsonify({'message': 'Product deleted successfully'}), 200
