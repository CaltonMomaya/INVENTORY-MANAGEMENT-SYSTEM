"""Supplier Controller - Handles all supplier business logic"""
from app import db
from app.models.supplier import Supplier

class SupplierController:
    """Separates supplier logic from routes"""
    
    @staticmethod
    def get_all_suppliers():
        """Get all suppliers"""
        suppliers = Supplier.query.all()
        return {'suppliers': [s.to_dict() for s in suppliers]}, 200
    
    @staticmethod
    def create_supplier(data):
        """Create new supplier logic"""
        supplier = Supplier(
            name=data['name'],
            contact_person=data.get('contact_person'),
            email=data.get('email'),
            phone=data.get('phone'),
            address=data.get('address')
        )
        db.session.add(supplier)
        db.session.commit()
        
        return {
            'message': 'Supplier created successfully',
            'supplier': supplier.to_dict()
        }, None, 201
    
    @staticmethod
    def update_supplier(supplier_id, data):
        """Update supplier logic"""
        supplier = Supplier.query.get(supplier_id)
        if not supplier:
            return None, {'error': 'Supplier not found'}, 404
        
        if 'name' in data:
            supplier.name = data['name']
        if 'contact_person' in data:
            supplier.contact_person = data['contact_person']
        if 'email' in data:
            supplier.email = data['email']
        if 'phone' in data:
            supplier.phone = data['phone']
        if 'address' in data:
            supplier.address = data['address']
        
        db.session.commit()
        
        return {
            'message': 'Supplier updated successfully',
            'supplier': supplier.to_dict()
        }, None, 200
    
    @staticmethod
    def delete_supplier(supplier_id):
        """Delete supplier logic"""
        supplier = Supplier.query.get(supplier_id)
        if not supplier:
            return None, {'error': 'Supplier not found'}, 404
        
        if supplier.products:
            return None, {'error': 'Cannot delete supplier with products'}, 400
        
        db.session.delete(supplier)
        db.session.commit()
        
        return {'message': 'Supplier deleted successfully'}, None, 200
