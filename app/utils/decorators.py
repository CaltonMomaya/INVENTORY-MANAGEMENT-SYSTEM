from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from app.models.user import User

def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            current_user_id = get_jwt_identity()
            user = User.query.get(current_user_id)
            
            if not user or user.role != 'admin':
                return jsonify({'error': 'Admin access required'}), 403
        except:
            return jsonify({'error': 'Authentication required'}), 401
        
        return fn(*args, **kwargs)
    return wrapper

def manager_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            current_user_id = get_jwt_identity()
            user = User.query.get(current_user_id)
            
            if not user or user.role not in ['admin', 'manager']:
                return jsonify({'error': 'Manager access required'}), 403
        except:
            return jsonify({'error': 'Authentication required'}), 401
        
        return fn(*args, **kwargs)
    return wrapper

def role_required(*roles):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            try:
                verify_jwt_in_request()
                current_user_id = get_jwt_identity()
                user = User.query.get(current_user_id)
                
                if not user or user.role not in roles:
                    return jsonify({'error': 'Insufficient permissions'}), 403
            except:
                return jsonify({'error': 'Authentication required'}), 401
            
            return fn(*args, **kwargs)
        return wrapper
    return decorator