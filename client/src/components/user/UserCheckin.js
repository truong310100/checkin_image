import React, { useState, useRef, useEffect, use } from 'react';
import apiService from '../../services/apiService';

const Checkin = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [result, setResult] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [forceUpdate, setForceUpdate] = useState(0); 
  const [capturedImageUrl, setCapturedImageUrl] = useState(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  useEffect(() => {
    const autoStartCamera = async () => {
      if (!isCameraActive && !stream) {
        try {
          await startCamera();
        } catch (error) {
          console.log('Auto start camera failed:', error);
        }
      }
    };

    const timer = setTimeout(autoStartCamera, 500);
    return () => clearTimeout(timer);
  }, []);

  const startCamera = async () => {
    try {
      setError('');
      setIsCameraActive(false); 
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      setStream(mediaStream);
      setIsCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          const handleLoadedMetadata = () => {
            setForceUpdate(prev => prev + 1); 
          };
          videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
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
      const context = canvasRef.current.getContext('2d');
      const video = videoRef.current;
      canvasRef.current.width = video.videoWidth || video.clientWidth;
      canvasRef.current.height = video.videoHeight || video.clientHeight;
      context.drawImage(video, 0, 0, canvasRef.current.width, canvasRef.current.height);
      const imageDataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
      setCapturedImageUrl(imageDataUrl);
      const response = await apiService.checkin(imageDataUrl);
      if (response.success) {
        setSuccess('Checkin thành công!');
        setResult(response);
      } else {
        setError(response.message || 'Checkin thất bại!');
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi checkin!');
    } finally {
      setIsLoading(false);
    }
  };

  const resetCheckin = () => {
    setResult(null);
    setSuccess('');
    setError('');
    setCapturedImageUrl(null);
    startCamera();
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    return date.toLocaleString('vi-VN');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Thông báo lỗi/thành công */}
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg max-w-md">
          {error}
        </div>
      )}

      {success && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg max-w-md">
          {success}
        </div>
      )}

      {!result ? (
        /* Camera View - iPhone style for mobile, fullscreen for desktop */
        <div className="flex-1 flex flex-col">
          {!isCameraActive ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : (
            <>
              {/* Camera Container */}
              <div className="flex-1 relative bg-black overflow-hidden md:flex md:items-center md:justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover md:max-w-4xl md:max-h-[80vh] md:rounded-2xl"
                />
                {!videoRef.current?.videoWidth && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black">
                    <div className="text-white text-lg">Đang khởi động camera...</div>
                  </div>
                )}
                
                {/* iPhone-style camera overlay for mobile */}
                <div className="absolute inset-0 pointer-events-none md:hidden">
                  {/* Top bar */}
                  <div className="h-20 bg-gradient-to-b from-black/50 to-transparent"></div>
                  {/* Bottom bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
              </div>
              
              {/* Checkin Button */}
              <div className="p-6 bg-gray-900 md:bg-transparent md:absolute md:bottom-8 md:left-1/2 md:transform md:-translate-x-1/2">
                <button
                  onClick={captureAndProcess}
                  disabled={isLoading}
                  className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-4 px-12 rounded-full transition-all transform active:scale-95 shadow-lg flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Checkin</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        /* Success View - Text on one side, images on the other */
        <div className="flex-1 flex flex-col md:flex-row bg-white">
          {/* Text Information Side */}
          <div className="flex-1 p-6 md:p-12 flex flex-col justify-center bg-gradient-to-br from-green-50 to-blue-50">
            <div className="max-w-md mx-auto w-full">
              {/* Success Icon */}
              <div className="mb-6 flex justify-center">
                <div className="bg-green-500 rounded-full p-4">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <h3 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                Checkin thành công!
              </h3>
              
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-sm text-gray-500 mb-1">Nhân viên</div>
                  <div className="text-lg font-semibold text-gray-800">{result.user || result.user_name}</div>
                </div>
                
                {result.employee_id && (
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-sm text-gray-500 mb-1">Mã nhân viên</div>
                    <div className="text-lg font-semibold text-gray-800">{result.employee_id}</div>
                  </div>
                )}
                
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-sm text-gray-500 mb-1">Trạng thái</div>
                  <div className="text-lg font-semibold">
                    <span className={`inline-block px-3 py-1 rounded-full ${
                      (result.type || result.action) === 'check_in' || (result.type || result.action) === 'checkin' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {(result.type || result.action) === 'check_in' || (result.type || result.action) === 'checkin' ? 'Check-in' : 'Check-out'}
                    </span>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-sm text-gray-500 mb-1">Thời gian</div>
                  <div className="text-lg font-semibold text-gray-800">{result.time || formatTime(result.timestamp)}</div>
                </div>
                
                {result.message && (
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-sm text-gray-500 mb-1">Thông báo</div>
                    <div className="text-lg font-semibold text-gray-800">{result.message}</div>
                  </div>
                )}
                
                {result.duration && (
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-sm text-gray-500 mb-1">Thời gian làm việc</div>
                    <div className="text-lg font-semibold text-gray-800">{result.duration}</div>
                  </div>
                )}
              </div>
              
              <button
                onClick={resetCheckin}
                className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-all transform active:scale-95 shadow-lg"
              >
                Checkin tiếp
              </button>
            </div>
          </div>
          
          {/* Image Comparison Side */}
          {capturedImageUrl && result.user_image && (
            <div className="flex-1 p-6 md:p-12 flex flex-col justify-center bg-gray-50">
              <div className="max-w-md mx-auto w-full">
                <h4 className="text-xl font-semibold text-gray-800 mb-6 text-center">So sánh hình ảnh</h4>
                <div className="space-y-6">
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2">
                      <p className="text-white font-medium text-center">Ảnh đăng ký</p>
                    </div>
                    <div className="p-4">
                      <img 
                        src={`data:image/jpeg;base64,${result.user_image}`}
                        alt="User original"
                        className="w-full h-auto rounded-lg"
                      />
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 px-4 py-2">
                      <p className="text-white font-medium text-center">Ảnh vừa chụp</p>
                    </div>
                    <div className="p-4">
                      <img 
                        src={capturedImageUrl}
                        alt="Captured"
                        className="w-full h-auto rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default Checkin;