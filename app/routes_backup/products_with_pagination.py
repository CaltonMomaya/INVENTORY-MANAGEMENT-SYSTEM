# Add this to your app/routes/products.py - Update the get_products function

@bp.route('', methods=['GET'])
@jwt_required()
def get_products():
    """Get all products with pagination and filtering"""
    
    # Get query parameters
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    search = request.args.get('search', type=str)
    category_id = request.args.get('category_id', type=int)
    supplier_id = request.args.get('supplier_id', type=int)
    low_stock = request.args.get('low_stock', type=bool)
    sort_by = request.args.get('sort_by', 'id')
    sort_order = request.args.get('sort_order', 'asc')
    
    # Start with base query
    query = Product.query
    
    # Apply filters
    if search:
        query = query.filter(
            db.or_(
                Product.name.ilike(f'%{search}%'),
                Product.sku.ilike(f'%{search}%'),
                Product.description.ilike(f'%{search}%')
            )
        )
    
    if category_id:
        query = query.filter_by(category_id=category_id)
    
    if supplier_id:
        query = query.filter_by(supplier_id=supplier_id)
    
    if low_stock:
        query = query.filter(Product.quantity <= Product.reorder_level)
    
    # Apply sorting
    if sort_order == 'asc':
        query = query.order_by(getattr(Product, sort_by))
    else:
        query = query.order_by(getattr(Product, sort_by).desc())
    
    # Paginate results
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    # Return paginated response
    return jsonify({
        'products': [product.to_dict() for product in pagination.items],
        'pagination': {
            'total': pagination.total,
            'page': page,
            'per_page': per_page,
            'pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        },
        'filters': {
            'search': search,
            'category_id': category_id,
            'supplier_id': supplier_id,
            'low_stock': low_stock,
            'sort_by': sort_by,
            'sort_order': sort_order
        }
    }), 200
