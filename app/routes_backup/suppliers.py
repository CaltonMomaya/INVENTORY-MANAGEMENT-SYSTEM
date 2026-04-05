from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models.supplier import Supplier
from app.utils.decorators import manager_required

bp = Blueprint('suppliers', __name__)

@bp.route('', methods=['GET'])
@jwt_required()
def get_suppliers():
    """Get all suppliers"""
    suppliers = Supplier.query.all()
    return jsonify({'suppliers': [s.to_dict() for s in suppliers]}), 200

@bp.route('/<int:supplier_id>', methods=['GET'])
@jwt_required()
def get_supplier(supplier_id):
    """Get a single supplier by ID"""
    supplier = Supplier.query.get_or_404(supplier_id)
    return jsonify({'supplier': supplier.to_dict()}), 200

@bp.route('', methods=['POST'])
@manager_required
def create_supplier():
    """Create a new supplier"""
    data = request.get_json()
    
    if not data.get('name'):
        return jsonify({'error': 'Supplier name is required'}), 400
    
    supplier = Supplier(
        name=data['name'],
        contact_person=data.get('contact_person'),
        email=data.get('email'),
        phone=data.get('phone'),
        address=data.get('address')
    )
    
    db.session.add(supplier)
    db.session.commit()
    
    return jsonify({
        'message': 'Supplier created successfully',
        'supplier': supplier.to_dict()
    }), 201

@bp.route('/<int:supplier_id>', methods=['PUT'])
@manager_required
def update_supplier(supplier_id):
    """Update a supplier"""
    supplier = Supplier.query.get_or_404(supplier_id)
    data = request.get_json()
    
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
    
    return jsonify({
        'message': 'Supplier updated successfully',
        'supplier': supplier.to_dict()
    }), 200

@bp.route('/<int:supplier_id>', methods=['DELETE'])
@manager_required
def delete_supplier(supplier_id):
    """Delete a supplier"""
    supplier = Supplier.query.get_or_404(supplier_id)
    
    if supplier.products:
        return jsonify({'error': 'Cannot delete supplier with associated products'}), 400
    
    db.session.delete(supplier)
    db.session.commit()
    
    return jsonify({'message': 'Supplier deleted successfully'}), 200
