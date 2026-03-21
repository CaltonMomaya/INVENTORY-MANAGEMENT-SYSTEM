from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models.product import Product
from app.utils.decorators import manager_required

bp = Blueprint('products', __name__)

@bp.route('', methods=['GET'])
@jwt_required()
def get_products():
    """Get all products"""
    products = Product.query.all()
    return jsonify({'products': [p.to_dict() for p in products]}), 200

@bp.route('/<int:product_id>', methods=['GET'])
@jwt_required()
def get_product(product_id):
    """Get a single product by ID"""
    product = Product.query.get_or_404(product_id)
    return jsonify({'product': product.to_dict()}), 200

@bp.route('', methods=['POST'])
@manager_required
def create_product():
    """Create a new product"""
    data = request.get_json()
    
    required_fields = ['name', 'sku', 'price', 'cost']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    if Product.query.filter_by(sku=data['sku']).first():
        return jsonify({'error': 'Product with this SKU already exists'}), 409
    
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
