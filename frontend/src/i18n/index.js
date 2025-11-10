import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // Common
      'common': {
        'loading': 'Loading...',
        'error': 'Error',
        'success': 'Success',
        'warning': 'Warning',
        'info': 'Information',
        'save': 'Save',
        'cancel': 'Cancel',
        'submit': 'Submit',
        'delete': 'Delete',
        'edit': 'Edit',
        'view': 'View',
        'close': 'Close',
        'back': 'Back',
        'next': 'Next',
        'previous': 'Previous',
        'search': 'Search',
        'filter': 'Filter',
        'reset': 'Reset',
        'clear': 'Clear',
        'refresh': 'Refresh',
        'download': 'Download',
        'upload': 'Upload',
        'select': 'Select',
        'selectAll': 'Select All',
        'none': 'None',
        'all': 'All',
        'yes': 'Yes',
        'no': 'No',
        'ok': 'OK',
        'confirm': 'Confirm',
        'required': 'Required',
        'optional': 'Optional',
        'dateFormat': 'DD/MM/YYYY',
        'timeFormat': 'HH:mm',
        'currency': '₹',
        'changeLanguage': 'Change Language'
      },

      // Navigation
      'nav': {
        'home': 'Home',
        'dashboard': 'Dashboard',
        'complaints': 'Complaints',
        'myComplaints': 'My Complaints',
        'newComplaint': 'New Complaint',
        'profile': 'Profile',
        'settings': 'Settings',
        'help': 'Help',
        'logout': 'Logout',
        'login': 'Login',
        'register': 'Register',
        'admin': 'Admin',
        'reports': 'Reports',
        'users': 'Users',
        'departments': 'Departments',
        'wards': 'Wards'
      },

      // Authentication
      'auth': {
        'login': 'Login',
        'register': 'Register',
        'email': 'Email',
        'password': 'Password',
        'confirmPassword': 'Confirm Password',
        'firstName': 'First Name',
        'lastName': 'Last Name',
        'phone': 'Phone Number',
        'address': 'Address',
        'ward': 'Ward',
        'loginSuccess': 'Login successful',
        'loginError': 'Login failed. Please check your credentials.',
        'registerSuccess': 'Registration successful',
        'registerError': 'Registration failed. Please try again.',
        'logoutSuccess': 'Logged out successfully',
        'forgotPassword': 'Forgot Password?',
        'resetPassword': 'Reset Password',
        'rememberMe': 'Remember Me',
        'alreadyHaveAccount': 'Already have an account?',
        'dontHaveAccount': "Don't have an account?",
        'signInWith': 'Sign in with',
        'orContinueWith': 'Or continue with'
      },

      // Complaints
      'complaints': {
        'title': 'Complaints',
        'myComplaints': 'My Complaints',
        'newComplaint': 'New Complaint',
        'complaintId': 'Complaint ID',
        'complaintTitle': 'Complaint Title',
        'description': 'Description',
        'category': 'Category',
        'priority': 'Priority',
        'status': 'Status',
        'department': 'Department',
        'assignedTo': 'Assigned To',
        'createdAt': 'Created At',
        'updatedAt': 'Updated At',
        'resolvedAt': 'Resolved At',
        'location': 'Location',
        'address': 'Address',
        'landmark': 'Landmark',
        'attachments': 'Attachments',
        'selectImages': 'Select Images',
        'dragDropImages': 'Drag and drop images here or click to select',
        'submitComplaint': 'Submit Complaint',
        'complaintSubmitted': 'Complaint submitted successfully',
        'complaintSubmissionError': 'Failed to submit complaint',
        'viewDetails': 'View Details',
        'editComplaint': 'Edit Complaint',
        'deleteComplaint': 'Delete Complaint',
        'trackComplaint': 'Track Complaint',
        'complaintHistory': 'Complaint History',
        'noComplaints': 'No complaints found',
        'searchComplaints': 'Search complaints...',
        'filterByStatus': 'Filter by Status',
        'filterByCategory': 'Filter by Category',
        'filterByPriority': 'Filter by Priority',
        'totalComplaints': 'Total Complaints',
        'pendingComplaints': 'Pending Complaints',
        'resolvedComplaints': 'Resolved Complaints',
        'emergencyComplaint': 'Emergency Complaint',
        'reportEmergency': 'Report Emergency'
      },

      // Complaint Status
      'status': {
        'submitted': 'Submitted',
        'assigned': 'Assigned',
        'in_progress': 'In Progress',
        'resolved': 'Resolved',
        'closed': 'Closed',
        'rejected': 'Rejected',
        'pending': 'Pending',
        'on_hold': 'On Hold'
      },

      // Complaint Categories
      'categories': {
        'roads': 'Roads & Transportation',
        'waste': 'Waste Management',
        'water': 'Water Supply',
        'electricity': 'Electricity',
        'health': 'Health & Sanitation',
        'education': 'Education',
        'parks': 'Parks & Recreation',
        'buildings': 'Buildings & Construction',
        'noise': 'Noise Pollution',
        'others': 'Others'
      },

      // Priority Levels
      'priority': {
        'low': 'Low',
        'medium': 'Medium',
        'high': 'High',
        'urgent': 'Urgent',
        'emergency': 'Emergency'
      },

      // Mumbai BMC Departments
      'departments': {
        'roads': 'Roads Department',
        'waste': 'Solid Waste Management',
        'water': 'Water Supply Department',
        'health': 'Public Health Department',
        'engineering': 'Municipal Engineering',
        'education': 'Education Department',
        'gardens': 'Gardens Department',
        'fire': 'Fire Brigade',
        'police': 'Mumbai Police',
        'electricity': 'Electricity Department'
      },

      // Mumbai Wards
      'wards': {
        'A': 'A Ward - Colaba',
        'B': 'B Ward - Dongri',
        'C': 'C Ward - Marine Lines',
        'D': 'D Ward - Grant Road',
        'E': 'E Ward - Byculla',
        'F/N': 'F/N Ward - Matunga',
        'F/S': 'F/S Ward - Sewri',
        'G/N': 'G/N Ward - Dadar',
        'G/S': 'G/S Ward - Parel',
        'H/E': 'H/E Ward - Bandra East',
        'H/W': 'H/W Ward - Bandra West',
        'K/E': 'K/E Ward - Andheri East',
        'K/W': 'K/W Ward - Andheri West',
        'L': 'L Ward - Kurla',
        'M/E': 'M/E Ward - Chembur',
        'M/W': 'M/W Ward - Ghatkopar',
        'N': 'N Ward - Ghatkopar',
        'P/N': 'P/N Ward - Malad',
        'P/S': 'P/S Ward - Goregaon',
        'R/C': 'R/C Ward - Borivali',
        'R/N': 'R/N Ward - Dahisar',
        'R/S': 'R/S Ward - Kandivali',
        'S': 'S Ward - Bhandup',
        'T': 'T Ward - Mulund'
      },

      // Profile
      'profile': {
        'title': 'Profile',
        'personalInfo': 'Personal Information',
        'contactInfo': 'Contact Information',
        'addressInfo': 'Address Information',
        'preferences': 'Preferences',
        'changePassword': 'Change Password',
        'currentPassword': 'Current Password',
        'newPassword': 'New Password',
        'profileUpdated': 'Profile updated successfully',
        'passwordChanged': 'Password changed successfully',
        'gender': 'Gender',
        'age': 'Age',
        'occupation': 'Occupation',
        'language': 'Preferred Language',
        'notifications': 'Notifications',
        'emailNotifications': 'Email Notifications',
        'smsNotifications': 'SMS Notifications',
        'pushNotifications': 'Push Notifications'
      },

      // Dashboard
      'dashboard': {
        'title': 'Dashboard',
        'welcome': 'Welcome',
        'overview': 'Overview',
        'recentComplaints': 'Recent Complaints',
        'complaintStats': 'Complaint Statistics',
        'wardInfo': 'Ward Information',
        'quickActions': 'Quick Actions',
        'notifications': 'Notifications',
        'announcements': 'Announcements',
        'emergencyContacts': 'Emergency Contacts',
        'onlineServices': 'Online Services',
        'complaintTrends': 'Complaint Trends',
        'resolutionRate': 'Resolution Rate',
        'averageResolutionTime': 'Average Resolution Time',
        'satisfactionRating': 'Satisfaction Rating'
      },

      // Maps
      'maps': {
        'title': 'Mumbai Ward Map',
        'showWardBoundaries': 'Show Ward Boundaries',
        'showComplaints': 'Show Complaints',
        'zoomIn': 'Zoom In',
        'zoomOut': 'Zoom Out',
        'resetView': 'Reset View',
        'currentLocation': 'Current Location',
        'selectLocation': 'Select Location',
        'confirmLocation': 'Confirm Location',
        'wardBoundaries': 'Ward Boundaries',
        'complaintLocations': 'Complaint Locations',
        'clusterView': 'Cluster View',
        'detailView': 'Detail View',
        'mapLegend': 'Map Legend',
        'layerControls': 'Layer Controls'
      },

      // Notifications
      'notifications': {
        'title': 'Notifications',
        'markAsRead': 'Mark as Read',
        'markAllAsRead': 'Mark All as Read',
        'clearAll': 'Clear All',
        'settings': 'Notification Settings',
        'enable': 'Enable Notifications',
        'disable': 'Disable Notifications',
        'complaintUpdates': 'Complaint Updates',
        'systemAlerts': 'System Alerts',
        'announcements': 'Announcements',
        'emergency': 'Emergency Notifications',
        'frequency': 'Notification Frequency',
        'immediately': 'Immediately',
        'daily': 'Daily',
        'weekly': 'Weekly',
        'never': 'Never'
      },

      // PWA
      'pwa': {
        'installApp': 'Install App',
        'installPrompt': 'Install CivicConnect for better experience',
        'installSuccess': 'App installed successfully',
        'updateAvailable': 'Update Available',
        'updatePrompt': 'A new version is available. Update now?',
        'updateSuccess': 'App updated successfully',
        'offline': 'You are offline',
        'onlineAgain': 'You are back online',
        'offlineMessage': 'Some features may not be available offline',
        'cacheCleared': 'Cache cleared successfully',
        'syncInProgress': 'Syncing data...',
        'syncCompleted': 'Data synced successfully'
      },

      // Errors
      'errors': {
        'general': 'Something went wrong. Please try again.',
        'network': 'Network error. Please check your connection.',
        'server': 'Server error. Please try again later.',
        'notFound': 'The requested resource was not found.',
        'unauthorized': 'You are not authorized to perform this action.',
        'forbidden': 'Access denied.',
        'validation': 'Please check your input and try again.',
        'fileSize': 'File size is too large.',
        'fileType': 'File type is not supported.',
        'required': 'This field is required.',
        'invalidEmail': 'Please enter a valid email address.',
        'invalidPhone': 'Please enter a valid phone number.',
        'passwordMismatch': 'Passwords do not match.',
        'sessionExpired': 'Your session has expired. Please login again.'
      }
    }
  },
  mr: {
    translation: {
      // Common - मराठी
      'common': {
        'loading': 'लोड होत आहे...',
        'error': 'त्रुटी',
        'success': 'यशस्वी',
        'warning': 'चेतावणी',
        'info': 'माहिती',
        'save': 'सेव्ह करा',
        'cancel': 'रद्द करा',
        'submit': 'सबमिट करा',
        'delete': 'हटवा',
        'edit': 'संपादित करा',
        'view': 'पहा',
        'close': 'बंद करा',
        'back': 'मागे',
        'next': 'पुढे',
        'previous': 'मागील',
        'search': 'शोधा',
        'filter': 'फिल्टर',
        'reset': 'रीसेट',
        'clear': 'साफ करा',
        'refresh': 'रिफ्रेश',
        'download': 'डाउनलोड',
        'upload': 'अपलोड',
        'select': 'निवडा',
        'selectAll': 'सर्व निवडा',
        'none': 'काहीही नाही',
        'all': 'सर्व',
        'yes': 'होय',
        'no': 'नाही',
        'ok': 'ठीक आहे',
        'confirm': 'पुष्टी करा',
        'required': 'आवश्यक',
        'optional': 'पर्यायी',
        'dateFormat': 'दिदि/मम/वववव',
        'timeFormat': 'तत:मम',
        'currency': '₹',
        'changeLanguage': 'भाषा बदला'
      },

      // Navigation - नेव्हिगेशन
      'nav': {
        'home': 'मुख्यपृष्ठ',
        'dashboard': 'डॅशबोर्ड',
        'complaints': 'तक्रारी',
        'myComplaints': 'माझ्या तक्रारी',
        'newComplaint': 'नवीन तक्रार',
        'profile': 'प्रोफाइल',
        'settings': 'सेटिंग्ज',
        'help': 'मदत',
        'logout': 'लॉगआउट',
        'login': 'लॉगिन',
        'register': 'नोंदणी',
        'admin': 'प्रशासक',
        'reports': 'अहवाल',
        'users': 'वापरकर्ते',
        'departments': 'विभाग',
        'wards': 'प्रभाग'
      },

      // Authentication - प्रमाणीकरण
      'auth': {
        'login': 'लॉगिन',
        'register': 'नोंदणी',
        'email': 'ईमेल',
        'password': 'पासवर्ड',
        'confirmPassword': 'पासवर्डची पुष्टी करा',
        'firstName': 'नाव',
        'lastName': 'आडनाव',
        'phone': 'फोन नंबर',
        'address': 'पत्ता',
        'ward': 'प्रभाग',
        'loginSuccess': 'लॉगिन यशस्वी',
        'loginError': 'लॉगिन अयशस्वी. कृपया आपली माहिती तपासा.',
        'registerSuccess': 'नोंदणी यशस्वी',
        'registerError': 'नोंदणी अयशस्वी. कृपया पुन्हा प्रयत्न करा.',
        'logoutSuccess': 'लॉगआउट यशस्वी',
        'forgotPassword': 'पासवर्ड विसरलात?',
        'resetPassword': 'पासवर्ड रीसेट करा',
        'rememberMe': 'मला लक्षात ठेवा',
        'alreadyHaveAccount': 'आधीच खाते आहे?',
        'dontHaveAccount': 'खाते नाही?',
        'signInWith': 'सह साइन इन करा',
        'orContinueWith': 'किंवा सह सुरू ठेवा'
      },

      // Complaints - तक्रारी
      'complaints': {
        'title': 'तक्रारी',
        'myComplaints': 'माझ्या तक्रारी',
        'newComplaint': 'नवीन तक्रार',
        'complaintId': 'तक्रार आयडी',
        'complaintTitle': 'तक्रारीचे शीर्षक',
        'description': 'वर्णन',
        'category': 'श्रेणी',
        'priority': 'प्राधान्य',
        'status': 'स्थिती',
        'department': 'विभाग',
        'assignedTo': 'यांना सोपवले',
        'createdAt': 'तयार केले',
        'updatedAt': 'अपडेट केले',
        'resolvedAt': 'निराकरण केले',
        'location': 'स्थान',
        'address': 'पत्ता',
        'landmark': 'खुण',
        'attachments': 'संलग्नक',
        'selectImages': 'चित्रे निवडा',
        'dragDropImages': 'चित्रे येथे ड्रॅग करा किंवा निवडण्यासाठी क्लिक करा',
        'submitComplaint': 'तक्रार सबमिट करा',
        'complaintSubmitted': 'तक्रार यशस्वीरीत्या सबमिट केली',
        'complaintSubmissionError': 'तक्रार सबमिट करण्यात अयशस्वी',
        'viewDetails': 'तपशील पहा',
        'editComplaint': 'तक्रार संपादित करा',
        'deleteComplaint': 'तक्रार हटवा',
        'trackComplaint': 'तक्रार ट्रॅक करा',
        'complaintHistory': 'तक्रारीचा इतिहास',
        'noComplaints': 'कोणत्याही तक्रारी आढळल्या नाहीत',
        'searchComplaints': 'तक्रारी शोधा...',
        'filterByStatus': 'स्थितीनुसार फिल्टर करा',
        'filterByCategory': 'श्रेणीनुसार फिल्टर करा',
        'filterByPriority': 'प्राधान्यानुसार फिल्टर करा',
        'totalComplaints': 'एकूण तक्रारी',
        'pendingComplaints': 'प्रलंबित तक्रारी',
        'resolvedComplaints': 'निराकरण झालेल्या तक्रारी',
        'emergencyComplaint': 'आपत्कालीन तक्रार',
        'reportEmergency': 'आपत्काल नोंदवा'
      },

      // Complaint Status - तक्रारीची स्थिती
      'status': {
        'submitted': 'सबमिट केले',
        'assigned': 'सोपवले',
        'in_progress': 'प्रगतीपथावर',
        'resolved': 'निराकरण झाले',
        'closed': 'बंद',
        'rejected': 'नाकारले',
        'pending': 'प्रलंबित',
        'on_hold': 'स्थगित'
      },

      // Complaint Categories - तक्रारीच्या श्रेणी
      'categories': {
        'roads': 'रस्ते आणि वाहतूक',
        'waste': 'कचरा व्यवस्थापन',
        'water': 'पाणीपुरवठा',
        'electricity': 'वीज',
        'health': 'आरोग्य आणि स्वच्छता',
        'education': 'शिक्षण',
        'parks': 'उद्याने आणि मनोरंजन',
        'buildings': 'इमारती आणि बांधकाम',
        'noise': 'ध्वनी प्रदूषण',
        'others': 'इतर'
      },

      // Priority Levels - प्राधान्य स्तर
      'priority': {
        'low': 'कमी',
        'medium': 'मध्यम',
        'high': 'उच्च',
        'urgent': 'तातडीची',
        'emergency': 'आपत्कालीन'
      },

      // Mumbai BMC Departments - मुंबई महानगरपालिका विभाग
      'departments': {
        'roads': 'रस्ते विभाग',
        'waste': 'घनकचरा व्यवस्थापन',
        'water': 'पाणीपुरवठा विभाग',
        'health': 'सार्वजनिक आरोग्य विभाग',
        'engineering': 'नगर अभियांत्रिकी',
        'education': 'शिक्षण विभाग',
        'gardens': 'उद्यान विभाग',
        'fire': 'अग्निशमन दल',
        'police': 'मुंबई पोलीस',
        'electricity': 'वीज विभाग'
      },

      // Mumbai Wards - मुंबई प्रभाग
      'wards': {
        'A': 'अ प्रभाग - कोलाबा',
        'B': 'ब प्रभाग - डोंगरी',
        'C': 'क प्रभाग - मरीन लाईन्स',
        'D': 'ड प्रभाग - ग्रांट रोड',
        'E': 'इ प्रभाग - बायकुला',
        'F/N': 'फ/उ प्रभाग - माटुंगा',
        'F/S': 'फ/द प्रभाग - सेवरी',
        'G/N': 'ग/उ प्रभाग - दादर',
        'G/S': 'ग/द प्रभाग - परळ',
        'H/E': 'ह/पू प्रभाग - बांद्रा पूर्व',
        'H/W': 'ह/प प्रभाग - बांद्रा पश्चिम',
        'K/E': 'क/पू प्रभाग - अंधेरी पूर्व',
        'K/W': 'क/प प्रभाग - अंधेरी पश्चिम',
        'L': 'ल प्रभाग - कुर्ला',
        'M/E': 'म/पू प्रभाग - चेंबूर',
        'M/W': 'म/प प्रभाग - घाटकोपर',
        'N': 'न प्रभाग - घाटकोपर',
        'P/N': 'प/उ प्रभाग - मलाड',
        'P/S': 'प/द प्रभाग - गोरेगाव',
        'R/C': 'र/मं प्रभाग - बोरिवली',
        'R/N': 'र/उ प्रभाग - दहिसर',
        'R/S': 'र/द प्रभाग - कांदिवली',
        'S': 'स प्रभाग - भांडूप',
        'T': 'त प्रभाग - मुलुंड'
      },

      // Profile - प्रोफाइल
      'profile': {
        'title': 'प्रोफाइल',
        'personalInfo': 'वैयक्तिक माहिती',
        'contactInfo': 'संपर्क माहिती',
        'addressInfo': 'पत्ता माहिती',
        'preferences': 'प्राधान्ये',
        'changePassword': 'पासवर्ड बदला',
        'currentPassword': 'सध्याचा पासवर्ड',
        'newPassword': 'नवीन पासवर्ड',
        'profileUpdated': 'प्रोफाइल यशस्वीरीत्या अपडेट केले',
        'passwordChanged': 'पासवर्ड यशस्वीरीत्या बदलले',
        'gender': 'लिंग',
        'age': 'वय',
        'occupation': 'व्यवसाय',
        'language': 'पसंतीची भाषा',
        'notifications': 'सूचना',
        'emailNotifications': 'ईमेल सूचना',
        'smsNotifications': 'एसएमएस सूचना',
        'pushNotifications': 'पुश सूचना'
      },

      // Dashboard - डॅशबोर्ड
      'dashboard': {
        'title': 'डॅशबोर्ड',
        'welcome': 'स्वागत',
        'overview': 'विहंगावलोकन',
        'recentComplaints': 'अलीकडील तक्रारी',
        'complaintStats': 'तक्रार आकडेवारी',
        'wardInfo': 'प्रभाग माहिती',
        'quickActions': 'द्रुत क्रिया',
        'notifications': 'सूचना',
        'announcements': 'घोषणा',
        'emergencyContacts': 'आपत्कालीन संपर्क',
        'onlineServices': 'ऑनलाइन सेवा',
        'complaintTrends': 'तक्रार ट्रेंड',
        'resolutionRate': 'निराकरण दर',
        'averageResolutionTime': 'सरासरी निराकरण वेळ',
        'satisfactionRating': 'समाधान रेटिंग'
      },

      // Maps - नकाशे
      'maps': {
        'title': 'मुंबई प्रभाग नकाशा',
        'showWardBoundaries': 'प्रभाग सीमा दाखवा',
        'showComplaints': 'तक्रारी दाखवा',
        'zoomIn': 'झूम इन',
        'zoomOut': 'झूम आउट',
        'resetView': 'व्यू रीसेट करा',
        'currentLocation': 'सध्याचे स्थान',
        'selectLocation': 'स्थान निवडा',
        'confirmLocation': 'स्थानाची पुष्टी करा',
        'wardBoundaries': 'प्रभाग सीमा',
        'complaintLocations': 'तक्रार स्थाने',
        'clusterView': 'क्लस्टर व्यू',
        'detailView': 'तपशील व्यू',
        'mapLegend': 'नकाशा लीजेंड',
        'layerControls': 'लेयर कंट्रोल्स'
      },

      // Notifications - सूचना
      'notifications': {
        'title': 'सूचना',
        'markAsRead': 'वाचले म्हणून चिन्हांकित करा',
        'markAllAsRead': 'सर्व वाचले म्हणून चिन्हांकित करा',
        'clearAll': 'सर्व साफ करा',
        'settings': 'सूचना सेटिंग्ज',
        'enable': 'सूचना सक्षम करा',
        'disable': 'सूचना अक्षम करा',
        'complaintUpdates': 'तक्रार अपडेट्स',
        'systemAlerts': 'सिस्टम अलर्ट',
        'announcements': 'घोषणा',
        'emergency': 'आपत्कालीन सूचना',
        'frequency': 'सूचना वारंवारता',
        'immediately': 'लगेच',
        'daily': 'दैनिक',
        'weekly': 'साप्ताहिक',
        'never': 'कधीच नाही'
      },

      // PWA - प्रगतिशील वेब अॅप
      'pwa': {
        'installApp': 'अॅप इंस्टॉल करा',
        'installPrompt': 'चांगल्या अनुभवासाठी CivicConnect इंस्टॉल करा',
        'installSuccess': 'अॅप यशस्वीरीत्या इंस्टॉल केले',
        'updateAvailable': 'अपडेट उपलब्ध',
        'updatePrompt': 'नवीन आवृत्ती उपलब्ध आहे. आता अपडेट करा?',
        'updateSuccess': 'अॅप यशस्वीरीत्या अपडेट केले',
        'offline': 'तुम्ही ऑफलाइन आहात',
        'onlineAgain': 'तुम्ही पुन्हा ऑनलाइन आहात',
        'offlineMessage': 'काही वैशिष्ट्ये ऑफलाइन उपलब्ध नसू शकतात',
        'cacheCleared': 'कॅश यशस्वीरीत्या साफ केले',
        'syncInProgress': 'डेटा सिंक होत आहे...',
        'syncCompleted': 'डेटा यशस्वीरीत्या सिंक केले'
      },

      // Errors - त्रुटी
      'errors': {
        'general': 'काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.',
        'network': 'नेटवर्क त्रुटी. कृपया आपले कनेक्शन तपासा.',
        'server': 'सर्व्हर त्रुटी. कृपया नंतर प्रयत्न करा.',
        'notFound': 'विनंती केलेला संसाधन सापडला नाही.',
        'unauthorized': 'तुम्हाला ही क्रिया करण्याचा अधिकार नाही.',
        'forbidden': 'प्रवेश नाकारला.',
        'validation': 'कृपया तुमची माहिती तपासा आणि पुन्हा प्रयत्न करा.',
        'fileSize': 'फाइलचा आकार खूप मोठा आहे.',
        'fileType': 'फाइल प्रकार समर्थित नाही.',
        'required': 'हे फील्ड आवश्यक आहे.',
        'invalidEmail': 'कृपया वैध ईमेल पत्ता प्रविष्ट करा.',
        'invalidPhone': 'कृपया वैध फोन नंबर प्रविष्ट करा.',
        'passwordMismatch': 'पासवर्ड जुळत नाहीत.',
        'sessionExpired': 'तुमचे सेशन संपले आहे. कृपया पुन्हा लॉगिन करा.'
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    lng: localStorage.getItem('language') || 'en', // Get saved language preference
    
    interpolation: {
      escapeValue: false // React already does escaping
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    },

    react: {
      useSuspense: false
    }
  });

// Save language preference to localStorage when language changes
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
  document.documentElement.lang = lng;
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr'; // For future RTL support
});

export default i18n;