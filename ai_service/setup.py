#!/usr/bin/env python3
"""
Setup script for CivicConnect AI Service.
Installs optional dependencies based on required model types.
"""
import subprocess
import sys
import os
import argparse
from pathlib import Path


def run_command(command, description=""):
    """Run a shell command and handle errors."""
    print(f"{'='*50}")
    print(f"Running: {description or command}")
    print(f"{'='*50}")
    
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        if result.stdout:
            print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error: {e}")
        if e.stderr:
            print(f"Error output: {e.stderr}")
        return False


def install_base_requirements():
    """Install base requirements."""
    return run_command("pip install -r requirements.txt", "Installing base requirements")


def install_tensorflow():
    """Install TensorFlow dependencies."""
    commands = [
        "pip install tensorflow>=2.13.0",
        "pip install transformers>=4.35.0 tokenizers>=0.14.0"
    ]
    
    for cmd in commands:
        if not run_command(cmd):
            return False
    return True


def install_pytorch():
    """Install PyTorch dependencies."""
    # Detect CUDA availability
    try:
        import torch
        cuda_available = torch.cuda.is_available()
        print(f"CUDA available: {cuda_available}")
    except ImportError:
        cuda_available = False
    
    if cuda_available:
        cmd = "pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118"
    else:
        cmd = "pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu"
    
    return run_command(cmd, "Installing PyTorch")


def install_onnx():
    """Install ONNX Runtime dependencies."""
    # Try GPU version first, fallback to CPU
    gpu_cmd = "pip install onnxruntime-gpu>=1.16.0"
    cpu_cmd = "pip install onnxruntime>=1.16.0"
    
    if not run_command(gpu_cmd, "Installing ONNX Runtime GPU"):
        print("GPU version failed, trying CPU version...")
        return run_command(cpu_cmd, "Installing ONNX Runtime CPU")
    return True


def install_all_ml_frameworks():
    """Install all ML framework dependencies."""
    frameworks = [
        ("TensorFlow", install_tensorflow),
        ("PyTorch", install_pytorch),
        ("ONNX Runtime", install_onnx)
    ]
    
    results = {}
    for name, install_func in frameworks:
        print(f"\n{'='*60}")
        print(f"Installing {name}...")
        print(f"{'='*60}")
        results[name] = install_func()
    
    # Summary
    print(f"\n{'='*60}")
    print("Installation Summary:")
    print(f"{'='*60}")
    for name, success in results.items():
        status = "✓ SUCCESS" if success else "✗ FAILED"
        print(f"{name}: {status}")
    
    return all(results.values())


def setup_model_directories():
    """Create necessary model directories."""
    directories = [
        "models/trained_models",
        "models/model_backups",
        "models/cache"
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"Created directory: {directory}")


def download_sample_models():
    """Download sample models (placeholder)."""
    print("Sample model download not implemented yet.")
    print("To add your own models:")
    print("1. Place model files in models/trained_models/")
    print("2. Update models/model_config.json")
    print("3. Set enabled=true for your models")


def verify_installation():
    """Verify the installation by testing imports."""
    test_imports = [
        ("FastAPI", "import fastapi"),
        ("NumPy", "import numpy"),
        ("Pillow", "import PIL"),
        ("Geopy", "import geopy"),
    ]
    
    optional_imports = [
        ("TensorFlow", "import tensorflow"),
        ("PyTorch", "import torch"),
        ("ONNX Runtime", "import onnxruntime"),
        ("Transformers", "import transformers"),
    ]
    
    print(f"\n{'='*60}")
    print("Verifying Installation:")
    print(f"{'='*60}")
    
    # Test required imports
    for name, import_stmt in test_imports:
        try:
            exec(import_stmt)
            print(f"✓ {name}")
        except ImportError:
            print(f"✗ {name} - REQUIRED")
    
    # Test optional imports
    print("\nOptional frameworks:")
    for name, import_stmt in optional_imports:
        try:
            exec(import_stmt)
            print(f"✓ {name}")
        except ImportError:
            print(f"- {name} (not installed)")


def main():
    """Main setup function."""
    parser = argparse.ArgumentParser(description="Setup CivicConnect AI Service")
    parser.add_argument("--framework", choices=["tensorflow", "pytorch", "onnx", "all"], 
                       help="Install specific ML framework")
    parser.add_argument("--skip-base", action="store_true", help="Skip base requirements")
    parser.add_argument("--verify-only", action="store_true", help="Only verify installation")
    
    args = parser.parse_args()
    
    if args.verify_only:
        verify_installation()
        return
    
    print("CivicConnect AI Service Setup")
    print("============================")
    
    # Install base requirements
    if not args.skip_base:
        if not install_base_requirements():
            print("Failed to install base requirements!")
            sys.exit(1)
    
    # Setup directories
    setup_model_directories()
    
    # Install ML frameworks
    if args.framework:
        if args.framework == "tensorflow":
            install_tensorflow()
        elif args.framework == "pytorch":
            install_pytorch()
        elif args.framework == "onnx":
            install_onnx()
        elif args.framework == "all":
            install_all_ml_frameworks()
    else:
        print("\nTo install ML frameworks, use:")
        print("python setup.py --framework tensorflow")
        print("python setup.py --framework pytorch")
        print("python setup.py --framework onnx")
        print("python setup.py --framework all")
    
    # Verify installation
    verify_installation()
    
    print(f"\n{'='*60}")
    print("Setup Complete!")
    print(f"{'='*60}")
    print("Next steps:")
    print("1. Place your trained models in models/trained_models/")
    print("2. Update models/model_config.json with your model configurations")
    print("3. Start the service: uvicorn app:app --reload")
    print("4. Test the API: curl http://localhost:8000/health")


if __name__ == "__main__":
    main()