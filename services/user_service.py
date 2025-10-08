"""
User service
"""
from models import User
from config.database import db
from services.face_recognition_service import FaceRecognitionService
import os
import numpy as np

class UserService:
    """Service for user operations"""
    
    @staticmethod
    def create_user(name, email, employee_id, image_data):
        """
        Create a new user with face recognition data
        Returns: (user, error_message)
        """
        try:
            # Check if user already exists
            if User.query.filter_by(email=email).first():
                return None, 'Email đã được sử dụng!'
            
            if User.query.filter_by(employee_id=employee_id).first():
                return None, 'Mã sinh viên đã được sử dụng!'
            
            # Process face image
            face_encoding, face_error = FaceRecognitionService.encode_face_from_base64(image_data)
            if face_error:
                return None, face_error
            
            # Save image
            image_path, image_error = FaceRecognitionService.save_face_image(image_data, employee_id)
            if image_error:
                return None, image_error
            
            # Convert face encoding to string
            face_encoding_str = ','.join(map(str, face_encoding))
            
            # Create new user
            new_user = User(
                name=name,
                email=email,
                employee_id=employee_id,
                face_encoding=face_encoding_str,
                image_path=image_path
            )
            
            db.session.add(new_user)
            db.session.commit()
            
            return new_user, None
            
        except Exception as e:
            return None, f'Có lỗi xảy ra: {str(e)}'
    
    @staticmethod
    def get_all_users():
        """Get all users"""
        return User.query.all()
    
    @staticmethod
    def get_user_by_id(user_id):
        """Get user by ID"""
        return User.query.get(user_id)
    
    @staticmethod
    def get_user_by_employee_id(employee_id):
        """Get user by employee ID"""
        return User.query.filter_by(employee_id=employee_id).first()
    
    @staticmethod
    def get_user_by_email(email):
        """Get user by email"""
        return User.query.filter_by(email=email).first()
    
    @staticmethod
    def get_users_debug_info():
        """Get debug information for all users"""
        users = User.query.all()
        users_info = []
        
        for user in users:
            # Check face encoding validity
            try:
                face_encoding_array = np.array([float(x) for x in user.face_encoding.split(',')])
                encoding_valid = len(face_encoding_array) == 128  # Face encoding must have 128 dimensions
            except:
                encoding_valid = False
            
            # Check image file existence
            image_exists = os.path.exists(user.image_path)
            
            users_info.append({
                'id': user.id,
                'name': user.name,
                'employee_id': user.employee_id,
                'email': user.email,
                'image_path': user.image_path,
                'image_exists': image_exists,
                'encoding_valid': encoding_valid,
                'encoding_length': len(user.face_encoding.split(',')) if user.face_encoding else 0,
                'created_at': user.created_at.strftime('%Y-%m-%d %H:%M:%S')
            })
        
        return {
            'total_users': len(users),
            'users': users_info
        }
    
    @staticmethod
    def update_user(user_id, **kwargs):
        """Update user information"""
        try:
            user = User.query.get(user_id)
            if not user:
                return None, "User not found"
            
            for key, value in kwargs.items():
                if hasattr(user, key):
                    setattr(user, key, value)
            
            db.session.commit()
            return user, None
            
        except Exception as e:
            return None, f"Error updating user: {str(e)}"
    
    @staticmethod
    def delete_user(user_id):
        """Delete a user"""
        try:
            user = User.query.get(user_id)
            if not user:
                return False, "User not found"
            
            # Delete image file if exists
            if os.path.exists(user.image_path):
                os.remove(user.image_path)
            
            db.session.delete(user)
            db.session.commit()
            return True, None
            
        except Exception as e:
            return False, f"Error deleting user: {str(e)}"