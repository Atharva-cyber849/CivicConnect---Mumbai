"""
External AI Model implementations for TensorFlow, PyTorch, and ONNX models.
Provides concrete implementations for different ML frameworks.
"""
import os
import json
import pickle
import numpy as np
import logging
from typing import Dict, Any, List, Optional
from PIL import Image
import io

from .registry import BaseModel, ModelConfig, ModelStatus

logger = logging.getLogger(__name__)


class TensorFlowTextModel(BaseModel):
    """TensorFlow-based text classification model."""

    def __init__(self, config: ModelConfig):
        super().__init__(config)
        self.tokenizer = None
        self.max_length = config.preprocessing.get('max_length', 512)

    def load(self) -> bool:
        """Load TensorFlow model and tokenizer."""
        try:
            import tensorflow as tf
            from transformers import AutoTokenizer
            
            # Check if model file exists
            if not os.path.exists(self.config.model_path):
                self.error_message = f"Model file not found: {self.config.model_path}"
                self.status = ModelStatus.NOT_FOUND
                return False

            # Load the model
            self.model = tf.keras.models.load_model(self.config.model_path)
            
            # Load tokenizer
            tokenizer_name = self.config.preprocessing.get('tokenizer', 'bert-base-uncased')
            self.tokenizer = AutoTokenizer.from_pretrained(tokenizer_name)
            
            self.status = ModelStatus.AVAILABLE
            logger.info(f"Successfully loaded TensorFlow model: {self.config.name}")
            return True
            
        except ImportError as e:
            self.error_message = f"TensorFlow not installed: {str(e)}"
            self.status = ModelStatus.FAILED
            logger.error(self.error_message)
            return False
        except Exception as e:
            self.error_message = f"Failed to load TensorFlow model: {str(e)}"
            self.status = ModelStatus.FAILED
            logger.error(self.error_message)
            return False

    def predict(self, text: str = "", **kwargs) -> Dict[str, Any]:
        """Make prediction using TensorFlow model."""
        if not self.is_available():
            raise RuntimeError(f"Model {self.config.name} is not available")

        try:
            # Tokenize text
            encoded = self.tokenizer(
                text,
                max_length=self.max_length,
                padding='max_length',
                truncation=True,
                return_tensors='tf'
            )
            
            # Make prediction
            predictions = self.model.predict(encoded['input_ids'])
            predicted_class_idx = np.argmax(predictions[0])
            confidence = float(np.max(predictions[0]))
            
            # Map to category
            category = self.config.labels[predicted_class_idx] if predicted_class_idx < len(self.config.labels) else 'OTHER'
            
            return {
                'category': category,
                'confidence': confidence,
                'source': f'tensorflow_{self.config.name}',
                'model_name': self.config.name,
                'all_predictions': {
                    self.config.labels[i]: float(predictions[0][i])
                    for i in range(len(self.config.labels))
                } if len(predictions[0]) == len(self.config.labels) else {}
            }
            
        except Exception as e:
            logger.error(f"Prediction failed for {self.config.name}: {str(e)}")
            raise

    def is_available(self) -> bool:
        """Check if model is available."""
        return self.status == ModelStatus.AVAILABLE and self.model is not None


class PyTorchImageModel(BaseModel):
    """PyTorch-based image classification model."""

    def __init__(self, config: ModelConfig):
        super().__init__(config)
        self.transform = None
        self.device = None

    def load(self) -> bool:
        """Load PyTorch model."""
        try:
            import torch
            import torchvision.transforms as transforms
            
            # Check if model file exists
            if not os.path.exists(self.config.model_path):
                self.error_message = f"Model file not found: {self.config.model_path}"
                self.status = ModelStatus.NOT_FOUND
                return False

            # Set device
            self.device = torch.device('cuda' if torch.cuda.is_available() and self.config.requires_gpu else 'cpu')
            
            # Load model
            self.model = torch.load(self.config.model_path, map_location=self.device)
            self.model.eval()
            
            # Setup image transforms
            image_size = self.config.preprocessing.get('image_size', [224, 224])
            normalize_params = self.config.preprocessing.get('normalize', {
                'mean': [0.485, 0.456, 0.406],
                'std': [0.229, 0.224, 0.225]
            })
            
            self.transform = transforms.Compose([
                transforms.Resize(image_size),
                transforms.ToTensor(),
                transforms.Normalize(mean=normalize_params['mean'], std=normalize_params['std'])
            ])
            
            self.status = ModelStatus.AVAILABLE
            logger.info(f"Successfully loaded PyTorch model: {self.config.name}")
            return True
            
        except ImportError as e:
            self.error_message = f"PyTorch not installed: {str(e)}"
            self.status = ModelStatus.FAILED
            logger.error(self.error_message)
            return False
        except Exception as e:
            self.error_message = f"Failed to load PyTorch model: {str(e)}"
            self.status = ModelStatus.FAILED
            logger.error(self.error_message)
            return False

    def predict(self, image_bytes: bytes = None, **kwargs) -> Dict[str, Any]:
        """Make prediction using PyTorch model."""
        if not self.is_available():
            raise RuntimeError(f"Model {self.config.name} is not available")

        if not image_bytes:
            raise ValueError("image_bytes is required for image classification")

        try:
            import torch
            
            # Convert bytes to PIL Image
            image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
            
            # Apply transforms
            input_tensor = self.transform(image).unsqueeze(0).to(self.device)
            
            # Make prediction
            with torch.no_grad():
                outputs = self.model(input_tensor)
                probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
                predicted_class_idx = torch.argmax(probabilities).item()
                confidence = probabilities[predicted_class_idx].item()
            
            # Map to category
            category = self.config.labels[predicted_class_idx] if predicted_class_idx < len(self.config.labels) else 'OTHER'
            
            return {
                'category': category,
                'confidence': confidence,
                'source': f'pytorch_{self.config.name}',
                'model_name': self.config.name,
                'all_predictions': {
                    self.config.labels[i]: float(probabilities[i])
                    for i in range(len(self.config.labels))
                } if len(probabilities) == len(self.config.labels) else {}
            }
            
        except Exception as e:
            logger.error(f"Prediction failed for {self.config.name}: {str(e)}")
            raise

    def is_available(self) -> bool:
        """Check if model is available."""
        return self.status == ModelStatus.AVAILABLE and self.model is not None


class ONNXMultimodalModel(BaseModel):
    """ONNX-based multimodal classification model."""

    def __init__(self, config: ModelConfig):
        super().__init__(config)
        self.session = None
        self.tokenizer = None
        self.image_transform = None

    def load(self) -> bool:
        """Load ONNX model."""
        try:
            import onnxruntime as ort
            from transformers import AutoTokenizer
            import torchvision.transforms as transforms
            
            # Check if model file exists
            if not os.path.exists(self.config.model_path):
                self.error_message = f"Model file not found: {self.config.model_path}"
                self.status = ModelStatus.NOT_FOUND
                return False

            # Create ONNX session
            providers = ['CUDAExecutionProvider', 'CPUExecutionProvider'] if self.config.requires_gpu else ['CPUExecutionProvider']
            self.session = ort.InferenceSession(self.config.model_path, providers=providers)
            
            # Load tokenizer for text processing
            self.tokenizer = AutoTokenizer.from_pretrained('bert-base-uncased')
            
            # Setup image transforms
            image_size = self.config.preprocessing.get('image_size', [224, 224])
            self.image_transform = transforms.Compose([
                transforms.Resize(image_size),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
            ])
            
            self.status = ModelStatus.AVAILABLE
            logger.info(f"Successfully loaded ONNX model: {self.config.name}")
            return True
            
        except ImportError as e:
            self.error_message = f"ONNX Runtime not installed: {str(e)}"
            self.status = ModelStatus.FAILED
            logger.error(self.error_message)
            return False
        except Exception as e:
            self.error_message = f"Failed to load ONNX model: {str(e)}"
            self.status = ModelStatus.FAILED
            logger.error(self.error_message)
            return False

    def predict(self, text: str = "", image_bytes: bytes = None, **kwargs) -> Dict[str, Any]:
        """Make prediction using ONNX multimodal model."""
        if not self.is_available():
            raise RuntimeError(f"Model {self.config.name} is not available")

        try:
            inputs = {}
            
            # Process text input
            if text:
                max_length = self.config.preprocessing.get('text_max_length', 256)
                encoded = self.tokenizer(
                    text,
                    max_length=max_length,
                    padding='max_length',
                    truncation=True,
                    return_tensors='np'
                )
                inputs['text_input'] = encoded['input_ids']
                inputs['text_attention_mask'] = encoded['attention_mask']
            
            # Process image input
            if image_bytes:
                image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
                image_tensor = self.image_transform(image).unsqueeze(0).numpy()
                inputs['image_input'] = image_tensor
            
            # Run inference
            outputs = self.session.run(None, inputs)
            predictions = outputs[0][0]  # Assuming first output is predictions
            
            predicted_class_idx = np.argmax(predictions)
            confidence = float(np.max(predictions))
            
            # Map to category
            category = self.config.labels[predicted_class_idx] if predicted_class_idx < len(self.config.labels) else 'OTHER'
            
            return {
                'category': category,
                'confidence': confidence,
                'source': f'onnx_{self.config.name}',
                'model_name': self.config.name,
                'modalities_used': [k for k in inputs.keys()],
                'all_predictions': {
                    self.config.labels[i]: float(predictions[i])
                    for i in range(len(self.config.labels))
                } if len(predictions) == len(self.config.labels) else {}
            }
            
        except Exception as e:
            logger.error(f"Prediction failed for {self.config.name}: {str(e)}")
            raise

    def is_available(self) -> bool:
        """Check if model is available."""
        return self.status == ModelStatus.AVAILABLE and self.session is not None


def create_model_instance(config: ModelConfig) -> BaseModel:
    """Factory function to create model instances based on configuration."""
    if config.model_path == "builtin":
        from .registry import RuleBasedModel
        return RuleBasedModel(config)
    
    # Determine model type based on file extension and config
    model_path = config.model_path.lower()
    
    if model_path.endswith('.h5') or model_path.endswith('.keras'):
        return TensorFlowTextModel(config)
    elif model_path.endswith('.pth') or model_path.endswith('.pt'):
        return PyTorchImageModel(config)
    elif model_path.endswith('.onnx'):
        return ONNXMultimodalModel(config)
    else:
        # Default to rule-based
        logger.warning(f"Unknown model format for {config.name}, using rule-based fallback")
        from .registry import RuleBasedModel
        return RuleBasedModel(config)