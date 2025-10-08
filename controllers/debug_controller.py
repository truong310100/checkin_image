"""
Debug controller for debugging and testing
"""
from flask import request, jsonify
from services.user_service import UserService
from services.face_recognition_service import FaceRecognitionService

class DebugController:
    """Controller for debug operations"""
    
    @staticmethod
    def debug_users():
        """Debug endpoint to check user information in database"""
        try:
            debug_info = UserService.get_users_debug_info()
            return jsonify({
                'success': True,
                **debug_info
            })
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            })
    
    @staticmethod
    def test_recognition():
        """Debug endpoint to test face recognition"""
        try:
            image_data = request.form.get('image_data')
            
            if not image_data:
                return jsonify({'success': False, 'message': 'Không có dữ liệu ảnh!'})
            
            # Get all users
            users = UserService.get_all_users()
            
            # Get detailed comparison results
            result = FaceRecognitionService.get_face_comparison_details(image_data, users)
            
            return jsonify({
                'success': True,
                **result
            })
            
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            })