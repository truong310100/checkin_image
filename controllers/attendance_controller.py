"""
Attendance controller for check-in/check-out operations
"""
from flask import render_template, request, jsonify
from services.user_service import UserService
from services.attendance_service import AttendanceService
from services.face_recognition_service import FaceRecognitionService

class AttendanceController:
    """Controller for attendance operations"""
    
    @staticmethod
    def checkin():
        """Show check-in page"""
        return render_template('checkin.html')
    
    @staticmethod
    def process_checkin():
        """Process face recognition and check-in/check-out"""
        image_data = request.form.get('image_data')
        
        if not image_data:
            return jsonify({'success': False, 'message': 'Không có dữ liệu ảnh!'})
        
        # Get all users for face recognition
        users = UserService.get_all_users()
        
        # Recognize face
        found_user, confidence, error = FaceRecognitionService.recognize_face(image_data, users)
        
        if error:
            return jsonify({'success': False, 'message': error})
        
        if not found_user:
            return jsonify({'success': False, 'message': 'Không nhận diện được khuôn mặt! Vui lòng đăng ký trước.'})
        
        # Process attendance
        result, error = AttendanceService.process_checkin(found_user)
        
        if error:
            return jsonify({'success': False, 'message': error})
        
        return jsonify(result)
    
    @staticmethod
    def user_history(user_id):
        """Show attendance history for a specific user"""
        user = UserService.get_user_by_id(user_id)
        if not user:
            return "User not found", 404
        
        attendances = AttendanceService.get_user_attendances(user_id)
        return render_template('user_history.html', user=user, attendances=attendances)