from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
import io
from PIL import Image
import mediapipe as mp
import requests
import os
from typing import Dict, List, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Initialize MediaPipe
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=1,
    min_detection_confidence=0.7,
    min_tracking_confidence=0.5
)

# Gemini API configuration
GEMINI_API_KEY = "AIzaSyDr-xhmK9sUoxCEl-MNRW12ERoLw1qfyCs"
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={GEMINI_API_KEY}"

class GestureRecognizer:
    def __init__(self):
        # Simple gesture mapping for demonstration
        # In production, this would be replaced with your trained Kaggle model
        self.gesture_map = {
            'thumbs_up': 'A',
            'peace': 'V',
            'fist': 'S',
            'open_palm': 'HELLO',
            'pointing': 'I',
            'ok_sign': 'O'
        }
        
        # Gesture stability tracking
        self.last_gesture = None
        self.gesture_count = 0
        self.stability_threshold = 2  # Require 2 consecutive same gestures
    
    def extract_landmarks(self, hand_landmarks) -> List[float]:
        """Extract normalized hand landmarks"""
        landmarks = []
        for landmark in hand_landmarks.landmark:
            landmarks.extend([landmark.x, landmark.y, landmark.z])
        return landmarks
    
    def classify_gesture(self, landmarks: List[float]) -> tuple[str, float]:
        """
        Enhanced gesture classification with stability checking
        In production, replace this with your trained Kaggle model prediction
        """
        try:
            # Enhanced heuristic-based classification for demo
            # This would be replaced with your ML model inference
            
            # Get key landmark positions
            thumb_tip = landmarks[4*3:4*3+3]
            index_tip = landmarks[8*3:8*3+3]
            middle_tip = landmarks[12*3:12*3+3]
            ring_tip = landmarks[16*3:16*3+3]
            pinky_tip = landmarks[20*3:20*3+3]
            wrist = landmarks[0*3:0*3+3]
            
            # Enhanced gesture detection logic
            current_gesture = None
            confidence = 0.0
            
            # Calculate finger positions relative to wrist
            thumb_up = thumb_tip[1] < wrist[1] - 0.1
            index_up = index_tip[1] < wrist[1] - 0.1
            middle_up = middle_tip[1] < wrist[1] - 0.1
            ring_up = ring_tip[1] < wrist[1] - 0.1
            pinky_up = pinky_tip[1] < wrist[1] - 0.1
            
            # Gesture classification
            if thumb_up and not index_up and not middle_up and not ring_up and not pinky_up:
                current_gesture = 'A'
                confidence = 0.9
            elif not thumb_up and index_up and middle_up and not ring_up and not pinky_up:
                current_gesture = 'V'
                confidence = 0.85
            elif not thumb_up and not index_up and not middle_up and not ring_up and not pinky_up:
                current_gesture = 'S'
                confidence = 0.8
            elif thumb_up and index_up and middle_up and ring_up and pinky_up:
                current_gesture = 'HELLO'
                confidence = 0.75
            elif not thumb_up and index_up and not middle_up and not ring_up and not pinky_up:
                current_gesture = 'I'
                confidence = 0.8
            else:
                current_gesture = 'UNKNOWN'
                confidence = 0.3
            
            # Stability checking
            if current_gesture == self.last_gesture:
                self.gesture_count += 1
            else:
                self.gesture_count = 1
                self.last_gesture = current_gesture
            
            # Only return stable gestures
            if self.gesture_count >= self.stability_threshold and confidence > 0.7:
                return current_gesture, confidence
            else:
                return 'UNSTABLE', confidence * 0.5
                
        except Exception as e:
            logger.error(f"Error in gesture classification: {e}")
            return 'ERROR', 0.0

gesture_recognizer = GestureRecognizer()

def translate_to_marathi(english_text: str) -> str:
    """Translate English text to Marathi using Gemini API"""
    try:
        headers = {
            'Content-Type': 'application/json',
        }
        
        data = {
            "contents": [{
                "parts": [{
                    "text": f"Translate the following English text to Marathi. Only provide the Marathi translation, no explanations: {english_text}"
                }]
            }]
        }
        
        response = requests.post(GEMINI_URL, headers=headers, json=data, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            if 'candidates' in result and len(result['candidates']) > 0:
                marathi_text = result['candidates'][0]['content']['parts'][0]['text'].strip()
                return marathi_text
            else:
                return english_text
        else:
            logger.error(f"Gemini API error: {response.status_code}")
            return english_text
            
    except Exception as e:
        logger.error(f"Translation error: {e}")
        return english_text

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "ISL Converter API is running"})

@app.route('/recognize', methods=['POST'])
def recognize_gesture():
    """Process image and recognize gesture"""
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({"error": "No image data provided"}), 400
        
        # Decode base64 image
        image_data = data['image'].split(',')[1]  # Remove data:image/jpeg;base64,
        image_bytes = base64.b64decode(image_data)
        
        # Convert to OpenCV format
        image = Image.open(io.BytesIO(image_bytes))
        image_rgb = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # Process with MediaPipe
        results = hands.process(cv2.cvtColor(image_rgb, cv2.COLOR_BGR2RGB))
        
        if results.multi_hand_landmarks:
            # Get first hand landmarks
            hand_landmarks = results.multi_hand_landmarks[0]
            landmarks = gesture_recognizer.extract_landmarks(hand_landmarks)
            
            # Classify gesture
            predicted_letter, model_confidence = gesture_recognizer.classify_gesture(landmarks)
            
            # Only return valid, stable gestures
            if predicted_letter not in ['UNSTABLE', 'ERROR', 'UNKNOWN']:
                return jsonify({
                    "success": True,
                    "letter": predicted_letter,
                    "confidence": model_confidence,
                    "landmarks_detected": True,
                    "hand_detected": True
                })
            else:
                return jsonify({
                    "success": True,
                    "letter": None,
                    "confidence": model_confidence,
                    "landmarks_detected": True,
                    "hand_detected": True,
                    "message": "Gesture not stable or recognized"
                })
        else:
            return jsonify({
                "success": True,
                "letter": None,
                "confidence": 0.0,
                "landmarks_detected": False,
                "hand_detected": False,
                "message": "No hand detected"
            })
            
    except Exception as e:
        logger.error(f"Error in gesture recognition: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/translate', methods=['POST'])
def translate_text():
    """Translate English text to Marathi"""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({"error": "No text provided"}), 400
        
        english_text = data['text'].strip()
        
        if not english_text:
            return jsonify({"english": "", "marathi": ""})
        
        marathi_text = translate_to_marathi(english_text)
        
        return jsonify({
            "success": True,
            "english": english_text,
            "marathi": marathi_text
        })
        
    except Exception as e:
        logger.error(f"Error in translation: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Starting ISL to Marathi Converter API...")
    print("Make sure you have installed all required dependencies:")
    print("pip install flask flask-cors opencv-python mediapipe pillow requests")
    app.run(debug=True, host='0.0.0.0', port=5000)