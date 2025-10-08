import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Hệ thống điểm danh bằng khuôn mặt
          </h1>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Register Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
            <div className="text-6xl mb-6">👤</div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Đăng ký</h3>
            <p className="text-gray-600 mb-6">
              Đăng ký tài khoản mới và chụp ảnh khuôn mặt để tạo hồ sơ nhận diện
            </p>
            <Link 
              to="/register" 
              className="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              ✨ Đăng ký ngay
            </Link>
          </div>

          {/* Check-in Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
            <div className="text-6xl mb-6">⏰</div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Điểm danh</h3>
            <p className="text-gray-600 mb-6">
              Sử dụng webcam để nhận diện khuôn mặt và ghi nhận thời gian check-in/check-out
            </p>
            <Link 
              to="/checkin" 
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              📸 Điểm danh
            </Link>
          </div>

          {/* History Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
            <div className="text-6xl mb-6">📊</div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Lịch sử điểm danh</h3>
            <p className="text-gray-600 mb-6">
              Xem lại lịch sử điểm danh của tất cả nhân viên trong hệ thống
            </p>
            <Link 
              to="/history" 
              className="inline-block bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              📈 Xem lịch sử
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;