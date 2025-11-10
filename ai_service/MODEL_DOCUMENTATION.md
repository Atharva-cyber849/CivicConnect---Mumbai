# CivicConnect AI Service - Model Documentation

## Overview

The CivicConnect AI Service provides a pluggable AI model system for intelligent complaint categorization with graceful fallbacks. The system supports multiple AI frameworks and automatically routes to the best available model.

## Architecture

### Model Registry System

The system uses a centralized model registry that manages:
- Model configuration and metadata
- Lazy loading and unloading
- Priority-based model selection
- Graceful fallback to rule-based logic
- Health monitoring and status reporting

### Supported Model Types

1. **Text Classifiers** (`text_classifier`)
   - BERT-based models for text classification
   - Rule-based keyword matching (fallback)

2. **Image Classifiers** (`image_classifier`)
   - CNN models (ResNet, EfficientNet, etc.)
   - Basic computer vision fallback

3. **Multimodal Models** (`multimodal`)
   - Combined text and image processing
   - CLIP-based architectures

4. **Rule-Based Models** (`rule_based`)
   - Always available fallback
   - Mumbai-specific keyword matching

## Configuration

### Model Configuration File

The system uses `models/model_config.json` to define available models:

```json
{
  "models": {
    "model_name": {
      "name": "model_name",
      "type": "text_classifier|image_classifier|multimodal",
      "model_path": "/path/to/model/file",
      "version": "1.0.0",
      "priority": 10,
      "enabled": true,
      "requires_gpu": false,
      "memory_requirement_mb": 512,
      "confidence_threshold": 0.8,
      "labels": ["POTHOLE", "GARBAGE", ...],
      "preprocessing": {...},
      "metadata": {...}
    }
  },
  "settings": {
    "max_models_in_memory": 3,
    "auto_fallback": true,
    "cache_predictions": true
  }
}
```

### Environment Variables

- `AI_MODEL_CONFIG_PATH`: Path to model configuration file
- `AI_MODEL_STORAGE_PATH`: Directory containing model files
- `GPU_MEMORY_FRACTION`: GPU memory allocation (0.0-1.0)
- `ENABLE_MODEL_CACHING`: Enable prediction caching (true/false)

## Supported Frameworks

### TensorFlow Models

**File Format**: `.h5`, `.keras`
**Requirements**: `tensorflow>=2.8.0`

```python
# Example TensorFlow model configuration
{
  "name": "tensorflow_text_classifier",
  "type": "text_classifier",
  "model_path": "./models/text_classifier.h5",
  "preprocessing": {
    "max_length": 512,
    "tokenizer": "bert-base-uncased"
  }
}
```

### PyTorch Models

**File Format**: `.pth`, `.pt`
**Requirements**: `torch>=1.12.0`, `torchvision>=0.13.0`

```python
# Example PyTorch model configuration
{
  "name": "pytorch_image_classifier",
  "type": "image_classifier",
  "model_path": "./models/image_classifier.pth",
  "preprocessing": {
    "image_size": [224, 224],
    "normalize": {
      "mean": [0.485, 0.456, 0.406],
      "std": [0.229, 0.224, 0.225]
    }
  }
}
```

### ONNX Models

**File Format**: `.onnx`
**Requirements**: `onnxruntime>=1.12.0`

```python
# Example ONNX model configuration
{
  "name": "multimodal_classifier",
  "type": "multimodal",
  "model_path": "./models/multimodal.onnx",
  "preprocessing": {
    "text_max_length": 256,
    "image_size": [224, 224]
  }
}
```

## API Endpoints

### Core Prediction

#### POST `/predict`
Enhanced prediction with Mumbai routing.

**Parameters**:
- `description`: Text description (required)
- `latitude`: Location latitude (optional)
- `longitude`: Location longitude (optional)
- `address`: Address text (optional)
- `image`: Image file (optional)

**Response**:
```json
{
  "predicted_category": "POTHOLE",
  "confidence_score": 0.85,
  "ai_method": "tensorflow_text_classifier",
  "message": "Category predicted with high confidence",
  "routing": {
    "ward": "H/W",
    "department": "ROADS",
    "priority": "HIGH"
  },
  "mumbai_specific": true
}
```

### Model Management

#### GET `/models/info`
Get information about all models.

#### GET `/models/health`
Perform health check on all models.

#### POST `/models/load/{model_name}`
Load a specific model.

#### DELETE `/models/unload/{model_name}`
Unload a model from memory.

#### POST `/models/predict/best`
Use the best available model for prediction.

### Mumbai-Specific

#### GET `/mumbai/wards`
Get Mumbai ward information.

#### POST `/mumbai/route`
Get Mumbai-specific routing for complaints.

## Model Development Guide

### Training Data Format

Text classifier training data should be in CSV format:
```csv
text,category,ward,priority
"पोथोल on road near station","POTHOLE","H/W","HIGH"
"Garbage bin overflowing","GARBAGE","A","MEDIUM"
```

Image classifier training data structure:
```
training_data/
├── POTHOLE/
│   ├── img001.jpg
│   ├── img002.jpg
├── GARBAGE/
│   ├── img003.jpg
└── OTHER/
    ├── img004.jpg
```

### Model Training Pipeline

1. **Data Collection**
   - Gather Mumbai civic complaint data
   - Include text descriptions and images
   - Label with appropriate categories

2. **Preprocessing**
   - Text: Tokenization, normalization
   - Images: Resize, normalize, augment
   - Multilingual support (English/Marathi)

3. **Model Training**
   - Fine-tune pre-trained models
   - Validate on Mumbai-specific test set
   - Export in supported format

4. **Integration**
   - Add to model configuration
   - Test with API endpoints
   - Monitor performance

### Performance Requirements

- **Latency**: < 500ms per prediction
- **Accuracy**: > 85% on Mumbai test set
- **Memory**: < 2GB per model
- **Throughput**: > 100 predictions/second

## Deployment

### Docker Deployment

```dockerfile
FROM python:3.9-slim

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . /app
WORKDIR /app

# Download models
RUN python scripts/download_models.py

EXPOSE 8001
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8001"]
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: civic-ai-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: civic-ai-service
  template:
    spec:
      containers:
      - name: ai-service
        image: civic-ai-service:latest
        ports:
        - containerPort: 8001
        env:
        - name: GPU_MEMORY_FRACTION
          value: "0.3"
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "4Gi"
            cpu: "2"
```

## Monitoring and Logging

### Health Checks

The service provides health endpoints for monitoring:
- `/health`: Basic service health
- `/models/health`: Detailed model status

### Metrics

Key metrics to monitor:
- Prediction latency
- Model accuracy
- Memory usage
- Error rates
- Fallback frequency

### Logging

Structured logging with levels:
- INFO: Model loading, predictions
- WARNING: Fallbacks, low confidence
- ERROR: Model failures, API errors

## Troubleshooting

### Common Issues

1. **Model Not Loading**
   - Check file path and permissions
   - Verify framework dependencies
   - Check GPU availability

2. **Low Accuracy**
   - Retrain with more Mumbai data
   - Adjust confidence thresholds
   - Update preprocessing parameters

3. **High Memory Usage**
   - Reduce max_models_in_memory
   - Unload unused models
   - Use model quantization

4. **Slow Predictions**
   - Enable GPU acceleration
   - Use model optimization
   - Implement caching

### Debug Mode

Enable debug logging:
```python
import logging
logging.getLogger().setLevel(logging.DEBUG)
```

## Future Enhancements

1. **Model Versioning**
   - A/B testing framework
   - Gradual rollouts
   - Automatic rollbacks

2. **Advanced Features**
   - Real-time learning
   - Active learning
   - Ensemble methods

3. **Performance Optimization**
   - Model quantization
   - TensorRT optimization
   - Batch processing

4. **Data Pipeline**
   - Automated retraining
   - Data quality monitoring
   - Bias detection