
# Example code for using the trained model for inference

import tensorflow as tf
import numpy as np
from tensorflow.keras.models import load_model

# Load the trained model
model = load_model('best_guava_model.h5')

# Class names (in the same order as training)
class_names = ['Citrus Canker', 'Red Rust', 'Anthracnose', 'Spiraling Whitefly', 'Healthy', 'Algal Spot']

def predict_guava_disease(image_path, model, class_names):
    """
    Predict guava leaf disease from image
    
    Args:
        image_path: Path to the image file
        model: Trained model
        class_names: List of class names
    
    Returns:
        predicted_class: Predicted class name
        confidence: Prediction confidence
    """
    
    # Load and preprocess image
    image = tf.io.read_file(image_path)
    image = tf.image.decode_image(image, channels=3)
    image = tf.image.resize(image, [IMG_SIZE, IMG_SIZE])
    image = tf.cast(image, tf.float32)
    image = tf.keras.applications.efficientnet_v2.preprocess_input(image)
    image = tf.expand_dims(image, 0)  # Add batch dimension
    
    # Make prediction
    predictions = model.predict(image)
    predicted_class_idx = np.argmax(predictions)
    confidence = np.max(predictions)
    
    predicted_class = class_names[predicted_class_idx]
    
    return predicted_class, confidence

# Example usage:
# predicted_class, confidence = predict_guava_disease('path_to_image.jpg', model, class_names)
# print(f"Predicted: {predicted_class} (Confidence: {confidence:.3f})")
