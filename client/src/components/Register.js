import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';

const Register = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    employee_id: ''
  });
  const [capturedImage, setCapturedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [forceUpdate, setForceUpdate] = useState(0); // Force re-render

  // Cleanup stream when component unmounts
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

    const startCamera = async () => {
    try {
      setError('');
      setIsCameraActive(false); // Reset state first
      console.log('Starting camera...');
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      console.log('Camera stream:', mediaStream);
      console.log('Video tracks:', mediaStream.getVideoTracks());
      
      setStream(mediaStream);
      
      // Set camera active FIRST so UI shows video element
      setIsCameraActive(true);
      
      // Use setTimeout to ensure DOM is updated
      setTimeout(() => {
        if (videoRef.current) {
          console.log('Video element found, setting srcObject');
          videoRef.current.srcObject = mediaStream;
          
          // Wait for video metadata to load
          const handleLoadedMetadata = () => {
            console.log('Video metadata loaded');
            console.log('Video dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
            setForceUpdate(prev => prev + 1); // Force re-render
          };

          videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
          
          // Force video to play
          videoRef.current.play().then(() => {
            console.log('Video play successful');
          }).catch((playError) => {
            console.log('Video play error:', playError);
          });
        } else {
          console.error('Video element not found after setting camera active');
        }
      }, 100);
      
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped track:', track);
      });
      setStream(null);
    }
    
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject = null;
    }
    
    setIsCameraActive(false);
    console.log('Camera stopped');
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current && videoRef.current.readyState === 4) {
      const context = canvasRef.current.getContext('2d');
      const video = videoRef.current;
      
      // Set canvas dimensions to match video
      canvasRef.current.width = video.videoWidth || video.clientWidth;
      canvasRef.current.height = video.videoHeight || video.clientHeight;
      
      // Draw the video frame to canvas
      context.drawImage(video, 0, 0, canvasRef.current.width, canvasRef.current.height);
      
      // Convert to base64 image
      const imageDataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageDataUrl);
      stopCamera();
    } else {
      setError('Camera chưa sẵn sàng. Vui lòng thử lại sau vài giây.');
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.email || !formData.employee_id) {
      setError('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    if (!capturedImage) {
      setError('Vui lòng chụp ảnh khuôn mặt!');
      return;
    }

    setIsLoading(true);

    try {
      const userData = {
        ...formData,
        image_data: capturedImage
      };

      const response = await apiService.registerUser(userData);
      
      if (response.success) {
        setSuccess('Đăng ký thành công!');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setError(response.message || 'Có lỗi xảy ra khi đăng ký!');
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi đăng ký!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            👤 Đăng ký tài khoản
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Nhập họ và tên"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã nhân viên *
                </label>
                <input
                  type="text"
                  name="employee_id"
                  value={formData.employee_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Nhập mã nhân viên"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Nhập địa chỉ email"
                required
              />
            </div>

            {/* Camera Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Chụp ảnh khuôn mặt *
              </label>
              
              <div className="bg-gray-50 rounded-lg p-6">
                {!capturedImage ? (
                  <div>
                    {!isCameraActive ? (
                      <div className="text-center">
                        <button
                          type="button"
                          onClick={startCamera}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                          📸 Bật camera
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="relative inline-block mb-4">
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full max-w-md mx-auto rounded-lg shadow-md bg-black"
                            style={{ 
                              minHeight: '200px',
                              display: 'block' // Ensure it's visible
                            }}
                          />
                          {!videoRef.current?.videoWidth && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-white">Đang khởi động camera...</div>
                            </div>
                          )}
                        </div>
                        <div className="space-x-4 mt-4">
                          <button
                            type="button"
                            onClick={captureImage}
                            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                          >
                            📸 Chụp ảnh
                          </button>
                          <button
                            type="button"
                            onClick={stopCamera}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                          >
                            ❌ Đóng camera
                          </button>
                          <button
                            type="button"
                            onClick={() => setForceUpdate(prev => prev + 1)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded text-sm"
                          >
                            🔄 Refresh
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <img
                      src={capturedImage}
                      alt="Captured face"
                      className="w-full max-w-md mx-auto rounded-lg shadow-md mb-4"
                    />
                    <button
                      type="button"
                      onClick={retakePhoto}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      🔄 Chụp lại
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {isLoading ? '⏳ Đang đăng ký...' : '✅ Đăng ký'}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Quay lại
              </button>
            </div>
          </form>

          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      </div>
    </div>
  );
};

export default Register;