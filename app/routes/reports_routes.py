"""Reports Routes"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.controllers.reports_controller import ReportsController

bp = Blueprint('reports', __name__)

@bp.route('/sales', methods=['GET'])
@jwt_required()
def get_sales_report():
    """Get sales report from real data"""
    period = request.args.get('period', 'month')
    response, status = ReportsController.get_sales_report(period)
    return jsonify(response), status

@bp.route('/inventory', methods=['GET'])
@jwt_required()
def get_inventory_report():
    """Get inventory report from real data"""
    response, status = ReportsController.get_inventory_report()
    return jsonify(response), status

@bp.route('/transactions', methods=['GET'])
@jwt_required()
def get_transaction_report():
    """Get transaction history from real data"""
    transaction_type = request.args.get('type', None)
    response, status = ReportsController.get_transaction_report(transaction_type)
    return jsonify(response), status

@bp.route('/trends', methods=['GET'])
@jwt_required()
def get_monthly_trends():
    """Get monthly trends from real data"""
    response, status = ReportsController.get_monthly_trends()
    return jsonify(response), status
