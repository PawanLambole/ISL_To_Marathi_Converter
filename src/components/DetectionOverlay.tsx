import React from 'react';

interface DetectionOverlayProps {
  autoDetectionEnabled: boolean;
  isProcessing: boolean;
  handDetected: boolean;
}

const DetectionOverlay: React.FC<DetectionOverlayProps> = ({ 
  autoDetectionEnabled, 
  isProcessing, 
  handDetected 
}) => {
  const getDetectionState = () => {
    if (!autoDetectionEnabled) return 'disabled';
    if (isProcessing) return 'processing';
    if (handDetected) return 'detected';
    return 'searching';
  };

  const detectionState = getDetectionState();

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Detection square */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className={`w-80 h-80 border-4 rounded-2xl transition-all duration-500 ${
            detectionState === 'disabled'
              ? 'border-gray-400 border-dashed opacity-50'
              : detectionState === 'processing'
              ? 'border-blue-500 shadow-lg shadow-blue-500/50 animate-pulse'
              : detectionState === 'detected'
              ? 'border-green-500 shadow-lg shadow-green-500/50'
              : 'border-yellow-400 border-dashed animate-pulse'
          }`}
        >
          {/* Corner indicators */}
          <div className="relative w-full h-full">
            {/* Top-left corner */}
            <div className={`absolute -top-1 -left-1 w-8 h-8 border-l-4 border-t-4 rounded-tl-lg transition-all duration-300 ${
              detectionState === 'detected' 
                ? 'border-green-500' 
                : detectionState === 'processing'
                ? 'border-blue-500'
                : detectionState === 'searching'
                ? 'border-yellow-400'
                : 'border-gray-400'
            }`}></div>
            
            {/* Top-right corner */}
            <div className={`absolute -top-1 -right-1 w-8 h-8 border-r-4 border-t-4 rounded-tr-lg transition-all duration-300 ${
              detectionState === 'detected' 
                ? 'border-green-500' 
                : detectionState === 'processing'
                ? 'border-blue-500'
                : detectionState === 'searching'
                ? 'border-yellow-400'
                : 'border-gray-400'
            }`}></div>
            
            {/* Bottom-left corner */}
            <div className={`absolute -bottom-1 -left-1 w-8 h-8 border-l-4 border-b-4 rounded-bl-lg transition-all duration-300 ${
              detectionState === 'detected' 
                ? 'border-green-500' 
                : detectionState === 'processing'
                ? 'border-blue-500'
                : detectionState === 'searching'
                ? 'border-yellow-400'
                : 'border-gray-400'
            }`}></div>
            
            {/* Bottom-right corner */}
            <div className={`absolute -bottom-1 -right-1 w-8 h-8 border-r-4 border-b-4 rounded-br-lg transition-all duration-300 ${
              detectionState === 'detected' 
                ? 'border-green-500' 
                : detectionState === 'processing'
                ? 'border-blue-500'
                : detectionState === 'searching'
                ? 'border-yellow-400'
                : 'border-gray-400'
            }`}></div>
          </div>
          
          {/* Center status indicator */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              detectionState === 'detected'
                ? 'bg-green-500 bg-opacity-90 text-white'
                : detectionState === 'processing'
                ? 'bg-blue-500 bg-opacity-90 text-white'
                : detectionState === 'searching'
                ? 'bg-yellow-500 bg-opacity-90 text-white'
                : 'bg-gray-500 bg-opacity-70 text-white'
            }`}>
              {detectionState === 'detected' && '✓ Hand Detected'}
              {detectionState === 'processing' && '🔍 Analyzing...'}
              {detectionState === 'searching' && '👋 Searching for hand...'}
              {detectionState === 'disabled' && '⏸ Detection Paused'}
            </div>
          </div>
        </div>
      </div>

      {/* Scanning animation when searching for hands */}
      {autoDetectionEnabled && !handDetected && !isProcessing && (
        <div className="absolute inset-0">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-80 h-80 border-2 border-yellow-400 rounded-2xl">
              <div className="w-full h-1 bg-yellow-400 opacity-60 animate-pulse"></div>
              <div 
                className="w-full h-1 bg-yellow-400 opacity-80 animate-bounce"
                style={{ 
                  animation: 'scan 2s ease-in-out infinite',
                  transformOrigin: 'top'
                }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetectionOverlay;