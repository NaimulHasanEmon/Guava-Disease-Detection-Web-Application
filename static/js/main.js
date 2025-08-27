// Guava Disease Detection - Main JavaScript
const API_BASE_URL = window.API_BASE_URL || '';

class GuavaDiseaseDetector {
    constructor() {
        this.currentFile = null;
        this.isProcessing = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupDragAndDrop();
    }

    bindEvents() {
        // File input change
        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files[0]);
        });

        // Upload button click
        document.getElementById('uploadButton').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });

        // Analyze button click
        document.getElementById('analyzeBtn').addEventListener('click', () => {
            this.analyzeImage();
        });

        // Change image button
        document.getElementById('changeImageBtn').addEventListener('click', () => {
            this.resetToUpload();
        });

        // New analysis button
        document.getElementById('newAnalysisBtn').addEventListener('click', () => {
            this.resetToUpload();
        });

        // Try again button
        document.getElementById('tryAgainBtn').addEventListener('click', () => {
            this.resetToUpload();
        });



        // Tab switching
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
    }

    setupDragAndDrop() {
        const uploadArea = document.getElementById('uploadArea');
        const dragOverlay = document.getElementById('dragOverlay');

        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, this.preventDefaults, false);
            document.body.addEventListener(eventName, this.preventDefaults, false);
        });

        // Highlight drop area when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.add('drag-over');
                dragOverlay.classList.add('show');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.remove('drag-over');
                dragOverlay.classList.remove('show');
            }, false);
        });

        // Handle dropped files
        uploadArea.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0]);
            }
        }, false);
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    handleFileSelect(file) {
        if (!file) return;

        // Validate file type
        if (!this.isValidFileType(file)) {
            this.showError('Please select a valid image file (PNG, JPG, JPEG, GIF, or BMP).');
            return;
        }

        // Validate file size (16MB max)
        if (file.size > 16 * 1024 * 1024) {
            this.showError('File size must be less than 16MB. Please choose a smaller image.');
            return;
        }

        this.currentFile = file;
        
        // First, ensure the image preview section is ready
        const imagePreviewSection = document.getElementById('imagePreviewSection');
        const imagePreview = document.getElementById('imagePreview');
        const previewImage = document.getElementById('previewImage');
        
        // Hide upload section and show image preview section in left column (replacing upload)
        document.getElementById('uploadSection').style.display = 'none';
        imagePreviewSection.style.display = 'block';
        imagePreview.style.display = 'block';
        imagePreview.style.opacity = '1';
        imagePreview.style.visibility = 'visible';
        
        // Now load and display the image
        setTimeout(() => {
            this.displayImagePreview(file);
        }, 100);
        
        // Show welcome section in right column when image is uploaded
        document.getElementById('welcomeSection').style.display = 'block';
        document.getElementById('loadingSection').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'none';
        document.getElementById('errorSection').style.display = 'none';
    }

    isValidFileType(file) {
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/bmp'];
        return validTypes.includes(file.type);
    }

    displayImagePreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const previewImage = document.getElementById('previewImage');
            
            if (!previewImage) {
                console.error('Preview image element not found!');
                return;
            }
            
            previewImage.src = e.target.result;
            
            // Ensure image is visible
            previewImage.style.display = 'block';
            previewImage.style.opacity = '1';
        };
        
        reader.readAsDataURL(file);
    }

    async analyzeImage() {
        if (!this.currentFile || this.isProcessing) return;

        this.isProcessing = true;
        this.showSection('loadingSection');
        this.startLoadingAnimation();

        try {
            const formData = new FormData();
            formData.append('file', this.currentFile);

            const endpoint = API_BASE_URL ? `${API_BASE_URL}/predict` : '/upload';
            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.displayResults(result);
            } else {
                this.showError(result.error || 'Failed to analyze image. Please try again.');
            }
        } catch (error) {
            console.error('Error analyzing image:', error);
            this.showError('Network error. Please check your connection and try again.');
        } finally {
            this.isProcessing = false;
            this.stopLoadingAnimation();
        }
    }

    startLoadingAnimation() {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) progress = 90;
            
            progressFill.style.width = progress + '%';
            
            if (progress < 30) {
                progressText.textContent = 'Loading model...';
            } else if (progress < 60) {
                progressText.textContent = 'Processing image...';
            } else if (progress < 90) {
                progressText.textContent = 'Analyzing patterns...';
            }
        }, 200);

        this.loadingInterval = interval;
    }

    stopLoadingAnimation() {
        if (this.loadingInterval) {
            clearInterval(this.loadingInterval);
            this.loadingInterval = null;
        }
        
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        progressFill.style.width = '100%';
        progressText.textContent = 'Complete!';
    }

    displayResults(result) {
        // Update prediction card
        document.getElementById('diseaseName').textContent = result.prediction;
        document.getElementById('confidenceValue').textContent = Math.round(result.confidence * 100) + '%';
        
        // Update severity
        const severityValue = document.getElementById('severityValue');
        if (result.disease_info.severity) {
            severityValue.textContent = result.disease_info.severity;
            severityValue.style.background = result.disease_info.color;
            severityValue.style.color = 'white';
        } else {
            severityValue.textContent = 'None';
            severityValue.style.background = '#4CAF50';
            severityValue.style.color = 'white';
        }

        // Update disease icon based on prediction
        this.updateDiseaseIcon(result.prediction);

        // Update disease details
        document.getElementById('descriptionText').textContent = result.disease_info.description || 'No description available.';
        document.getElementById('symptomsText').textContent = result.disease_info.symptoms || 'No symptoms information available.';
        document.getElementById('treatmentText').textContent = result.disease_info.treatment || 'No treatment information available.';

        // Show results section
        this.showSection('resultsSection');
        
        // Add success animation
        this.animateResults();
    }

    updateDiseaseIcon(diseaseName) {
        const diseaseIcon = document.getElementById('diseaseIcon');
        const icon = document.querySelector('#diseaseIcon i');
        
        // Remove existing classes
        icon.className = 'fas';
        
        // Set appropriate icon based on disease
        switch (diseaseName.toLowerCase()) {
            case 'healthy':
                icon.classList.add('fa-leaf');
                diseaseIcon.style.color = '#4CAF50';
                break;
            case 'citrus canker':
                icon.classList.add('fa-bug');
                diseaseIcon.style.color = '#FF6B6B';
                break;
            case 'red rust':
                icon.classList.add('fa-fire');
                diseaseIcon.style.color = '#FF8E53';
                break;
            case 'anthracnose':
                icon.classList.add('fa-disease');
                diseaseIcon.style.color = '#8B4513';
                break;
            case 'spiraling whitefly':
                icon.classList.add('fa-bug');
                diseaseIcon.style.color = '#87CEEB';
                break;
            case 'algal spot':
                icon.classList.add('fa-seedling');
                diseaseIcon.style.color = '#9ACD32';
                break;
            default:
                icon.classList.add('fa-leaf');
                diseaseIcon.style.color = '#4CAF50';
        }
    }

    animateResults() {
        const resultsCard = document.querySelector('.results-card');
        resultsCard.style.opacity = '0';
        resultsCard.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            resultsCard.style.transition = 'all 0.6s ease-out';
            resultsCard.style.opacity = '1';
            resultsCard.style.transform = 'translateY(0)';
        }, 100);
    }

    switchTab(tabName) {
        // Remove active class from all tabs and panes
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
        
        // Add active class to selected tab and pane
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(tabName).classList.add('active');
    }

    showSection(sectionName) {
        // Hide all sections in the right column
        const rightColumnSections = ['welcomeSection', 'loadingSection', 'resultsSection', 'errorSection'];
        rightColumnSections.forEach(section => {
            const element = document.getElementById(section);
            if (element) {
                element.style.display = 'none';
            }
        });

        // Show requested section
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.style.display = 'block';
        }
    }

    showError(message) {
        document.getElementById('errorMessage').textContent = message;
        this.showSection('errorSection');
    }

    resetToUpload() {
        this.currentFile = null;
        this.isProcessing = false;
        
        // Reset file input
        document.getElementById('fileInput').value = '';
        
        // Reset image preview
        document.getElementById('previewImage').src = '';
        
        // Show upload section in left column (replacing image preview)
        document.getElementById('uploadSection').style.display = 'block';
        document.getElementById('imagePreviewSection').style.display = 'none';
        
        // Show welcome section in right column
        this.showSection('welcomeSection');
        
        // Reset tabs to first tab
        this.switchTab('description');
    }

    // Utility method to show success notification
    showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : '#FF9800'};
            color: white;
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease-out;
            max-width: 300px;
        `;

        // Add to page
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
    

}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GuavaDiseaseDetector();
    
    // Add some nice entrance animations
    const elements = document.querySelectorAll('.upload-card, .loading-card, .results-card, .error-card');
    elements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.6s ease-out';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 100);
    });
});

// Add smooth scrolling for better UX
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add keyboard navigation support
document.addEventListener('keydown', (e) => {
    // Escape key to reset
    if (e.key === 'Escape') {
        const detector = window.guavaDetector;
        if (detector) {
            detector.resetToUpload();
        }
    }
    
    // Enter key to analyze when image is selected
    if (e.key === 'Enter' && document.getElementById('imagePreviewSection').style.display !== 'none') {
        const detector = window.guavaDetector;
        if (detector && !detector.isProcessing) {
            detector.analyzeImage();
        }
    }
});

// Add loading state management
function setLoadingState(isLoading) {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.disabled = isLoading;
        if (isLoading) {
            button.style.opacity = '0.6';
            button.style.cursor = 'not-allowed';
        } else {
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
        }
    });
}

// Add error boundary
window.addEventListener('error', (e) => {
    console.error('Application error:', e.error);
    // You could send this to an error reporting service
});

// Add performance monitoring
window.addEventListener('load', () => {
    if ('performance' in window) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`Page loaded in ${loadTime}ms`);
    }
});
