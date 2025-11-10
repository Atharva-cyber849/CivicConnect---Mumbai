# Model Checkpoint Directory

This directory stores trained model checkpoints and their configurations.

## Structure

```
checkpoints/
├── text_model/
│   ├── pytorch_model.bin  # HuggingFace transformer weights
│   └── config.json        # Model configuration
└── image_model/
    ├── model.pt          # PyTorch CNN weights
    └── labels.json       # Class label mapping
```

## Usage

Models are loaded from this directory when available, falling back to:
1. Downloading from HuggingFace Hub (for transformers)
2. Using TorchVision pretrained weights (for CNNs)
3. Rule-based logic (if no models available)

## Adding New Models

1. Place model checkpoints in appropriate subdirectory
2. Update config.py label mappings if needed
3. Verify file permissions allow read access

## Model Sources

- Text Models: HuggingFace transformers (distilbert-base-uncased fine-tuned)
- Image Models: TorchVision ResNet18 (fine-tuned on civic issue dataset)