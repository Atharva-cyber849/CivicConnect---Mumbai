#!/usr/bin/env python
import os
import django
from io import BytesIO
from PIL import Image

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.core.files.base import ContentFile
from django.contrib.auth import get_user_model
from apps.complaints.models import Complaint, ComplaintImage

User = get_user_model()

def create_sample_image(name, width=400, height=300, color=(255, 0, 0)):
    """Create a sample image with the given color."""
    img = Image.new('RGB', (width, height), color=color)
    image_io = BytesIO()
    img.save(image_io, format='JPEG', quality=85)
    image_io.seek(0)
    return ContentFile(image_io.read(), name=f'{name}.jpg')

def add_images_to_complaint(complaint_id, num_images=2):
    """Add sample images to a complaint."""
    try:
        complaint = Complaint.objects.get(id=complaint_id)
        
        # Create and add images
        colors = [(255, 0, 0), (0, 255, 0), (0, 0, 255), (255, 255, 0)]
        
        for i in range(num_images):
            image = create_sample_image(
                f'complaint_{complaint_id}_image_{i+1}',
                color=colors[i % len(colors)]
            )
            
            complaint_image = ComplaintImage.objects.create(
                complaint=complaint,
                image=image
            )
            print(f"✅ Added image {i+1} to complaint {complaint_id}")
        
        return True
    except Complaint.DoesNotExist:
        print(f"❌ Complaint {complaint_id} not found")
        return False
    except Exception as e:
        print(f"❌ Error adding images: {e}")
        return False

# Add images to complaint #7
if __name__ == '__main__':
    print("Adding sample images to complaint #7...")
    success = add_images_to_complaint(complaint_id=7, num_images=2)
    
    if success:
        print("\n✅ Successfully added images to complaint #7")
        # Verify
        complaint = Complaint.objects.get(id=7)
        image_count = complaint.images.count()
        print(f"   Complaint #7 now has {image_count} image(s)")
    else:
        print("\n❌ Failed to add images")
