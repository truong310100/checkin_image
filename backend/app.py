"""
Face Attendance System - Main Application
"""
from flask import Flask
from flask_cors import CORS
from config.config import config
from config.database import init_db, create_tables
from controllers.routes import register_blueprints
import os

def create_app(config_name=None):
    """Application factory pattern"""
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'default')
    
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Enable CORS for all routes
    CORS(app, origins=['http://localhost:3000'])
    
    # Initialize database
    init_db(app)
    
    # Register blueprints
    register_blueprints(app)
    
    # Create database tables
    create_tables(app)
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5001, debug=True)

#Run the app with: python3 backend/app.py