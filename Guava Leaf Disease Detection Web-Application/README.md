# 🥭 Guava Disease Detection - AI-Powered Plant Health Analysis

A modern, responsive web application that uses advanced AI technology to detect diseases in guava leaves. Built with Flask, TensorFlow, and a beautiful user interface.

## ✨ Features

- **🎯 High Accuracy**: 95.4% accuracy in disease detection
- **🖼️ Easy Upload**: Drag & drop or click to upload images
- **⚡ Real-time Analysis**: Instant disease detection results
- **📱 Responsive Design**: Works perfectly on all devices
- **🎨 Modern UI**: Beautiful, intuitive user interface
- **🔍 Detailed Results**: Comprehensive disease information and treatment options

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- TensorFlow 2.18.0
- Keras 3.8.0

### Installation

1. **Clone or download** the project files to your local machine

2. **Navigate to the project directory**:
   ```bash
   cd "By Claude"
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Ensure model file exists**:
   - Make sure `best_guava_model.h5` is in the `Model Info` folder inside this web-app directory
   - The model file should be approximately 206MB

5. **Run the application**:
   ```bash
   python run.py
   ```
   
   *Note: The uploads directory will be automatically created when needed.*

6. **Open your browser** and go to:
   ```
   http://127.0.0.1:5000
   ```

## 🏗️ Project Structure

```
By Claude/
├── app.py                 # Main Flask application
├── run.py                 # Application launcher
├── requirements.txt       # Python dependencies
├── README.md             # This file
├── static/               # Static assets
│   ├── css/
│   │   └── style.css     # Main stylesheet
│   └── js/
│       └── main.js       # Frontend JavaScript
├── templates/
│   └── index.html        # Main HTML template
└── uploads/              # Temporary upload directory (auto-created)
    └── .gitkeep          # Keeps directory in version control
```

## 🔧 Configuration

### Model Requirements

- **Model File**: `best_guava_model.h5` (206MB)
- **Location**: `Model Info/best_guava_model.h5`
- **Architecture**: EfficientNetV2
- **Input Size**: 512x512 pixels
- **Classes**: 6 disease categories + healthy

### Supported Image Formats

- PNG, JPG, JPEG, GIF, BMP
- Maximum file size: 16MB
- Automatic resizing to 512x512 pixels

## 🎯 Disease Detection Capabilities

The system can detect the following conditions:

| Disease | Description | Severity |
|---------|-------------|----------|
| **Healthy** | Normal, healthy guava leaves | None |
| **Citrus Canker** | Bacterial disease causing lesions | High |
| **Red Rust** | Fungal disease with rust-colored spots | Medium |
| **Anthracnose** | Fungal disease causing dark lesions | High |
| **Spiraling Whitefly** | Insect infestation | Medium |
| **Algal Spot** | Algal growth on leaves | Low |

## 🎨 User Interface

### Two-Column Layout

- **Left Column**: Image upload and preview
- **Right Column**: Results and information display

### Interactive Features

- **Drag & Drop**: Intuitive image upload
- **Real-time Preview**: See uploaded image immediately
- **Smooth Animations**: Professional transitions and effects
- **Responsive Design**: Works on all screen sizes

## 🛠️ Technical Details

### Backend (Flask)

- **Framework**: Flask 3.0+
- **Image Processing**: PIL/Pillow
- **AI Model**: TensorFlow 2.18.0 + Keras 3.8.0
- **File Handling**: Secure upload processing

### Frontend

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS Grid and Flexbox
- **JavaScript**: ES6+ with modern browser APIs
- **Font Awesome**: Professional icons
- **Google Fonts**: Inter font family

### AI Model

- **Architecture**: EfficientNetV2
- **Training**: Custom dataset with 95.4% accuracy
- **Preprocessing**: Automatic image resizing and normalization
- **Inference**: Real-time prediction with confidence scores

## 📱 Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🚨 Troubleshooting

### Common Issues

1. **Model Loading Error**
   - Ensure `best_guava_model.h5` exists in `Model Info/`
   - Check TensorFlow version compatibility
   - Verify file permissions

2. **Image Upload Issues**
   - Check file format (PNG, JPG, JPEG, GIF, BMP)
   - Ensure file size < 16MB
   - Clear browser cache if needed

3. **Port Already in Use**
   - Change port in `run.py` if needed
   - Kill existing processes using port 5000

### Debug Mode

To enable debug mode, modify `run.py`:
```python
app.run(debug=True, host='127.0.0.1', port=5000)
```

## 🔒 Security Features

- **File Type Validation**: Only image files accepted
- **Size Limits**: Maximum 16MB file size
- **Secure Filenames**: Automatic sanitization
- **Input Validation**: Comprehensive error handling

## 📊 Performance

- **Model Loading**: ~2-3 seconds (first time)
- **Image Processing**: <1 second
- **Prediction**: <2 seconds
- **Memory Usage**: ~500MB (including model)

## 🌟 Future Enhancements

- [ ] Batch processing for multiple images
- [ ] Export results to PDF/CSV
- [ ] User authentication and history
- [ ] Mobile app version
- [ ] Additional plant species support
- [ ] Real-time camera integration

## 📄 License

This project is developed for educational and research purposes. The AI model and dataset are proprietary.

## 🤝 Contributing

For questions or contributions, please contact the development team.

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Verify all dependencies are installed
3. Ensure the model file is in the correct location
4. Check browser console for JavaScript errors

---

**Built with ❤️ using Flask, TensorFlow, and modern web technologies**
