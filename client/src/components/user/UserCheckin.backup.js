import React, { useState, useRef, useEffect } from 'react';
import apiService from '../../services/apiService';
import * as faceapi from 'face-api.js';

const Checkin = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [result, setResult] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [capturedImageUrl, setCapturedImageUrl] = useState(null);
  const [autoScanEnabled, setAutoScanEnabled] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [showResultOverlay, setShowResultOverlay] = useState(false);
  const detectionIntervalRef = useRef(null);
  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        setModelsLoaded(true);
        console.log('Face detection models loaded');
      } catch (err) {
        console.error('Error loading face detection models:', err);
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (autoScanIntervalRef.current) {
        clearInterval(autoScanIntervalRef.current);
      }
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
      if (resultTimeoutRef.current) {
        clearTimeout(resultTimeoutef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, Start face detection when camera is active
  useEffect(() => {
    if (isCameraActive && modelsLoaded && videoRef.current && overlayCanvasRef.current) {
      startFaceDetection();
    } else {
      stopFaceDetection();
    }

    return () => {
      stopFaceDetection();
    };
  }, [isCameraActive, modelsLoaded]);

  const startFaceDetection = () => {
    stopFaceDetection();
    
    detectionIntervalRef.current = setInterval(async () => {
      if (videoRef.current && overlayCanvasRef.current && videoRef.current.readyState === 4) {
        await detectFace();
      }
    }, 100); // Detect every 100ms
  };

  const stopFaceDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
  };

  const detectFace = async () => {
    try {
      const video = videoRef.current;
      const canvas = overlayCanvasRef.current;
      
      const detection = await faceapi.detectSingleFace(
        video,
        new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
      );

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (detection) {
        setFaceDetected(true);
        
        // Draw bounding box
        const box = detection.box;
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 3;
        ctx.strokeRect(box.x, box.y, box.width, box.height);
        
        // Draw corner indicators
        const cornerLength = 20;
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 4;
        
        // Top-left
        ctx.beginPath();
        ctx.moveTo(box.x, box.y + cornerLength);
        ctx.lineTo(box.x, box.y);
        ctx.lineTo(box.x + cornerLength, box.y);
        ctx.stroke();
        
        // Top-right
        ctx.beginPath();
        ctx.moveTo(box.x + box.width - cornerLength, box.y);
        ctx.lineTo(box.x + box.width, box.y);
        ctx.lineTo(box.x + box.width, box.y + cornerLength);
        ctx.stroke();
        isScanning || showResultOverlay) {
      return;
    }

    if (videoRef.current.readyState !== 4) {
      return;
    }

    setIsScanning(true);

    try {
      const context = canvasRef.current.getContext('2d');
      const video = videoRef.current;
      canvasRef.current.width = video.videoWidth || video.clientWidth;
      canvasRef.current.height = video.videoHeight || video.clientHeight;
      context.drawImage(video, 0, 0, canvasRef.current.width, canvasRef.current.height);
      const imageDataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
      
      // Try to checkin
      const response = await apiService.checkin(imageDataUrl);
      if (response.success) {
        setCapturedImageUrl(imageDataUrl);
        setSuccess('Checkin thành công!');
        setResult(response);
        setShowResultOverlay(true);
        
        // Auto hide after 5 seconds
        if (resultTimeoutRef.current) {
          clearTimeout(resultTimeoutRef.current);
        }
        resultTimeoutRef.current = setTimeout(() => {
          hideResultOverlay();
        }, 5000
    // First scan after 3 seconds
    setTimeout(() => {
      performAutoScan();
    }, 3000);
  };

  const stopAutoScan = () => {
    if (autoScanIntervalRef.current) {
      clearInterval(autoScanIntervalRef.current);
      autoScanIntervalRef.1280 },
          height: { ideal: 720 }
        } 
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          setIsCameraActive(true);
          
          // Set canvas dimensions to match video
          if (overlayCanvasRef.current) {
            overlayCanvasRef.current.width = videoRef.current.videoWidth;
            overlayCanvasRef.current.height = videoRef.current.videoHeight;
          }
        };
      }

    setIsScanning(true);

    try {
      const context = canvasRef.current.getContext('2d');
      const video = videoRef.current;
      canvasRef.current.width = video.videoWidth || video.clientWidth;
      canvasRef.current.height = video.videoHeight || video.clientHeight;
      context.drawImage(video, 0, 0, canvasRef.current.width, canvasRef.current.height);
      const imageDataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
      
      // Try to checkin
      const response = await apiService.checkin(imageDataUrl);
      if (response.success) {
        setCapturedImageUrl(imageDataUrl);
        setSuccess('Checkin thành công!');
        setResult(response);
        stopAutoScan();
      }
      // If failed, just continue scanning (no error shown)
    } catch (err) {
      // Silent fail, continue scanning
      console.log('Auto scan attempt failed:', err.message);
    } finally {
      setIsScanning(false);
    }
  };

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
        hideResultOverlay = () => {
    setShowResultOverlay(false);
    setResult(null);
    setSuccess('');
    setCapturedImageUrl(null);
  };

  const toggleAutoScan = () => {
    setAutoScanEnabled(!autoScanEnabled);etCapturedImageUrl(null);
    setAutoScanEnabled(true);
    startCamera();
  };

  const toggleAutoScan = () => {
    setAutoScanEnabled(!autoScanEnabled);
    if (!autoScanEnabled) {
      setError('');
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    return date.toLocaleString('vi-VN');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Thông báo lỗi */}
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg max-w-md">
          {error}
        </div>
      )}

      {/* Camera View */}
      <div className="flex-1 flex flex-col">
        {!isCameraActive ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white">{modelsLoaded ? 'Đang khởi động camera...' : 'Đang tải models...'}</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 relative bg-black overflow-hidden">
            {/* Video và Overlay Canvas Container */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full max-w-full max-h-full flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-contain"
                />
                {/* Face Detection Overlay Canvas */}
                <canvas
                  ref={overlayCanvasRef}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full object-contain pointer-events-none"
                />
              </div>
            </div>

            {/* Status Indicators */}
            <div className="absolute top-4 left-4 z-10 space-y-2">
              {/* Face Detection Status */}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm ${
                faceDetected ? 'bg-green-500/80' : 'bg-gray-800/80'
              }`}>
                <div className={`w-2 h-2 rounded-full ${faceDetected ? 'bg-white animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-white text-sm font-medium">
                  {faceDetected ? 'Phát hiện khuôn mặt' : 'Không phát hiện khuôn mặt'}
                </span>
              </div>

              {/* Auto Scan Status */}
              {autoScanEnabled && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/80 backdrop-blur-sm">
                  {isScanning ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white"></div>
                      <span className="text-white text-sm font-medium">Đang quét...</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span className="text-white text-sm font-medium">Tự động quét</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Auto Scan Toggle */}
            <button
              onClick={toggleAutoScan}
              className="absolute top-4 right-4 z-10 bg-black/70 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/90 transition-all"
              title={autoScanEnabled ? "Tắt tự động quét" : "Bật tự động quét"}
            >
              {autoScanEnabled ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              )}
            </button>

            {/* Result Overlay */}
            {showResultOverlay && result && (
              <div className="absolute inset-0 flex items-end md:items-center justify-center z-20 bg-black/50 backdrop-blur-sm animate-fadeIn">
                <div className="bg-white rounded-t-3xl md:rounded-3xl shadow-2xl max-w-2xl w-full md:max-h-[80vh] overflow-y-auto m-0 md:m-4">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 relative">
                    <button
                      onClick={hideResultOverlay}
                      className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition-all"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <div className="flex items-center gap-4">
                      <div className="bg-white rounded-full p-3">
                        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">Checkin thành công!</h3>
                        <p className="text-green-100 text-sm">Thông tin sẽ tự động ẩn sau 5 giây</p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Thông tin */}
                      <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="text-sm text-gray-500 mb-1">Nhân viên</div>
                          <div className="text-xl font-bold text-gray-800">{result.user || result.user_name}</div>
                        </div>
                        
                        {result.employee_id && (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-sm text-gray-500 mb-1">Mã nhân viên</div>
                            <div className="text-lg font-semibold text-gray-800">{result.employee_id}</div>
                          </div>
                        )}
                        
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="text-sm text-gray-500 mb-1">Trạng thái</div>
                          <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                            (result.type || result.action) === 'check_in' || (result.type || result.action) === 'checkin' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {(result.type || result.action) === 'check_in' || (result.type || result.action) === 'checkin' ? 'Check-in' : 'Check-out'}
                          </span>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="text-sm text-gray-500 mb-1">Thời gian</div>
                          <div className="text-lg font-semibold text-gray-800">{result.time || formatTime(result.timestamp)}</div>
                        </div>
                        
                        {result.message && (
                          <div className="bg-blue-50 rounded-lg p-4">
                            <div className="text-sm text-blue-600 mb-1">Thông báo</div>
                            <div className="text-base font-medium text-gray-800">{result.message}</div>
                          </div>
                        )}
                        
                        {result.duration && (
                          <div className="bg-purple-50 rounded-lg p-4">
                            <div className="text-sm text-purple-600 mb-1">Thời gian làm việc</div>
                            <div className="text-lg font-semibold text-gray-800">{result.duration}</div>
                          </div>
                        )}
                      </div>

                      {/* Hình ảnh */}
                      {capturedImageUrl && result.user_image && (
                        <div className="space-y-4">
                          <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-2">
                              <p className="text-white font-medium text-sm text-center">Ảnh đăng ký</p>
                            </div>
                            <div className="p-3">
                              <img 
                                src={`data:image/jpeg;base64,${result.user_image}`}
                                alt="User original"
                                className="w-full h-auto rounded-lg"
                              />
                            </div>
                          </div>
                          
                          <div className="bg-white rounded-xl border-2 border-green-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-green-500 to-green-600 px-3 py-2">
                              <p className="text-white font-medium text-sm text-center">Ảnh vừa chụp</p>
                            </div>
                            <div className="p-3">
                              <img 
                                src={capturedImageUrl}
                                alt="Captured"
                                className="w-full h-auto rounded-lg"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Manual Checkin Button */}
            {!autoScanEnabled && (
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
                <button
                  onClick={captureAndProcess}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-4 px-12 rounded-full transition-all transform active:scale-95 shadow-lg flex items-center justify-center gap-2"
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
                      <span>Checkin ngay</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default Checkin;