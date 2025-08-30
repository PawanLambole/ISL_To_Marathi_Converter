# ISL to Marathi Converter

A comprehensive Indian Sign Language (ISL) to Marathi text conversion application with real-time gesture recognition.

## Features

- **Real-time Camera Feed**: Live video capture with hand detection overlay
- **Automatic Hand Detection**: AI-powered continuous hand detection and tracking
- **Gesture Recognition**: Real-time ISL gesture recognition using MediaPipe with stability checking
- **Marathi Translation**: Automatic English to Marathi translation using Google Gemini API
- **Interactive UI**: Modern, responsive interface with real-time feedback
- **Text Management**: Copy, download, and clear functionality for recognized text
- **Smart Detection**: Automatic gesture recognition without manual start/stop controls
- **Visual Feedback**: Dynamic detection states with color-coded indicators

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- React Webcam for camera integration
- Lucide React for icons
- Axios for API communication

### Backend
- Python Flask server
- OpenCV for image processing
- MediaPipe for hand landmark detection
- Google Gemini API for translation
- CORS enabled for cross-origin requests

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Webcam/camera access
- Internet connection for translation API

### Frontend Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Start the Flask server:
   ```bash
   python app.py
   ```

The backend will run on `http://localhost:5000` and the frontend on `http://localhost:5173`.

## Usage

1. **Enable Camera**: The camera starts automatically when you open the app
2. **Automatic Detection**: The system continuously scans for hands in the camera feed
3. **Position Hand**: Simply place your hand within the detection square
4. **Make Gestures**: Perform clear ISL gestures - the system automatically recognizes them
5. **View Results**: Letters appear automatically as you sign
6. **Translate**: Click "Translate" to convert accumulated text to Marathi
7. **Manage Text**: Use copy, download, or clear functions as needed

### Detection States
- **🟡 Searching**: System is actively looking for hands
- **🟢 Detected**: Hand found and being tracked
- **🔵 Processing**: Analyzing current gesture
- **⏸ Paused**: Auto-detection is disabled

## API Endpoints

### Backend Endpoints
- `GET /health` - Health check for backend status
- `POST /recognize` - Process image and recognize gesture
- `POST /translate` - Translate English text to Marathi

## Model Integration

The current implementation uses MediaPipe for hand detection with a simple heuristic-based gesture classifier for demonstration. To integrate your Kaggle model:

1. Replace the `GestureRecognizer` class in `backend/app.py`
2. Load your trained model using appropriate ML framework (TensorFlow, PyTorch, etc.)
3. Update the `classify_gesture` method to use your model's prediction logic
4. Ensure input preprocessing matches your model's requirements

## Configuration

### Gemini API
The application uses Google Gemini API for translation. The API key is configured in the backend. For production use, move the API key to environment variables.

### Camera Settings
Camera resolution and constraints can be modified in `src/components/CameraCapture.tsx`.

## Development Notes

- The gesture recognition currently uses a simplified classifier for demonstration
- Real-time processing is optimized for 1-second intervals to balance accuracy and performance
- The UI provides visual feedback for all states (recording, processing, errors)
- Error handling is implemented for camera access and API failures

## Future Enhancements

- Integration with production-ready ISL recognition model
- Support for word-level and sentence-level recognition
- Multiple language translation options
- Gesture training and customization features
- Offline mode capabilities