from app import db
from datetime import datetime

class Product(db.Model):
    __tablename__ = 'products'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    sku = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.String(500))
    quantity = db.Column(db.Integer, default=0)
    price = db.Column(db.Float, nullable=False)
    cost = db.Column(db.Float, nullable=False)
    reorder_level = db.Column(db.Integer, default=10)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'))
    supplier_id = db.Column(db.Integer, db.ForeignKey('suppliers.id'))
    
    transactions = db.relationship('Transaction', backref='product', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'sku': self.sku,
            'description': self.description,
            'quantity': self.quantity,
            'price': self.price,
            'cost': self.cost,
            'reorder_level': self.reorder_level,
            'category_id': self.category_id,
            'category_name': self.category.name if self.category else None,
            'supplier_id': self.supplier_id,
            'supplier_name': self.supplier.name if self.supplier else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_low_stock': self.quantity <= self.reorder_level
        }
