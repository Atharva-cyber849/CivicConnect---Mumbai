# �🇳 Snap & Report - Mumbai BMC Civic Issue Reporting System

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Django](https://img.shields.io/badge/Django-5.0-green.svg)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-teal.svg)](https://fastapi.tiangolo.com/)
[![Mumbai](https://img.shields.io/badge/Mumbai-BMC-orange.svg)](https://portal.mcgm.gov.in/)

A modern, AI-powered civic issue reporting and management platform tailored for **Mumbai Municipal Corporation (BMC)**. Empowers Mumbaikars to report municipal problems across all 24 wards and track their resolution in real-time.

**मुंबईकरांसाठी नागरी समस्या नोंदवण्याचे प्लॅटफॉर्म** 🏙️

## 🚀 Features

### For Citizens
- 📸 **Snap & Report** - Take a photo and report issues instantly
- 🗺️ **Ward-Level Tracking** - Coverage across all 24 Mumbai wards (A-T) with precise geolocation
- 📊 **Real-Time Updates** - Track complaint status from submission to resolution
- � **Instant Notifications** - In-app and email updates on complaint progress
- 📱 **Mobile-Friendly** - Responsive design for all devices
- 🌐 **Bilingual** - Full support for English and Marathi (मराठी)

### For Administrators
- 🤖 **AI SmartRoute™** - Automatic routing to BMC departments (Roads, Waste, Water, etc.)
- 📈 **Analytics Dashboard** - Comprehensive insights and statistics
- 👥 **Department Management** - Manage 10 BMC departments and staff
- 🔔 **Notification System** - Stay informed of new complaints
- 📊 **Ward-wise Analytics** - Performance metrics for each Mumbai ward
- 🗺️ **Heatmap Visualization** - See complaint density across Mumbai

### Mumbai-Specific Features
- 🏛️ **BMC Integration** - Designed for Mumbai Municipal Corporation
- 🗺️ **24 Wards** - Complete coverage (Colaba to Mulund)
- 🏢 **10 Departments** - Roads, Solid Waste, Water Supply, Sewage, Streetlights, Gardens, etc.
- 📍 **GeoJSON Boundaries** - Accurate ward boundary visualization
- 🌏 **Mumbai Map** - Centered on Mumbai (19.0760°N, 72.8777°E)
- 📞 **BMC Helpline** - Integrated support (1916)
- 🎨 **Civic Theme** - Mumbai civic blue and orange color scheme

### AI-Powered Features
- 🤖 **SmartRoute™** - Automatic complaint categorization using AI
- 🖼️ **Image Recognition** - CNN-based visual complaint classification
- 📝 **Text Analysis** - NLP-powered description categorization
- 🎯 **Ensemble Learning** - Combined predictions for higher accuracy

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                   │
│  ├─ User Dashboard      ├─ Admin Dashboard                   │
│  ├─ Report Issues       ├─ Complaint Management              │
│  └─ Track Complaints    └─ Department Management             │
└───────────────────────┬─────────────────────────────────────┘
                        │ REST API (HTTPS/JSON)
┌───────────────────────┴─────────────────────────────────────┐
│              BACKEND (Django REST Framework)                 │
│  ├─ JWT Authentication  ├─ Celery Tasks                      │
│  ├─ Complaint CRUD      ├─ Email Notifications               │
│  ├─ Department Routing  ├─ PostGIS Geolocation               │
│  └─ Role-Based Access   └─ AWS S3 Storage                    │
└───────────────────────┬─────────────────────────────────────┘
                        │ REST API
┌───────────────────────┴─────────────────────────────────────┐
│            AI MICROSERVICE (FastAPI)                         │
│  ├─ Image Classification (CNN)                               │
│  ├─ Text Classification (NLP)                                │
│  └─ Ensemble Predictions                                     │
└─────────────────────────────────────────────────────────────┘
                        │
┌───────────────────────┴─────────────────────────────────────┐
│                  DATA LAYER                                  │
│  ├─ PostgreSQL + PostGIS  ├─ Redis (Celery)                 │
│  └─ AWS S3 / Cloudinary   └─ Media Storage                   │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Tech Stack

### Backend
- **Django 5.0** - Web framework
- **Django REST Framework** - API development
- **PostgreSQL + PostGIS** - Database with geospatial support
- **Celery + Redis** - Async task queue
- **JWT** - Authentication
- **AWS S3** - Media storage

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Query** - Data fetching
- **React Leaflet** - Interactive maps
- **Recharts** - Data visualization

### AI Service
- **FastAPI** - API framework
- **PyTorch** - Deep learning
- **Transformers** - NLP models
- **Pillow** - Image processing

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Orchestration
- **Gunicorn** - WSGI server
- **NGINX** - Reverse proxy (production)

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+ (with PostGIS)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/snap-and-report.git
   cd snap-and-report
   ```

2. **Set up environment variables**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   
   # Frontend
   cp frontend/.env.example frontend/.env
   
   # Edit the files with your configurations
   ```

3. **Start with Docker Compose**
   ```bash
   docker-compose up --build
   ```

4. **Access the applications**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - Admin Panel: http://localhost:8000/admin
   - API Docs: http://localhost:8000/api/docs
   - AI Service: http://localhost:8001/docs

5. **Create superuser (in a new terminal)**
   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```

## 📖 Documentation

- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)
- [AI Service Documentation](./ai_service/README.md)

## 📁 Project Structure

```
snap-and-report/
├── backend/                 # Django REST API
│   ├── apps/
│   │   ├── users/          # User management
│   │   ├── complaints/     # Complaint CRUD
│   │   ├── departments/    # Department management
│   │   └── notifications/  # Email notifications
│   ├── core/               # Django settings
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/               # React application
│   ├── src/
│   │   ├── api/           # API client
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   └── store/         # State management
│   ├── package.json
│   └── vite.config.js
│
├── ai_service/            # FastAPI AI service
│   ├── app.py            # Main application
│   ├── utils/            # Prediction utilities
│   ├── models/           # Trained models (gitignored)
│   └── requirements.txt
│
├── docker-compose.yml     # Docker orchestration
└── README.md             # This file
```

## 🔑 Default Credentials

After running migrations and creating a superuser:

- **Admin Panel**: http://localhost:8000/admin
- **Username**: (your created superuser email)
- **Password**: (your created password)

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Production Deployment Guide

1. **Update environment variables** for production
2. **Set `DEBUG=False`** in Django settings
3. **Configure proper database** credentials
4. **Set up AWS S3** for media storage
5. **Configure NGINX** as reverse proxy
6. **Enable HTTPS** with SSL certificates
7. **Set up monitoring** (Sentry, Prometheus)

### Recommended Hosting

- **Backend**: AWS EC2, Railway, Render
- **Frontend**: Vercel, Netlify
- **Database**: AWS RDS PostgreSQL
- **Media**: AWS S3, Cloudinary

## 📊 API Endpoints

### Authentication
- `POST /api/users/register/` - Register new user
- `POST /api/users/login/` - Login
- `POST /api/users/logout/` - Logout

### Complaints
- `GET /api/complaints/` - List complaints
- `POST /api/complaints/` - Create complaint
- `GET /api/complaints/{id}/` - Get complaint
- `PATCH /api/complaints/{id}/` - Update complaint
- `GET /api/complaints/statistics/` - Get statistics

### Departments (Admin only)
- `GET /api/departments/` - List departments
- `POST /api/departments/` - Create department
- `PATCH /api/departments/{id}/` - Update department

## 📚 Mumbai-Specific Documentation

Comprehensive guides for implementing Snap & Report in Mumbai:

### For Developers
- **[IMPLEMENTATION_GUIDE.md](docs/IMPLEMENTATION_GUIDE.md)** - Complete 10-phase implementation roadmap
   - Phase-by-phase tasks with validation checklists
   - Mumbai ward integration
   - BMC department configuration
   - AI model training guide
   - Security and optimization
   - Production deployment

- **[UI_DESIGN_GUIDE.md](docs/UI_DESIGN_GUIDE.md)** - Complete design system
   - Mumbai civic color palette
   - Typography (English + Marathi)
   - All page layouts with diagrams
   - Component specifications
   - Accessibility (WCAG 2.1 AA)
   - Responsive design rules

- **[QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md)** - Quick commands and troubleshooting
   - Docker commands
   - Django management
   - API testing
   - Common issues and solutions

### For Deployment
- **[SETUP_GUIDE.md](docs/SETUP_GUIDE.md)** - Production deployment
   - Local development setup
   - Docker configuration
   - AWS/Cloud deployment
   - Environment variables

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System architecture
   - Architecture diagrams
   - Data flow visualization
   - Technology stack
   - Security architecture

- **[PROJECT_SUMMARY.md](docs/PROJECT_SUMMARY.md)** - Project overview
   - Tech stack details
   - Database schema
   - API reference
   - KPIs and metrics

### Mumbai Enhancement Summary
- **[MUMBAI_ENHANCEMENTS.md](MUMBAI_ENHANCEMENTS.md)** - What's new for Mumbai
   - List of all Mumbai-specific features
   - New files created
   - Implementation status
   - Next steps and roadmap

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - Initial work

## 🙏 Acknowledgments

- **Brihanmumbai Municipal Corporation (BMC)** - For serving Mumbai
- **Mumbaikars** - For making the city great
- Inspired by civic tech initiatives worldwide (mySociety, Code for America)
- Built with open-source technologies
- Special thanks to the Django, React, and FastAPI communities

## 📞 Support

**For Mumbai Deployment:**
- BMC Helpline: **1916**
- Email: support@snapandreport.mumbai.gov.in
- GitHub Issues: Create an issue in the repository

**For Technical Support:**
- Check documentation in `docs/` folder
- See troubleshooting guide: `docs/QUICK_REFERENCE.md`
- Contact: tech@snapandreport.com

## 🗺️ Roadmap

### Completed ✅
- Mumbai ward integration (24 wards)
- Bilingual support (English + Marathi)
- BMC department mapping
- Ward boundaries GeoJSON
- Notification system

### Upcoming 🚀
- [ ] Mobile apps (iOS & Android)
- [ ] Real-time updates via WebSocket
- [ ] Advanced analytics with ML insights
- [ ] SMS and WhatsApp notifications
- [ ] Gamification for civic engagement
- [ ] Voice complaints (Marathi + Hindi)
- [ ] Integration with existing BMC systems
- [ ] Public API for third-party apps

---

**Made with ❤️ for Mumbai | मुंबईसाठी प्रेमाने बनवलेले** 🇮🇳

**जय महाराष्ट्र! 🚩**
#   C i v i c C o n n e c t - - - M u m b a i  
 