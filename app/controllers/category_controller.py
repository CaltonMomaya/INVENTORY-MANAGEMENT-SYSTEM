"""Category Controller - Handles all category business logic"""
from app import db
from app.models.category import Category

class CategoryController:
    """Separates category logic from routes"""
    
    @staticmethod
    def get_all_categories():
        """Get all categories"""
        categories = Category.query.all()
        return {'categories': [c.to_dict() for c in categories]}, 200
    
    @staticmethod
    def create_category(data):
        """Create new category logic"""
        if Category.query.filter_by(name=data['name']).first():
            return None, {'error': 'Category already exists'}, 409
        
        category = Category(
            name=data['name'],
            description=data.get('description')
        )
        db.session.add(category)
        db.session.commit()
        
        return {
            'message': 'Category created successfully',
            'category': category.to_dict()
        }, None, 201
    
    @staticmethod
    def delete_category(category_id):
        """Delete category logic"""
        category = Category.query.get(category_id)
        if not category:
            return None, {'error': 'Category not found'}, 404
        
        if category.products:
            return None, {'error': 'Cannot delete category with products'}, 400
        
        db.session.delete(category)
        db.session.commit()
        
        return {'message': 'Category deleted successfully'}, None, 200
