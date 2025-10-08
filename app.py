from flask import Flask, render_template, request, redirect, url_for, jsonify, flash
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, date
import face_recognition
import cv2
import numpy as np
import os
import base64
from PIL import Image
import io
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'

# MySQL Database Configuration
DB_HOST = os.getenv('HOST', 'localhost')
DB_USER = os.getenv('USER_DB', 'root')
DB_PASSWORD = os.getenv('PASSWORD', '')
DB_NAME = os.getenv('DB', 'checkin')
DB_DIALECT = os.getenv('DIALECT', 'mysql')

# Construct MySQL connection string
app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}?charset=utf8mb4'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_pre_ping': True,
    'pool_recycle': 300,
}

db = SQLAlchemy(app)

# Database Models
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False, index=True)
    employee_id = db.Column(db.String(50), unique=True, nullable=False, index=True)
    face_encoding = db.Column(db.Text, nullable=False)  # Lưu face encoding dưới dạng string
    image_path = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    attendances = db.relationship('Attendance', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<User {self.name} ({self.employee_id})>'

class Attendance(db.Model):
    __tablename__ = 'attendance'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    date = db.Column(db.Date, nullable=False, default=date.today, index=True)
    check_in = db.Column(db.DateTime)
    check_out = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Unique constraint để đảm bảo mỗi user chỉ có 1 bản ghi attendance per day
    __table_args__ = (db.UniqueConstraint('user_id', 'date', name='unique_user_date'),)
    
    def __repr__(self):
        return f'<Attendance {self.user.name} on {self.date}>'

# Tạo database tables
def create_tables():
    try:
        with app.app_context():
            db.create_all()
            print("✅ Database tables created successfully!")
    except Exception as e:
        print(f"❌ Error creating database tables: {str(e)}")
        print("Please make sure MySQL server is running and database 'checkin' exists.")

# Initialize database tables
create_tables()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/register')
def register():
    return render_template('register.html')

@app.route('/register', methods=['POST'])
def register_user():
    try:
        name = request.form.get('name')
        email = request.form.get('email')
        employee_id = request.form.get('employee_id')
        image_data = request.form.get('image_data')
        
        # Kiểm tra user đã tồn tại
        if User.query.filter_by(email=email).first():
            flash('Email đã được sử dụng!', 'error')
            return redirect(url_for('register'))
            
        if User.query.filter_by(employee_id=employee_id).first():
            flash('Mã sinh viên đã được sử dụng!', 'error')
            return redirect(url_for('register'))
        
        # Xử lý ảnh và tạo face encoding
        if image_data:
            # Decode base64 image
            image_data = image_data.split(',')[1]  # Remove data:image/jpeg;base64,
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes))
            
            # Lưu ảnh
            image_filename = f"{employee_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"
            image_path = os.path.join('face_images', image_filename)
            image.save(image_path)
            
            # Tạo face encoding
            image_rgb = np.array(image)
            face_encodings = face_recognition.face_encodings(image_rgb)
            
            if len(face_encodings) == 0:
                flash('Không tìm thấy khuôn mặt trong ảnh! Vui lòng thử lại.', 'error')
                return redirect(url_for('register'))
            
            face_encoding = face_encodings[0]
            face_encoding_str = ','.join(map(str, face_encoding))
            
            # Tạo user mới
            new_user = User(
                name=name,
                email=email,
                employee_id=employee_id,
                face_encoding=face_encoding_str,
                image_path=image_path
            )
            
            db.session.add(new_user)
            db.session.commit()
            
            flash('Đăng ký thành công!', 'success')
            return redirect(url_for('index'))
        else:
            flash('Vui lòng chụp ảnh khuôn mặt!', 'error')
            return redirect(url_for('register'))
            
    except Exception as e:
        flash(f'Có lỗi xảy ra: {str(e)}', 'error')
        return redirect(url_for('register'))

@app.route('/checkin')
def checkin():
    return render_template('checkin.html')

@app.route('/checkin', methods=['POST'])
def process_checkin():
    try:
        image_data = request.form.get('image_data')
        
        if not image_data:
            return jsonify({'success': False, 'message': 'Không có dữ liệu ảnh!'})
        
        # Decode base64 image
        image_data = image_data.split(',')[1]
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        image_rgb = np.array(image)
        
        # Tìm face encodings trong ảnh
        face_locations = face_recognition.face_locations(image_rgb)
        face_encodings = face_recognition.face_encodings(image_rgb, face_locations)
        
        if len(face_encodings) == 0:
            return jsonify({'success': False, 'message': 'Không tìm thấy khuôn mặt trong ảnh!'})
        
        # So sánh với tất cả users trong database
        users = User.query.all()
        found_user = None
        best_match_distance = float('inf')
        
        # Thu thập tất cả face encodings đã lưu
        stored_encodings = []
        user_list = []
        
        for user in users:
            try:
                # Convert face encoding từ string về numpy array
                stored_encoding = np.array([float(x) for x in user.face_encoding.split(',')])
                stored_encodings.append(stored_encoding)
                user_list.append(user)
            except Exception as e:
                print(f"Error processing user {user.name}: {str(e)}")
                continue
        
        if not stored_encodings:
            return jsonify({'success': False, 'message': 'Không có dữ liệu khuôn mặt nào trong hệ thống!'})
        
        # So sánh từng khuôn mặt phát hiện được với database
        for face_encoding in face_encodings:
            # Tính khoảng cách với tất cả face encodings trong database
            face_distances = face_recognition.face_distance(stored_encodings, face_encoding)
            
            # Tìm khoảng cách nhỏ nhất
            min_distance_index = np.argmin(face_distances)
            min_distance = face_distances[min_distance_index]
            
            # Nếu khoảng cách nhỏ hơn threshold và tốt hơn match trước đó
            if min_distance < 0.6 and min_distance < best_match_distance:
                found_user = user_list[min_distance_index]
                best_match_distance = min_distance
                print(f"Found match: {found_user.name} with distance: {min_distance:.3f}")
        
        # Log thông tin debug
        print(f"Total users in database: {len(users)}")
        print(f"Face encodings found in image: {len(face_encodings)}")
        print(f"Best match distance: {best_match_distance:.3f}")
        
        if found_user:
            print(f"Successfully matched user: {found_user.name} (ID: {found_user.employee_id})")
        else:
            print("No match found within tolerance")
        
        if not found_user:
            return jsonify({'success': False, 'message': 'Không nhận diện được khuôn mặt! Vui lòng đăng ký trước.'})
        
        # Xử lý check-in/check-out
        today = date.today()
        attendance = Attendance.query.filter_by(user_id=found_user.id, date=today).first()
        
        if not attendance:
            # Lần đầu trong ngày - Check-in
            attendance = Attendance(
                user_id=found_user.id,
                date=today,
                check_in=datetime.now()
            )
            db.session.add(attendance)
            db.session.commit()
            
            return jsonify({
                'success': True, 
                'message': f'Chào {found_user.name}! Check-in thành công lúc {attendance.check_in.strftime("%H:%M:%S")}',
                'type': 'check_in',
                'user': found_user.name,
                'time': attendance.check_in.strftime("%H:%M:%S")
            })
        
        else:
            # Từ lần thứ 2 trở đi - Luôn cập nhật check-out (ghi đè thời gian cũ)
            old_checkout = attendance.check_out.strftime("%H:%M:%S") if attendance.check_out else None
            attendance.check_out = datetime.now()
            attendance.updated_at = datetime.now()  # Cập nhật thời gian sửa đổi
            db.session.commit()
            
            # Thông báo khác nhau nếu là lần đầu check-out hoặc cập nhật check-out
            if old_checkout:
                message = f'Cập nhật check-out cho {found_user.name}! Thời gian mới: {attendance.check_out.strftime("%H:%M:%S")} (trước đó: {old_checkout})'
            else:
                message = f'Tạm biệt {found_user.name}! Check-out thành công lúc {attendance.check_out.strftime("%H:%M:%S")}'
            
            return jsonify({
                'success': True, 
                'message': message,
                'type': 'check_out',
                'user': found_user.name,
                'time': attendance.check_out.strftime("%H:%M:%S"),
                'is_update': old_checkout is not None
            })
            
    except Exception as e:
        return jsonify({'success': False, 'message': f'Có lỗi xảy ra: {str(e)}'})

@app.route('/history')
def history():
    users = User.query.all()
    return render_template('history.html', users=users)

@app.route('/debug')
def debug():
    return render_template('debug.html')

@app.route('/history/<int:user_id>')
def user_history(user_id):
    user = User.query.get_or_404(user_id)
    attendances = Attendance.query.filter_by(user_id=user_id).order_by(Attendance.date.desc()).all()
    return render_template('user_history.html', user=user, attendances=attendances)

@app.route('/debug/users')
def debug_users():
    """Debug endpoint để kiểm tra thông tin users trong database"""
    try:
        users = User.query.all()
        users_info = []
        
        for user in users:
            # Kiểm tra face encoding
            try:
                face_encoding_array = np.array([float(x) for x in user.face_encoding.split(',')])
                encoding_valid = len(face_encoding_array) == 128  # Face encoding phải có 128 dimensions
            except:
                encoding_valid = False
            
            # Kiểm tra file ảnh
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
        
        return jsonify({
            'success': True,
            'total_users': len(users),
            'users': users_info
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

@app.route('/debug/test_recognition', methods=['POST'])
def test_recognition():
    """Debug endpoint để test nhận diện khuôn mặt"""
    try:
        image_data = request.form.get('image_data')
        
        if not image_data:
            return jsonify({'success': False, 'message': 'Không có dữ liệu ảnh!'})
        
        # Decode base64 image
        image_data = image_data.split(',')[1]
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        image_rgb = np.array(image)
        
        # Tìm face encodings trong ảnh
        face_locations = face_recognition.face_locations(image_rgb)
        face_encodings = face_recognition.face_encodings(image_rgb, face_locations)
        
        # Lấy thông tin tất cả users
        users = User.query.all()
        
        result = {
            'success': True,
            'faces_detected': len(face_encodings),
            'face_locations': face_locations,
            'total_users_in_db': len(users),
            'comparison_results': []
        }
        
        if len(face_encodings) > 0:
            for i, face_encoding in enumerate(face_encodings):
                face_result = {
                    'face_index': i,
                    'matches': []
                }
                
                for user in users:
                    try:
                        stored_encoding = np.array([float(x) for x in user.face_encoding.split(',')])
                        distance = face_recognition.face_distance([stored_encoding], face_encoding)[0]
                        is_match = distance < 0.6
                        
                        face_result['matches'].append({
                            'user_name': user.name,
                            'employee_id': user.employee_id,
                            'distance': round(float(distance), 3),
                            'is_match': is_match
                        })
                    except Exception as e:
                        face_result['matches'].append({
                            'user_name': user.name,
                            'employee_id': user.employee_id,
                            'error': str(e)
                        })
                
                # Sắp xếp theo khoảng cách
                face_result['matches'].sort(key=lambda x: x.get('distance', float('inf')))
                result['comparison_results'].append(face_result)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

# if __name__ == '__main__':
#     app.run(debug=True)
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)