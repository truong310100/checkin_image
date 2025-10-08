"""
Database initialization
"""
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def init_db(app):
    """Initialize database with Flask app"""
    db.init_app(app)
    
    # Import models after db initialization to avoid circular imports
    with app.app_context():
        from models import User, Attendance
    
def create_tables(app):
    """Create database tables"""
    try:
        with app.app_context():
            # Import models
            from models import User, Attendance
            db.create_all()
            print("✅ Database tables created successfully!")
    except Exception as e:
        print(f"❌ Error creating database tables: {str(e)}")
        print("Please make sure MySQL server is running and database 'checkin' exists.")