"""Authentication Controller - Handles all auth business logic"""
from flask import jsonify
from flask_jwt_extended import create_access_token, create_refresh_token
from app import db, bcrypt
from app.models.user import User

class AuthController:
    """Separates authentication logic from routes"""
    
    @staticmethod
    def register_user(data):
        """Handle user registration logic"""
        # Check if user exists
        if User.query.filter_by(email=data['email']).first():
            return None, {'error': 'User already exists'}, 409
        
        # Hash password
        hashed = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        
        # Create user
        user = User(
            name=data['name'],
            email=data['email'],
            password_hash=hashed,
            role=data.get('role', 'user')
        )
        
        db.session.add(user)
        db.session.commit()
        
        # Generate tokens
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        return {
            'message': 'User created successfully',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }, None, 201
    
    @staticmethod
    def login_user(email, password):
        """Handle user login logic"""
        user = User.query.filter_by(email=email).first()
        
        if not user or not bcrypt.check_password_hash(user.password_hash, password):
            return None, {'error': 'Invalid credentials'}, 401
        
        # Generate tokens
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        return {
            'message': 'Login successful',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict()
        }, None, 200
    
    @staticmethod
    def get_user_profile(user_id):
        """Get current user profile"""
        user = User.query.get(user_id)
        if not user:
            return None, {'error': 'User not found'}, 404
        return {'user': user.to_dict()}, None, 200
    
    @staticmethod
    def refresh_user_token(user_id):
        """Refresh access token"""
        new_token = create_access_token(identity=str(user_id))
        return {'access_token': new_token}, None, 200
