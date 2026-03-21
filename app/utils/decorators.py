from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from app.models.user import User

def admin_required(fn):
    """Decorator to require admin role"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            current_user_id = get_jwt_identity()
            # Convert string ID to int for query
            user = User.query.get(int(current_user_id))
            
            if not user or user.role != 'admin':
                return jsonify({'error': 'Admin access required'}), 403
        except Exception as e:
            return jsonify({'error': f'Authentication required: {str(e)}'}), 401
        
        return fn(*args, **kwargs)
    return wrapper

def manager_required(fn):
    """Decorator to require manager or admin role"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            current_user_id = get_jwt_identity()
            # Convert string ID to int for query
            user = User.query.get(int(current_user_id))
            
            if not user or user.role not in ['admin', 'manager']:
                return jsonify({'error': 'Manager access required'}), 403
        except Exception as e:
            return jsonify({'error': f'Authentication required: {str(e)}'}), 401
        
        return fn(*args, **kwargs)
    return wrapper

def role_required(*roles):
    """Decorator to require specific role(s)"""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            try:
                verify_jwt_in_request()
                current_user_id = get_jwt_identity()
                # Convert string ID to int for query
                user = User.query.get(int(current_user_id))
                
                if not user or user.role not in roles:
                    return jsonify({'error': f'Role {", ".join(roles)} required'}), 403
            except Exception as e:
                return jsonify({'error': f'Authentication required: {str(e)}'}), 401
            
            return fn(*args, **kwargs)
        return wrapper
    return decorator
