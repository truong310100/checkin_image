import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiService from '../services/apiService';

const UserHistory = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  
  const [user, setUser] = useState(null);
  const [attendances, setAttendances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userId) {
      fetchUserHistory();
    }
  }, [userId]);

  const fetchUserHistory = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getUserHistory(userId);
      
      if (response.success) {
        setUser(response.user);
        setAttendances(response.attendances);
      } else {
        setError(response.message || 'Không thể tải lịch sử Checkin');
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '-';
    const date = new Date(dateTimeString);
    return date.toLocaleString('vi-VN');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return '-';
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusBadge = (attendance) => {
    if (attendance.checkin_time && attendance.checkout_time) {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
          ✅ Hoàn thành
        </span>
      );
    } else if (attendance.checkin_time) {
      return (
        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
          ⏳ Đang làm việc
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
        ❓ Không xác định
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-xl text-gray-600">Đang tải lịch sử Checkin...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-xl text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/history')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            ← Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              📊 Lịch sử Checkin
            </h1>
            {user && (
              <div className="flex items-center space-x-4 text-gray-600">
                <span className="flex items-center">
                  <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-2">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  {user.name}
                </span>
                <span>•</span>
                <span>ID: {user.employee_id}</span>
                <span>•</span>
                <span>{user.email}</span>
              </div>
            )}
          </div>
          
          <button
            onClick={fetchUserHistory}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            🔄 Làm mới
          </button>
        </div>

            {/* Statistics */}
            {attendances.length > 0 && (
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg p-6 text-center">
                  <div className="text-3xl mb-2">📈</div>
                  <div className="text-2xl font-bold text-green-700">{attendances.length}</div>
                  <div className="text-sm text-green-600">Tổng số ngày</div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-lg p-6 text-center">
                  <div className="text-3xl mb-2">✅</div>
                  <div className="text-2xl font-bold text-blue-700">
                    {attendances.filter(a => a.checkin_time && a.checkout_time).length}
                  </div>
                  <div className="text-sm text-blue-600">Ngày hoàn thành</div>
                </div>
                
                <div className="bg-gradient-to-br from-yellow-50 to-orange-100 rounded-lg p-6 text-center">
                  <div className="text-3xl mb-2">⏳</div>
                  <div className="text-2xl font-bold text-orange-700">
                    {attendances.filter(a => a.checkin_time && !a.checkout_time).length}
                  </div>
                  <div className="text-sm text-orange-600">Đang làm việc</div>
                </div>
              </div>
            )}

            {/* Attendance List */}
            {attendances.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-8xl mb-6">📋</div>
                <h3 className="text-2xl font-semibold text-gray-700 mb-4">
                  Chưa có lịch sử Checkin
                </h3>
                <p className="text-gray-600 mb-6">
                  Người dùng này chưa thực hiện Checkin lần nào
                </p>
                <button
                  onClick={() => navigate('/checkin')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  ⏰ Checkin ngay
                </button>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  Chi tiết Checkin ({attendances.length} ngày)
                </h2>
                
                <div className="overflow-x-auto">
                  <table className="w-full bg-white rounded-lg shadow-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Ngày</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Check-in</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Check-out</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Thời gian làm việc</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {attendances.map((attendance) => (
                        <tr key={attendance.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {formatDate(attendance.date)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {formatTime(attendance.checkin_time)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {formatTime(attendance.checkout_time)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {attendance.duration || '-'}
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(attendance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
    </div>
  );
};

export default UserHistory;