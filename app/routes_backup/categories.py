from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models.category import Category
from app.utils.decorators import manager_required

bp = Blueprint('categories', __name__)

@bp.route('', methods=['GET'])
@jwt_required()
def get_categories():
    """Get all categories"""
    categories = Category.query.all()
    return jsonify({'categories': [c.to_dict() for c in categories]}), 200

@bp.route('/<int:category_id>', methods=['GET'])
@jwt_required()
def get_category(category_id):
    """Get a single category by ID"""
    category = Category.query.get_or_404(category_id)
    return jsonify({'category': category.to_dict()}), 200

@bp.route('', methods=['POST'])
@manager_required
def create_category():
    """Create a new category"""
    data = request.get_json()
    
    if not data.get('name'):
        return jsonify({'error': 'Category name is required'}), 400
    
    if Category.query.filter_by(name=data['name']).first():
        return jsonify({'error': 'Category already exists'}), 409
    
    category = Category(
        name=data['name'],
        description=data.get('description')
    )
    
    db.session.add(category)
    db.session.commit()
    
    return jsonify({
        'message': 'Category created successfully',
        'category': category.to_dict()
    }), 201

@bp.route('/<int:category_id>', methods=['PUT'])
@manager_required
def update_category(category_id):
    """Update a category"""
    category = Category.query.get_or_404(category_id)
    data = request.get_json()
    
    if 'name' in data:
        existing = Category.query.filter_by(name=data['name']).first()
        if existing and existing.id != category_id:
            return jsonify({'error': 'Category name already exists'}), 409
        category.name = data['name']
    
    if 'description' in data:
        category.description = data['description']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Category updated successfully',
        'category': category.to_dict()
    }), 200

@bp.route('/<int:category_id>', methods=['DELETE'])
@manager_required
def delete_category(category_id):
    """Delete a category"""
    category = Category.query.get_or_404(category_id)
    
    if category.products:
        return jsonify({'error': 'Cannot delete category with associated products'}), 400
    
    db.session.delete(category)
    db.session.commit()
    
    return jsonify({'message': 'Category deleted successfully'}), 200
