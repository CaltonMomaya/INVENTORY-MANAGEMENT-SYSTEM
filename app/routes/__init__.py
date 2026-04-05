"""Routes module - API endpoints"""
# Import all route blueprints using your actual file names
from app.routes.auth import bp as auth_bp
from app.routes.products import bp as product_bp
from app.routes.categories import bp as category_bp
from app.routes.suppliers import bp as supplier_bp
from app.routes.transactions import bp as transaction_bp
from app.routes.reports_routes import bp as reports_bp

# Export blueprints
auth = auth_bp
products = product_bp
categories = category_bp
suppliers = supplier_bp
transactions = transaction_bp
reports = reports_bp

__all__ = ['auth', 'products', 'categories', 'suppliers', 'transactions', 'reports']
