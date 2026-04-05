"""Reports Controller - Real data from database"""
from app import db
from app.models.product import Product
from app.models.category import Category
from app.models.supplier import Supplier
from app.models.transaction import Transaction
from datetime import datetime, timedelta
from sqlalchemy import func

class ReportsController:
    
    @staticmethod
    def get_sales_report(period='month'):
        """Get real sales data from transactions"""
        # Calculate date range
        if period == 'month':
            start_date = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        else:
            start_date = datetime.utcnow().replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Get all sales transactions (stock out)
        sales = Transaction.query.filter(
            Transaction.transaction_type == 'out',
            Transaction.created_at >= start_date
        ).all()
        
        # Calculate totals
        total_quantity = sum(t.quantity for t in sales)
        total_revenue = sum(t.quantity * t.product.price for t in sales) if sales else 0
        total_cost = sum(t.quantity * t.product.cost for t in sales) if sales else 0
        total_profit = total_revenue - total_cost
        avg_order = total_revenue / len(sales) if sales else 0
        
        # Get top products by sales quantity
        product_sales = {}
        for t in sales:
            if t.product_id not in product_sales:
                product_sales[t.product_id] = {
                    'name': t.product.name,
                    'quantity': 0,
                    'revenue': 0
                }
            product_sales[t.product_id]['quantity'] += t.quantity
            product_sales[t.product_id]['revenue'] += t.quantity * t.product.price
        
        top_products = sorted(product_sales.values(), key=lambda x: x['quantity'], reverse=True)[:10]
        
        # Get daily breakdown for chart
        daily_breakdown = []
        for i in range(30):
            day = datetime.utcnow() - timedelta(days=i)
            day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=1)
            
            day_sales = Transaction.query.filter(
                Transaction.transaction_type == 'out',
                Transaction.created_at >= day_start,
                Transaction.created_at < day_end
            ).all()
            
            daily_breakdown.append({
                'date': day.strftime('%Y-%m-%d'),
                'quantity': sum(t.quantity for t in day_sales),
                'revenue': round(sum(t.quantity * t.product.price for t in day_sales), 2)
            })
        
        return {
            'summary': {
                'total_sales': total_quantity,
                'total_revenue': round(total_revenue, 2),
                'total_cost': round(total_cost, 2),
                'total_profit': round(total_profit, 2),
                'average_order_value': round(avg_order, 2)
            },
            'top_products': top_products,
            'daily_breakdown': daily_breakdown[::-1]  # Reverse to show oldest first
        }, 200
    
    @staticmethod
    def get_inventory_report():
        """Get real inventory data"""
        products = Product.query.all()
        
        # Calculate totals
        total_products = len(products)
        total_quantity = sum(p.quantity for p in products)
        total_value = sum(p.quantity * p.price for p in products)
        total_cost = sum(p.quantity * p.cost for p in products)
        
        # Count low stock
        low_stock_count = len([p for p in products if p.quantity <= p.reorder_level])
        out_of_stock_count = len([p for p in products if p.quantity == 0])
        
        # Category breakdown
        categories = Category.query.all()
        category_breakdown = []
        for cat in categories:
            cat_products = [p for p in products if p.category_id == cat.id]
            category_breakdown.append({
                'category': cat.name,
                'product_count': len(cat_products),
                'total_quantity': sum(p.quantity for p in cat_products),
                'total_value': round(sum(p.quantity * p.price for p in cat_products), 2)
            })
        
        # Low stock items
        low_stock_items = []
        for p in products:
            if p.quantity <= p.reorder_level:
                low_stock_items.append({
                    'id': p.id,
                    'name': p.name,
                    'quantity': p.quantity,
                    'reorder_level': p.reorder_level,
                    'sku': p.sku
                })
        
        # Out of stock items
        out_of_stock_items = []
        for p in products:
            if p.quantity == 0:
                out_of_stock_items.append({
                    'id': p.id,
                    'name': p.name,
                    'sku': p.sku
                })
        
        return {
            'summary': {
                'total_products': total_products,
                'total_quantity': total_quantity,
                'total_inventory_value': round(total_value, 2),
                'total_inventory_cost': round(total_cost, 2),
                'potential_profit': round(total_value - total_cost, 2),
                'low_stock_count': low_stock_count,
                'out_of_stock_count': out_of_stock_count
            },
            'category_breakdown': category_breakdown,
            'low_stock_items': low_stock_items,
            'out_of_stock_items': out_of_stock_items
        }, 200
    
    @staticmethod
    def get_transaction_report(transaction_type=None):
        """Get real transaction history"""
        query = Transaction.query
        
        if transaction_type:
            query = query.filter_by(transaction_type=transaction_type)
        
        transactions = query.order_by(Transaction.created_at.desc()).limit(100).all()
        
        transaction_list = []
        for t in transactions:
            transaction_list.append({
                'id': t.id,
                'date': t.created_at.strftime('%Y-%m-%d %H:%M'),
                'type': t.transaction_type,
                'product': t.product.name if t.product else 'Unknown',
                'quantity': t.quantity,
                'reference': t.reference or '-',
                'user': t.user.name if t.user else 'System',
                'notes': t.notes or '-'
            })
        
        return {
            'transactions': transaction_list,
            'total_count': len(transaction_list),
            'total_quantity': sum(t.quantity for t in transactions)
        }, 200
    
    @staticmethod
    def get_monthly_trends():
        """Get monthly trends from real data"""
        current_year = datetime.utcnow().year
        monthly_data = []
        
        for month in range(1, 13):
            start_date = datetime(current_year, month, 1)
            if month == 12:
                end_date = datetime(current_year + 1, 1, 1)
            else:
                end_date = datetime(current_year, month + 1, 1)
            
            # Sales for this month
            sales = Transaction.query.filter(
                Transaction.transaction_type == 'out',
                Transaction.created_at >= start_date,
                Transaction.created_at < end_date
            ).all()
            
            # Purchases for this month
            purchases = Transaction.query.filter(
                Transaction.transaction_type == 'in',
                Transaction.created_at >= start_date,
                Transaction.created_at < end_date
            ).all()
            
            monthly_data.append({
                'month': start_date.strftime('%B'),
                'sales_quantity': sum(t.quantity for t in sales),
                'sales_revenue': round(sum(t.quantity * t.product.price for t in sales), 2) if sales else 0,
                'purchases_quantity': sum(t.quantity for t in purchases),
                'purchases_cost': round(sum(t.quantity * t.product.cost for t in purchases), 2) if purchases else 0
            })
        
        return monthly_data, 200
