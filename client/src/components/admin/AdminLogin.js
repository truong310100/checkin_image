import React, { useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const { instance, accounts } = useMsal();
  const navigate = useNavigate();

  useEffect(() => {
    // Nếu đã login, redirect đến admin dashboard
    if (accounts.length > 0) {
      navigate('/admin/register');
    }
  }, [accounts, navigate]);

  const handleLogin = async () => {
    try {
      await instance.loginPopup({
        scopes: ["User.Read", "openid", "profile", "email"],
        prompt: "select_account"
      });
      navigate('/admin/register');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Admin Portal
          </h1>
          <p className="text-gray-600">
            Đăng nhập bằng tài khoản Microsoft 365
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-lg font-medium text-lg transition-colors flex items-center justify-center space-x-3"
          >
            <svg className="w-6 h-6" viewBox="0 0 23 23" fill="none">
              <rect width="11" height="11" fill="#f25022"/>
              <rect x="12" width="11" height="11" fill="#00a4ef"/>
              <rect y="12" width="11" height="11" fill="#7fba00"/>
              <rect x="12" y="12" width="11" height="11" fill="#ffb900"/>
            </svg>
            <span>Đăng nhập với Microsoft 365</span>
          </button>

          <div className="text-center text-sm text-gray-500 mt-6">
            <p>Chỉ dành cho quản trị viên</p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <a
              href="/"
              className="block text-center text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Quay về trang Checkin
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
