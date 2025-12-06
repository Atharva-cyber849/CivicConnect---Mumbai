# 15-Minute Video Script: Mumbai BMC Civic Complaint System
## Snap & Report Mumbai - Code & Implementation Demonstration

**Purpose:** Copyright claim demonstration showing original code implementation and live browser functionality.

---

## **INTRO (0:00 - 0:45)**

**[Screen: Title slide with project name]**

> "Welcome to the comprehensive demonstration of the Mumbai BMC Civic Complaint Management System, also known as Snap & Report. This system enables citizens to report civic issues, track their complaints, and allows municipal officers to efficiently manage and resolve these complaints across Mumbai's wards and departments."

> "Before we dive in, let me explain what this system solves. In a city like Mumbai with 24 administrative wards, citizens often don't know how to report civic issues like potholes, water leaks, or street light failures. Previous systems were fragmented - citizens would call various departments, and there was no unified tracking. Our solution creates a single platform where anyone can report an issue from their phone, and it automatically gets routed to the correct ward officer based on location. Officers can then track, update, and resolve complaints in real-time. The system uses a three-tier admin hierarchy to ensure proper oversight - Super Admins manage the entire system, Department Admins oversee their specific departments, and Ward Officers handle day-to-day complaint resolution."

> "In the next 15 minutes, I'll walk you through the core code architecture that makes this possible and demonstrate the live implementation in the browser, showing exactly how a citizen's complaint flows through the system, gets assigned to the right officer, and gets resolved."

---

## **SECTION 1: PROJECT ARCHITECTURE OVERVIEW (0:45 - 3:00)**

**[Screen: VS Code - Show folder structure]**

> "Let's start with the project structure. This is a full-stack application built with modern web technologies."

**Show the directory tree:**
```
Snap & Report/
├── frontend/          # React + Vite application
├── backend/           # Django REST Framework API
│   ├── apps/
│   │   ├── users/     # User authentication & 3-tier hierarchy
│   │   ├── complaints/ # Complaint management system
│   │   ├── departments/ # Department management
│   │   └── notifications/
└── docs/              # Documentation
```

> "I've split this into two main parts: the frontend and the backend. Let me explain the technology choices and why they matter."

> "**Frontend**: We're using React, a JavaScript library that makes it easy to build interactive user interfaces. We're pairing it with Vite, which is a modern build tool that makes development incredibly fast. We're styling everything with Tailwind CSS - a utility-first framework that lets us build beautiful, responsive designs quickly. And we're using React Router to handle navigation between different pages. This combination means the frontend is fast, responsive, and provides a great user experience whether someone's using a phone, tablet, or desktop."

> "**Backend**: The backend is built with Django, a mature Python web framework that's been battle-tested by companies like Instagram and Spotify. We're using Django REST Framework, which is a toolkit for building powerful APIs. The beauty of this architecture is that the frontend communicates with the backend purely through API calls - no page reloads, no server-side rendering. This makes the application feel snappy and modern. We're using SQLite for development - which is a file-based database that requires zero setup - but the production system uses PostgreSQL, a robust open-source relational database used by thousands of companies."

> "**Authentication**: User security is critical when dealing with government systems. We're using JWT tokens - that stands for JSON Web Tokens. Here's how it works: when a user logs in, the server creates a token that's cryptographically signed. This token proves the user's identity without the server having to maintain a session. The token travels with every API request, allowing the server to verify who's making the request. JWT tokens can expire and be refreshed, providing security while keeping the system stateless and scalable."

---

## **SECTION 2: 3-TIER ADMIN HIERARCHY - BACKEND CODE (3:00 - 5:30)**

**[Screen: VS Code - backend/apps/users/models.py]**

> "Now let me explain the core innovation of this system: the 3-tier admin hierarchy. This is absolutely critical for government operations because different levels of administration need different levels of access."

> "In the Django User model, we store both a 'role' field and an 'is_superuser' flag. This might seem redundant, but it's actually elegant. Here's why:"

**Highlight these properties in models.py:**

```python
@property
def is_super_admin(self):
    """Super Admin: ADMIN role + is_superuser=True"""
    return self.role == 'ADMIN' and self.is_superuser

@property
def is_department_admin(self):
    """Department Admin: ADMIN role + is_superuser=False + has department"""
    if self.role == 'ADMIN' and not self.is_superuser:
        return hasattr(self, 'officer_profile') and self.officer_profile.department is not None
    return False

@property
def is_bmc_officer(self):
    """BMC Officer: DEPARTMENT_STAFF role"""
    return self.role == 'DEPARTMENT_STAFF'

@property
def admin_tier(self):
    """Returns the admin tier for the user"""
    if self.is_super_admin:
        return 'super_admin'
    elif self.is_department_admin:
        return 'department_admin'
    elif self.is_bmc_officer:
        return 'bmc_officer'
    return 'citizen'
```

> "Let me break down each tier with a real-world example:"

> "**Tier 1: Super Admin** - This is the top level, managed by the BMC's IT director. They have a role of 'ADMIN' AND is_superuser is True. The Super Admin can see every complaint in Mumbai across every department and every ward. They can create Department Admins, manage the overall system settings, and generate city-wide reports. They're accountable for the entire system's performance."

> "**Tier 2: Department Admin** - Let's say someone is in charge of the 'Roads & Infrastructure' department. They have a role of 'ADMIN' but is_superuser is False. They're also linked to their specific department in the officer_profile. This Department Admin can see all road-related complaints across all wards in Mumbai. If a pothole is reported in Bandra, Andheri, or Colaba, they see it. But they cannot see water supply complaints or waste management complaints - those are other departments. They can manage the officers within their department and generate reports just for their domain."

> "**Tier 3: BMC Officer** - This is the frontline worker. They have a role of 'DEPARTMENT_STAFF' and are assigned to a specific ward, like Bandra. When a complaint comes in from Bandra ward, they see it, inspect it, and resolve it. They cannot see complaints from other wards, and they definitely cannot change system settings. They focus on their assigned area."

> "**Citizens** - The base level. Citizens can only see complaints they themselves have created. Their admin_tier is 'citizen'. This privacy is important - citizens shouldn't see each other's complaints."

> "So the `admin_tier` property dynamically calculates the user's access level by combining role, superuser status, and department affiliation. This elegant design allows us to enforce permissions using a single property check, rather than complex if-else chains scattered throughout the code."

---

## **SECTION 3: PERMISSION CLASSES (5:30 - 6:30)**

**[Screen: VS Code - backend/apps/users/permissions.py]**

> "Now let's look at how we enforce these permissions in the API. This is where the security rubber meets the road."

**Show permissions.py:**

```python
class IsSuperAdmin(permissions.BasePermission):
    """Only Super Admins (ADMIN + is_superuser) can access"""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == 'ADMIN' and
            request.user.is_superuser
        )

class IsDepartmentAdmin(permissions.BasePermission):
    """Only Department Admins can access"""
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.user.role != 'ADMIN' or request.user.is_superuser:
            return False
        return hasattr(request.user, 'officer_profile') and \
               request.user.officer_profile.department is not None
```

> "These permission classes are like gatekeepers for specific API endpoints. In Django REST Framework, when you attach a permission class to a view, that check happens before any code in the view runs."

> "For example, imagine we have a 'Create Department' endpoint that only Super Admins should access. We'd decorate that endpoint with `@permission_classes([IsSuperAdmin])`. When a request comes in, Django checks: Is the user authenticated? Do they have the role 'ADMIN'? Is their is_superuser flag True? Only if ALL three conditions are met does the request proceed. If a Department Admin tries to call this endpoint, they fail the check because their is_superuser flag is False, and the request is immediately rejected with a 403 Forbidden response."

> "Similarly, the Department Admin permission ensures that only someone with role='ADMIN' and is_superuser=False can access department-specific endpoints. This creates a clean separation of concerns - Super Admins can't accidentally be treated as Department Admins, and the code is very explicit about what each tier can do."

> "This approach has another benefit: it's all declarative. You can look at an endpoint and immediately see 'Oh, this requires IsSuperAdmin permission' without digging through the view code. It makes the codebase maintainable and auditable."

---

## **SECTION 4: JWT AUTHENTICATION WITH ADMIN TIER (6:30 - 7:15)**

**[Screen: VS Code - backend/apps/users/serializers_jwt.py]**

> "When users log in, something important happens on the backend. We don't just return a generic token. We include metadata about their tier in the JWT response."

```python
def get_admin_tier(user):
    """Helper function to determine admin tier"""
    if user.role == 'ADMIN' and user.is_superuser:
        return 'super_admin'
    elif user.role == 'ADMIN' and not user.is_superuser:
        if hasattr(user, 'officer_profile') and user.officer_profile.department:
            return 'department_admin'
    elif user.role == 'DEPARTMENT_STAFF':
        return 'bmc_officer'
    return 'citizen'
```

> "Here's the flow: A user logs in with their email and password. The backend validates the credentials against the database. If valid, we call this `get_admin_tier()` function, which looks at their role and superuser status, and returns a string like 'super_admin', 'department_admin', 'bmc_officer', or 'citizen'."

> "This tier is then encoded into the JWT token itself. The JWT is a JSON object that's been cryptographically signed. Inside this token, we store the user's ID, their tier, their role, and some other metadata. The key insight is: we DON'T store a list of all their permissions. We just store their tier, because the tier is a summary of their permissions."

> "Why is this important? Because the frontend receives this tier along with the token. It can immediately know 'Oh, this user is a department_admin' and start rendering the UI accordingly without making additional API calls. This makes the frontend snappy and responsive. The token proves the user's identity AND their tier, and it's verified on every API request."

> "This tier information is sent to the frontend and stored, allowing the UI to adapt based on the user's role in real-time."

---

## **SECTION 5: COMPLAINT FILTERING BY TIER (7:15 - 9:00)**

**[Screen: VS Code - backend/apps/complaints/views.py]**

> "Here's where the 3-tier system really shines - complaint filtering. This is the mechanism that ensures data isolation and proper access control."

```python
def get_queryset(self):
    user = self.request.user
    queryset = Complaint.objects.all()
    
    # Super Admin: sees ALL complaints
    if user.role == 'ADMIN' and user.is_superuser:
        return queryset
    
    # Department Admin: sees only their department's complaints
    elif user.role == 'ADMIN' and not user.is_superuser:
        if hasattr(user, 'officer_profile') and user.officer_profile.department:
            department = user.officer_profile.department
            return queryset.filter(department=department)
    
    # BMC Officer: sees only their assigned ward
    elif user.role == 'DEPARTMENT_STAFF':
        if hasattr(user, 'officer_profile'):
            ward = user.officer_profile.assigned_ward or user.ward
            if ward:
                return queryset.filter(ward__iexact=ward)
    
    # Citizens: see only their own complaints
    return queryset.filter(user=user)
```

> "This method is called `get_queryset()`, and it's the secret sauce of access control in Django REST Framework. Let me walk you through what happens."

> "When ANY user - whether they're a Super Admin, Department Admin, Officer, or Citizen - requests a list of complaints, this method runs. The queryset starts as 'all complaints in the database'. But then we filter it based on the user's tier."

> "**For a Super Admin**: No filtering happens. They see absolutely every complaint filed by anyone, in any ward, in any department, across all of Mumbai. If there are 10,000 complaints in the system, the Super Admin sees all 10,000."

> "**For a Department Admin**: Let's say Rajesh is the Department Admin for Roads & Infrastructure. When Rajesh makes an API call to list complaints, Django checks his role and superuser status, realizes he's a Department Admin, then pulls his department from his officer_profile. The queryset is filtered to only return complaints where the department matches Roads & Infrastructure. If there are 10,000 total complaints, but 2,000 are road-related, Rajesh sees only those 2,000. The other 8,000 complaints - about water supply, garbage, etc. - are completely invisible to him."

> "**For a BMC Officer**: Now let's say Priya is a BMC Officer assigned to the Bandra ward. When she requests complaints, Django checks her role, sees she's DEPARTMENT_STAFF, pulls her assigned_ward from the officer_profile. The queryset is filtered to only Bandra complaints. Even if there are 2,000 road complaints total, she only sees the 200 that were filed in her ward. The other 1,800 from Andheri, Dadar, and other wards are not returned."

> "**For a Citizen**: Amit is a citizen who filed 3 complaints. When he requests his complaint history, the queryset is filtered to only complaints where the user is Amit. He sees his 3 complaints, but nothing else. He can't see what other citizens reported, and he can't see officer notes or department comments."

> "The beauty of this design is that the filtering happens at the database query level. We're not fetching all complaints into Python and then filtering them - that would be slow and wasteful. We're asking the database itself to only return the relevant rows. It's both more efficient and more secure."

> "This approach also makes auditing easier. If someone accuses an officer of accessing data they shouldn't have, we can check the logs and see exactly which complaints they queried. And we can verify that our code is enforcing the rules correctly."

---

## **SECTION 6: REPORT ISSUE - FRONTEND (9:00 - 11:00)**

**[Screen: VS Code - frontend/src/pages/citizen/ReportIssue.jsx]**

> "Now let's look at the citizen-facing feature - the Report Issue page. This is what a regular person in Mumbai uses to report a pothole, water leak, or broken streetlight."

**Show key parts of ReportIssue.jsx:**

```javascript
const ReportIssue = () => {
  const navigate = useNavigate()
  const wardGeo = useWardBoundaries()
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [autoDetectedWard, setAutoDetectedWard] = useState('')
  const [markerPosition, setMarkerPosition] = useState(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    ward: '',
    address: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    zip_code: '',
    latitude: '',
    longitude: '',
    image: null,
  })

  // Automatically fetch location on component mount
  useEffect(() => {
    handleUseMyLocation();
  }, []);
```

> "The form is quite sophisticated. Notice that `formData` has all these fields. Some are obvious - title and description are what the citizen types. But notice the location fields: latitude, longitude, address, city, state, zip_code, and ward."

> "Here's the key insight: we don't ask the user to manually type their ward. That's error-prone. Instead, we use their GPS location. When the page loads, the `useEffect` hook automatically calls `handleUseMyLocation()`. This requests the browser for the user's GPS coordinates. With the user's permission, the browser shares their location."

> "Once we have latitude and longitude, we do something clever called reverse geocoding. That's a process where we take coordinates and convert them into human-readable address information. We also check which ward those coordinates fall into by checking against Mumbai's administrative boundaries."

> "This automatic location detection serves multiple purposes: it's convenient for citizens - they don't have to manually enter their location - and it ensures accuracy. We know exactly where the issue is."

---

**[Show map integration code:]**

```javascript
const handleMapClick = async (latlng) => {
  setMarkerPosition(latlng)
  
  try {
    const geo = await reverseGeocode(latlng.lat, latlng.lng)
    
    // Update all form data with reverse geocode results
    setFormData(prev => ({
      ...prev,
      latitude: latlng.lat,
      longitude: latlng.lng,
      address: geo.address || '',
      city: geo.city || 'Mumbai',
      state: geo.state || 'Maharashtra',
      zip_code: geo.zip_code || '',
      ward: geo.ward || prev.ward,
    }))
    
    setAutoDetectedWard(geo.ward)
  } catch (error) {
    console.error('Geocoding failed:', error)
  }
};
```

> "When citizens click on the map, this `handleMapClick` function is triggered. The click event provides latitude and longitude coordinates. We immediately set a marker on the map at that location so the citizen can see exactly where they clicked."

> "Then comes the automation: we call `reverseGeocode()` with those coordinates. This is an API call to a service - could be Google Maps API, OpenStreetMap, or a similar geolocation service. Within milliseconds, the service returns the full address - street name, house number, neighborhood. Crucially, it also identifies which of Mumbai's 24 wards contains those coordinates."

> "We then update the entire `formData` object in one go. The address field now shows 'SV Road, Bandra', the ward field shows 'Bandra', and we also set state to 'Maharashtra' and city to 'Mumbai'. The citizen can see their entire location auto-filled and can verify it's correct."

> "This is crucial for proper routing. The backend will use the ward field to determine which Ward Officer should see this complaint. If the ward detection is wrong, the complaint goes to the wrong officer. By using GPS coordinates and reverse geocoding instead of manual text entry, we ensure accuracy at the point of data entry, preventing downstream errors."

---

## **SECTION 7: REPORT ISSUE - BACKEND SERIALIZER (11:00 - 12:00)**

**[Screen: VS Code - backend/apps/complaints/serializers.py]**

> "When a citizen clicks the submit button, all that form data goes to the backend as a JSON request. Here's how the backend handles it."

```python
class ComplaintCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating complaints."""
    
    latitude = serializers.FloatField(write_only=True, required=False)
    longitude = serializers.FloatField(write_only=True, required=False)
    
    class Meta:
        model = Complaint
        fields = ('title', 'description', 'category', 'address', 'ward', 
                  'city', 'state', 'zip_code', 'latitude', 'longitude', 'image')
    
    def create(self, validated_data):
        # Set user from request context
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
```

> "A serializer in Django REST Framework is like a gatekeeper and translator. It takes JSON from the frontend and converts it into Python objects that the backend can work with. It also validates the data."

> "Notice the `write_only=True` on latitude and longitude. That means these fields are only used when writing data (creating a complaint), not when reading it back. Why? Because we don't need to send coordinates back to the frontend - the frontend already has them. We just need them on the backend for storage."

> "The `create()` method is called when we're actually creating a new Complaint record. Before saving to the database, we do something important: we set the user to `self.context['request'].user`. What does this mean? The request context contains information about who's making the API call. We automatically associate the new complaint with the logged-in citizen. The citizen doesn't have to specify who they are - we know because they authenticated with their JWT token."

> "This is a crucial security feature. The citizen can't accidentally - or maliciously - file a complaint on behalf of someone else. The backend enforces that the user field of the complaint is always set to whoever's making the request."

> "So to summarize the flow: citizen fills out form on frontend, frontend sends JSON to backend, serializer validates and deserializes JSON to Python objects, adds the user automatically, saves to database. In milliseconds, the complaint exists in the system."

---

## **SECTION 8: FRONTEND ROLE-BASED ACCESS (12:00 - 13:15)**

**[Screen: VS Code - frontend/src/utils/roleBasedAccess.js]**

> "On the frontend, we don't blindly show all UI elements to everyone. We use role-based utilities to determine what the current user can see and do."

```javascript
export const isSuperAdmin = (user) => {
  return user?.role === 'ADMIN' && user?.is_superuser === true;
};

export const isDepartmentAdmin = (user) => {
  return user?.role === 'ADMIN' && 
         user?.is_superuser === false && 
         user?.admin_tier === 'department_admin';
};

export const getPageAccess = (user) => {
  const superAdmin = isSuperAdmin(user);
  const deptAdmin = isDepartmentAdmin(user);
  
  return {
    dashboard: true,
    complaints: true,
    analytics: superAdmin || deptAdmin,
    departmentManagement: superAdmin,
    officerManagement: superAdmin || deptAdmin,
    zoneManagement: superAdmin,
    settings: superAdmin,
    createAdmin: superAdmin,  // Only Super Admin can create new admins
  };
};
```

> "These are utility functions that help the frontend make decisions about what to render. The functions check the user's role and admin_tier - information that came from the JWT token we discussed earlier."

> "The `isSuperAdmin()` function checks if the user has role='ADMIN' AND is_superuser=true. The optional chaining operator `?.` means 'if user exists and has a role property, check if it equals ADMIN'. This makes the code safe - if user is undefined, it returns undefined instead of crashing."

> "The `isDepartmentAdmin()` function is a bit more complex because Department Admin has more conditions: role must be ADMIN, is_superuser must be false, AND admin_tier must be 'department_admin'. This multi-condition check ensures we're not confusing Department Admins with Super Admins or officers."

> "Then comes the `getPageAccess()` function, which is the most important. It returns an object that tells the UI which pages and features the current user can access. Notice the pattern:"

> "- `dashboard` and `complaints` are `true` for everyone - all logged-in users can see these"
> "- `analytics` is true only for Super Admin or Department Admin - citizens and officers don't see analytics"
> "- `departmentManagement` is ONLY for Super Admin - only the top admin can create or modify departments"
> "- `officerManagement` is for Super Admin or Department Admin - because Department Admins manage their own officers"
> "- `zoneManagement` is ONLY for Super Admin - managing wards is a system-level operation"
> "- `settings` is ONLY for Super Admin - configuration should be restricted to the top"
> "- `createAdmin` is ONLY for Super Admin - the most sensitive operation"

> "This function is called when the user logs in or when the user's role changes. The UI then uses this object to decide what to show. If `analyticsPage` is false, the entire analytics page is hidden from the interface."

---

## **SECTION 9: ADMIN SIDEBAR NAVIGATION (13:15 - 14:30)**

**[Screen: VS Code - frontend/src/components/Layout/AdminSidebar.jsx]**

> "Now let's see how the sidebar navigation dynamically adapts based on the user's role. This is where the `pageAccess` object we just discussed comes into play."

```javascript
const getRoleLabel = () => {
  if (isSuperAdmin(user)) return 'Super Admin';
  if (isDepartmentAdmin(user)) return 'Department Admin';
  return 'BMC Officer';
};

// Navigation items filtered by role
{pageAccess.departmentManagement && (
  <NavItem to="/admin/departments" icon={Building2}>
    Departments
  </NavItem>
)}
{pageAccess.zoneManagement && (
  <NavItem to="/admin/zones" icon={Map}>
    Zones & Wards
  </NavItem>
)}
```

> "The sidebar uses conditional rendering - a React pattern where we only render JSX if a condition is true. The `&&` operator is being used here, which means 'if the left side is true, render the right side'."

> "So this code says: 'If `pageAccess.departmentManagement` is true, render a navigation item called Departments'. If it's false, this entire line is skipped and nothing is rendered."

> "For a Super Admin, both conditions are true, so they see both the 'Departments' and 'Zones & Wards' navigation items. For a Department Admin, `pageAccess.departmentManagement` is false, so they don't see these options - their interface is cleaner and simpler, showing only what's relevant to them. For a BMC Officer, both are false, so the sidebar is even simpler - just their assigned ward's complaints."

> "This is important for user experience. If we showed a Super Admin's full, complex interface to a regular officer, they'd be overwhelmed and confused. Instead, we progressively disclosure features based on what they're actually authorized to do. It's not just hiding buttons - we're also controlling complexity and preventing users from accidentally doing things they're not supposed to do."

> "The `getRoleLabel()` function also shows their current role at the top of the sidebar, so they always know what tier they're logged in as."

---

## **SECTION 10: LIVE DEMO - CITIZEN REPORT ISSUE (14:30 - 16:30)**

**[Screen: Browser - localhost:5173]**

> "Now let's see the Report Issue feature in action. I'll walk you through exactly what happens when a citizen submits a complaint, and how it flows through the system."

> "Let me log in as a citizen named Priya who lives in Bandra."

**Steps:**
1. Navigate to login page
2. Enter: `citizen1@gmail.com` / `Citizen@123`
3. Click "Report Issue" in the navigation
4. **Show the interactive map** - point out Mumbai boundary and highlight Bandra ward in different color
5. **Demonstrate "Use My Location"** button - browser asks for permission, shows coordinates auto-populated
6. Alternatively, click on map at a specific location - watch address and ward auto-populate
7. Fill in:
   - Title: "Large pothole on SV Road"
   - Category: Select "Potholes" from dropdown
   - Description: "Deep pothole causing traffic issues near Bandra station. It's about 2 meters wide and 1 foot deep. Very dangerous."
8. **Upload a photo** - show image preview with thumbnail
9. Submit the complaint
10. Show success message: "Complaint submitted successfully!"
11. Redirect to complaints list
12. Verify the new complaint appears at the top with:
    - Status: "Open"
    - Ward: "Bandra"
    - Date: Today's date
    - Category: "Potholes"

> "What just happened behind the scenes is quite sophisticated. When Priya clicked submit, the frontend sent all the complaint data to the backend API. The backend received the request with the JWT token Priya received during login. Django verified the token is valid and not expired, identified Priya as the user, then ran our ComplaintCreateSerializer."

> "The serializer automatically set the user field to Priya - so the complaint is now associated with her. The ward field was 'Bandra', which means when officers query the complaints API, the database filter we looked at earlier will show this complaint to whoever is assigned to Bandra ward."

> "The image was uploaded to the media folder on the server. The database stores a reference to it - the file path. If this was production deployed to AWS, the image would actually be stored in S3, which is cloud object storage."

> "Within seconds, the complaint is in the system. It's now visible in the database, and if we refresh Priya's complaints page, she can see it. But here's the crucial part: it's NOT visible to other citizens. It's only visible to Priya, the Bandra ward officer, the Roads & Infrastructure Department Admin, and the Super Admin."

> "This data isolation happens automatically because of the `get_queryset()` filtering we discussed. Every API call respects the user's tier."

---

## **SECTION 11: LIVE DEMO - BMC OFFICER LOGIN (16:30 - 17:45)**

**[Screen: Browser - New incognito window]**

> "Now let's switch perspective. I'll log in as the BMC Officer responsible for the Bandra ward. Their name is Arjun, and he's been assigned to investigate and resolve complaints from Bandra."

**Steps:**
1. Login: `officer.bandra@bmc.gov.in` / `Officer@123`
2. Notice the sidebar shows "BMC Officer" in the header and limited menu options
3. Show officer dashboard showing only Bandra complaints
4. Notice the complaint Priya just submitted is now visible to Arjun
5. Open the complaint we just created
6. Show all details:
   - Citizen name: Priya
   - Location pinpoint on map
   - Photo of the pothole
   - Full description
   - Timestamp of submission
7. Update complaint status from "Open" to "In Progress"
8. Add officer notes: "Inspection scheduled for tomorrow morning. Will assess damage severity and coordination with contractor."
9. Save changes
10. Notice status automatically updated on the list

> "This is the critical handoff in the system. The complaint created by a citizen is now visible to the officer responsible for that ward. But notice - the officer doesn't see complaints from other wards. If there's a similar pothole in Andheri ward, Arjun doesn't see it. That's handled by the `get_queryset()` filter we discussed - it automatically filters to his assigned ward."

> "When Arjun updates the status and adds notes, these changes are saved back to the database. The citizen Priya will see these updates on her phone in real-time if she has the app open - thanks to a notification system built into the backend."

> "The officer's view is intentionally simpler than the admin view. They see the information they need - the complaint details and location - but they don't see department-wide analytics or system settings. This focus keeps them efficient."

> "Also notice that Arjun cannot create new users, cannot manage other officers, cannot see other wards. His permissions are surgically scoped to exactly what he needs to do his job. This is the principle of least privilege in security - every user gets the minimum permissions required for their role."

---

## **SECTION 12: LIVE DEMO - DEPARTMENT ADMIN LOGIN (17:45 - 19:00)**

**[Screen: Browser - New window]**

> "Next, let's see the Department Admin view. I'll log in as Rajesh, who manages the entire Roads & Infrastructure department across all of Mumbai's wards."

**Steps:**
1. Login: `deptadmin.roads@bmc.gov.in` / `DeptAdmin@123`
2. Notice the sidebar shows "Department Admin" and different menu options than the officer
3. Show dashboard with statistics for the entire Roads department
4. Show complaints list filtered to Roads & Infrastructure department:
   - Complaints from Bandra, Andheri, Colaba, Dadar (all roads complaints)
   - But NOT complaints about water supply or waste management
5. Show the Bandra pothole complaint Priya reported
6. Show "Officer Management" page for the Roads department:
   - List of all road officers
   - Can view their assigned wards
   - Can reassign officers if needed
   - Can see performance metrics for each officer
7. Show "Analytics" page:
   - Department-wide statistics
   - Complaint resolution rates by ward
   - Average resolution time
   - Category breakdown (potholes vs street lights vs etc)
8. Demonstrate filtering - show only "Potholes" category
9. Notice Rajesh cannot access "System Settings" or "Department Management"

> "Rajesh's view is all about oversight and coordination within his department. He can see every complaint related to roads, regardless of which ward it's in. If there's a pothole in Bandra, a street light out in Andheri, and a sidewalk issue in Dadar, he sees all three."

> "But notice what he cannot do: he cannot modify system settings, he cannot create new departments, he cannot see complaints from other departments like Water Supply or Waste Management. His world is bounded to Roads & Infrastructure."

> "His Analytics page shows aggregated data for his entire department. He can see which wards have the most complaints, which types of issues are most common, and which officers are performing best. This is management-level information that helps him allocate resources effectively."

> "The Department Admin is the middle manager in this system. They have more power than an individual officer - they see everything in their domain - but less power than the Super Admin who sees everything system-wide. This tiered approach means the responsibility for issues can be clearly assigned: if roads are poorly maintained, the Roads Department Admin is accountable."

---

## **SECTION 13: LIVE DEMO - SUPER ADMIN LOGIN (19:00 - 20:15)**

**[Screen: Browser - New window]**

> "Finally, let's see the full power of the system with a Super Admin account. I'll log in as the BMC's IT Director, who oversees the entire Snap & Report system."

**Steps:**
1. Login: `superadmin@bmc.gov.in` / `SuperAdmin@123`
2. Notice the sidebar shows "Super Admin" and has significantly more options than previous roles
3. Show full dashboard with statistics from across ALL departments and ALL wards:
   - Total complaints received
   - Average resolution time
   - Complaints by category system-wide
   - Performance metrics for all departments
4. Show "Department Management" page:
   - List of all departments (Roads, Water Supply, Waste Management, etc.)
   - Can add new departments
   - Can edit department details, contact info, assigned categories
   - Can view complaint distribution by department
5. Show "Zone & Ward Management":
   - Map of Mumbai with all 24 wards marked
   - Can adjust ward boundaries
   - Can view ward statistics
   - Can reassign officers between wards
6. Show the complaint that started this journey (Priya's pothole):
   - Can see it from the Super Admin perspective
   - Can see the entire chain: citizen → officer → department
   - Can see officer notes and all updates
7. Show "Create New Admin" feature:
   - Can create new Department Admins
   - Can assign them to specific departments
   - Can set their permissions
   - Can also create Super Admins (though they likely won't)
8. Show "Settings" page:
   - System configuration options
   - API rate limiting
   - Notification settings
   - Data retention policies
9. Notice the analytics drill-down capability
10. Show "Audit Logs":
    - Who accessed what when
    - What changes were made
    - When complaints were created/updated

> "The Super Admin has complete visibility and control of the entire system. They can see every complaint filed by any citizen in any ward in any department. They see aggregated analytics across the entire city. They manage the organizational structure - creating departments, assigning admin roles, and configuring system-wide settings."

> "But with great power comes great responsibility. The Super Admin account should be carefully guarded. In a real BMC deployment, there might only be 2-3 Super Admin accounts for the entire city, and their actions are logged for audit purposes."

> "Here's what's remarkable about the system design: even though the Super Admin has full access, the access control still flows through the same `get_queryset()` method. When a Super Admin queries complaints, they get all of them. But a regular officer querying the same API with the same endpoint code gets only their ward. Same code, different results based on who's making the request. This is what we call 'row-level security' - the database itself enforces the restrictions."

> "Notice also that the UI is completely different for each role. A citizen's interface is about submitting and tracking issues. An officer's interface is about investigation and resolution. A Department Admin's interface is about oversight and management. A Super Admin's interface is about system administration. The same backend API serves all of them, but the frontend adapts the UI for each role's needs."

---

## **SECTION 14: SUMMARY & CONCLUSION (20:15 - 15:00)**

**[Screen: Split - Code on left, Browser on right]**

> "To summarize what we've built and demonstrated:"

> "**1. 3-Tier Admin Hierarchy with Automatic Data Isolation** - We created a system where Super Admin, Department Admin, and BMC Officer have completely different access levels. This isn't just UI hiding - it's enforced at the database query level. When any user queries the API, the backend automatically filters the results based on their tier. This prevents accidental data leaks and is auditable."

> "**2. Role-Based Filtering at the Database Level** - The `get_queryset()` method is the security lynchpin. Every API endpoint uses it. A Super Admin sees all 10,000 complaints. A Department Admin sees 2,000 in their department. An Officer sees 200 in their ward. A Citizen sees 3 of their own. Same code, different results. This is the most secure approach because the filtering happens at the source."

> "**3. Secure JWT Authentication with Tier Metadata** - Users authenticate once with their email and password. The backend issues a JWT token that contains their tier. This token is cryptographically signed so it cannot be forged. Every API request includes this token. The backend verifies it before processing any request. The frontend can immediately know the user's tier without making extra API calls."

> "**4. Dynamic Frontend UI Based on Permissions** - The frontend uses the admin_tier from the JWT to determine which pages and features to show. This isn't security theater - it's UX. It prevents users from being confused by options they can't use. A Super Admin gets a complex interface with system settings. An officer gets a focused interface for their ward."

> "**5. Report Issue with Automatic Geolocation and Ward Assignment** - Citizens use GPS and reverse geocoding to report issues. We automatically detect which ward they're in and route their complaint to the right officer. No manual routing needed. This ensures complaints reach the correct department."

> "**6. Complete Audit Trail** - Every action is logged. We know who accessed what, when they accessed it, and what changes they made. This is essential for government accountability and investigating security incidents."

> "The result is a system that feels simple to use but is complex and secure under the hood. Citizens can report issues in seconds. Officers see only what they need. Departments can manage their resources. And the city administration has full visibility. All while maintaining strict data isolation between different user tiers."

> "This system is designed for scale. Whether Mumbai has 1,000 complaints or 1 million, the architecture supports it. The database queries are optimized. The API is stateless and can be deployed across multiple servers. The frontend is a static React app that can be served from a CDN for lightning-fast performance worldwide."

> "The code is also maintainable. Future developers can understand the system quickly because it's well-organized. The permission classes are declarative - you can look at an endpoint and immediately know what access level it requires. The serializers handle validation. The views handle business logic. It's separation of concerns done right."

> "Thank you for watching this demonstration of the CivicConnect Mumbai Civic Complaint Management System. This codebase is a showcase of modern web development practices: secure authentication, role-based access control, geolocation integration, and a beautiful responsive interface. Whether you're building for a municipality, a corporation, or any organization with multiple user tiers, these architectural patterns will serve you well."

**[Screen: End slide with project name and copyright]**

> "All code and implementation in this system are original works created for the Mumbai BMC civic complaint management system. The architecture, database design, API structure, and UI components demonstrate professional-grade software engineering."

---

## **SCREEN RECORDING TIMELINE**

| Timestamp | Duration | Content to Show |
|-----------|----------|-----------------|
| 0:00-0:45 | 45s | Title slide, project intro, problem statement |
| 0:45-3:00 | 135s | VS Code folder structure, technology stack explanation |
| 3:00-5:30 | 150s | User model properties, 3-tier hierarchy explanation |
| 5:30-6:30 | 60s | Permission classes, access control mechanisms |
| 6:30-7:15 | 45s | JWT authentication, token composition |
| 7:15-9:00 | 105s | get_queryset() filtering by tier with real examples |
| 9:00-11:00 | 120s | ReportIssue.jsx form and location auto-detection |
| 11:00-12:00 | 60s | Map integration with reverse geocoding |
| 12:00-12:00 | 60s | ComplaintCreateSerializer backend handling |
| 12:00-13:15 | 75s | Role-based access utilities and pageAccess logic |
| 13:15-14:30 | 75s | AdminSidebar conditional rendering by role |
| 14:30-16:30 | 120s | Browser: Citizen Report Issue demo with map |
| 16:30-17:45 | 75s | Browser: Officer login & ward-filtered view |
| 17:45-19:00 | 75s | Browser: Dept Admin login & department view |
| 19:00-20:15 | 75s | Browser: Super Admin login & full access |
| 20:15-21:00 | 45s | Summary slide and conclusion |

---

## **TEST CREDENTIALS FOR DEMO**

### 🔴 Super Admin (Full System Access)
| Email | Password | Access |
|-------|----------|--------|
| `superadmin@bmc.gov.in` | `SuperAdmin@123` | All departments, all wards, all settings |

### 🟠 Department Admins (Department-Only Access)
| Email | Password | Department |
|-------|----------|------------|
| `deptadmin.roads@bmc.gov.in` | `DeptAdmin@123` | Roads & Infrastructure |
| `deptadmin.waste@bmc.gov.in` | `DeptAdmin@123` | Solid Waste Management |
| `deptadmin.water@bmc.gov.in` | `DeptAdmin@123` | Water Supply |

### 🟢 BMC Officers (Ward-Only Access)
| Email | Password | Department | Ward |
|-------|----------|------------|------|    
| `officer.bandra@bmc.gov.in` | `Officer@123` | Roads & Infrastructure | Bandra |
| `officer.andheri@bmc.gov.in` | `Officer@123` | Roads & Infrastructure | Andheri |
| `officer.colaba@bmc.gov.in` | `Officer@123` | Roads & Infrastructure | Colaba |
| `officer.dadar@bmc.gov.in` | `Officer@123` | Solid Waste Management | Dadar |
| `officer.malad@bmc.gov.in` | `Officer@123` | Solid Waste Management | Malad |

### 🔵 Citizens
| Email | Password | Ward |
|-------|----------|------|
| `citizen1@gmail.com` | `Citizen@123` | Bandra |
| `citizen2@gmail.com` | `Citizen@123` | Andheri |
| `citizen3@gmail.com` | `Citizen@123` | Dadar |

---

## **KEY FILES TO SHOW IN VIDEO**

### Backend (Django)
1. `backend/apps/users/models.py` - User model with admin_tier property
2. `backend/apps/users/permissions.py` - Permission classes
3. `backend/apps/users/serializers_jwt.py` - JWT with admin tier
4. `backend/apps/complaints/views.py` - Tier-based filtering
5. `backend/apps/complaints/serializers.py` - Complaint serializers

### Frontend (React)
1. `frontend/src/pages/citizen/ReportIssue.jsx` - Complaint form with map
2. `frontend/src/utils/roleBasedAccess.js` - Role utilities
3. `frontend/src/components/Layout/AdminSidebar.jsx` - Dynamic navigation
4. `frontend/src/utils/mapUtils.js` - Mumbai geolocation utilities

---

## **COPYRIGHT NOTICE**

```
CivicConnect Mumbai - Civic Complaint Management System
Copyright © 2025 Atharva-cyber849
Repository: https://github.com/Atharva-cyber849/CivicConnect---Mumbai

All rights reserved. This code and implementation are original works
created for the Mumbai BMC civic complaint management system.
```

---

*Document created: December 4, 2025*
