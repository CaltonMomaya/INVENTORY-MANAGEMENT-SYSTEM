"""User Management Routes (Admin Only)"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.utils.decorators import admin_required

bp = Blueprint('users', __name__)

@bp.route('/users', methods=['GET'])
@jwt_required()
@admin_required
def get_all_users():
    """Get all users (Admin only)"""
    users = User.query.all()
    return jsonify({'users': [u.to_dict() for u in users]}), 200

@bp.route('/users/<int:user_id>/toggle', methods=['PUT'])
@jwt_required()
@admin_required
def toggle_user_status(user_id):
    """Activate/Deactivate user (Admin only)"""
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    user.is_active = not user.is_active
    db.session.commit()
    
    return jsonify({'message': f'User status updated to {user.is_active}'}), 200

@bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_user(user_id):
    """Delete user (Admin only)"""
    current_user_id = get_jwt_identity()
    
    if user_id == int(current_user_id):
        return jsonify({'error': 'Cannot delete yourself'}), 400
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({'message': 'User deleted successfully'}), 200
