"""
Main controller for home and general routes
"""
from flask import jsonify

class MainController:
    """Controller for main application routes"""
    
    @staticmethod
    def index():
        """API status endpoint"""
        return jsonify({
            'success': True,
            'message': 'Face Recognition Attendance API is running',
            'version': '1.0.0',
            'endpoints': {
                'register': '/user/register',
                'checkin': '/attendance/checkin',
                'history': '/user/history',
                'user_history': '/attendance/history/<user_id>'
            }
        })
    
    @staticmethod
    def debug():
        """Debug API information"""
        return jsonify({
            'success': True,
            'message': 'Debug API endpoint',
            'debug_endpoints': {
                'users': '/debug/users',
                'test_recognition': '/debug/test_recognition'
            }
        })