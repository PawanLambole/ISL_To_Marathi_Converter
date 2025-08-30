import React, { useRef, useCallback, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera, CameraOff, Eye, EyeOff } from 'lucide-react';
import { useGesture } from '../context/GestureContext';
import DetectionOverlay from './DetectionOverlay';

const CameraCapture: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const [autoDetectionEnabled, setAutoDetectionEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [handDetected, setHandDetected] = useState(false);
  const { addLetter, isConnected, connectionStatus } = useGesture();

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "user"
  };

  const processFrame = useCallback(async () => {
    if (!webcamRef.current || !autoDetectionEnabled || !cameraEnabled) return;

    try {
      setIsProcessing(true);
      const imageSrc = webcamRef.current.getScreenshot();
      
      if (imageSrc) {
        const response = await fetch('http://localhost:5000/recognize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: imageSrc }),
        });

        if (response.ok) {
          const result = await response.json();
          
          // Update hand detection status
          setHandDetected(result.landmarks_detected);
          
          if (result.success && result.letter && result.confidence > 0.7) {
            addLetter(result.letter);
          }
        }
      }
    } catch (error) {
      console.error('Error capturing frame:', error);
      setHandDetected(false);
    } finally {
      setIsProcessing(false);
    }
  }, [autoDetectionEnabled, cameraEnabled, addLetter]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoDetectionEnabled && cameraEnabled && isConnected) {
      interval = setInterval(processFrame, 800); // Process every 800ms for smoother detection
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoDetectionEnabled, cameraEnabled, isConnected, processFrame]);

  const toggleAutoDetection = () => {
    setAutoDetectionEnabled(!autoDetectionEnabled);
    if (!autoDetectionEnabled) {
      setHandDetected(false);
    }
  };

  const toggleCamera = () => {
    setCameraEnabled(!cameraEnabled);
    if (!cameraEnabled) {
      setHandDetected(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Camera Feed</h2>
        <div className="flex items-center space-x-2">
          {/* Hand detection status */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${handDetected ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
            <span className="text-sm text-gray-600">
              {handDetected ? 'Hand Detected' : 'No Hand'}
            </span>
          </div>
          
          {/* Connection status */}
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-600">{connectionStatus}</span>
        </div>
      </div>

      <div className="relative">
        <div className="relative bg-gray-900 rounded-xl overflow-hidden">
          {cameraEnabled ? (
            <>
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="w-full h-auto"
              />
              <DetectionOverlay 
                autoDetectionEnabled={autoDetectionEnabled} 
                isProcessing={isProcessing} 
                handDetected={handDetected}
              />
            </>
          ) : (
            <div className="w-full h-80 flex items-center justify-center bg-gray-800">
              <div className="text-center text-gray-400">
                <CameraOff className="w-16 h-16 mx-auto mb-4" />
                <p>Camera is disabled</p>
              </div>
            </div>
          )}
        </div>

        {/* Auto-detection indicator */}
        {autoDetectionEnabled && (
          <div className="absolute top-4 left-4 flex items-center space-x-2 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>Auto-Detection Active</span>
          </div>
        )}

        {/* Processing indicator */}
        {isProcessing && (
          <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            Analyzing Hand...
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-4 mt-6">
        <button
          onClick={toggleCamera}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            cameraEnabled
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {cameraEnabled ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
          <span>{cameraEnabled ? 'Disable Camera' : 'Enable Camera'}</span>
        </button>

        <button
          onClick={toggleAutoDetection}
          disabled={!cameraEnabled || !isConnected}
          className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            autoDetectionEnabled
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-600 text-white hover:bg-gray-700'
          }`}
        >
          {autoDetectionEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          <span>{autoDetectionEnabled ? 'Auto-Detection ON' : 'Auto-Detection OFF'}</span>
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Instructions:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Simply place your hand in front of the camera</li>
          <li>• The system automatically detects and recognizes gestures</li>
          <li>• Hold each gesture clearly for 1-2 seconds</li>
          <li>• Ensure good lighting and position hand within the detection area</li>
          <li>• Letters will automatically appear as you sign</li>
        </ul>
      </div>
    </div>
  );
};

export default CameraCapture;