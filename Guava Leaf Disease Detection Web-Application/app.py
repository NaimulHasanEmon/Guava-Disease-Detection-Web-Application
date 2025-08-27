from flask import Flask, render_template, request, jsonify, send_from_directory
import os
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import base64
import json
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = 'uploads'

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Model configuration
IMG_SIZE = 512
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp'}

# Class names for the model
CLASS_NAMES = ['Citrus Canker', 'Red Rust', 'Anthracnose', 'Spiraling Whitefly', 'Healthy', 'Algal Spot']

# Disease information
DISEASE_INFO = {
    'Citrus Canker': {
        'description': 'A serious bacterial disease that affects citrus plants, including guava trees.',
        'symptoms': 'Raised, corky lesions on leaves, stems, and fruits with water-soaked margins.',
        'treatment': 'Remove infected plant parts, apply copper-based fungicides, and maintain good sanitation.',
        'severity': 'High',
        'color': '#FF6B6B'
    },
    'Red Rust': {
        'description': 'A fungal disease caused by Cephaleuros virescens that affects guava leaves.',
        'symptoms': 'Circular to irregular reddish-brown spots on leaves, often with a velvety appearance.',
        'treatment': 'Improve air circulation, remove infected leaves, and apply fungicides if necessary.',
        'severity': 'Medium',
        'color': '#FF8E53'
    },
    'Anthracnose': {
        'description': 'A fungal disease caused by Colletotrichum gloeosporioides that affects guava fruits and leaves.',
        'symptoms': 'Dark, sunken lesions on fruits and leaves, often with pink spore masses.',
        'treatment': 'Prune infected parts, apply fungicides, and maintain proper spacing between plants.',
        'severity': 'Medium',
        'color': '#8B4513'
    },
    'Spiraling Whitefly': {
        'description': 'An insect pest that feeds on guava leaves, causing damage and spreading diseases.',
        'symptoms': 'Yellowing leaves, white waxy deposits, and stunted growth due to feeding damage.',
        'treatment': 'Use insecticidal soaps, neem oil, or introduce natural predators like ladybugs.',
        'severity': 'Low',
        'color': '#87CEEB'
    },
    'Healthy': {
        'description': 'The guava leaf shows no signs of disease or pest damage.',
        'symptoms': 'Normal green color, uniform leaf structure, and healthy appearance.',
        'treatment': 'Continue with regular maintenance and monitoring for early detection.',
        'severity': 'None',
        'color': '#4CAF50'
    },
    'Algal Spot': {
        'description': 'A disease caused by algae that affects guava leaves, especially in humid conditions.',
        'symptoms': 'Small, circular to irregular spots with a velvety texture, often greenish to reddish-brown.',
        'treatment': 'Improve air circulation, reduce humidity, and apply copper-based fungicides.',
        'severity': 'Low',
        'color': '#9ACD32'
    }
}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def load_model():
    """Load the trained model - now compatible with TensorFlow 2.18.0 and Keras 3.8.0"""
    try:
        # Try multiple possible paths for the model
        possible_paths = [
            os.path.join('..', 'Model Info', 'best_guava_model.h5'),  # From By Claude folder (preferred)
            os.path.join('Model Info', 'best_guava_model.h5'),        # From root folder
            'best_guava_model.h5',                                     # Current directory
            'converted_guava_model.h5'                                # Converted model (fallback)
        ]
        
        for model_path in possible_paths:
            if os.path.exists(model_path):
                print(f"Loading model from: {model_path}")
                try:
                    # With TensorFlow 2.18.0 and Keras 3.8.0, the model should load directly
                    model = tf.keras.models.load_model(model_path, compile=False)
                    print("✅ Model loaded successfully!")
                    print(f"   Model input shape: {model.input_shape}")
                    print(f"   Model output shape: {model.output_shape}")
                    return model
                    
                except Exception as load_error:
                    print(f"❌ Failed to load model from {model_path}: {load_error}")
                    continue
        
        print("Model file not found in any of the expected locations:")
        for path in possible_paths:
            print(f"  - {os.path.abspath(path)}")
        
        print("❌ Failed to load trained model. Please ensure you have the correct TensorFlow version.")
        return None
        
    except Exception as e:
        print(f"Error loading model: {e}")
        import traceback
        traceback.print_exc()
        return None

# Removed create_compatible_model function - we need the trained model

def preprocess_image(image_path):
    """Preprocess image for model prediction - compatible with TensorFlow 2.18.0"""
    try:
        # Load and resize image
        image = tf.io.read_file(image_path)
        image = tf.image.decode_image(image, channels=3)
        image = tf.image.resize(image, [IMG_SIZE, IMG_SIZE])
        image = tf.cast(image, tf.float32)
        
        # Apply EfficientNetV2 preprocessing
        image = tf.keras.applications.efficientnet_v2.preprocess_input(image)
        image = tf.expand_dims(image, 0)  # Add batch dimension
        
        return image
    except Exception as e:
        print(f"Error preprocessing image: {e}")
        return None

def predict_disease(image_path, model):
    """Predict disease from image"""
    try:
        # Preprocess image
        processed_image = preprocess_image(image_path)
        if processed_image is None:
            return None, None
        
        # Make prediction
        predictions = model.predict(processed_image)
        predicted_class_idx = np.argmax(predictions)
        confidence = float(np.max(predictions))
        
        predicted_class = CLASS_NAMES[predicted_class_idx]
        
        return predicted_class, confidence
    except Exception as e:
        print(f"Error predicting disease: {e}")
        return None, None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        print("Upload endpoint called")
        
        if 'file' not in request.files:
            print("No file in request")
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            print("Empty filename")
            return jsonify({'error': 'No file selected'}), 400
        
        print(f"Processing file: {file.filename}")
        
        if file and allowed_file(file.filename):
            # Ensure upload directory exists
            os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
            
            # Save file
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            print(f"File saved to: {filepath}")
            
            # Load model and predict
            print("Loading model...")
            model = load_model()
            if model is None:
                print("Model loading failed")
                return jsonify({'error': 'Failed to load model. Check console for details.'}), 500
            
            print("Model loaded successfully, predicting...")
            predicted_class, confidence = predict_disease(filepath, model)
            if predicted_class is None:
                print("Prediction failed")
                return jsonify({'error': 'Failed to process image'}), 500
            
            print(f"Prediction successful: {predicted_class} with confidence {confidence}")
            
            # Get disease information
            disease_info = DISEASE_INFO.get(predicted_class, {})
            
            # Clean up uploaded file
            os.remove(filepath)
            print("Uploaded file cleaned up")
            
            return jsonify({
                'success': True,
                'prediction': predicted_class,
                'confidence': confidence,
                'disease_info': disease_info
            })
        else:
            print(f"Invalid file type: {file.filename}")
            return jsonify({'error': 'Invalid file type'}), 400
            
    except Exception as e:
        print(f"Error in upload: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/disease-info/<disease_name>')
def get_disease_info(disease_name):
    """Get detailed information about a specific disease"""
    if disease_name in DISEASE_INFO:
        return jsonify(DISEASE_INFO[disease_name])
    else:
        return jsonify({'error': 'Disease not found'}), 404

@app.route('/model-stats')
def get_model_stats():
    """Get model statistics and performance metrics"""
    try:
        # Read training history
        history_paths = [
            os.path.join('..', 'Model Info', 'training_history.csv'),
            os.path.join('Model Info', 'training_history.csv'),
            'training_history.csv'
        ]
        history_data = "No training history available"
        for history_path in history_paths:
            if os.path.exists(history_path):
                try:
                    with open(history_path, 'r') as f:
                        history_data = f.read()
                    break
                except:
                    continue
        
        # Read classification report
        report_paths = [
            os.path.join('..', 'Model Info', 'classification_report.csv'),
            os.path.join('Model Info', 'classification_report.csv'),
            'classification_report.csv'
        ]
        report_data = "No classification report available"
        for report_path in report_paths:
            if os.path.exists(report_path):
                try:
                    with open(report_path, 'r') as f:
                        report_data = f.read()
                    break
                except:
                    continue
        
        return jsonify({
            'class_names': CLASS_NAMES,
            'image_size': IMG_SIZE,
            'training_history': history_data,
            'classification_report': report_data
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
