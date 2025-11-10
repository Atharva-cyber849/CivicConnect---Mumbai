"""
Model Registry and Configuration System for CivicConnect AI Service.
Provides pluggable AI model loading with graceful fallbacks.
"""
import json
import os
import logging
from pathlib import Path
from typing import Dict, List, Optional, Any, Union
from abc import ABC, abstractmethod
from dataclasses import dataclass, asdict
from enum import Enum

logger = logging.getLogger(__name__)


class ModelType(Enum):
    """Types of AI models supported."""
    TEXT_CLASSIFIER = "text_classifier"
    IMAGE_CLASSIFIER = "image_classifier"
    MULTIMODAL = "multimodal"
    EMBEDDINGS = "embeddings"
    RULE_BASED = "rule_based"


class ModelStatus(Enum):
    """Model availability status."""
    AVAILABLE = "available"
    LOADING = "loading"
    FAILED = "failed"
    DISABLED = "disabled"
    NOT_FOUND = "not_found"


@dataclass
class ModelConfig:
    """Configuration for an AI model."""
    name: str
    type: ModelType
    model_path: str
    weights_path: Optional[str] = None
    config_path: Optional[str] = None
    version: str = "1.0.0"
    priority: int = 10  # Higher priority models are tried first
    enabled: bool = True
    requires_gpu: bool = False
    memory_requirement_mb: int = 512
    batch_size: int = 1
    confidence_threshold: float = 0.5
    labels: List[str] = None
    preprocessing: Dict[str, Any] = None
    metadata: Dict[str, Any] = None

    def __post_init__(self):
        if self.labels is None:
            self.labels = []
        if self.preprocessing is None:
            self.preprocessing = {}
        if self.metadata is None:
            self.metadata = {}

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization."""
        data = asdict(self)
        data['type'] = self.type.value
        return data

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ModelConfig':
        """Create from dictionary."""
        data['type'] = ModelType(data['type'])
        return cls(**data)


class BaseModel(ABC):
    """Abstract base class for all AI models."""

    def __init__(self, config: ModelConfig):
        self.config = config
        self.status = ModelStatus.LOADING
        self.model = None
        self.error_message = None
        self.load_time = None

    @abstractmethod
    def load(self) -> bool:
        """Load the model. Returns True if successful."""
        pass

    @abstractmethod
    def predict(self, **kwargs) -> Dict[str, Any]:
        """Make a prediction. Returns prediction with confidence."""
        pass

    @abstractmethod
    def is_available(self) -> bool:
        """Check if model is available for predictions."""
        pass

    def get_info(self) -> Dict[str, Any]:
        """Get model information."""
        return {
            'name': self.config.name,
            'type': self.config.type.value,
            'version': self.config.version,
            'status': self.status.value,
            'priority': self.config.priority,
            'enabled': self.config.enabled,
            'error_message': self.error_message,
            'load_time': self.load_time,
            'metadata': self.config.metadata
        }

    def unload(self):
        """Unload model from memory."""
        self.model = None
        self.status = ModelStatus.DISABLED


class RuleBasedModel(BaseModel):
    """Rule-based fallback model."""

    def __init__(self, config: ModelConfig):
        super().__init__(config)
        self.status = ModelStatus.AVAILABLE

    def load(self) -> bool:
        """Rule-based models don't need loading."""
        self.status = ModelStatus.AVAILABLE
        return True

    def predict(self, text: str = "", image_bytes: bytes = None, **kwargs) -> Dict[str, Any]:
        """Rule-based prediction logic."""
        # Import here to avoid circular imports
        from utils.predict import predict_category_from_text, predict_category_from_image
        
        if image_bytes:
            result = predict_category_from_image(image_bytes)
        else:
            result = predict_category_from_text(text)
        
        return {
            'category': result['category'],
            'confidence': result['confidence'],
            'source': 'rule_based',
            'model_name': self.config.name
        }

    def is_available(self) -> bool:
        """Rule-based models are always available."""
        return True


class ModelRegistry:
    """Central registry for managing AI models."""

    def __init__(self, config_path: Optional[str] = None):
        self.config_path = config_path or self._get_default_config_path()
        self.models: Dict[str, BaseModel] = {}
        self.model_configs: Dict[str, ModelConfig] = {}
        self.load_order: List[str] = []
        self._initialize()

    def _get_default_config_path(self) -> str:
        """Get default configuration file path."""
        return os.path.join(os.path.dirname(__file__), 'model_config.json')

    def _initialize(self):
        """Initialize the registry by loading configuration."""
        self._load_config()
        self._register_fallback_models()

    def _load_config(self):
        """Load model configurations from file."""
        try:
            if os.path.exists(self.config_path):
                with open(self.config_path, 'r') as f:
                    config_data = json.load(f)
                
                for model_name, model_data in config_data.get('models', {}).items():
                    try:
                        config = ModelConfig.from_dict(model_data)
                        self.model_configs[model_name] = config
                        logger.info(f"Loaded config for model: {model_name}")
                    except Exception as e:
                        logger.error(f"Failed to load config for {model_name}: {e}")
            else:
                logger.warning(f"Config file not found: {self.config_path}")
                self._create_default_config()
        except Exception as e:
            logger.error(f"Failed to load model configuration: {e}")
            self._create_default_config()

    def _create_default_config(self):
        """Create default configuration file."""
        default_config = {
            "models": {
                "rule_based_text": {
                    "name": "rule_based_text",
                    "type": "text_classifier",
                    "model_path": "builtin",
                    "version": "1.0.0",
                    "priority": 1,
                    "enabled": True,
                    "requires_gpu": False,
                    "memory_requirement_mb": 64,
                    "confidence_threshold": 0.6,
                    "labels": [
                        "POTHOLE", "ROAD_DAMAGE", "GARBAGE", "WATER_LEAKAGE",
                        "STREETLIGHT", "SEWAGE_OVERFLOW", "TRAFFIC_SIGNAL",
                        "PARK_DAMAGE", "ENCROACHMENT", "OTHER"
                    ],
                    "metadata": {
                        "description": "Rule-based text classifier for Mumbai civic complaints",
                        "language_support": ["en", "mr"],
                        "keywords_based": True
                    }
                },
                "rule_based_image": {
                    "name": "rule_based_image",
                    "type": "image_classifier",
                    "model_path": "builtin",
                    "version": "1.0.0",
                    "priority": 1,
                    "enabled": True,
                    "requires_gpu": False,
                    "memory_requirement_mb": 64,
                    "confidence_threshold": 0.5,
                    "labels": [
                        "POTHOLE", "ROAD_DAMAGE", "GARBAGE", "WATER_LEAKAGE",
                        "STREETLIGHT", "SEWAGE_OVERFLOW", "TRAFFIC_SIGNAL",
                        "PARK_DAMAGE", "ENCROACHMENT", "OTHER"
                    ],
                    "metadata": {
                        "description": "Rule-based image classifier using basic computer vision",
                        "features": ["color_analysis", "edge_detection", "texture_analysis"]
                    }
                }
            },
            "settings": {
                "max_models_in_memory": 3,
                "auto_fallback": True,
                "cache_predictions": True,
                "cache_ttl_minutes": 60,
                "gpu_memory_fraction": 0.3
            }
        }

        try:
            os.makedirs(os.path.dirname(self.config_path), exist_ok=True)
            with open(self.config_path, 'w') as f:
                json.dump(default_config, f, indent=2)
            logger.info(f"Created default config file: {self.config_path}")
        except Exception as e:
            logger.error(f"Failed to create default config: {e}")

    def _register_fallback_models(self):
        """Register built-in fallback models."""
        # Text classifier fallback
        if "rule_based_text" not in self.model_configs:
            text_config = ModelConfig(
                name="rule_based_text",
                type=ModelType.TEXT_CLASSIFIER,
                model_path="builtin",
                priority=1,
                enabled=True
            )
            self.model_configs["rule_based_text"] = text_config

        # Image classifier fallback
        if "rule_based_image" not in self.model_configs:
            image_config = ModelConfig(
                name="rule_based_image",
                type=ModelType.IMAGE_CLASSIFIER,
                model_path="builtin",
                priority=1,
                enabled=True
            )
            self.model_configs["rule_based_image"] = image_config

    def register_model(self, config: ModelConfig) -> bool:
        """Register a new model configuration."""
        try:
            self.model_configs[config.name] = config
            logger.info(f"Registered model: {config.name}")
            return True
        except Exception as e:
            logger.error(f"Failed to register model {config.name}: {e}")
            return False

    def load_model(self, model_name: str) -> bool:
        """Load a specific model."""
        if model_name not in self.model_configs:
            logger.error(f"Model config not found: {model_name}")
            return False

        config = self.model_configs[model_name]
        
        try:
            # Create model instance based on type and path
            if config.model_path == "builtin" or config.type == ModelType.RULE_BASED:
                model = RuleBasedModel(config)
            else:
                # Try to load external models (TensorFlow, PyTorch, etc.)
                model = self._create_external_model(config)

            if model.load():
                self.models[model_name] = model
                logger.info(f"Successfully loaded model: {model_name}")
                return True
            else:
                logger.error(f"Failed to load model: {model_name}")
                return False

        except Exception as e:
            logger.error(f"Error loading model {model_name}: {e}")
            return False

    def _create_external_model(self, config: ModelConfig) -> BaseModel:
        """Create external model instance (TensorFlow, PyTorch, etc.)."""
        try:
            from .external_models import create_model_instance
            return create_model_instance(config)
        except Exception as e:
            logger.warning(f"Failed to create external model {config.name}: {e}, using rule-based fallback")
            return RuleBasedModel(config)

    def get_models_by_type(self, model_type: ModelType) -> List[BaseModel]:
        """Get all loaded models of a specific type, sorted by priority."""
        models = [
            model for model in self.models.values()
            if model.config.type == model_type and model.is_available()
        ]
        return sorted(models, key=lambda m: m.config.priority, reverse=True)

    def predict_with_fallback(self, model_type: ModelType, **kwargs) -> Dict[str, Any]:
        """Make prediction with automatic fallback to lower priority models."""
        models = self.get_models_by_type(model_type)
        
        if not models:
            # Load fallback models if none are available
            self._load_fallback_models(model_type)
            models = self.get_models_by_type(model_type)

        errors = []
        
        for model in models:
            try:
                if model.is_available():
                    result = model.predict(**kwargs)
                    if result.get('confidence', 0) >= model.config.confidence_threshold:
                        return result
                    else:
                        logger.info(f"Model {model.config.name} confidence too low: {result.get('confidence')}")
            except Exception as e:
                error_msg = f"Model {model.config.name} failed: {str(e)}"
                logger.error(error_msg)
                errors.append(error_msg)
                continue

        # If all models failed, return error
        return {
            'category': 'OTHER',
            'confidence': 0.1,
            'source': 'fallback_error',
            'errors': errors,
            'message': 'All models failed, returned default category'
        }

    def _load_fallback_models(self, model_type: ModelType):
        """Load fallback models for a specific type."""
        fallback_names = {
            ModelType.TEXT_CLASSIFIER: "rule_based_text",
            ModelType.IMAGE_CLASSIFIER: "rule_based_image"
        }
        
        fallback_name = fallback_names.get(model_type)
        if fallback_name and fallback_name not in self.models:
            self.load_model(fallback_name)

    def get_model_info(self) -> Dict[str, Any]:
        """Get information about all models."""
        return {
            'loaded_models': {name: model.get_info() for name, model in self.models.items()},
            'configured_models': {name: config.to_dict() for name, config in self.model_configs.items()},
            'total_loaded': len(self.models),
            'total_configured': len(self.model_configs)
        }

    def unload_model(self, model_name: str) -> bool:
        """Unload a specific model from memory."""
        if model_name in self.models:
            self.models[model_name].unload()
            del self.models[model_name]
            logger.info(f"Unloaded model: {model_name}")
            return True
        return False

    def reload_config(self) -> bool:
        """Reload configuration from file."""
        try:
            self.model_configs.clear()
            self._load_config()
            logger.info("Reloaded model configuration")
            return True
        except Exception as e:
            logger.error(f"Failed to reload config: {e}")
            return False

    def health_check(self) -> Dict[str, Any]:
        """Perform health check on all models."""
        health_status = {
            'overall_status': 'healthy',
            'models': {},
            'warnings': [],
            'errors': []
        }

        for name, model in self.models.items():
            try:
                is_available = model.is_available()
                model_status = {
                    'name': name,
                    'available': is_available,
                    'status': model.status.value,
                    'type': model.config.type.value
                }
                
                if not is_available:
                    health_status['warnings'].append(f"Model {name} is not available")
                    if health_status['overall_status'] == 'healthy':
                        health_status['overall_status'] = 'degraded'
                
                health_status['models'][name] = model_status
                
            except Exception as e:
                error_msg = f"Health check failed for {name}: {str(e)}"
                health_status['errors'].append(error_msg)
                health_status['overall_status'] = 'unhealthy'

        return health_status


# Global registry instance
_registry = None


def get_model_registry() -> ModelRegistry:
    """Get the global model registry instance."""
    global _registry
    if _registry is None:
        _registry = ModelRegistry()
    return _registry


def initialize_models() -> ModelRegistry:
    """Initialize and return the model registry."""
    registry = get_model_registry()
    
    # Load default models
    for model_name in registry.model_configs.keys():
        if registry.model_configs[model_name].enabled:
            registry.load_model(model_name)
    
    return registry