"""Supplier Routes - Only endpoint definitions"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.controllers.supplier_controller import SupplierController
from app.utils.decorators import manager_required

bp = Blueprint('suppliers', __name__)

@bp.route('', methods=['GET'])
@jwt_required()
def get_suppliers():
    """Get all suppliers"""
    response, status = SupplierController.get_all_suppliers()
    return jsonify(response), status

@bp.route('', methods=['POST'])
@manager_required
def create_supplier():
    """Create new supplier"""
    data = request.get_json()
    
    if not data.get('name'):
        return jsonify({'error': 'Supplier name required'}), 400
    
    response, error, status = SupplierController.create_supplier(data)
    if error:
        return jsonify(error), status
    return jsonify(response), status

@bp.route('/<int:supplier_id>', methods=['PUT'])
@manager_required
def update_supplier(supplier_id):
    """Update supplier"""
    data = request.get_json()
    response, error, status = SupplierController.update_supplier(supplier_id, data)
    if error:
        return jsonify(error), status
    return jsonify(response), status

@bp.route('/<int:supplier_id>', methods=['DELETE'])
@manager_required
def delete_supplier(supplier_id):
    """Delete supplier"""
    response, error, status = SupplierController.delete_supplier(supplier_id)
    if error:
        return jsonify(error), status
    return jsonify(response), status
