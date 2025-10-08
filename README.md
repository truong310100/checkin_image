# Hệ Thống Điểm Danh Bằng Khuôn Mặt

Một ứng dụng web hiện đại sử dụng công nghệ nhận diện khuôn mặt để quản lý điểm danh sinh viên tự động.

## ✨ Tính Năng Chính

- 👤 **Đăng ký thông tin sinh viên**: Nhập thông tin cá nhân và chụp ảnh khuôn mặt
- 📷 **Điểm danh bằng khuôn mặt**: Sử dụng webcam để nhận diện và ghi nhận thời gian
- ⏰ **Check-in/Check-out tự động**: Lần đầu trong ngày = check-in, lần thứ 2 = check-out
- 📊 **Xem lịch sử điểm danh**: Theo dõi lịch sử làm việc của từng sinh viên
- 📱 **Giao diện responsive**: Hoạt động tốt trên mọi thiết bị

## 🛠️ Công Nghệ Sử Dụng

- **Backend**: Flask (Python)
- **Database**: SQLite
- **AI/ML**: face_recognition library
- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap 5
- **Camera**: WebRTC API

## 📋 Yêu Cầu Hệ Thống

- Python 3.7+
- Webcam
- Trình duyệt hiện đại (Chrome, Firefox, Safari, Edge)
- Kết nối internet (để tải Bootstrap và FontAwesome)

## 🚀 Hướng Dẫn Cài Đặt

### 1. Clone dự án
```bash
git clone <repository-url>
cd checkin_Image
```

### 2. Tạo môi trường ảo
```bash
# Tạo môi trường ảo
python -m venv venv

# Kích hoạt môi trường ảo
# Trên macOS/Linux:
source venv/bin/activate

# Trên Windows:
venv\Scripts\activate
```

### 3. Cài đặt thư viện
```bash
pip install -r requirements.txt
```

### 4. Chạy ứng dụng
```bash
python app.py
```

### 5. Truy cập ứng dụng
Mở trình duyệt và truy cập: `http://localhost:5000`

## 📖 Hướng Dẫn Sử Dụng

### Đăng Ký sinh viên Mới
1. Truy cập trang "Đăng ký"
2. Nhập đầy đủ thông tin:
   - Họ và tên
   - Email (duy nhất)
   - Mã sinh viên (duy nhất)
3. Bấm "Bật camera" và chụp ảnh khuôn mặt
4. Đảm bảo khuôn mặt rõ nét và đủ ánh sáng
5. Bấm "Đăng ký" để hoàn tất

### Điểm Danh Hằng Ngày
1. Truy cập trang "Điểm danh"
2. Bấm "Bật camera"
3. Nhìn thẳng vào camera và bấm "Điểm danh"
4. Hệ thống sẽ tự động nhận diện và ghi nhận:
   - **Lần 1 trong ngày**: Check-in
   - **Lần 2 trong ngày**: Check-out

### Xem Lịch Sử
1. Truy cập trang "Lịch sử"
2. Chọn sinh viên cần xem
3. Xem chi tiết thời gian check-in/check-out
4. Theo dõi thống kê làm việc

## 📁 Cấu Trúc Dự Án

```
checkin_Image/
├── app.py                 # File chính của ứng dụng
├── requirements.txt       # Danh sách thư viện
├── face_attendance.db    # Database SQLite (tự động tạo)
├── face_images/          # Thư mục lưu ảnh khuôn mặt
├── templates/            # Templates HTML
│   ├── base.html
│   ├── index.html
│   ├── register.html
│   ├── checkin.html
│   ├── history.html
│   └── user_history.html
└── static/               # CSS, JS, assets
    ├── css/
    │   └── style.css
    └── js/
        └── main.js
```

## 🔧 Cấu Hình

### Thay đổi Secret Key
Mở file `app.py` và thay đổi:
```python
app.config['SECRET_KEY'] = 'your-secret-key-here'
```

### Điều chỉnh độ chính xác nhận diện
Trong hàm `process_checkin()`, thay đổi giá trị `tolerance`:
```python
matches = face_recognition.compare_faces([stored_encoding], face_encoding, tolerance=0.6)
```
- Giá trị thấp hơn (0.4-0.5): Chính xác hơn, khó nhận diện hơn
- Giá trị cao hơn (0.7-0.8): Dễ nhận diện hơn, có thể kém chính xác

## 🚨 Lưu Ý Quan Trọng

### Về Bảo Mật
- **Không sử dụng trong môi trường production** mà không có HTTPS
- Thay đổi SECRET_KEY thành giá trị phức tạp và bảo mật
- Cân nhắc mã hóa dữ liệu nhạy cảm trong database

### Về Hiệu Suất
- Với nhiều sinh viên (>100), cân nhắc tối ưu hóa thuật toán so sánh
- Nén ảnh để tiết kiệm dung lượng lưu trữ
- Sử dụng database mạnh hơn (PostgreSQL, MySQL) cho production

### Về Camera
- Đảm bảo ánh sáng đủ sáng khi chụp ảnh đăng ký
- Tránh đeo kính đen hoặc che khuất khuôn mặt
- Camera độ phân giải càng cao càng tốt

## 🔍 Xử Lý Sự Cố

### Lỗi không nhận diện được khuôn mặt
1. Kiểm tra ánh sáng
2. Đảm bảo khuôn mặt nhìn thẳng camera
3. Thử điều chỉnh `tolerance` trong code
4. Kiểm tra chất lượng ảnh đã đăng ký

### Lỗi camera không hoạt động
1. Kiểm tra quyền truy cập camera trong trình duyệt
2. Đảm bảo không có ứng dụng nào khác đang sử dụng camera
3. Thử refresh trang hoặc restart trình duyệt

### Lỗi cài đặt thư viện
```bash
# Nếu gặp lỗi với face_recognition trên macOS
brew install cmake
pip install dlib
pip install face_recognition

# Nếu gặp lỗi với opencv-python
pip install opencv-python-headless
```

## 🤝 Đóng Góp

Nếu bạn muốn đóng góp cho dự án:
1. Fork repository
2. Tạo branch mới cho feature
3. Commit các thay đổi
4. Tạo Pull Request

## 📄 Giấy Phép

Dự án này được phát hành dưới giấy phép MIT. Xem file LICENSE để biết thêm chi tiết.

## 📞 Hỗ Trợ

Nếu gặp vấn đề hoặc có câu hỏi:
- Tạo issue trên GitHub
- Liên hệ qua email: [your-email@example.com]

---

**Lưu ý**: Đây là dự án demo/học tập. Để sử dụng trong môi trường production, cần bổ sung thêm các tính năng bảo mật và tối ưu hóa hiệu suất.