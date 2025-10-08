"""
Attendance service
"""
from datetime import datetime, date
from models import Attendance
from config.database import db

class AttendanceService:
    """Service for attendance operations"""
    
    @staticmethod
    def process_checkin(user):
        """
        Process check-in/check-out for a user
        Returns: (result_dict, error_message)
        """
        try:
            today = date.today()
            attendance = Attendance.query.filter_by(user_id=user.id, date=today).first()
            
            if not attendance:
                # First time today - Check-in
                attendance = Attendance(
                    user_id=user.id,
                    date=today,
                    check_in=datetime.now()
                )
                db.session.add(attendance)
                db.session.commit()
                
                return {
                    'success': True,
                    'message': f'Chào {user.name}! Check-in thành công lúc {attendance.check_in.strftime("%H:%M:%S")}',
                    'type': 'check_in',
                    'user': user.name,
                    'time': attendance.check_in.strftime("%H:%M:%S")
                }, None
            
            else:
                # Second time onwards - Update check-out (overwrite previous)
                old_checkout = attendance.check_out.strftime("%H:%M:%S") if attendance.check_out else None
                attendance.check_out = datetime.now()
                attendance.updated_at = datetime.now()
                db.session.commit()
                
                # Different message for first check-out vs update
                if old_checkout:
                    message = f'Cập nhật check-out cho {user.name}! Thời gian mới: {attendance.check_out.strftime("%H:%M:%S")} (trước đó: {old_checkout})'
                else:
                    message = f'Tạm biệt {user.name}! Check-out thành công lúc {attendance.check_out.strftime("%H:%M:%S")}'
                
                return {
                    'success': True,
                    'message': message,
                    'type': 'check_out',
                    'user': user.name,
                    'time': attendance.check_out.strftime("%H:%M:%S"),
                    'is_update': old_checkout is not None
                }, None
                
        except Exception as e:
            return None, f"Lỗi xử lý điểm danh: {str(e)}"
    
    @staticmethod
    def get_user_attendances(user_id, limit=None):
        """Get attendance records for a specific user"""
        query = Attendance.query.filter_by(user_id=user_id).order_by(Attendance.date.desc())
        if limit:
            query = query.limit(limit)
        return query.all()
    
    @staticmethod
    def get_attendance_by_date(attendance_date):
        """Get all attendance records for a specific date"""
        return Attendance.query.filter_by(date=attendance_date).all()
    
    @staticmethod
    def get_attendance_stats(user_id, start_date=None, end_date=None):
        """Get attendance statistics for a user"""
        query = Attendance.query.filter_by(user_id=user_id)
        
        if start_date:
            query = query.filter(Attendance.date >= start_date)
        if end_date:
            query = query.filter(Attendance.date <= end_date)
        
        attendances = query.all()
        
        total_days = len(attendances)
        complete_days = len([a for a in attendances if a.check_out])
        incomplete_days = total_days - complete_days
        completion_rate = (complete_days / total_days * 100) if total_days > 0 else 0
        
        return {
            'total_days': total_days,
            'complete_days': complete_days,
            'incomplete_days': incomplete_days,
            'completion_rate': round(completion_rate, 1)
        }