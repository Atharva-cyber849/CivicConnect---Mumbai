"""
AI Models package for CivicConnect.
Provides pluggable AI model loading with graceful fallbacks.
"""
from .registry import (
    ModelRegistry, ModelConfig, ModelType, ModelStatus,
    get_model_registry, initialize_models
)
from .external_models import (
    TensorFlowTextModel, PyTorchImageModel, ONNXMultimodalModel,
    create_model_instance
)

# Global registry instance
_global_registry = None


def get_active_predictors():
    """
    Get active predictors from the model registry.
    Maintains backward compatibility with existing code.
    """
    global _global_registry
    if _global_registry is None:
        _global_registry = initialize_models()
    
    # Return a list of active models
    active_models = []
    for model in _global_registry.models.values():
        if model.is_available():
            active_models.append(ModelWrapper(model))
    
    return active_models


class ModelWrapper:
    """
    Wrapper class to maintain compatibility with existing predictor interface.
    """
    
    def __init__(self, model):
        self.model = model
        self.name = model.config.name
        self.type = model.config.type.value
    
    def available(self):
        """Check if model is available."""
        return self.model.is_available()
    
    def predict(self, **kwargs):
        """Make prediction with the wrapped model."""
        return self.model.predict(**kwargs)


def load_model_by_name(model_name: str):
    """Load a specific model by name."""
    registry = get_model_registry()
    return registry.load_model(model_name)


def get_model_info():
    """Get information about all models."""
    registry = get_model_registry()
    return registry.get_model_info()


def health_check():
    """Perform health check on all models."""
    registry = get_model_registry()
    return registry.health_check()


def predict_with_best_model(model_type: str, **kwargs):
    """
    Make prediction using the best available model of specified type.
    """
    registry = get_model_registry()
    model_type_enum = ModelType(model_type)
    return registry.predict_with_fallback(model_type_enum, **kwargs)


# Initialize the registry on import
def _initialize_on_import():
    """Initialize models when the package is imported."""
    try:
        global _global_registry
        _global_registry = initialize_models()
        return True
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to initialize models on import: {e}")
        return False


# Attempt to initialize on import (graceful failure)
_initialization_success = _initialize_on_import()


__all__ = [
    'ModelRegistry', 'ModelConfig', 'ModelType', 'ModelStatus',
    'get_model_registry', 'initialize_models', 'get_active_predictors',
    'TensorFlowTextModel', 'PyTorchImageModel', 'ONNXMultimodalModel',
    'create_model_instance', 'load_model_by_name', 'get_model_info',
    'health_check', 'predict_with_best_model'
]

