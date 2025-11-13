# Frontend Integration Guide

## Overview
Complete guide for integrating new backend APIs into the frontend application.

## New API Clients Created

### 1. `complaintDetailsApi.js`
Handles all complaint sub-resources: images, attachments, timeline, resolution, notes.

**Location**: `/frontend/src/api/complaintDetailsApi.js`

**Usage**:
```javascript
import { complaintDetailsApi } from '@/api';

// Get complaint images
const images = await complaintDetailsApi.images.getAll(complaintId);

// Upload image
const newImage = await complaintDetailsApi.images.upload(complaintId, imageFile);

// Get timeline
const timeline = await complaintDetailsApi.timeline.getAll(complaintId);

// Add note
const note = await complaintDetailsApi.notes.add(complaintId, {
  notes: 'Internal note content',
  is_internal: true
});
```

### 2. `officersApi.js`
Handles officer management operations.

**Location**: `/frontend/src/api/officersApi.js`

**Usage**:
```javascript
import { officersApi } from '@/api';

// Get all officers
const officers = await officersApi.getAll();

// Get officer by ID
const officer = await officersApi.getById(officerId);

// Create officer
const newOfficer = await officersApi.create({
  user: userId,
  department: departmentId,
  assigned_ward: 'H/W',
  role: 'DEPARTMENT_STAFF',
  designation: 'Ward Officer',
  phone: '9876543210',
  email: 'officer@test.com'
});

// Toggle status
await officersApi.toggleStatus(officerId, true);

// Reset password
const result = await officersApi.resetPassword(officerId);
console.log('Temporary password:', result.temporary_password);

// Send invitation
await officersApi.sendInvitation(officerId);

// Filter by department
const deptOfficers = await officersApi.getByDepartment(departmentId);

// Filter by ward
const wardOfficers = await officersApi.getByWard('H/W');
```

## Updated Components

### ComplaintDetails Component

**File**: `/frontend/src/pages/admin/ComplaintDetails.jsx`

**Updates Needed**:

1. **Import new API**:
```javascript
import { complaintDetailsApi } from '@/api';
```

2. **Fetch images from new endpoint**:
```javascript
// Old approach (single image)
// const image = complaint.image;

// New approach (multiple images)
const { data: images } = useQuery(
  ['complaint-images', complaintId],
  () => complaintDetailsApi.images.getAll(complaintId),
  { enabled: !!complaintId }
);
```

3. **Fetch timeline**:
```javascript
const { data: timeline } = useQuery(
  ['complaint-timeline', complaintId],
  () => complaintDetailsApi.timeline.getAll(complaintId),
  { enabled: !!complaintId }
);
```

4. **Fetch resolution**:
```javascript
const { data: resolution } = useQuery(
  ['complaint-resolution', complaintId],
  () => complaintDetailsApi.resolution.get(complaintId),
  { enabled: !!complaintId }
);
```

5. **Fetch officer notes**:
```javascript
const { data: officerNotes } = useQuery(
  ['complaint-notes', complaintId],
  () => complaintDetailsApi.notes.getAll(complaintId),
  { enabled: !!complaintId }
);
```

6. **Upload image mutation**:
```javascript
const uploadImageMutation = useMutation(
  (imageFile) => complaintDetailsApi.images.upload(complaintId, imageFile),
  {
    onSuccess: () => {
      queryClient.invalidateQueries(['complaint-images', complaintId]);
      toast.success('Image uploaded successfully');
    },
    onError: () => {
      toast.error('Failed to upload image');
    }
  }
);
```

7. **Add note mutation**:
```javascript
const addNoteMutation = useMutation(
  (noteData) => complaintDetailsApi.notes.add(complaintId, noteData),
  {
    onSuccess: () => {
      queryClient.invalidateQueries(['complaint-notes', complaintId]);
      toast.success('Note added successfully');
    }
  }
);
```

8. **Create resolution mutation**:
```javascript
const createResolutionMutation = useMutation(
  (resolutionData) => complaintDetailsApi.resolution.create(complaintId, resolutionData),
  {
    onSuccess: () => {
      queryClient.invalidateQueries(['complaint-resolution', complaintId]);
      toast.success('Resolution submitted successfully');
    }
  }
);
```

### OfficerDetails Component

**File**: `/frontend/src/pages/admin/OfficerDetails.jsx`

**Updates Needed**:

1. **Import new API**:
```javascript
import { officersApi } from '@/api';
```

2. **Fetch officer data**:
```javascript
const { data: officer } = useQuery(
  ['officer', officerId],
  () => officersApi.getById(officerId),
  { enabled: !!officerId }
);
```

3. **Update officer mutation**:
```javascript
const updateOfficerMutation = useMutation(
  (data) => officersApi.partialUpdate(officerId, data),
  {
    onSuccess: () => {
      queryClient.invalidateQueries(['officer', officerId]);
      toast.success('Officer updated successfully');
    }
  }
);
```

4. **Toggle status action**:
```javascript
const handleToggleStatus = async () => {
  try {
    await officersApi.toggleStatus(officerId, !officer.is_active);
    queryClient.invalidateQueries(['officer', officerId]);
    toast.success(`Officer ${officer.is_active ? 'deactivated' : 'activated'}`);
  } catch (error) {
    toast.error('Failed to update status');
  }
};
```

5. **Reset password action**:
```javascript
const handleResetPassword = async () => {
  try {
    const result = await officersApi.resetPassword(officerId);
    toast.success(`Temporary password: ${result.temporary_password}`);
  } catch (error) {
    toast.error('Failed to reset password');
  }
};
```

### OfficerManagement Component

**File**: `/frontend/src/pages/admin/OfficerManagement.jsx`

**Updates Needed**:

1. **Import new API**:
```javascript
import { officersApi } from '@/api';
```

2. **Fetch officers list**:
```javascript
const { data: officers } = useQuery(
  ['officers', filters],
  () => officersApi.getAll(filters),
  { enabled: true }
);
```

3. **Filter by department**:
```javascript
const handleFilterByDepartment = async (departmentId) => {
  const officers = await officersApi.getByDepartment(departmentId);
  setFilteredOfficers(officers);
};
```

4. **Filter by ward**:
```javascript
const handleFilterByWard = async (ward) => {
  const officers = await officersApi.getByWard(ward);
  setFilteredOfficers(officers);
};
```

5. **Create officer mutation**:
```javascript
const createOfficerMutation = useMutation(
  (data) => officersApi.create(data),
  {
    onSuccess: () => {
      queryClient.invalidateQueries(['officers']);
      toast.success('Officer created successfully');
    }
  }
);
```

## Usage Examples

### Example 1: Display Complaint Images Carousel

```javascript
import { complaintDetailsApi } from '@/api';
import { useQuery } from '@tanstack/react-query';

function ComplaintImageCarousel({ complaintId }) {
  const { data: images, isLoading } = useQuery(
    ['complaint-images', complaintId],
    () => complaintDetailsApi.images.getAll(complaintId)
  );

  if (isLoading) return <div>Loading images...</div>;

  return (
    <div className="carousel">
      {images?.map((image) => (
        <img key={image.id} src={image.image} alt="Complaint" />
      ))}
    </div>
  );
}
```

### Example 2: Display Complaint Timeline

```javascript
import { complaintDetailsApi } from '@/api';
import { useQuery } from '@tanstack/react-query';

function ComplaintTimeline({ complaintId }) {
  const { data: timeline } = useQuery(
    ['complaint-timeline', complaintId],
    () => complaintDetailsApi.timeline.getAll(complaintId)
  );

  return (
    <div className="timeline">
      {timeline?.map((entry) => (
        <div key={entry.id} className="timeline-entry">
          <p>{entry.previous_status} → {entry.new_status}</p>
          <p>By: {entry.updated_by_name}</p>
          <p>Date: {new Date(entry.created_at).toLocaleDateString()}</p>
          {entry.notes && <p>Notes: {entry.notes}</p>}
        </div>
      ))}
    </div>
  );
}
```

### Example 3: Officer Management List

```javascript
import { officersApi } from '@/api';
import { useQuery } from '@tanstack/react-query';

function OfficersList() {
  const { data: officers } = useQuery(
    ['officers'],
    () => officersApi.getAll()
  );

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Department</th>
          <th>Ward</th>
          <th>Designation</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {officers?.map((officer) => (
          <tr key={officer.id}>
            <td>{officer.user_name}</td>
            <td>{officer.department_name}</td>
            <td>{officer.assigned_ward}</td>
            <td>{officer.designation}</td>
            <td>{officer.is_active ? 'Active' : 'Inactive'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### Example 4: Add Officer Note

```javascript
import { complaintDetailsApi } from '@/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

function AddNoteForm({ complaintId }) {
  const queryClient = useQueryClient();
  const [noteText, setNoteText] = useState('');

  const addNoteMutation = useMutation(
    (noteData) => complaintDetailsApi.notes.add(complaintId, noteData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['complaint-notes', complaintId]);
        setNoteText('');
        toast.success('Note added');
      }
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    addNoteMutation.mutate({
      notes: noteText,
      is_internal: true
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={noteText}
        onChange={(e) => setNoteText(e.target.value)}
        placeholder="Add internal note..."
      />
      <button type="submit" disabled={addNoteMutation.isLoading}>
        Add Note
      </button>
    </form>
  );
}
```

## API Response Examples

### Complaint Images Response
```json
{
  "id": 1,
  "complaint": 3,
  "image": "https://api.example.com/media/complaints/images/pothole_001.jpg",
  "uploaded_at": "2025-11-12T10:38:41Z"
}
```

### Complaint Timeline Response
```json
{
  "id": 1,
  "complaint": 3,
  "previous_status": "PENDING",
  "new_status": "IN_PROGRESS",
  "updated_by": 61,
  "updated_by_name": "Ravi Kumar Singh",
  "updated_by_email": "officer.bandra@test.bmc.gov.in",
  "notes": "Officer assigned to handle",
  "created_at": "2025-11-12T10:30:00Z"
}
```

### Officer Response
```json
{
  "id": 1,
  "user": 61,
  "user_name": "Ravi Kumar Singh",
  "user_email": "officer.bandra@test.bmc.gov.in",
  "department": 1,
  "department_name": "Roads & Traffic Department",
  "assigned_ward": "H/W",
  "role": "DEPARTMENT_STAFF",
  "designation": "Ward Officer",
  "phone": "9876543215",
  "email": "officer.bandra@test.bmc.gov.in",
  "complaints_handled": 45,
  "average_resolution_time": 3.2,
  "is_active": true,
  "created_at": "2025-11-11T06:12:19Z",
  "updated_at": "2025-11-11T06:12:19Z"
}
```

## Error Handling

### Example: Handle API Errors

```javascript
import { complaintDetailsApi } from '@/api';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

const uploadImageMutation = useMutation(
  (imageFile) => complaintDetailsApi.images.upload(complaintId, imageFile),
  {
    onSuccess: () => {
      toast.success('Image uploaded successfully');
    },
    onError: (error) => {
      if (error.response?.status === 400) {
        toast.error('Invalid image format');
      } else if (error.response?.status === 413) {
        toast.error('Image too large');
      } else {
        toast.error('Failed to upload image');
      }
    }
  }
);
```

## Migration Checklist

- [ ] Update ComplaintDetails component to use new APIs
- [ ] Update OfficerDetails component to use new APIs
- [ ] Update OfficerManagement component to use new APIs
- [ ] Update image carousel to use complaintDetailsApi.images
- [ ] Update timeline visualization to use complaintDetailsApi.timeline
- [ ] Update resolution form to use complaintDetailsApi.resolution
- [ ] Update officer notes to use complaintDetailsApi.notes
- [ ] Test all API calls with real data
- [ ] Handle loading and error states
- [ ] Update React Query cache invalidation
- [ ] Test file uploads (images, attachments)
- [ ] Test filtering and searching

## Files Modified

1. ✅ `/frontend/src/api/complaintDetailsApi.js` - NEW
2. ✅ `/frontend/src/api/officersApi.js` - NEW
3. ✅ `/frontend/src/api/index.js` - UPDATED

## Files to Update

1. `/frontend/src/pages/admin/ComplaintDetails.jsx`
2. `/frontend/src/pages/admin/OfficerDetails.jsx`
3. `/frontend/src/pages/admin/OfficerManagement.jsx`

## Implementation Date
November 12, 2025

## Status

✅ API Clients Created
✅ Exports Updated
⏳ Component Updates Needed
⏳ Testing Needed
