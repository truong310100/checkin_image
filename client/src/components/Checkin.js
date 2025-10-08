import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';

const Checkin = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [result, setResult] = useState(null);
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

  const captureAndProcess = async () => {
    if (!videoRef.current || !canvasRef.current) {
      setError('Camera chưa sẵn sàng!');
      return;
    }

    if (videoRef.current.readyState !== 4) {
      setError('Camera chưa sẵn sàng. Vui lòng thử lại sau vài giây.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Capture image from video
      const context = canvasRef.current.getContext('2d');
      const video = videoRef.current;
      
      // Set canvas dimensions to match video
      canvasRef.current.width = video.videoWidth || video.clientWidth;
      canvasRef.current.height = video.videoHeight || video.clientHeight;
      
      // Draw the video frame to canvas
      context.drawImage(video, 0, 0, canvasRef.current.width, canvasRef.current.height);
      
      // Convert to base64 image
      const imageDataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);

      // Process check-in
      const response = await apiService.checkin(imageDataUrl);
      
      if (response.success) {
        setSuccess('Điểm danh thành công!');
        setResult(response);
        stopCamera();
      } else {
        setError(response.message || 'Điểm danh thất bại!');
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi điểm danh!');
    } finally {
      setIsLoading(false);
    }
  };

  const resetCheckin = () => {
    setResult(null);
    setSuccess('');
    setError('');
    startCamera();
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    return date.toLocaleString('vi-VN');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Điểm danh
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

          {!result ? (
            <div>
              {/* Camera Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                {!isCameraActive ? (
                  <div className="text-center">
                    <button
                      onClick={startCamera}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-medium text-lg transition-colors"
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
                      <div className="absolute inset-0 border-4 border-blue-500 rounded-lg pointer-events-none"></div>
                      {!videoRef.current?.videoWidth && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-white">Đang khởi động camera...</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-x-4">
                      <button
                        onClick={captureAndProcess}
                        disabled={isLoading}
                        className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-8 py-4 rounded-lg font-medium text-lg transition-colors"
                      >
                        {isLoading ? 'Đang xử lý...' : 'Điểm danh'}
                      </button>
                      
                      <button
                        onClick={stopCamera}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-4 rounded-lg font-medium transition-colors"
                      >
                        Đóng camera
                      </button>
                      
                      <button
                        onClick={() => setForceUpdate(prev => prev + 1)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded text-sm"
                      >
                        Refresh
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Result Section */
            <div className="text-center">
              <div className="text-8xl mb-6">✅</div>
              
              <div className="bg-green-50 rounded-lg p-6 mb-6">
                <h3 className="text-2xl font-bold text-green-800 mb-4">
                  Điểm danh thành công!
                </h3>
                
                <div className="space-y-3 text-left max-w-md mx-auto">
                  <div className="flex justify-between">
                    <span className="font-medium">Nhân viên:</span>
                    <span>{result.user || result.user_name}</span>
                  </div>
                  
                  {result.employee_id && (
                    <div className="flex justify-between">
                      <span className="font-medium">Mã NV:</span>
                      <span>{result.employee_id}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="font-medium">Trạng thái:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      (result.type || result.action) === 'check_in' || (result.type || result.action) === 'checkin'
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {(result.type || result.action) === 'check_in' || (result.type || result.action) === 'checkin' ? '📥 Check-in' : '📤 Check-out'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="font-medium">Thời gian:</span>
                    <span>{result.time || formatTime(result.timestamp)}</span>
                  </div>
                  
                  {result.message && (
                    <div className="flex justify-between">
                      <span className="font-medium">Thông báo:</span>
                      <span className="font-semibold text-blue-600">{result.message}</span>
                    </div>
                  )}
                  
                  {result.duration && (
                    <div className="flex justify-between">
                      <span className="font-medium">Thời gian làm việc:</span>
                      <span className="font-semibold text-blue-600">{result.duration}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-x-4">
                <button
                  onClick={resetCheckin}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                 Điểm danh tiếp
                </button>
                
                <button
                  onClick={() => navigate('/')}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Về trang chủ
                </button>
              </div>
            </div>
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      </div>
    </div>
  );
};

export default Checkin;