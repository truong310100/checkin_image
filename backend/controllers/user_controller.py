"""
User controller for user-related operations
"""
from flask import request, jsonify
from services.user_service import UserService

class UserController:
    """Controller for user operations"""
    
    @staticmethod
    def register():
        """Return registration form requirements"""
        return jsonify({
            'success': True,
            'message': 'User registration endpoint',
            'required_fields': ['name', 'email', 'employee_id', 'image_data'],
            'method': 'POST'
        })
    
    @staticmethod
    def register_user():
        """Process user registration"""
        try:
            data = request.get_json() if request.is_json else request.form
            
            name = data.get('name')
            email = data.get('email')
            employee_id = data.get('employee_id')
            image_data = data.get('image_data')
            
            if not image_data:
                return jsonify({
                    'success': False,
                    'message': 'Vui lòng chụp ảnh khuôn mặt!'
                }), 400
            
            user, error = UserService.create_user(name, email, employee_id, image_data)
            
            if error:
                return jsonify({
                    'success': False,
                    'message': error
                }), 400
            
            return jsonify({
                'success': True,
                'message': 'Đăng ký thành công!',
                'user': {
                    'id': user.id,
                    'name': user.name,
                    'email': user.email,
                    'employee_id': user.employee_id,
                    'created_at': user.created_at.isoformat() if user.created_at else None
                }
            })
            
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'Lỗi server: {str(e)}'
            }), 500
    
    @staticmethod
    def history():
        """Get all users for history selection"""
        try:
            users = UserService.get_all_users()
            users_data = []
            
            for user in users:
                users_data.append({
                    'id': user.id,
                    'name': user.name,
                    'email': user.email,
                    'employee_id': user.employee_id,
                    'created_at': user.created_at.isoformat() if user.created_at else None
                })
            
            return jsonify({
                'success': True,
                'users': users_data,
                'total': len(users_data)
            })
            
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'Lỗi server: {str(e)}'
            }), 500