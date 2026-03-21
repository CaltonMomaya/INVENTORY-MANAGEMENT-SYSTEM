from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, get_jwt_identity, jwt_required
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from datetime import timedelta
import os

# Initialize extensions
db = SQLAlchemy()
jwt = JWTManager()
bcrypt = Bcrypt()

def create_app(config_name='development'):
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///database.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # JWT Configuration
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)
    app.config['JWT_TOKEN_LOCATION'] = ['headers']
    app.config['JWT_HEADER_NAME'] = 'Authorization'
    app.config['JWT_HEADER_TYPE'] = 'Bearer'
    
    # Initialize extensions with app
    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    CORS(app)
    
    # Optional: Swagger documentation (uncomment if flasgger is installed)
    # try:
    #     from flasgger import Swagger
    #     swagger = Swagger(app, template={
    #         'swagger': '2.0',
    #         'info': {
    #             'title': 'KANBAN Inventory Management API',
    #             'description': 'RESTful API for inventory management',
    #             'version': '1.0.0'
    #         },
    #         'host': 'localhost:5000',
    #         'basePath': '/api',
    #         'schemes': ['http'],
    #         'securityDefinitions': {
    #             'BearerAuth': {
    #                 'type': 'apiKey',
    #                 'name': 'Authorization',
    #                 'in': 'header',
    #                 'description': 'JWT Authorization header using the Bearer scheme'
    #             }
    #         }
    #     })
    # except ImportError:
    #     print("Flasgger not installed. Skipping Swagger documentation.")
    
    # JWT callbacks
    @jwt.user_identity_loader
    def user_identity_lookup(user):
        return str(user)
    
    @jwt.user_lookup_loader
    def user_lookup_callback(_jwt_header, jwt_data):
        identity = jwt_data["sub"]
        from app.models.user import User
        return User.query.get(int(identity))
    
    # Register blueprints
    from app.routes import auth, products, categories, suppliers, transactions
    
    app.register_blueprint(auth.bp, url_prefix='/api/auth')
    app.register_blueprint(products.bp, url_prefix='/api/products')
    app.register_blueprint(categories.bp, url_prefix='/api/categories')
    app.register_blueprint(suppliers.bp, url_prefix='/api/suppliers')
    app.register_blueprint(transactions.bp, url_prefix='/api/transactions')
    
    # Root endpoint
    @app.route('/', methods=['GET'])
    def index():
        return jsonify({
            'message': 'Inventory Management System API',
            'version': '1.0.0',
            'status': 'running',
            'endpoints': {
                'auth': {
                    'register': 'POST /api/auth/register',
                    'login': 'POST /api/auth/login',
                    'refresh': 'POST /api/auth/refresh',
                    'me': 'GET /api/auth/me'
                },
                'products': 'GET /api/products',
                'categories': 'GET /api/categories',
                'suppliers': 'GET /api/suppliers',
                'transactions': 'GET /api/transactions'
            }
        }), 200
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Resource not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500
    
    return app
