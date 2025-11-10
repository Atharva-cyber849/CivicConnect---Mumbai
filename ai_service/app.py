"""
FastAPI application for AI-powered complaint categorization.
SmartRoute™ - Intelligent complaint routing system.
"""
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import logging

from utils.predict import predict_category_from_image, predict_category_from_text
from utils.mumbai_routing import enhance_prediction_with_mumbai_routing, MumbaiWardRouter
from models import get_active_predictors
from models.config import get_label_metadata

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Snap & Report AI Service",
    description="SmartRoute™ - AI-powered complaint categorization and routing",
    version="1.0.0"
)

# Load predictors lazily on first request
_predictors = None

def _ensure_predictors():
    global _predictors
    if _predictors is None:
        _predictors = get_active_predictors()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class PredictionRequest(BaseModel):
    description: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = ""
    category: Optional[str] = None

class PredictionResponse(BaseModel):
    predicted_category: str
    confidence_score: float
    ai_method: str
    message: str
    metadata: Optional[dict] = None
    routing: Optional[dict] = None
    mumbai_specific: Optional[bool] = False

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    predictors: Optional[dict] = None

# Routes
@app.get("/", response_model=HealthResponse)
async def root():
    """Health check endpoint."""
    _ensure_predictors()
    predictor_status = {}
    if _predictors:
        predictor_status = {
            p.name: "available" if p.available() else "unavailable"
            for p in _predictors
        }
    return {
        "status": "healthy",
        "service": "Snap & Report AI Service",
        "version": "1.0.0",
        "predictors": predictor_status or {"rule-based": "available"}
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Detailed health check endpoint."""
    _ensure_predictors()
    predictor_status = {}
    if _predictors:
        predictor_status = {
            p.name: "available" if p.available() else "unavailable"
            for p in _predictors
        }
    return {
        "status": "healthy",
        "service": "SmartRoute™ AI Service",
        "version": "1.0.0",
        "predictors": predictor_status or {"rule-based": "available"}
    }

@app.post("/predict", response_model=PredictionResponse)
async def predict_complaint_category(
    description: str = Form(...),
    category: Optional[str] = Form(None),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    address: Optional[str] = Form(""),
    image: Optional[UploadFile] = File(None)
):
    """
    Predict complaint category using AI models with Mumbai-specific routing.
    
    Args:
        description: Text description of the complaint
        category: User-selected category (optional, for comparison)
        latitude: Location latitude (optional)
        longitude: Location longitude (optional)
        address: Address text (optional)
        image: Image file of the complaint (optional)
    
    Returns:
        PredictionResponse with predicted category, confidence score, and Mumbai routing
    """
    try:
        _ensure_predictors()
        logger.info(f"Received prediction request - Description: {description[:50]}...")
        
        predictions = []
        
        # Strategy 1: Try image-based prediction if image is provided
        if image:
            logger.info(f"Processing image: {image.filename}")
            try:
                image_bytes = await image.read()
                # Try advanced image models first
                for predictor in _predictors or []:
                    if getattr(predictor, 'type', '') == 'image' and predictor.available():
                        result = predictor.predict(image_bytes=image_bytes)
                        predictions.append(result)
                        if result['confidence'] > 0.7:
                            # High confidence image prediction - add Mumbai routing
                            complaint_data = {
                                'description': description,
                                'latitude': latitude,
                                'longitude': longitude,
                                'address': address
                            }
                            enhanced_result = enhance_prediction_with_mumbai_routing(
                                {'predicted_category': result['category'], 'confidence_score': result['confidence']},
                                complaint_data
                            )
                            
                            metadata = get_label_metadata(result['category'])
                            return PredictionResponse(
                                predicted_category=result['category'],
                                confidence_score=result['confidence'],
                                ai_method=result['source'],
                                message="Category predicted from image with high confidence",
                                metadata=metadata,
                                routing=enhanced_result.get('routing'),
                                mumbai_specific=True
                            )
                
                # Fallback to rule-based image classification
                result = predict_category_from_image(image_bytes)
                predictions.append(result)
            except Exception as e:
                logger.error(f"Image processing error: {str(e)}")
        
        # Strategy 2: Text-based prediction
        logger.info("Processing text description")
        # Try advanced text models first
        for predictor in _predictors or []:
            if getattr(predictor, 'type', '') == 'text' and predictor.available():
                result = predictor.predict(text=description)
                predictions.append(result)
                if result['confidence'] > 0.8:
                    # High confidence text prediction - add Mumbai routing
                    complaint_data = {
                        'description': description,
                        'latitude': latitude,
                        'longitude': longitude,
                        'address': address
                    }
                    enhanced_result = enhance_prediction_with_mumbai_routing(
                        {'predicted_category': result['category'], 'confidence_score': result['confidence']},
                        complaint_data
                    )
                    
                    metadata = get_label_metadata(result['category'])
                    return PredictionResponse(
                        predicted_category=result['category'],
                        confidence_score=result['confidence'],
                        ai_method=result['source'],
                        message="Category predicted from text description with high confidence",
                        metadata=metadata,
                        routing=enhanced_result.get('routing'),
                        mumbai_specific=True
                    )
        
        # Fallback to rule-based text classification
        result = predict_category_from_text(description)
        predictions.append(result)
        
        # Select best prediction from all attempts
        best_prediction = max(predictions, key=lambda x: x['confidence'])
        
        # Enhance with Mumbai routing
        complaint_data = {
            'description': description,
            'latitude': latitude,
            'longitude': longitude,
            'address': address
        }
        enhanced_result = enhance_prediction_with_mumbai_routing(
            {'predicted_category': best_prediction['category'], 'confidence_score': best_prediction['confidence']},
            complaint_data
        )
        
        metadata = get_label_metadata(best_prediction['category'])
        
        return PredictionResponse(
            predicted_category=best_prediction['category'],
            confidence_score=best_prediction['confidence'],
            ai_method=best_prediction.get('source', 'ensemble'),
            message="Category predicted using multiple methods with Mumbai routing",
            metadata=metadata,
            routing=enhanced_result.get('routing'),
            mumbai_specific=True
        )
    
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.post("/predict/batch")
async def predict_batch(
    complaints: list[dict]
):
    """
    Batch prediction endpoint for multiple complaints.
    
    Args:
        complaints: List of complaint dictionaries with description and optional image_url
    
    Returns:
        List of predictions
    """
    try:
        _ensure_predictors()
        results = []
        
        for complaint in complaints:
            description = complaint.get('description', '')
            best_prediction = None
            highest_confidence = 0.0
            
            # Try each available predictor if any exist
            if _predictors:
                for predictor in _predictors:
                    if predictor.type == 'text' and description:
                        result = predictor.predict(text=description)
                        if result['confidence'] > highest_confidence:
                            best_prediction = result
                            highest_confidence = result['confidence']
            
            # Always use rule-based as fallback
            if not best_prediction or best_prediction.get('confidence', 0) < 0.5:
                best_prediction = predict_category_from_text(description)
            
            metadata = get_label_metadata(best_prediction['category'])
            results.append({
                'id': complaint.get('id'),
                'predicted_category': best_prediction['category'],
                'confidence_score': best_prediction['confidence'],
                'ai_method': best_prediction.get('source', 'rule-based'),
                'metadata': metadata
            })
        
        return {"predictions": results, "count": len(results)}
    
    except Exception as e:
        logger.error(f"Batch prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Batch prediction failed: {str(e)}")

@app.get("/mumbai/wards")
async def get_mumbai_wards():
    """Get information about Mumbai wards."""
    try:
        ward_data = []
        for ward_code in MumbaiWardRouter.WARD_COORDINATES.keys():
            ward_info = MumbaiWardRouter.get_ward_info(ward_code)
            ward_data.append({
                'code': ward_code,
                **ward_info
            })
        
        return {
            "wards": ward_data,
            "total_wards": len(ward_data),
            "city": "Mumbai",
            "corporation": "BMC"
        }
    except Exception as e:
        logger.error(f"Ward info error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get ward information: {str(e)}")

@app.post("/mumbai/route")
async def route_mumbai_complaint(request: PredictionRequest):
    """Get Mumbai-specific routing for a complaint."""
    try:
        routing_info = MumbaiWardRouter.route_complaint(
            category=request.category or 'OTHER',
            description=request.description,
            latitude=request.latitude,
            longitude=request.longitude,
            address=request.address or ""
        )
        
        ward_info = MumbaiWardRouter.get_ward_info(routing_info['ward'])
        
        return {
            "routing": routing_info,
            "ward_info": ward_info,
            "valid_coordinates": MumbaiWardRouter.validate_mumbai_coordinates(
                request.latitude, request.longitude
            ) if request.latitude and request.longitude else None
        }
    except Exception as e:
        logger.error(f"Routing error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to route complaint: {str(e)}")

@app.get("/models/info")
async def get_model_info():
    """Get information about all loaded models."""
    try:
        from models import get_model_info
        return get_model_info()
    except Exception as e:
        logger.error(f"Model info error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get model info: {str(e)}")

@app.get("/models/health")
async def model_health_check():
    """Perform health check on all models."""
    try:
        from models import health_check
        return health_check()
    except Exception as e:
        logger.error(f"Health check error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

@app.post("/models/load/{model_name}")
async def load_model(model_name: str):
    """Load a specific model by name."""
    try:
        from models import load_model_by_name
        success = load_model_by_name(model_name)
        if success:
            return {"message": f"Model {model_name} loaded successfully", "status": "success"}
        else:
            raise HTTPException(status_code=400, detail=f"Failed to load model {model_name}")
    except Exception as e:
        logger.error(f"Model loading error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to load model: {str(e)}")

@app.delete("/models/unload/{model_name}")
async def unload_model(model_name: str):
    """Unload a specific model from memory."""
    try:
        from models import get_model_registry
        registry = get_model_registry()
        success = registry.unload_model(model_name)
        if success:
            return {"message": f"Model {model_name} unloaded successfully", "status": "success"}
        else:
            raise HTTPException(status_code=404, detail=f"Model {model_name} not found")
    except Exception as e:
        logger.error(f"Model unloading error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to unload model: {str(e)}")

@app.post("/models/predict/best")
async def predict_with_best_model(
    model_type: str = Form(...),
    text: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None)
):
    """Make prediction using the best available model of specified type."""
    try:
        from models import predict_with_best_model
        
        kwargs = {}
        if text:
            kwargs['text'] = text
        if image:
            kwargs['image_bytes'] = await image.read()
        
        result = predict_with_best_model(model_type, **kwargs)
        return result
    except Exception as e:
        logger.error(f"Best model prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
