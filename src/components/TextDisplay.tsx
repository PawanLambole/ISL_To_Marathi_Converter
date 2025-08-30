import React, { useState } from 'react';
import { Type, Languages, Trash2, Copy, Download } from 'lucide-react';
import { useGesture } from '../context/GestureContext';

const TextDisplay: React.FC = () => {
  const { 
    recognizedText, 
    marathiText, 
    clearText, 
    translateText, 
    isTranslating,
    lastRecognizedLetter,
    confidence 
  } = useGesture();
  
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleDownload = () => {
    const content = `English: ${recognizedText}\nMarathi: ${marathiText}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'isl-translation.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Recognition Results</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleCopy(recognizedText)}
            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Copy English text"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Download text"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={clearText}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Clear all text"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Last recognized letter */}
      {lastRecognizedLetter && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center animate-bounce">
                <span className="text-white font-bold text-lg">{lastRecognizedLetter}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">✓ Auto-Detected</p>
                <p className="text-xs text-green-600">Confidence: {(confidence * 100).toFixed(1)}%</p>
              </div>
            </div>
            <div className="w-16 h-2 bg-green-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-600 transition-all duration-300"
                style={{ width: `${confidence * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* English Text */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <Type className="w-5 h-5 text-gray-600" />
          <label className="text-sm font-medium text-gray-700">English Text</label>
        </div>
        <div className="relative">
          <textarea
            value={recognizedText}
            readOnly
            placeholder="Recognized letters will appear here..."
            className="w-full h-32 p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
          />
          {recognizedText && (
            <button
              onClick={() => handleCopy(recognizedText)}
              className="absolute top-2 right-2 p-1 text-gray-400 hover:text-indigo-600 transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Translation Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Languages className="w-5 h-5 text-gray-600" />
            <label className="text-sm font-medium text-gray-700">Marathi Translation</label>
          </div>
          <button
            onClick={translateText}
            disabled={!recognizedText.trim() || isTranslating}
            className="px-3 py-1 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isTranslating ? 'Translating...' : 'Translate'}
          </button>
        </div>
        <div className="relative">
          <textarea
            value={marathiText}
            readOnly
            placeholder="Marathi translation will appear here..."
            className="w-full h-32 p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
          />
          {marathiText && (
            <button
              onClick={() => handleCopy(marathiText)}
              className="absolute top-2 right-2 p-1 text-gray-400 hover:text-indigo-600 transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-xl">
          <p className="text-sm text-gray-600">Letters Recognized</p>
          <p className="text-2xl font-bold text-gray-900">{recognizedText.length}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          <p className="text-sm text-gray-600">Words Formed</p>
          <p className="text-2xl font-bold text-gray-900">
            {recognizedText.trim() ? recognizedText.trim().split(/\s+/).length : 0}
          </p>
        </div>
      </div>

      {copied && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
          Text copied to clipboard!
        </div>
      )}
    </div>
  );
};

export default TextDisplay;