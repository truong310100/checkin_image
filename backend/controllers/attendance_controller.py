"""
Attendance controller for check-in/check-out operations
"""
from flask import request, jsonify
from services.user_service import UserService
from services.attendance_service import AttendanceService
from services.face_recognition_service import FaceRecognitionService

class AttendanceController:
    """Controller for attendance operations"""
    
    @staticmethod
    def checkin():
        """Return check-in endpoint information"""
        return jsonify({
            'success': True,
            'message': 'Face recognition check-in endpoint',
            'required_fields': ['image_data'],
            'method': 'POST',
            'description': 'Send base64 encoded image for face recognition check-in/check-out'
        })
    
    @staticmethod
    def process_checkin():
        """Process face recognition and check-in/check-out"""
        try:
            data = request.get_json() if request.is_json else request.form
            image_data = data.get('image_data')
            
            if not image_data:
                return jsonify({
                    'success': False,
                    'message': 'Không có dữ liệu ảnh!'
                }), 400
            
            # Get all users for face recognition
            users = UserService.get_all_users()
            
            # Recognize face
            found_user, confidence, error = FaceRecognitionService.recognize_face(image_data, users)
            
            if error:
                return jsonify({
                    'success': False,
                    'message': error
                }), 400
            
            if not found_user:
                return jsonify({
                    'success': False,
                    'message': 'Không nhận diện được khuôn mặt! Vui lòng đăng ký trước.'
                }), 404
            
            # Process attendance
            result, error = AttendanceService.process_checkin(found_user)
            
            if error:
                return jsonify({
                    'success': False,
                    'message': error
                }), 400
            
            return jsonify(result)
            
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'Lỗi server: {str(e)}'
            }), 500
    
    @staticmethod
    def user_history(user_id):
        """Get attendance history for a specific user"""
        try:
            user = UserService.get_user_by_id(user_id)
            if not user:
                return jsonify({
                    'success': False,
                    'message': 'Không tìm thấy người dùng'
                }), 404
            
            attendances = AttendanceService.get_user_attendances(user_id)
            
            # Convert attendance data to JSON format
            attendance_data = []
            for attendance in attendances:
                # Calculate duration if both check_in and check_out exist
                duration = None
                if attendance.check_in and attendance.check_out:
                    time_diff = attendance.check_out - attendance.check_in
                    hours = int(time_diff.total_seconds() // 3600)
                    minutes = int((time_diff.total_seconds() % 3600) // 60)
                    duration = f"{hours}h {minutes}m"
                
                attendance_data.append({
                    'id': attendance.id,
                    'checkin_time': attendance.check_in.isoformat() if attendance.check_in else None,
                    'checkout_time': attendance.check_out.isoformat() if attendance.check_out else None,
                    'date': attendance.date.isoformat() if attendance.date else None,
                    'duration': duration
                })
            
            return jsonify({
                'success': True,
                'user': {
                    'id': user.id,
                    'name': user.name,
                    'email': user.email,
                    'employee_id': user.employee_id
                },
                'attendances': attendance_data,
                'total': len(attendance_data)
            })
            
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'Lỗi server: {str(e)}'
            }), 500