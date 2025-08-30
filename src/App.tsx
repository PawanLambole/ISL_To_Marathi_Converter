import React from 'react';
import CameraCapture from './components/CameraCapture';
import Header from './components/Header';
import TextDisplay from './components/TextDisplay';
import { GestureProvider } from './context/GestureContext';

function App() {
  return (
    <GestureProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <CameraCapture />
            <TextDisplay />
          </div>
        </main>
      </div>
    </GestureProvider>
  );
}

export default App;
