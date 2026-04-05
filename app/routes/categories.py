"""Category Routes - Only endpoint definitions"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.controllers.category_controller import CategoryController
from app.utils.decorators import manager_required

bp = Blueprint('categories', __name__)

@bp.route('', methods=['GET'])
@jwt_required()
def get_categories():
    """Get all categories"""
    response, status = CategoryController.get_all_categories()
    return jsonify(response), status

@bp.route('', methods=['POST'])
@manager_required
def create_category():
    """Create new category"""
    data = request.get_json()
    
    if not data.get('name'):
        return jsonify({'error': 'Category name required'}), 400
    
    response, error, status = CategoryController.create_category(data)
    if error:
        return jsonify(error), status
    return jsonify(response), status

@bp.route('/<int:category_id>', methods=['DELETE'])
@manager_required
def delete_category(category_id):
    """Delete category"""
    response, error, status = CategoryController.delete_category(category_id)
    if error:
        return jsonify(error), status
    return jsonify(response), status
