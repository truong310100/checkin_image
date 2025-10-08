"""
Main controller for home and general routes
"""
from flask import render_template

class MainController:
    """Controller for main application routes"""
    
    @staticmethod
    def index():
        """Home page"""
        return render_template('index.html')
    
    @staticmethod
    def debug():
        """Debug page"""
        return render_template('debug.html')