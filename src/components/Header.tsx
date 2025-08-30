import React from 'react';
import { Hand, Languages } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-xl">
              <Hand className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                ISL to Marathi Converter
              </h1>
              <p className="text-sm text-gray-600">
                Indian Sign Language Recognition System
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-indigo-600">
            <Languages className="w-5 h-5" />
            <span className="text-sm font-medium">Real-time Translation</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;