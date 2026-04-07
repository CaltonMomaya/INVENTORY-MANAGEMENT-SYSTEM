cat > README.md << 'EOF'
# INVENTORY MANAGEMENT SYSTEM - KANBAN

A comprehensive, production-ready inventory management system with Flask REST API backend and modern web frontend. This system provides complete inventory control with user authentication, role-based access control, real-time stock tracking, and detailed analytics.

## Table of Contents

1. [System Overview](#system-overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Prerequisites](#prerequisites)
5. [Installation Guide](#installation-guide)
6. [Configuration](#configuration)
7. [Running the Application](#running-the-application)
8. [API Documentation](#api-documentation)
9. [Database Schema](#database-schema)
10. [Project Structure](#project-structure)
11. [Troubleshooting](#troubleshooting)
12. [Development Guide](#development-guide)
13. [Deployment](#deployment)

## System Overview

This inventory management system helps businesses track products, manage stock levels, process sales, and generate reports. The system features:

- Separate frontend and backend architecture
- RESTful API design following best practices
- JWT-based stateless authentication
- Role-based permissions (Admin, Manager, User)
- Real-time inventory updates
- Complete audit trail of stock movements

## Features

### Core Features
- User authentication with login and registration
- Role-based access control with three user levels
- Complete product management (Create, Read, Update, Delete)
- Category management for product organization
- Supplier management with contact information
- Real-time inventory tracking
- Stock in/out transaction recording
- Dashboard with sales analytics and charts
- Order history tracking
- User management for administrators

### Technical Features
- JWT token authentication with refresh capability
- Password hashing using bcrypt
- Database pagination for large datasets
- Filtering and search functionality
- CORS enabled for cross-origin requests
- SQLite database (configurable for PostgreSQL)
- Session timeout after inactivity
- Dark/light mode toggle
- Responsive design for mobile devices

## Technology Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.8+ | Programming language |
| Flask | 2.3.3 | Web framework |
| Flask-SQLAlchemy | 3.1.1 | Database ORM |
| Flask-JWT-Extended | 4.5.2 | JWT authentication |
| Flask-Bcrypt | 1.0.1 | Password hashing |
| Flask-CORS | 4.0.0 | Cross-origin requests |
| SQLite | 3 | Development database |
| Marshmallow | 3.20.1 | Data serialization |

### Frontend
| Technology | Purpose |
|------------|---------|
| HTML5 | Structure |
| CSS3 | Styling and responsive design |
| JavaScript (Vanilla) | Interactivity and API calls |
| Chart.js | Data visualization |
| Font Awesome | Icons |
| Google Fonts (Inter) | Typography |

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

# Python 3.8 or higher
python3 --version

# pip package manager
pip3 --version

# Git (for cloning repository)
git --version

# SQLite (for database access)
sqlite3 --version




installation Guide
Step 1: Clone the Repository
bash
# Clone the project
git clone https://github.com/CaltonMomaya/INVENTORY-MANAGEMENT-SYSTEM.git

# Navigate to project directory
cd INVENTORY-MANAGEMENT-SYSTEM
Step 2: Create Virtual Environment
A virtual environment isolates project dependencies from your system Python.


# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On Linux/macOS:
source venv/bin/activate

# On Windows:
venv\Scripts\activate

# You should see (venv) in your terminal prompt
Step 3: Install Dependencies
bash
# Install all required packages
pip install -r requirements.txt

# Verify installation
pip list
Expected packages:

Flask==2.3.3

Flask-SQLAlchemy==3.1.1

Flask-JWT-Extended==4.5.2

Flask-Bcrypt==1.0.1

Flask-CORS==4.0.0

python-dotenv==1.0.0

marshmallow==3.20.1

flask-marshmallow==1.0.0

Step 4: Configure Environment Variables
Create a .env file in the root directory:


FLASK_APP=run.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-here-change-in-production
JWT_SECRET_KEY=jwt-secret-key-here-change-in-production
DATABASE_URL=sqlite:///database.db
EOF
For production, generate secure random keys:


python3 -c "import secrets; print(secrets.token_hex(32))"
Step 5: Initialize the Database
bash
# Create database tables and populate with sample data
flask init-db
This command:

Creates all database tables

Adds an admin user (admin@kanban.com / admin123)

Creates sample categories (Electronics, Groceries, Clothing)

Creates sample suppliers

Adds sample products

Step 6: Verify Database Creation

# Check if database file was created
ls -la instance/

# Should see database.db file
# View database schema
sqlite3 instance/database.db ".tables"
Running the Application
The application requires two servers: backend (Flask API) and frontend (static file server).

Terminal 1 - Backend Server
bash
# Navigate to project root
cd ~/INVENTORY-MANAGEMENT-SYSTEM

# Activate virtual environment
source venv/bin/activate

# Start Flask backend
python3 run.py
Expected output:

text
 * Serving Flask app 'run'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
The backend runs on port 5000 and handles:

API requests

Database operations

Authentication

Business logic

Terminal 2 - Frontend Server
Open a new terminal window:


# Navigate to frontend directory
cd ~/INVENTORY-MANAGEMENT-SYSTEM/frontend

# Start static file server
python3 -m http.server 8000
Expected output:

text
Serving HTTP on 0.0.0.0 port 8000 ...
The frontend runs on port 8000 and serves:

HTML pages

CSS stylesheets

JavaScript files

Access the Application
Open your web browser and navigate to:

text
http://localhost:8000
Default Login Credentials
Role	Email	Password
Admin	admin@kanban.com	admin123
Manager	Create via signup with manager role	-
User	Create via signup with user role	-
API Documentation
Base URL
text
http://localhost:5000/api
Authentication Endpoints
Register New User
http
POST /auth/register
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "user"
}
Response (201 Created):

json
{
    "message": "User created successfully",
    "user": {
        "id": 5,
        "name": "John Doe",
        "email": "john@example.com",
        "role": "user"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
Login
http
POST /auth/login
Content-Type: application/json

{
    "email": "admin@kanban.com",
    "password": "admin123"
}
Response (200 OK):

json
{
    "message": "Login successful",
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
        "id": 1,
        "name": "Admin User",
        "email": "admin@kanban.com",
        "role": "admin"
    }
}
Refresh Token
http
POST /auth/refresh
Authorization: Bearer <refresh_token>
Response (200 OK):

json
{
    "access_token": "eyJhbGciOiJIUzI1NiIs..."
}
Get Current User
http
GET /auth/me
Authorization: Bearer <access_token>
Response (200 OK):

json
{
    "user": {
        "id": 1,
        "name": "Admin User",
        "email": "admin@kanban.com",
        "role": "admin"
    }
}
Product Endpoints
Get All Products (with pagination)
http
GET /products?page=1&per_page=10&search=excel&category_id=1&low_stock=true
Authorization: Bearer <access_token>
Query Parameters:

Parameter	Type	Description
page	integer	Page number (default: 1)
per_page	integer	Items per page (default: 10)
search	string	Search by name or SKU
category_id	integer	Filter by category
supplier_id	integer	Filter by supplier
low_stock	boolean	Show only low stock items
Response (200 OK):

json
{
    "products": [
        {
            "id": 1,
            "name": "Surf Excel",
            "sku": "SURF001",
            "quantity": 150,
            "price": 45.00,
            "is_low_stock": false
        }
    ],
    "pagination": {
        "total": 45,
        "page": 1,
        "per_page": 10,
        "pages": 5,
        "has_next": true,
        "has_prev": false
    }
}
Get Single Product
http
GET /products/{id}
Authorization: Bearer <access_token>
Response (200 OK):

json
{
    "product": {
        "id": 1,
        "name": "Surf Excel",
        "sku": "SURF001",
        "quantity": 150,
        "price": 45.00,
        "cost": 38.00,
        "reorder_level": 10,
        "category_name": "Groceries",
        "supplier_name": "Global Foods Ltd."
    }
}
Create Product
http
POST /products
Authorization: Bearer <access_token>
Content-Type: application/json

{
    "name": "New Product",
    "sku": "NEW001",
    "description": "Product description",
    "quantity": 100,
    "price": 29.99,
    "cost": 20.00,
    "reorder_level": 10,
    "category_id": 1,
    "supplier_id": 1
}
Response (201 Created):

json
{
    "message": "Product created successfully",
    "product": {
        "id": 10,
        "name": "New Product",
        "sku": "NEW001"
    }
}
Update Product
http
PUT /products/{id}
Authorization: Bearer <access_token>
Content-Type: application/json

{
    "price": 35.99,
    "quantity": 150
}
Response (200 OK):

json
{
    "message": "Product updated successfully",
    "product": { ... }
}
Delete Product
http
DELETE /products/{id}
Authorization: Bearer <access_token>
Response (200 OK):

json
{
    "message": "Product deleted successfully"
}
Stock Transaction Endpoints
Add Stock (Stock In)
http
POST /transactions/in
Authorization: Bearer <access_token>
Content-Type: application/json

{
    "product_id": 1,
    "quantity": 50,
    "reference": "PO-2024-001",
    "notes": "Purchase from supplier"
}
Response (201 Created):

json
{
    "message": "Stock added successfully",
    "transaction": {
        "id": 15,
        "transaction_type": "in",
        "quantity": 50,
        "product_name": "Surf Excel"
    },
    "product": {
        "id": 1,
        "quantity": 200
    }
}
Remove Stock (Stock Out)
http
POST /transactions/out
Authorization: Bearer <access_token>
Content-Type: application/json

{
    "product_id": 1,
    "quantity": 10,
    "reference": "SALE-2024-001",
    "notes": "Customer purchase"
}
Response (201 Created):

json
{
    "message": "Stock removed successfully",
    "transaction": {
        "id": 16,
        "transaction_type": "out",
        "quantity": 10,
        "product_name": "Surf Excel"
    },
    "product": {
        "id": 1,
        "quantity": 190
    }
}
Get Transaction History
http
GET /transactions?type=out&product_id=1
Authorization: Bearer <access_token>
Response (200 OK):

json
{
    "transactions": [
        {
            "id": 16,
            "transaction_type": "out",
            "quantity": 10,
            "product_name": "Surf Excel",
            "user_name": "Admin User",
            "created_at": "2024-01-15T10:30:00"
        }
    ]
}
Dashboard Statistics
http
GET /transactions/dashboard
Authorization: Bearer <access_token>
Response (200 OK):

json
{
    "sales_overview": {
        "sales": 832,
        "revenue": 18300,
        "profit": 868,
        "cost": 17432
    },
    "inventory_summary": {
        "quantity_in_hand": 1250,
        "to_be_received": 200
    },
    "product_summary": {
        "number_of_suppliers": 5,
        "number_of_categories": 3
    },
    "total_products": 45,
    "low_stock_products": 3
}
Category Endpoints
Get All Categories
http
GET /categories
Authorization: Bearer <access_token>
Response (200 OK):

json
{
    "categories": [
        {
            "id": 1,
            "name": "Electronics",
            "description": "Electronic devices",
            "product_count": 15
        }
    ]
}
Create Category
http
POST /categories
Authorization: Bearer <access_token>
Content-Type: application/json

{
    "name": "Office Supplies",
    "description": "Stationery and office equipment"
}
Supplier Endpoints
Get All Suppliers
http
GET /suppliers
Authorization: Bearer <access_token>
Response (200 OK):

json
{
    "suppliers": [
        {
            "id": 1,
            "name": "Tech Distributors Inc.",
            "contact_person": "John Smith",
            "email": "john@techdist.com",
            "phone": "+1234567890",
            "product_count": 8
        }
    ]
}
Create Supplier
http
POST /suppliers
Authorization: Bearer <access_token>
Content-Type: application/json

{
    "name": "New Supplier",
    "contact_person": "Jane Doe",
    "email": "jane@supplier.com",
    "phone": "+1234567890",
    "address": "123 Business St"
}
Report Endpoints
Sales Report
http
GET /reports/sales?period=month
Authorization: Bearer <access_token>
Inventory Report
http
GET /reports/inventory
Authorization: Bearer <access_token>
Transaction Report
http
GET /reports/transactions?type=out
Authorization: Bearer <access_token>
Status Codes
Code	Meaning	Description
200	OK	Request successful
201	Created	Resource created successfully
400	Bad Request	Missing or invalid parameters
401	Unauthorized	Missing or invalid token
403	Forbidden	Insufficient permissions
404	Not Found	Resource does not exist
409	Conflict	Duplicate entry (e.g., duplicate SKU)
500	Internal Error	Server error
Database Schema
Tables Structure
sql
-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(200) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME,
    updated_at DATETIME
);

-- Categories table
CREATE TABLE categories (
    id INTEGER PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(200),
    created_at DATETIME
);

-- Suppliers table
CREATE TABLE suppliers (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(120),
    phone VARCHAR(20),
    address VARCHAR(200),
    created_at DATETIME
);

-- Products table
CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    sku VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(500),
    quantity INTEGER DEFAULT 0,
    price FLOAT NOT NULL,
    cost FLOAT NOT NULL,
    reorder_level INTEGER DEFAULT 10,
    category_id INTEGER REFERENCES categories(id),
    supplier_id INTEGER REFERENCES suppliers(id),
    created_at DATETIME,
    updated_at DATETIME
);

-- Transactions table
CREATE TABLE transactions (
    id INTEGER PRIMARY KEY,
    transaction_type VARCHAR(20) NOT NULL,
    quantity INTEGER NOT NULL,
    reference VARCHAR(100),
    notes VARCHAR(500),
    product_id INTEGER REFERENCES products(id),
    user_id INTEGER REFERENCES users(id),
    created_at DATETIME
);
Project Structure
text
INVENTORY-MANAGEMENT-SYSTEM/
│
├── app/                           # Backend application
│   ├── __init__.py               # App factory and configuration
│   ├── config.py                 # Configuration settings
│   │
│   ├── models/                   # Database models
│   │   ├── __init__.py
│   │   ├── user.py              # User model
│   │   ├── product.py           # Product model
│   │   ├── category.py          # Category model
│   │   ├── supplier.py          # Supplier model
│   │   └── transaction.py       # Transaction model
│   │
│   ├── routes/                   # API routes
│   │   ├── __init__.py
│   │   ├── auth.py              # Authentication endpoints
│   │   ├── products.py          # Product endpoints
│   │   ├── categories.py        # Category endpoints
│   │   ├── suppliers.py         # Supplier endpoints
│   │   ├── transactions.py      # Transaction endpoints
│   │   └── reports.py           # Report endpoints
│   │
│   ├── controllers/              # Business logic
│   │   ├── __init__.py
│   │   ├── auth_controller.py
│   │   ├── product_controller.py
│   │   └── ...
│   │
│   └── utils/                    # Utility functions
│       ├── __init__.py
│       └── decorators.py        # Role-based decorators
│
├── frontend/                     # Frontend application
│   ├── index.html               # Main HTML file
│   ├── css/
│   │   └── style.css            # Stylesheets
│   └── js/
│       ├── app.js               # Main application logic
│       ├── dashboard.js         # Dashboard functions
│       ├── inventory.js         # Inventory management
│       ├── reports.js           # Reports functionality
│       ├── orders.js            # Orders management
│       ├── user_management.js   # User management
│       ├── supplier_management.js # Supplier management
│       ├── notifications.js     # Notification system
│       ├── darkmode.js          # Dark/light mode toggle
│       └── session_timeout.js   # Session timeout handler
│
├── instance/                     # Instance folder
│   └── database.db              # SQLite database file
│
├── requirements.txt              # Python dependencies
├── run.py                       # Application entry point
├── .env                         # Environment variables
└── README.md                    # Documentation
Troubleshooting
Common Issues and Solutions
Issue: ModuleNotFoundError
text
ModuleNotFoundError: No module named 'flask'
Solution:


# Activate virtual environment
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
Issue: Database not found
text
sqlalchemy.exc.OperationalError: (sqlite3.OperationalError) no such table
Solution:

bash
# Initialize database
flask init-db
Issue: Port already in use
text
OSError: [Errno 98] Address already in use
Solution:


# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or use different port
python run.py --port=5001
Issue: CORS error in browser
text
Access to fetch at 'http://localhost:5000/api/...' from origin 'http://localhost:8000' has been blocked by CORS policy
Solution:
Ensure CORS is enabled in app/__init__.py:

python
CORS(app, origins=["http://localhost:8000"])
Issue: Token expired
text
{"msg": "Token has expired"}
Solution:
Use refresh token endpoint to get new access token:

http
POST /auth/refresh
Authorization: Bearer <refresh_token>
Issue: Virtual environment not activating
bash
# On Linux/macOS
source venv/bin/activate

# On Windows
venv\Scripts\activate

# If permission denied
chmod +x venv/bin/activate
Development Guide
Adding a New Feature
Create a new branch:


git checkout -b feature/your-feature-name
Add database model if needed:

python
# app/models/new_model.py
class NewModel(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    # add fields
Create controller:

python
# app/controllers/new_controller.py
class NewController:
    @staticmethod
    def get_data():
        # business logic
        pass
Create routes:

python
# app/routes/new_routes.py
@bp.route('/data', methods=['GET'])
@jwt_required()
def get_data():
    return jsonify(NewController.get_data())
Update frontend to consume new API

Running Tests

# Run all tests
python -m pytest tests/

# Run specific test
python -m pytest tests/test_products.py
Database Migrations
For production, use Alembic for migrations:


# Install Alembic
pip install alembic

# Initialize
alembic init migrations

# Create migration
alembic revision --autogenerate -m "description"

# Apply migration
alembic upgrade head
Deployment
Deploying to Production Server
Option 1: Using Gunicorn (Linux/macOS)
bash
# Install Gunicorn
pip install gunicorn

# Run with Gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 run:app
Option 2: Using Waitress (Windows)
bash
# Install Waitress
pip install waitress

# Run with Waitress
waitress-serve --port=5000 run:app
Option 3: Docker Deployment
dockerfile
# Dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "run:app"]
bash
# Build Docker image
docker build -t inventory-system .

# Run container
docker run -p 5000:5000 inventory-system
Environment Variables for Production
bash
# .env file for production
FLASK_ENV=production
SECRET_KEY=<generate-secure-key>
JWT_SECRET_KEY=<generate-secure-key>
DATABASE_URL=postgresql://user:password@localhost/dbname
Using PostgreSQL in Production
bash
# Install PostgreSQL driver
pip install psycopg2-binary

# Update DATABASE_URL in .env
DATABASE_URL=postgresql://username:password@localhost/database_name
Frontend Deployment
Deploy to Netlify
Push frontend folder to GitHub

Connect repository to Netlify

Set publish directory to frontend

Deploy to Vercel
bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
Security Best Practices
Never commit .env file - Add to .gitignore

Use strong secrets - Generate with secrets.token_hex(32)

Enable HTTPS in production - Use Let's Encrypt

Rate limiting - Add to prevent abuse

Input validation - Validate all user inputs

SQL injection protection - Use parameterized queries (SQLAlchemy does this)

XSS protection - Escape HTML output

Regular backups - Backup database daily

Support
For issues or questions:

Check the troubleshooting section

Review API documentation

Examine server logs in terminal

License
MIT License - See LICENSE file for details

Author
Calton Momaya
Moringa School Student

Acknowledgments
Flask documentation

SQLAlchemy ORM

JWT extended library

Chart.js for visualizations




